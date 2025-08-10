import nodemailer from 'nodemailer';
import emailTrackingService from './emailTrackingService.js';

const SENDER_EMAIL = 'karan@karansuthar.works';
const SENDER_NAME = 'Bandhu Chai';

class EmailService {
    constructor() {
        this.transporter = null;
        this.isInitialized = false;
    }

    _getEmailHeader(subtitle = '') {
        return `
            <div style="background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%); color: white; text-align: center; padding: 30px;">
                <h1 style="margin: 0; font-size: 28px;">🍵 Bandhu Chai</h1>
                ${subtitle ? `<p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">${subtitle}</p>` : ''}
            </div>
        `;
    }

    _getEmailFooter() {
        return `
            <div style="background: #2c5530; color: white; text-align: center; padding: 20px;">
                <p style="margin: 0; opacity: 0.8; font-size: 14px;">
                    Thank you for choosing Bandhu Chai! 🍵
                </p>
                <p style="margin: 5px 0 0 0; opacity: 0.6; font-size: 12px;">
                    This is an automated email. Please do not reply to this email.
                </p>
            </div>
        `;
    }

    _getContactSection() {
        return `
            <div style="text-align: center; background: #f8f9fa; padding: 20px; border-radius: 5px;">
                <h3 style="color: #333; margin-top: 0;">Need Help?</h3>
                <p style="margin: 10px 0; color: #666;">Contact us for any questions about your order</p>
                <p style="margin: 5px 0;">📧 Email: support@bandhuchai.com</p>
                <p style="margin: 5px 0;">📞 Phone: +91-XXXXXXXXXX</p>
            </div>
        `;
    }

    async initialize() {
        try {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_SERVER,
                port: parseInt(process.env.SMTP_PORT),
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            await this.transporter.verify();
            this.isInitialized = true;
            console.log('✅ Email service initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Email service initialization failed:', error.message);
            this.isInitialized = false;
            return false;
        }
    }

    isReady() {
        return this.isInitialized && this.transporter;
    }

    async sendEmail(mailOptions, retries = 3, emailLogData = null) {
        let emailLog = null;
        if (emailLogData) {
            try {
                emailLog = await emailTrackingService.createEmailLog(emailLogData);
            } catch (error) {
                console.error('❌ Failed to create email log:', error.message);
            }
        }

        if (!this.isReady()) {
            const initialized = await this.initialize();
            if (!initialized) {
                if (emailLog) {
                    await emailTrackingService.markEmailFailed(emailLog.id, 'Email service not available');
                }
                throw new Error('Email service not available');
            }
        }

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                if (emailLog && attempt > 1) {
                    await emailTrackingService.incrementAttempt(emailLog.id);
                }

                const info = await this.transporter.sendMail(mailOptions);
                console.log(`✅ Email sent successfully (attempt ${attempt}):`, info.messageId);

                if (emailLog) {
                    await emailTrackingService.markEmailSent(emailLog.id, info.messageId);
                }

                return {
                    success: true,
                    messageId: info.messageId,
                    response: info.response,
                    emailLogId: emailLog?.id
                };
            } catch (error) {
                console.error(`❌ Email send attempt ${attempt} failed:`, error.message);
                
                if (attempt === retries) {
                    if (emailLog) {
                        await emailTrackingService.markEmailFailed(emailLog.id, error.message);
                    }
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }
    async sendOrderPlacedEmail(order) {
        if (!order || !order.customerEmail) {
            throw new Error('Order or customer email is missing');
        }
        const itemsHtml = order.orderItems?.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; border-right: 1px solid #eee;">
                    <img src="${item.variant?.product?.image || '/default-product.jpg'}" 
                         alt="${item.productName}" 
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                </td>
                <td style="padding: 10px;">
                    <strong>${item.productName}</strong>
                </td>
                <td style="padding: 10px; text-align: center;">₹${item.price}</td>
                <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="padding: 20px; text-align: center;">No items found</td></tr>';

        const shippingAddress = typeof order.shippingAddress === 'string' 
            ? JSON.parse(order.shippingAddress) 
            : order.shippingAddress;

        const mailOptions = {
            from: {
                name: SENDER_NAME,
                address: SENDER_EMAIL
            },
            to: order.customerEmail,
            subject: `📦 Order Placed #${order.id} - Bandhu Chai`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
                    ${this._getEmailHeader('Order Received - Pending Review')}
                    
                    <div style="background: white; padding: 30px; margin: 0;">
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
                            <h2 style="color: #856404; margin: 0 0 10px 0;">⏳ Order Received!</h2>
                            <p style="margin: 0; color: #856404;">Order #<strong>${order.id}</strong></p>
                            <p style="margin: 5px 0 0 0; color: #856404; font-size: 14px;"><strong>Status: PENDING</strong> - Awaiting admin review and confirmation</p>
                            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <h3 style="color: #333; margin-bottom: 15px; border-bottom: 2px solid #4a7c59; padding-bottom: 5px;">📋 Order Details</h3>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                                <p style="margin: 5px 0;"><strong>Customer:</strong> ${order.customerName}</p>
                                <p style="margin: 5px 0;"><strong>Email:</strong> ${order.customerEmail}</p>
                                <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.customerPhone}</p>
                                <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                                ${order.notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${order.notes}</p>` : ''}
                            </div>
                        </div>

                        <div style="margin-bottom: 25px;">
                            <h3 style="color: #333; margin-bottom: 15px; border-bottom: 2px solid #4a7c59; padding-bottom: 5px;">🏠 Delivery Address</h3>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                                <p style="margin: 5px 0; line-height: 1.6;">
                                    ${shippingAddress.street || ''}<br>
                                    ${shippingAddress.city || ''}, ${shippingAddress.state || ''}<br>
                                    ${shippingAddress.pincode || ''}<br>
                                    ${shippingAddress.country || 'India'}
                                </p>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <h3 style="color: #333; margin-bottom: 15px; border-bottom: 2px solid #4a7c59; padding-bottom: 5px;">🛒 Order Items</h3>
                            <table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #ddd;">
                                <thead>
                                    <tr style="background: #4a7c59; color: white;">
                                        <th style="padding: 12px; text-align: left;">Image</th>
                                        <th style="padding: 12px; text-align: left;">Product</th>
                                        <th style="padding: 12px; text-align: center;">Price</th>
                                        <th style="padding: 12px; text-align: center;">Qty</th>
                                        <th style="padding: 12px; text-align: right;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                                <tfoot>
                                    <tr style="background: #f8f9fa; font-weight: bold; font-size: 16px;">
                                        <td colspan="4" style="padding: 15px; text-align: right;">Grand Total:</td>
                                        <td style="padding: 15px; text-align: right; color: #4a7c59;">₹${order.finalTotal}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        
                        <div style="background: #e3f2fd; border: 1px solid #90caf9; border-radius: 5px; padding: 20px; margin-bottom: 25px;">
                            <h3 style="color: #1565c0; margin-top: 0;">⏱️ What happens next?</h3>
                            <ul style="color: #1565c0; margin: 10px 0; padding-left: 20px; line-height: 1.6;">
                                <li><strong>Order Review:</strong> Our team will review your order within 24 hours</li>
                                <li><strong>Confirmation Call:</strong> We'll contact you to confirm order details and delivery address</li>
                                <li><strong>Payment Confirmation:</strong> We'll verify payment method and process your order</li>
                                <li><strong>Processing:</strong> Once confirmed, your order will be prepared and shipped</li>
                                <li><strong>Tracking:</strong> You'll receive tracking details when your order is dispatched</li>
                            </ul>
                            <div style="background: #ffffff; padding: 15px; border-radius: 5px; margin-top: 15px; border-left: 4px solid #1565c0;">
                                <p style="margin: 0; color: #1565c0; font-weight: bold;">📧 You will receive a confirmation email once your order is approved by our team.</p>
                            </div>
                        </div>
                        
                        ${this._getContactSection()}
                    </div>
                    
                    ${this._getEmailFooter()}
                </div>
            `,
            text: `
BANDHU CHAI - Order Received

⏳ Order Received!
Order #${order.id}
Status: PENDING - Awaiting admin review and confirmation
Placed on ${new Date(order.createdAt).toLocaleDateString()}

📋 Order Details:
Customer: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone}
Payment Method: ${order.paymentMethod}
${order.notes ? `Notes: ${order.notes}` : ''}

🏠 Delivery Address:
${shippingAddress.street || ''}
${shippingAddress.city || ''}, ${shippingAddress.state || ''}
${shippingAddress.pincode || ''}
${shippingAddress.country || 'India'}

🛒 Order Items:
${order.orderItems?.map(item => `- ${item.productName} x${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`).join('\n') || 'No items found'}

Total: ₹${order.finalTotal}

⏱️ What happens next?
- Order Review: Our team will review your order within 24 hours
- Confirmation Call: We'll contact you to confirm order details and delivery address
- Payment Confirmation: We'll verify payment method and process your order
- Processing: Once confirmed, your order will be prepared and shipped
- Tracking: You'll receive tracking details when your order is dispatched

📧 You will receive a confirmation email once your order is approved by our team.

Need Help?
📧 Email: support@bandhuchai.com
📞 Phone: +91-XXXXXXXXXX

Thank you for choosing Bandhu Chai! 🍵
            `
        };

        const emailLogData = {
            type: 'ORDER_PLACED',
            sender: `${SENDER_NAME} <${SENDER_EMAIL}>`,
            recipient: order.customerEmail,
            subject: mailOptions.subject,
            orderId: order.id,
            metadata: {
                orderTotal: order.finalTotal,
                itemCount: order.orderItems?.length || 0,
                customerName: order.customerName,
                orderStatus: 'PENDING'
            }
        };

        return await this.sendEmail(mailOptions, 3, emailLogData);
    }

