import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { AppError } from '../middlewares/errors/AppError.js';
import { sendSuccess, sendCreated } from '../utils/responseUtils.js';
import { validateRequired } from '../utils/validationUtils.js';

if (!process.env.JWT_SECRET) {
    console.error('WARNING: JWT_SECRET environment variable is not set. Using a random string for this session only.');
    process.env.JWT_SECRET = require('crypto').randomBytes(64).toString('hex');
}

const generateAccessToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    return jwt.sign({ id, type: 'access' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
    });
};

const generateRefreshToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    return jwt.sign({ id, type: 'refresh' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
};

const getCookieConfig = (maxAge) => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge,
        path: '/'
    };
};

const loginAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const missingFields = validateRequired(['username', 'password'], req.body);
    if (missingFields.length > 0) {
        console.error('Login error: Missing username or password', { username });
        throw new AppError('Please provide username and password', 400);
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
        throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
        console.error('Login error: Invalid password', { username });
        throw new AppError('Invalid credentials', 401);
    }

    const accessToken = generateAccessToken(admin.id);
    const refreshToken = generateRefreshToken(admin.id);

    res.cookie('accessToken', accessToken, getCookieConfig(15 * 60 * 1000));
    res.cookie('refreshToken', refreshToken, getCookieConfig(7 * 24 * 60 * 60 * 1000));

    const { password: _, ...adminData } = admin;
    
    return sendSuccess(res, { admin: adminData });
});

const getMe = asyncHandler(async (req, res) => {
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

    return sendSuccess(res, { admin });
});

const createAdmin = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const missingFields = validateRequired(['username', 'email', 'password'], req.body);
    if (missingFields.length > 0) {
        throw new AppError('Please provide username, email, and password', 400);
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
        throw new AppError('Admin with this username or email already exists', 400);
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

    return sendCreated(res, {
        message: 'Admin created successfully',
        admin
    });
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const missingFields = validateRequired(['currentPassword', 'newPassword'], req.body);
    if (missingFields.length > 0) {
        throw new AppError('Please provide current and new password', 400);
    }

    if (newPassword.length < 8) {
        throw new AppError('Password must be at least 8 characters long', 400);
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        throw new AppError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', 400);
    }

    const admin = await prisma.admin.findUnique({
        where: { id: req.admin.id }
    });

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.admin.update({
        where: { id: req.admin.id },
        data: { password: hashedPassword }
    });

    return sendSuccess(res, {
        message: 'Password changed successfully'
    });
});

const refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
        throw new AppError('Refresh token not found', 401);
    }
    
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        if (decoded.type !== 'refresh') {
            throw new AppError('Invalid token type', 401);
        }

        const admin = await prisma.admin.findUnique({
            where: { id: decoded.id },
            select: { id: true, username: true, email: true, role: true, isActive: true }
        });
        
        if (!admin || !admin.isActive) {
            throw new AppError('Invalid or inactive user', 401);
        }

        const accessToken = generateAccessToken(admin.id);

        res.cookie('accessToken', accessToken, getCookieConfig(15 * 60 * 1000));

        return sendSuccess(res, {
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new AppError('Invalid token', 401);
        }
        if (error.name === 'TokenExpiredError') {
            throw new AppError('Token expired', 401);
        }
        throw error;
    }
});

const logoutAdmin = asyncHandler(async (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/auth/refresh' });
    
    return sendSuccess(res, {
        message: 'Logged out successfully'
    });
});

export {
    loginAdmin,
    getMe,
    createAdmin,
    changePassword,
    refreshToken,
    logoutAdmin
};
