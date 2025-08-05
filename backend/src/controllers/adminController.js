import prisma from "../config/prisma.js";
import bcrypt from 'bcryptjs';
import { ValidationError, NotFoundError } from "../middlewares/errors/AppError.js";

export const getAdminProfile = async (req, res) => {
    try {
        const adminId = req.user.id;
        
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

        res.json({
            success: true,
            data: admin
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        console.error('Admin profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin profile'
        });
    }
};

export const updateAdminProfile = async (req, res) => {
    try {
        const adminId = req.user.id;
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

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedAdmin
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (error instanceof ValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        console.error('Admin profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

export const changeAdminPassword = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
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

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (error instanceof ValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        console.error('Password change error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};

export const getSystemAnalytics = async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const [
            ordersOverTime,
            revenueOverTime,
            categoryStats,
            statusDistribution
        ] = await Promise.all([
            prisma.$queryRaw`
                SELECT 
                    DATE("createdAt") as date,
                    COUNT(*) as count
                FROM "Order" 
                WHERE "createdAt" >= ${startDate}
                GROUP BY DATE("createdAt")
                ORDER BY date ASC
            `,

            prisma.$queryRaw`
                SELECT 
                    DATE("createdAt") as date,
                    SUM("finalTotal") as revenue
                FROM "Order" 
                WHERE "createdAt" >= ${startDate} AND status = 'DELIVERED'
                GROUP BY DATE("createdAt")
                ORDER BY date ASC
            `,

            prisma.product.groupBy({
                by: ['category'],
                _count: { category: true },
                _avg: { price: true }
            }),

            prisma.order.groupBy({
                by: ['status'],
                _count: { status: true }
            })
        ]);

        res.json({
            success: true,
            analytics: {
                ordersOverTime,
                revenueOverTime,
                categoryStats,
                statusDistribution,
                period: `${days} days`
            }
        });
    } catch (error) {
        console.error('System analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system analytics'
        });
    }
};

export const getLowStockProducts = async (req, res) => {
    try {
        const { threshold = 10 } = req.query;
        
        const lowStockProducts = await prisma.product.findMany({
            where: {
                AND: [
                    { stock: { lte: parseInt(threshold) } },
                    { deactivated: false }
                ]
            },
            orderBy: { stock: 'asc' },
            select: {
                id: true,
                name: true,
                category: true,
                stock: true,
                price: true,
                image: true,
                images: true
            }
        });

        res.json({
            success: true,
            data: lowStockProducts,
            total: lowStockProducts.length
        });
    } catch (error) {
        console.error('Low stock products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch low stock products'
        });
    }
};