    async sendOrderConfirmation(order) {
        return await this.sendOrderStatusUpdateEmail(order, 'PENDING', 'CONFIRMED', 'Great news! Your order has been confirmed and will be processed soon.');
    }

    async sendOrderStatusUpdate(order, newStatus, notes = null) {
        return await this.sendOrderStatusUpdateEmail(order, order.status || 'PENDING', newStatus.toUpperCase(), notes);
    }

    async sendOrderStatusUpdateEmail(order, oldStatus, newStatus, notes = null) {
        if (!order || !order.customerEmail) {
            throw new Error('Order or customer email is missing');
        }

        const statusMessages = {
            'PENDING': 'Your order has been received and is pending review.',
            'CONFIRMED': 'Great news! Your order has been confirmed and will be processed soon.',
            'PROCESSING': 'Your order is being prepared with care.',
            'SHIPPED': 'Your order is on its way! Track your package for updates.',
            'OUT_FOR_DELIVERY': 'Your order is out for delivery and will arrive soon.',
            'DELIVERED': 'Your order has been delivered successfully!',
            'CANCELLED': 'Your order has been cancelled.',
            'RETURNED': 'Your order has been returned.',
            'REFUNDED': 'Your order has been refunded.'
        };

        const statusColors = {
            'PENDING': '#ffa726',
            'CONFIRMED': '#66bb6a',
            'PROCESSING': '#42a5f5',
            'SHIPPED': '#26c6da',
            'OUT_FOR_DELIVERY': '#ff9800',
            'DELIVERED': '#4caf50',
            'CANCELLED': '#ef5350',
            'RETURNED': '#f44336',
            'REFUNDED': '#9c27b0'
        };

        const statusEmojis = {
            'PENDING': '⏳',
            'CONFIRMED': '✅',
            'PROCESSING': '🔄',
            'SHIPPED': '🚚',
            'OUT_FOR_DELIVERY': '🚛',
            'DELIVERED': '📦',
            'CANCELLED': '❌',
            'RETURNED': '↩️',
            'REFUNDED': '💰'
        };

        const statusColor = statusColors[newStatus] || '#757575';
        const statusEmoji = statusEmojis[newStatus] || '📦';
        const defaultMessage = statusMessages[newStatus] || `Your order status has been updated to ${newStatus}.`;
        const finalMessage = notes || defaultMessage;

        const mailOptions = {
            from: {
                name: SENDER_NAME,
                address: SENDER_EMAIL
            },
            to: order.customerEmail,
            subject: `${statusEmoji} Order Update #${order.id} - ${newStatus.replace('_', ' ')}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
                    ${this._getEmailHeader('Order Status Update')}
                    
                    <div style="background: white; padding: 30px;">
                        <div style="background: ${statusColor}; color: white; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
                            <h2 style="margin: 0 0 10px 0;">${statusEmoji} Order ${newStatus.replace('_', ' ')}</h2>
                            <p style="margin: 0;">Order #<strong>${order.id}</strong></p>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 25px;">
                            <h3 style="color: #333; margin-top: 0;">📋 Update Details</h3>
                            <p style="margin: 10px 0; line-height: 1.6;">${finalMessage}</p>
                            <p style="margin: 10px 0; color: #666; font-size: 14px;">
                                Updated on: ${new Date().toLocaleDateString('en-IN', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                            <h4 style="color: #333; margin-top: 0;">Customer Information</h4>
                            <p style="margin: 5px 0;"><strong>Name:</strong> ${order.customerName}</p>
                            <p style="margin: 5px 0;"><strong>Email:</strong> ${order.customerEmail}</p>
                            <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.customerPhone}</p>
                        </div>
                        
                        ${this._getContactSection()}
                    </div>
                    
                    ${this._getEmailFooter()}
                </div>
            `,
            text: `
BANDHU CHAI - Order Status Update

${statusEmoji} Order ${newStatus.replace('_', ' ')}
Order #${order.id}

📋 Update Details:
${finalMessage}

Customer Information:
Name: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone}

Updated on: ${new Date().toLocaleDateString()}

Need Help?
📧 Email: support@bandhuchai.com
📞 Phone: +91-XXXXXXXXXX

Thank you for choosing Bandhu Chai! 🍵
            `
        };

        const emailLogData = {
            type: 'ORDER_STATUS_UPDATE',
            sender: `${SENDER_NAME} <${SENDER_EMAIL}>`,
            recipient: order.customerEmail,
            subject: mailOptions.subject,
            orderId: order.id,
            metadata: {
                oldStatus,
                newStatus,
                notes,
                customerName: order.customerName
            }
        };

        return await this.sendEmail(mailOptions, 3, emailLogData);
    }

