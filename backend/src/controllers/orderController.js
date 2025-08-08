import { OrderService } from "../services/orderService.js";
import { CartService } from "../services/cartService.js";
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

        console.log('About to send response with userMessage...');

        const responseData = {
            success: true,
            message: 'Order placed successfully! 🎉',
            userMessage: {
                title: 'Thank you for your order!',
                message: 'Your order has been placed successfully. We will contact you through email or call you within 24 hours to confirm your order details and delivery schedule.',
                contactInfo: 'If you have any questions, please contact us at support@bandhuchai.com or call us at +91-XXXXXXXXXX',
                nextSteps: [
                    'You will receive an order confirmation email shortly',
                    'Our team will contact you within 24 hours',
                    'We will confirm your delivery address and preferred time',
                    'Your order will be processed and shipped once confirmed'
                ]
            },
            order: {
                id: order.id,
                status: order.status,
                statusMessage: 'Order received - Awaiting confirmation',
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerPhone: order.customerPhone,
                finalTotal: order.finalTotal,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt,
                estimatedDelivery: '3-7 business days (after confirmation)'
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
            tax: order.tax,
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

    const updatedOrder = await OrderService.updateOrderStatus(orderId, status, notes);
    
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
