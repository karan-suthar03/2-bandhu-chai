import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link, Chip } from '@mui/material';
import { Edit, ArrowBack, Visibility } from '@mui/icons-material';
import {getStatusColor, getStatusLabel} from "../../Utils/orderUtils.jsx";

const OrderDetailsHeader = ({ order, onBackClick, onEditClick }) => (
    <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
            <Link color="inherit" href="/analytics" sx={{ textDecoration: 'none' }}>
                Dashboard
            </Link>
            <Link color="inherit" href="/orders" sx={{ textDecoration: 'none' }}>
                Orders
            </Link>
            <Typography color="text.primary">Order Details</Typography>
        </Breadcrumbs>

        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
                <Typography variant="h4" gutterBottom display="flex" alignItems="center" gap={1}>
                    <Visibility color="primary" />
                    Order #{order.id}
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
                <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={onEditClick}
                    color="primary"
                >
                    Edit Order
                </Button>
            </Box>
        </Box>
    </Box>
);

export default OrderDetailsHeader;
