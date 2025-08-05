import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip
} from '@mui/material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot
} from '@mui/lab';
import { 
    Assignment, 
    CheckCircle, 
    LocalShipping, 
    Inventory, 
    Cancel,
    Schedule,
    Done
} from '@mui/icons-material';
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

const getStatusIcon = (status) => {
    switch (status) {
        case StatusEnum.PENDING:
            return <Schedule />;
        case StatusEnum.CONFIRMED:
            return <CheckCircle />;
        case StatusEnum.PROCESSING:
            return <Inventory />;
        case StatusEnum.SHIPPED:
        case StatusEnum.OUT_FOR_DELIVERY:
            return <LocalShipping />;
        case StatusEnum.DELIVERED:
            return <Done />;
        case StatusEnum.CANCELLED:
        case StatusEnum.REFUNDED:
        case StatusEnum.RETURNED:
            return <Cancel />;
        default:
            return <Assignment />;
    }
};

const OrderStatusDetails = ({ order }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusProgress = () => {
        const statusOrder = [
            StatusEnum.PENDING,
            StatusEnum.CONFIRMED,
            StatusEnum.PROCESSING,
            StatusEnum.SHIPPED,
            StatusEnum.OUT_FOR_DELIVERY,
            StatusEnum.DELIVERED
        ];
        
        const currentIndex = statusOrder.indexOf(order.status);
        return currentIndex >= 0 ? currentIndex + 1 : 1;
    };

    const isCompleted = (status) => {
        const statusOrder = [
            StatusEnum.PENDING,
            StatusEnum.CONFIRMED,
            StatusEnum.PROCESSING,
            StatusEnum.SHIPPED,
            StatusEnum.OUT_FOR_DELIVERY,
            StatusEnum.DELIVERED
        ];
        
        const currentIndex = statusOrder.indexOf(order.status);
        const checkIndex = statusOrder.indexOf(status);
        
        return checkIndex <= currentIndex;
    };

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                        <Assignment />
                        Order Status
                    </Typography>
                    <Chip 
                        label={getStatusLabel(order.status)} 
                        color={getStatusColor(order.status)} 
                        size="small"
                        icon={getStatusIcon(order.status)}
                    />
                </Box>
                <Box mb={3} p={2} bgcolor="primary.light" borderRadius={1}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box color="primary.dark">
                            {getStatusIcon(order.status)}
                        </Box>
                        <Box>
                            <Typography variant="h6" color="primary.dark" fontWeight="bold">
                                {getStatusLabel(order.status)}
                            </Typography>
                            <Typography variant="body2" color="primary.dark">
                                Current order status
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                    Status Timeline
                </Typography>
                
                <Timeline>
                    <TimelineItem>
                        <TimelineSeparator>
                            <TimelineDot color={isCompleted(StatusEnum.PENDING) ? 'success' : 'grey'}>
                                <Schedule fontSize="small" />
                            </TimelineDot>
                            <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                            <Typography variant="body2" fontWeight="medium">Order Placed</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatDate(order.createdAt)}
                            </Typography>
                        </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                        <TimelineSeparator>
                            <TimelineDot color={isCompleted(StatusEnum.CONFIRMED) ? 'success' : 'grey'}>
                                <CheckCircle fontSize="small" />
                            </TimelineDot>
                            <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                            <Typography variant="body2" fontWeight="medium">Order Confirmed</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatDate(order.confirmedAt)}
                            </Typography>
                        </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                        <TimelineSeparator>
                            <TimelineDot color={isCompleted(StatusEnum.PROCESSING) ? 'success' : 'grey'}>
                                <Inventory fontSize="small" />
                            </TimelineDot>
                            <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                            <Typography variant="body2" fontWeight="medium">Processing</Typography>
                            <Typography variant="caption" color="text.secondary">
                                Order being prepared
                            </Typography>
                        </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                        <TimelineSeparator>
                            <TimelineDot color={isCompleted(StatusEnum.SHIPPED) ? 'success' : 'grey'}>
                                <LocalShipping fontSize="small" />
                            </TimelineDot>
                            <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                            <Typography variant="body2" fontWeight="medium">Shipped</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatDate(order.shippedAt)}
                            </Typography>
                        </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                        <TimelineSeparator>
                            <TimelineDot color={isCompleted(StatusEnum.DELIVERED) ? 'success' : 'grey'}>
                                <Done fontSize="small" />
                            </TimelineDot>
                        </TimelineSeparator>
                        <TimelineContent>
                            <Typography variant="body2" fontWeight="medium">Delivered</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatDate(order.deliveredAt)}
                            </Typography>
                        </TimelineContent>
                    </TimelineItem>
                </Timeline>

                {order.notes && (
                    <Box mt={3} p={2} bgcolor="warning.light" borderRadius={1}>
                        <Typography variant="body2" color="warning.dark">
                            <strong>Notes:</strong> {order.notes}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default OrderStatusDetails;
