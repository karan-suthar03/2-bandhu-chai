import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Stack,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableRow
} from '@mui/material';
import { Payment, CreditCard, AccountBalance, Smartphone, Wallet } from '@mui/icons-material';
import { PaymentStatusEnum, PaymentMethodEnum } from '../../enums';

const getPaymentStatusColor = (status) => {
    switch (status) {
        case PaymentStatusEnum.COMPLETED:
            return 'success';
        case PaymentStatusEnum.FAILED:
            return 'error';
        case PaymentStatusEnum.REFUNDED:
            return 'warning';
        default:
            return 'default';
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
            return <Smartphone />;
        case PaymentMethodEnum.WALLET:
            return <Wallet />;
        default:
            return <Payment />;
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

const OrderPaymentInfo = ({ order }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                        <Payment />
                        Payment Information
                    </Typography>
                </Box>

                <Stack spacing={3}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Payment Status
                        </Typography>
                        <Chip
                            label={order.paymentStatus || 'Unknown'}
                            color={getPaymentStatusColor(order.paymentStatus)}
                            size="medium"
                        />
                    </Box>

                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Payment Method
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            {getPaymentMethodIcon(order.paymentMethod)}
                            <Typography variant="body1">
                                {getPaymentMethodLabel(order.paymentMethod)}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Payment Breakdown
                        </Typography>
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
                                        <TableCell align="right" sx={{ border: 'none', px: 0, color: 'success.main' }}>
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
                                        borderTop: 1,
                                        borderColor: 'divider'
                                    }}>
                                        {formatCurrency(order.finalTotal)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>
                </Stack>

                <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Note:</strong> Payment information is read-only. For payment-related 
                        issues, please contact the payment gateway or process refunds through 
                        the appropriate channels.
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default OrderPaymentInfo;
