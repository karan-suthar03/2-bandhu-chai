import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Stack, Divider } from '@mui/material';
import { Payment } from '@mui/icons-material';
import {getPaymentMethodIcon, getPaymentMethodLabel, getPaymentStatusColor} from "../../Utils/orderUtils.jsx";

const OrderPaymentInfo = ({ order }) => (
    <Card>
        <CardContent>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={3}><Payment /> Payment Information</Typography>
            <Stack spacing={2} divider={<Divider />}>
                <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Payment Status</Typography>
                    <Chip label={order.paymentStatus} color={getPaymentStatusColor(order.paymentStatus)} />
                </Box>
                <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Payment Method</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                        {getPaymentMethodIcon(order.paymentMethod)}
                        <Typography variant="body1">{getPaymentMethodLabel(order.paymentMethod)}</Typography>
                    </Box>
                </Box>
            </Stack>
            <Box mt={3} p={2} bgcolor="grey.100" borderRadius={1}>
                <Typography variant="body2" color="text.secondary"><strong>Note:</strong> Payment details are for reference only and cannot be changed here.</Typography>
            </Box>
        </CardContent>
    </Card>
);

export default OrderPaymentInfo;