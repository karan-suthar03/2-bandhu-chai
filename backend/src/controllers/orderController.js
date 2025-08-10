import { OrderService } from "../services/orderService.js";
import { CartService } from "../services/cartService.js";
import emailService from "../services/emailService.js";
import { sendSuccess, sendNotFound, sendBadRequest } from "../utils/responseUtils.js";
import { validateRequired, validateEmail, validatePhone, sanitizeString } from "../utils/validationUtils.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const createOrder = asyncHandler(async (req, res) => {
    console.log('createOrder called with body:', req.body);
    console.log('Session cart:', req.session?.cart);
    console.log('Session ID:', req.sessionID);
    
    const {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        paymentMethod = 'CASH_ON_DELIVERY',
        notes
    } = req.body;

    console.log('Extracted data:', { customerName, customerEmail, customerPhone, shippingAddress, paymentMethod, notes });

    const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'shippingAddress'];
    const missingFields = validateRequired(requiredFields, req.body);
    
    console.log('Missing fields:', missingFields);
    
    if (missingFields.length > 0) {
        console.log('Returning bad request for missing fields');
        return sendBadRequest(res, `Missing required fields: ${missingFields.join(', ')}`);
    }

    if (!validateEmail(customerEmail)) {
        console.log('Invalid email format:', customerEmail);
        return sendBadRequest(res, 'Invalid email format');
    }

    if (!validatePhone(customerPhone)) {
        console.log('Invalid phone format:', customerPhone);
        return sendBadRequest(res, 'Invalid phone number format');
    }

    if (!req.session.cart || !req.session.cart.items || req.session.cart.items.length === 0) {
        console.log('Cart is empty or missing');
        return sendBadRequest(res, 'Your cart is empty. Please add some products before placing an order.');
    }

    console.log('Cart items:', req.session.cart.items);

    const orderData = {
        customerName: sanitizeString(customerName),
        customerEmail: sanitizeString(customerEmail),
        customerPhone: sanitizeString(customerPhone),
        shippingAddress,
        paymentMethod,
        notes: sanitizeString(notes)
    };

    console.log('Order data prepared:', orderData);

    try {
        const order = await OrderService.createOrder(orderData, req.session.cart.items, req.sessionID);
        console.log('Order created successfully:', order.id);

        CartService.clearCart(req.session);
        try {
            const fullOrder = await OrderService.getOrderById(order.id, true);
            await emailService.sendOrderPlacedEmail(fullOrder);
            console.log('Order placed email sent successfully');
        } catch (emailError) {
            console.error('Failed to send order placed email:', emailError.message);
        }

        console.log('About to send response with userMessage...');

        const responseData = {
            success: true,
            message: 'Order placed successfully! 🎉',
            userMessage: {
                title: 'Thank you for your order!',
                message: 'Your order has been placed successfully. We will review your order and send you a confirmation email once it\'s approved. Our team will contact you within 24 hours.',
                contactInfo: 'If you have any questions, please contact us at support@bandhuchai.com or call us at +91-XXXXXXXXXX',
                nextSteps: [
                    'We will review your order within 24 hours',
                    'You will receive a confirmation email once approved',
                    'Our team will contact you to confirm delivery details',
                    'Your order will be processed and shipped after confirmation'
                ]
            },
            order: {
                id: order.id,
                status: order.status,
                statusMessage: 'Order received - Pending admin review and confirmation',
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerPhone: order.customerPhone,
                finalTotal: order.finalTotal,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt,
                estimatedDelivery: 'Will be confirmed after order approval'
            }
        };
        
        console.log('Response data being sent:', responseData);
        res.status(201).json(responseData);
    } catch (error) {
        console.error('Error creating order:', {
            message: error.message,
            stack: error.stack,
            orderData,
            cartItems: req.session.cart.items
        });
        throw error;
    }
});

const getOrderConfirmation = asyncHandler(async (req, res) => {
    const orderId = sanitizeString(req.params.orderId);
    
    const order = await OrderService.getOrderById(orderId, true);
    
    if (!order) {
        return sendNotFound(res, 'Order not found');
    }

    return sendSuccess(res, {
        order: {
            id: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            shippingAddress: JSON.parse(order.shippingAddress),
            paymentMethod: order.paymentMethod,
            status: order.status,
            paymentStatus: order.paymentStatus,
            subtotal: order.subtotal,
            totalDiscount: order.totalDiscount,
            shippingCost: order.shippingCost,
            finalTotal: order.finalTotal,
            notes: order.notes,
            createdAt: order.createdAt,
            orderItems: order.orderItems.map(item => ({
                id: item.id,
                productName: item.productName,
                size: item.size,
                quantity: item.quantity,
                price: item.price,
                oldPrice: item.oldPrice,
                itemTotal: item.itemTotal
            }))
        }
    });
});

const getOrder = asyncHandler(async (req, res) => {
    const orderId = sanitizeString(req.params.orderId);
    
    const order = await OrderService.getOrderById(orderId, true);
    
    if (!order) {
        return sendNotFound(res, 'Order not found');
    }

    return sendSuccess(res, { order });
});

