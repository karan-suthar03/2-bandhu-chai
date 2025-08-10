import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link, Chip } from '@mui/material';
import { ArrowBack, Receipt } from '@mui/icons-material';
import {getStatusColor, getStatusLabel} from "../../Utils/orderUtils.jsx";

const OrderHeader = ({ order, onBackClick }) => (
    <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link underline="hover" color="inherit" href="/analytics">Analytics</Link>
            <Link underline="hover" color="inherit" href="/orders">Orders</Link>
            <Typography color="text.primary">Edit Order</Typography>
        </Breadcrumbs>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
                <Typography variant="h4" gutterBottom display="flex" alignItems="center" gap={1.5}>
                    <Receipt color="primary" /> Edit Order #{order.id}
                    <Chip label={getStatusLabel(order.status)} color={getStatusColor(order.status)} size="small" />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Customer: {order.customerName}
                </Typography>
            </Box>
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBackClick}>Back to Orders</Button>
        </Box>
    </Box>
);

export default OrderHeader;