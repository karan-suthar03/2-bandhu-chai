import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import asyncHandler from '../middlewares/asyncHandler.js';
import { AppError } from '../middlewares/errors/AppError.js';

const prisma = new PrismaClient();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

export const loginAdmin = asyncHandler(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return next(new AppError('Please provide username and password', 400));
    }

    const admin = await prisma.admin.findFirst({
        where: {
            OR: [
                { username: username },
                { email: username }
            ]
        }
    });

    if (!admin || !admin.isActive) {
        return next(new AppError('Invalid credentials', 401));
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
        return next(new AppError('Invalid credentials', 401));
    }

    const token = generateToken(admin.id);

    res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role
        }
    });
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