const getOrderByNumber = asyncHandler(async (req, res) => {
    const orderId = sanitizeString(req.params.orderId);
    const { email } = req.query;
    
    const order = await OrderService.getOrderById(orderId, true);
    
    if (!order) {
        return sendNotFound(res, 'Order not found');
    }

    if (email && order.customerEmail.toLowerCase() !== email.toLowerCase()) {
        return sendNotFound(res, 'Order not found');
    }

    return sendSuccess(res, { order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const orderId = sanitizeString(req.params.orderId);
    const { status, notes } = req.body;

    if (!status) {
        return sendBadRequest(res, 'Status is required');
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
        return sendBadRequest(res, `Invalid status. Valid statuses: ${validStatuses.join(', ')}`);
    }

    const currentOrder = await OrderService.getOrderById(orderId, true);
    if (!currentOrder) {
        return sendNotFound(res, 'Order not found');
    }

    const updatedOrder = await OrderService.updateOrderStatus(orderId, status, notes);
    if (currentOrder.status !== status) {
        try {
            console.log(`Sending status update email for order ${orderId}: ${currentOrder.status} -> ${status}`);
            const emailOrderData = {
                order: {
                    id: updatedOrder.id,
                    customerName: updatedOrder.customerName,
                    customerEmail: updatedOrder.customerEmail,
                    customerPhone: updatedOrder.customerPhone,
                    finalTotal: updatedOrder.finalTotal.toFixed(2),
                    paymentMethod: updatedOrder.paymentMethod,
                    notes: updatedOrder.notes,
                    createdAt: updatedOrder.createdAt,
                    status: updatedOrder.status
                },
                items: updatedOrder.orderItems.map(item => ({
                    name: item.productName,
                    variantName: null,
                    price: parseFloat(item.price),
                    quantity: item.quantity,
                    imageUrl: null
                }))
            };

            if (status === 'CONFIRMED') {
                console.log('📧 Sending ORDER CONFIRMATION email (admin confirmed the order)');
                const emailResult = await emailService.sendOrderConfirmation(emailOrderData);
                console.log('✅ Order confirmation email sent successfully:', emailResult.messageId);
            } else {
                const statusMessages = {
                    'PROCESSING': 'Your order is now being processed and prepared for shipment. We will notify you once it\'s ready to ship.',
                    'SHIPPED': 'Exciting news! Your order has been shipped and is on its way to you. You should receive it within the next few days.',
                    'DELIVERED': 'Your order has been successfully delivered! We hope you enjoy your Bandhu Chai products. Thank you for choosing us!',
                    'CANCELLED': 'Your order has been cancelled as requested. If you have any questions or concerns, please don\'t hesitate to contact us.'
                };

                const statusMessage = notes || statusMessages[status] || `Your order status has been updated to ${status.toLowerCase()}.`;
                
                const emailResult = await emailService.sendOrderStatusUpdate(emailOrderData, status.toLowerCase(), statusMessage);
                console.log(`✅ Order ${status.toLowerCase()} email sent successfully:`, emailResult.messageId);
            }
            
        } catch (emailError) {
            console.error('❌ Failed to send email:', emailError.message);
            console.error('Email error details:', emailError);
        }
    }
    
    return sendSuccess(res, {
        order: updatedOrder
    }, 'Order status updated successfully');
});

const getAllOrders = asyncHandler(async (req, res) => {
    const result = await OrderService.getOrders(req.query);
    
    return sendSuccess(res, {
        orders: result.orders,
        pagination: result.pagination
    });
});

const cancelOrder = asyncHandler(async (req, res) => {
    const orderId = sanitizeString(req.params.orderId);
    
    const order = await OrderService.getOrderById(orderId, false);
    
    if (!order) {
        return sendNotFound(res, 'Order not found');
    }

    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
        return sendBadRequest(res, 'Order cannot be cancelled');
    }

    const updatedOrder = await OrderService.updateOrderStatus(orderId, 'CANCELLED', 'Cancelled by customer');
    
    try {
        console.log(`Sending cancellation email for order ${orderId}`);
        
        const emailOrderData = {
            order: {
                id: updatedOrder.id,
                customerName: updatedOrder.customerName,
                customerEmail: updatedOrder.customerEmail,
                customerPhone: updatedOrder.customerPhone,
                finalTotal: updatedOrder.finalTotal.toFixed(2),
                paymentMethod: updatedOrder.paymentMethod,
                notes: updatedOrder.notes,
                createdAt: updatedOrder.createdAt,
                status: updatedOrder.status
            }
        };

        const cancellationMessage = 'Your order has been successfully cancelled as requested. If this was done in error or if you have any questions, please contact our support team and we\'ll be happy to help.';
        
        const emailResult = await emailService.sendOrderStatusUpdate(emailOrderData, 'cancelled', cancellationMessage);
        console.log('✅ Order cancellation email sent successfully:', emailResult.messageId);
        
    } catch (emailError) {
        console.error('❌ Failed to send order cancellation email:', emailError.message);
        console.error('Email error details:', emailError);
    }
    
    return sendSuccess(res, {
        order: updatedOrder
    }, 'Order cancelled successfully');
});

export {
    createOrder,
    getOrderConfirmation,
    getOrder,
    getOrderByNumber,
    updateOrderStatus,
    getAllOrders,
    cancelOrder
};
