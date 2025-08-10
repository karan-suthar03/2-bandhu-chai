import express from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import emailService from '../services/emailService.js';
import { sendSuccess, sendBadRequest } from '../utils/responseUtils.js';
import { validateRequired, validateEmail, sanitizeString } from '../utils/validationUtils.js';

const router = express.Router();

const sendContactEmail = asyncHandler(async (req, res) => {
    const { name, email, subject, message, phone } = req.body;

    const requiredFields = ['name', 'email', 'subject', 'message'];
    const missingFields = validateRequired(requiredFields, req.body);
    
    if (missingFields.length > 0) {
        return sendBadRequest(res, `Missing required fields: ${missingFields.join(', ')}`);
    }

    if (!validateEmail(email)) {
        return sendBadRequest(res, 'Invalid email format');
    }

    const contactData = {
        name: sanitizeString(name),
        email: sanitizeString(email),
        subject: sanitizeString(subject),
        message: sanitizeString(message),
        phone: phone ? sanitizeString(phone) : null
    };

    try {
        console.log('Sending contact form email...');
        const emailResult = await emailService.sendContactFormEmail(contactData);
        
        console.log('✅ Contact form email sent successfully:', emailResult.messageId);
        
        return sendSuccess(res, {
            messageId: emailResult.messageId,
            message: 'Your message has been sent successfully! We will get back to you soon.'
        });
        
    } catch (error) {
        console.error('❌ Failed to send contact form email:', error.message);
        throw error;
    }
});

const sendTestEmail = asyncHandler(async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return sendBadRequest(res, 'Test emails not allowed in production');
    }

    try {
        const testResult = await emailService.sendEmail({
            from: {
                name: 'Bandhu Chai Test',
                address: process.env.SMTP_USER
            },
            to: process.env.SMTP_USER,
            subject: '🧪 API Test Email',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #4a7c59;">API Test Email</h2>
                    <p>This is a test email sent from the Bandhu Chai API.</p>
                    <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Endpoint:</strong> POST /contact/test</p>
                </div>
            `,
            text: `API Test Email - Sent at ${new Date().toLocaleString()}`
        });

        return sendSuccess(res, {
            messageId: testResult.messageId,
            message: 'Test email sent successfully!'
        });
        
    } catch (error) {
        console.error('❌ Failed to send test email:', error.message);
        throw error;
    }
});

router.post('/send', sendContactEmail);
router.post('/test', sendTestEmail);

export default router;