    async sendContactFormEmail(contactData) {
        const { name, email, subject, message, phone } = contactData;
        
        const mailOptions = {
            from: {
                name: 'Bandhu Chai Contact Form',
                address: SENDER_EMAIL
            },
            to: SENDER_EMAIL,
            replyTo: email,
            subject: `📧 Contact Form: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #4a7c59; color: white; text-align: center; padding: 20px;">
                        <h1 style="margin: 0;">📧 New Contact Form Submission</h1>
                    </div>
                    
                    <div style="background: white; padding: 30px; border: 1px solid #ddd;">
                        <h2 style="color: #333; margin-top: 0;">Contact Details:</h2>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                        <p><strong>Subject:</strong> ${subject}</p>
                        
                        <h3 style="color: #333; margin-top: 30px;">Message:</h3>
                        <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #4a7c59;">
                            ${message.replace(/\n/g, '<br>')}
                        </div>
                        
                        <hr style="margin: 30px 0;">
                        <p style="color: #666; font-size: 14px;">
                            Received on: ${new Date().toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>
            `,
            text: `
NEW CONTACT FORM SUBMISSION

Contact Details:
Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
Subject: ${subject}

Message:
${message}

Received on: ${new Date().toLocaleDateString()}
            `
        };

        return await this.sendEmail(mailOptions);
    }
}

const emailService = new EmailService();
export default emailService;
