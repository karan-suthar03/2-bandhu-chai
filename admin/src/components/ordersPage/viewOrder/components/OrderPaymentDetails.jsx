import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Chip,
    Divider
} from '@mui/material';
import { 
    Payment, 
    CreditCard, 
    AccountBalance, 
    Phone,
    Wallet,
    MonetizationOn
} from '@mui/icons-material';
import { PaymentMethodEnum, PaymentStatusEnum } from '../../enums';

const getPaymentStatusColor = (status) => {
    switch (status) {
        case PaymentStatusEnum.COMPLETED:
            return 'success';
        case PaymentStatusEnum.FAILED:
            return 'error';
        case PaymentStatusEnum.REFUNDED:
            return 'info';
        case PaymentStatusEnum.PENDING:
        default:
            return 'warning';
    }
};

const getPaymentMethodIcon = (method) => {
    switch (method) {
        case PaymentMethodEnum.CREDIT_CARD:
        case PaymentMethodEnum.DEBIT_CARD:
            return <CreditCard />;
        case PaymentMethodEnum.NET_BANKING:
            return <AccountBalance />;
        case PaymentMethodEnum.UPI:
            return <Phone />;
        case PaymentMethodEnum.WALLET:
            return <Wallet />;
        case PaymentMethodEnum.CASH_ON_DELIVERY:
        default:
            return <MonetizationOn />;
    }
};

const getPaymentMethodLabel = (method) => {
    const labels = {
        [PaymentMethodEnum.CASH_ON_DELIVERY]: 'Cash on Delivery',
        [PaymentMethodEnum.CREDIT_CARD]: 'Credit Card',
        [PaymentMethodEnum.DEBIT_CARD]: 'Debit Card',
        [PaymentMethodEnum.UPI]: 'UPI',
        [PaymentMethodEnum.NET_BANKING]: 'Net Banking',
        [PaymentMethodEnum.WALLET]: 'Digital Wallet'
    };
    return labels[method] || method;
};

const getPaymentStatusLabel = (status) => {
    const labels = {
        [PaymentStatusEnum.PENDING]: 'Pending',
        [PaymentStatusEnum.COMPLETED]: 'Paid',
        [PaymentStatusEnum.FAILED]: 'Failed',
        [PaymentStatusEnum.REFUNDED]: 'Refunded'
    };
    return labels[status] || status;
};

const OrderPaymentDetails = ({ order }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                        <Payment />
                        Payment Details
                    </Typography>
                    <Chip 
                        label={getPaymentStatusLabel(order.paymentStatus)} 
                        color={getPaymentStatusColor(order.paymentStatus)} 
                        size="small"
                    />
                </Box>

                <Box mb={3} p={2} bgcolor="grey.50" borderRadius={1}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box color="primary.main">
                            {getPaymentMethodIcon(order.paymentMethod)}
                        </Box>
                        <Box>
                            <Typography variant="body1" fontWeight="bold">
                                {getPaymentMethodLabel(order.paymentMethod)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Payment Method
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Payment Status
                    </Typography>
                    <Chip 
                        label={getPaymentStatusLabel(order.paymentStatus)} 
                        color={getPaymentStatusColor(order.paymentStatus)} 
                        variant="filled"
                    />
                </Box>

                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                    Payment Breakdown
                </Typography>
                
                <TableContainer>
                    <Table size="small">
                        <TableBody>
                            <TableRow>
                                <TableCell component="th" scope="row" sx={{ border: 'none', px: 0 }}>
                                    Subtotal
                                </TableCell>
                                <TableCell align="right" sx={{ border: 'none', px: 0 }}>
                                    {formatCurrency(order.subtotal)}
                                </TableCell>
                            </TableRow>
                            
                            {parseFloat(order.totalDiscount || 0) > 0 && (
                                <TableRow>
                                    <TableCell component="th" scope="row" sx={{ border: 'none', px: 0 }}>
                                        Discount
                                    </TableCell>
                                    <TableCell align="right" sx={{ border: 'none', px: 0, color: 'error.main' }}>
                                        -{formatCurrency(order.totalDiscount)}
                                    </TableCell>
                                </TableRow>
                            )}
                            
                            {parseFloat(order.shippingCost || 0) > 0 && (
                                <TableRow>
                                    <TableCell component="th" scope="row" sx={{ border: 'none', px: 0 }}>
                                        Shipping
                                    </TableCell>
                                    <TableCell align="right" sx={{ border: 'none', px: 0 }}>
                                        {formatCurrency(order.shippingCost)}
                                    </TableCell>
                                </TableRow>
                            )}
                            
                            {parseFloat(order.tax || 0) > 0 && (
                                <TableRow>
                                    <TableCell component="th" scope="row" sx={{ border: 'none', px: 0 }}>
                                        Tax (GST 18%)
                                    </TableCell>
                                    <TableCell align="right" sx={{ border: 'none', px: 0 }}>
                                        {formatCurrency(order.tax)}
                                    </TableCell>
                                </TableRow>
                            )}
                            
                            <TableRow>
                                <TableCell component="th" scope="row" sx={{ 
                                    border: 'none', 
                                    px: 0, 
                                    fontWeight: 'bold',
                                    borderTop: 1,
                                    borderColor: 'divider'
                                }}>
                                    Total Amount
                                </TableCell>
                                <TableCell align="right" sx={{ 
                                    border: 'none', 
                                    px: 0, 
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    borderTop: 1,
                                    borderColor: 'divider'
                                }}>
                                    {formatCurrency(order.finalTotal)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box mt={3} p={2} bgcolor={
                    order.paymentStatus === PaymentStatusEnum.COMPLETED ? 'success.light' :
                    order.paymentStatus === PaymentStatusEnum.FAILED ? 'error.light' :
                    order.paymentStatus === PaymentStatusEnum.REFUNDED ? 'info.light' :
                    'warning.light'
                } borderRadius={1}>
                    <Typography variant="body2" color={
                        order.paymentStatus === PaymentStatusEnum.COMPLETED ? 'success.dark' :
                        order.paymentStatus === PaymentStatusEnum.FAILED ? 'error.dark' :
                        order.paymentStatus === PaymentStatusEnum.REFUNDED ? 'info.dark' :
                        'warning.dark'
                    }>
                        <strong>Status:</strong> {
                            order.paymentStatus === PaymentStatusEnum.COMPLETED ? 
                                'Payment has been successfully processed.' :
                            order.paymentStatus === PaymentStatusEnum.FAILED ? 
                                'Payment processing failed. Customer may need to retry payment.' :
                            order.paymentStatus === PaymentStatusEnum.REFUNDED ? 
                                'Payment has been refunded to the customer.' :
                                'Payment is pending. Customer will pay upon delivery for COD orders.'
                        }
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default OrderPaymentDetails;
