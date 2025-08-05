import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Chip
} from '@mui/material';
import { Person, Email, Phone, LocationOn } from '@mui/icons-material';

const OrderCustomerInfo = ({ order }) => {
    const parseAddress = (address) => {
        if (!address) return null;
        if (typeof address === 'string') {
            try {
                return JSON.parse(address);
            } catch {
                return { street: address };
            }
        }
        return address;
    };

    const formatAddress = (address) => {
        const addr = parseAddress(address);
        if (!addr) return 'No address provided';
        
        const parts = [
            addr.street,
            addr.landmark,
            addr.city,
            addr.state,
            addr.pincode
        ].filter(Boolean);
        
        return parts.join(', ');
    };

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                        <Person />
                        Customer Information
                    </Typography>
                    <Chip 
                        label="Customer Details" 
                        color="secondary" 
                        variant="outlined"
                        size="small" 
                    />
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Person fontSize="small" color="action" />
                            <Typography variant="subtitle2" color="text.secondary">
                                Customer Name
                            </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="medium">
                            {order.customerName || 'Not provided'}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Email fontSize="small" color="action" />
                            <Typography variant="subtitle2" color="text.secondary">
                                Email Address
                            </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="medium">
                            {order.customerEmail || 'Not provided'}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Phone fontSize="small" color="action" />
                            <Typography variant="subtitle2" color="text.secondary">
                                Phone Number
                            </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="medium">
                            {order.customerPhone || 'Not provided'}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="subtitle2" color="text.secondary">
                                Shipping Address
                            </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="medium">
                            {formatAddress(order.shippingAddress)}
                        </Typography>
                    </Grid>
                </Grid>

                <Box mt={3} p={2} bgcolor="info.light" borderRadius={1}>
                    <Typography variant="body2" color="info.dark">
                        <strong>Note:</strong> Customer information is used for order processing and delivery. 
                        To modify customer details, use the Edit Order function.
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default OrderCustomerInfo;
