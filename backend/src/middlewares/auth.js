import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from './errors/AppError.js';

const prisma = new PrismaClient();

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return next(new AppError('Access token required', 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        const admin = await prisma.admin.findUnique({
            where: { id: decoded.id },
            select: { id: true, username: true, email: true, role: true, isActive: true }
        });

        if (!admin || !admin.isActive) {
            return next(new AppError('Invalid or inactive user', 401));
        }

        req.admin = admin;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid token', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Token expired', 401));
        }
        next(error);
    }
};

export const requireAdmin = (req, res, next) => {
    if (!req.admin) {
        return next(new AppError('Authentication required', 401));
    }
    
    if (req.admin.role !== 'admin') {
        return next(new AppError('Admin access required', 403));
    }
    
    next();
};
