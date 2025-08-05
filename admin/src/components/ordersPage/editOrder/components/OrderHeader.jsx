import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link, Chip } from '@mui/material';
import { Edit, ArrowBack, Receipt } from '@mui/icons-material';
import { StatusEnum } from '../../enums';

const getStatusColor = (status) => {
    switch (status) {
        case StatusEnum.DELIVERED:
            return 'success';
        case StatusEnum.CANCELLED:
        case StatusEnum.REFUNDED:
            return 'error';
        case StatusEnum.RETURNED:
            return 'warning';
        case StatusEnum.SHIPPED:
        case StatusEnum.OUT_FOR_DELIVERY:
            return 'info';
        case StatusEnum.PROCESSING:
        case StatusEnum.CONFIRMED:
            return 'primary';
        default:
            return 'default';
    }
};

const getStatusLabel = (status) => {
    const labels = {
        [StatusEnum.PENDING]: 'Pending',
        [StatusEnum.CONFIRMED]: 'Confirmed',
        [StatusEnum.PROCESSING]: 'Processing',
        [StatusEnum.SHIPPED]: 'Shipped',
        [StatusEnum.OUT_FOR_DELIVERY]: 'On the Way',
        [StatusEnum.DELIVERED]: 'Delivered',
        [StatusEnum.CANCELLED]: 'Cancelled',
        [StatusEnum.RETURNED]: 'Returned',
        [StatusEnum.REFUNDED]: 'Refunded'
    };
    return labels[status] || status;
};

const OrderHeader = ({ order, onBackClick }) => (
    <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
            <Link color="inherit" href="/dashboard" sx={{ textDecoration: 'none' }}>
                Dashboard
            </Link>
            <Link color="inherit" href="/dashboard/orders" sx={{ textDecoration: 'none' }}>
                Orders
            </Link>
            <Typography color="text.primary">Edit Order</Typography>
        </Breadcrumbs>

        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
                <Typography variant="h4" gutterBottom display="flex" alignItems="center" gap={1}>
                    <Receipt color="primary" />
                    Edit Order #{order.id}
                    <Chip 
                        label={getStatusLabel(order.status)} 
                        color={getStatusColor(order.status)} 
                        size="small" 
                    />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Customer: {order.customerName} | Created: {new Date(order.createdAt).toLocaleDateString()} | Last Updated: {new Date(order.updatedAt).toLocaleDateString()}
                </Typography>
            </Box>

            <Box display="flex" gap={2} alignItems="center">
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={onBackClick}
                >
                    Back to Orders
                </Button>
            </Box>
        </Box>
    </Box>
);

export default OrderHeader;
