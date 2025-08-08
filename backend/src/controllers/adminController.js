import prisma from "../config/prisma.js";
import bcrypt from 'bcryptjs';
import asyncHandler from '../middlewares/asyncHandler.js';
import { ValidationError, NotFoundError } from "../middlewares/errors/AppError.js";
import { sendSuccess } from '../utils/responseUtils.js';
import { validateRequired } from '../utils/validationUtils.js';

const getAdminProfile = asyncHandler(async (req, res) => {
    const adminId = req.admin.id;
    
    const admin = await prisma.admin.findUnique({
        where: { id: adminId },
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

    if (!admin) {
        throw new NotFoundError('Admin profile not found');
    }

    return sendSuccess(res, { data: admin });
});

const updateAdminProfile = asyncHandler(async (req, res) => {
    const adminId = req.admin.id;
    const { username, email } = req.body;

    const existingAdmin = await prisma.admin.findUnique({
        where: { id: adminId }
    });

    if (!existingAdmin) {
        throw new NotFoundError('Admin not found');
    }

    if (username && username !== existingAdmin.username) {
        const usernameExists = await prisma.admin.findFirst({
            where: { 
                username,
                id: { not: adminId }
            }
        });

        if (usernameExists) {
            throw new ValidationError('Username is already taken');
        }
    }

    if (email && email !== existingAdmin.email) {
        const emailExists = await prisma.admin.findFirst({
            where: { 
                email,
                id: { not: adminId }
            }
        });

        if (emailExists) {
            throw new ValidationError('Email is already taken');
        }
    }

    const updateData = {};
    if (username !== undefined) updateData.username = username.trim();
    if (email !== undefined) updateData.email = email.trim();

    const updatedAdmin = await prisma.admin.update({
        where: { id: adminId },
        data: updateData,
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

    return sendSuccess(res, {
        message: 'Profile updated successfully',
        data: updatedAdmin
    });
});

const changeAdminPassword = asyncHandler(async (req, res) => {
    const adminId = req.admin.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const missingFields = validateRequired(['currentPassword', 'newPassword', 'confirmPassword'], req.body);
    if (missingFields.length > 0) {
        throw new ValidationError('All password fields are required');
    }

    if (newPassword !== confirmPassword) {
        throw new ValidationError('New password and confirm password do not match');
    }

    if (newPassword.length < 6) {
        throw new ValidationError('New password must be at least 6 characters long');
    }

    const admin = await prisma.admin.findUnique({
        where: { id: adminId }
    });

    if (!admin) {
        throw new NotFoundError('Admin not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
        throw new ValidationError('Current password is incorrect');
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.admin.update({
        where: { id: adminId },
        data: { password: hashedPassword }
    });

    return sendSuccess(res, {
        message: 'Password changed successfully'
    });
});

export {
    getAdminProfile,
    updateAdminProfile,
    changeAdminPassword
};
