import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import asyncHandler from '../middlewares/asyncHandler.js';
import { AppError } from '../middlewares/errors/AppError.js';

const prisma = new PrismaClient();

if (!process.env.JWT_SECRET) {
    console.error('WARNING: JWT_SECRET environment variable is not set. Using a random string for this session only.');
    process.env.JWT_SECRET = require('crypto').randomBytes(64).toString('hex');
}

const generateAccessToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    return jwt.sign({ id, type: 'access' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' // Short-lived token
    });
};

const generateRefreshToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    return jwt.sign({ id, type: 'refresh' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' // Longer-lived token
    });
};

export const loginAdmin = asyncHandler(async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            console.error('Login error: Missing username or password', { username });
            return next(new AppError('Please provide username and password', 400));
        }

        const clientIp = req.ip || req.connection.remoteAddress;
        console.log(`Login attempt from IP: ${clientIp}, username: ${username}`);

        const admin = await prisma.admin.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: username }
                ]
            }
        });

        if (!admin || !admin.isActive) {
            console.error('Login error: Admin not found or inactive', { username });
            return next(new AppError('Invalid credentials', 401));
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            console.error('Login error: Invalid password', { username });
            return next(new AppError('Invalid credentials', 401));
        }

        const accessToken = generateAccessToken(admin.id);
        const refreshToken = generateRefreshToken(admin.id);

        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/'
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        const { password: _, ...adminData } = admin;
        res.json({ success: true, admin: adminData });
    } catch (err) {
        console.error('Unexpected login error:', err);
        return next(new AppError('Internal server error', 500));
    }
});

export const getMe = asyncHandler(async (req, res) => {
    const admin = await prisma.admin.findUnique({
        where: { id: req.admin.id },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    });

    res.status(200).json({
        success: true,
        admin
    });
});

export const createAdmin = asyncHandler(async (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return next(new AppError('Please provide username, email, and password', 400));
    }

    const existingAdmin = await prisma.admin.findFirst({
        where: {
            OR: [
                { username: username },
                { email: email }
            ]
        }
    });

    if (existingAdmin) {
        return next(new AppError('Admin with this username or email already exists', 400));
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const admin = await prisma.admin.create({
        data: {
            username,
            email,
            password: hashedPassword
        },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true
        }
    });

    res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        admin
    });
});

export const changePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new AppError('Please provide current and new password', 400));
    }

    if (newPassword.length < 8) {
        return next(new AppError('Password must be at least 8 characters long', 400));
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return next(new AppError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', 400));
    }

    const admin = await prisma.admin.findUnique({
        where: { id: req.admin.id }
    });

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);

    if (!isCurrentPasswordValid) {
        return next(new AppError('Current password is incorrect', 400));
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.admin.update({
        where: { id: req.admin.id },
        data: { password: hashedPassword }
    });

    res.status(200).json({
        success: true,
        message: 'Password changed successfully'
    });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
        return next(new AppError('Refresh token not found', 401));
    }
    
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        if (decoded.type !== 'refresh') {
            return next(new AppError('Invalid token type', 401));
        }

        const admin = await prisma.admin.findUnique({
            where: { id: decoded.id },
            select: { id: true, username: true, email: true, role: true, isActive: true }
        });
        
        if (!admin || !admin.isActive) {
            return next(new AppError('Invalid or inactive user', 401));
        }

        const accessToken = generateAccessToken(admin.id);

        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/'
        });
        
        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid token', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Token expired', 401));
        }
        next(error);
    }
});

export const logoutAdmin = asyncHandler(async (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/auth/refresh' });
    
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});
