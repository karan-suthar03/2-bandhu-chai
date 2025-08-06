import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Divider,
    Chip
} from '@mui/material';
import { Receipt } from '@mui/icons-material';
import {formatCurrency} from "../../../Utils/Utils.js";

const OrderDetailsInfo = ({ order }) => {

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                        <Receipt />
                        Order Summary
                    </Typography>
                    <Chip 
                        label={`Order ID: ${order.id}`} 
                        color="primary" 
                        variant="outlined"
                        size="small" 
                    />
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Subtotal
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                            {formatCurrency(order.subtotal)}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Total Discount
                        </Typography>
                        <Typography variant="h6" color="error" gutterBottom>
                            -{formatCurrency(order.totalDiscount)}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Shipping Cost
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                            {order.shippingCost > 0 ? formatCurrency(order.shippingCost) : 'Free'}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Tax (GST 18%)
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                            {formatCurrency(order.tax)}
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box p={2} bgcolor="primary.main" borderRadius={1} color="white">
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Typography variant="h6" fontWeight="bold">
                                Final Total
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h4" fontWeight="bold">
                                {formatCurrency(order.finalTotal)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
                <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Calculation Breakdown:</strong>
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={8}>
                            <Typography variant="body2">Subtotal:</Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="right">
                            <Typography variant="body2">{formatCurrency(order.subtotal)}</Typography>
                        </Grid>
                        
                        <Grid item xs={8}>
                            <Typography variant="body2">Less: Discount:</Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="right">
                            <Typography variant="body2" color="error">-{formatCurrency(order.totalDiscount)}</Typography>
                        </Grid>
                        
                        <Grid item xs={8}>
                            <Typography variant="body2">Add: Shipping:</Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="right">
                            <Typography variant="body2">+{formatCurrency(order.shippingCost)}</Typography>
                        </Grid>
                        
                        <Grid item xs={8}>
                            <Typography variant="body2">Add: Tax (GST):</Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="right">
                            <Typography variant="body2">+{formatCurrency(order.tax)}</Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                        </Grid>
                        
                        <Grid item xs={8}>
                            <Typography variant="body1" fontWeight="bold">Final Total:</Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="right">
                            <Typography variant="body1" fontWeight="bold">{formatCurrency(order.finalTotal)}</Typography>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>
    );
};

export default OrderDetailsInfo;
