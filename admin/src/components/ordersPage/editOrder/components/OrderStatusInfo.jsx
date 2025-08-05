import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Chip,
    Stack
} from '@mui/material';
import { Save, Timeline, CheckCircle, Cancel, LocalShipping, Schedule } from '@mui/icons-material';
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
        case StatusEnum.DELIVERED:
            return <CheckCircle />;
        case StatusEnum.CANCELLED:
        case StatusEnum.REFUNDED:
            return <Cancel />;
        case StatusEnum.SHIPPED:
        case StatusEnum.OUT_FOR_DELIVERY:
            return <LocalShipping />;
        default:
            return <Schedule />;
    }
};

const OrderStatusInfo = ({ order, onSave, saving }) => {
    const [formData, setFormData] = useState({
        status: order.status,
        notes: ''
    });
    const [isModified, setIsModified] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const statusOptions = [
        { value: StatusEnum.PENDING, label: 'Pending' },
        { value: StatusEnum.CONFIRMED, label: 'Confirmed' },
        { value: StatusEnum.PROCESSING, label: 'Processing' },
        { value: StatusEnum.SHIPPED, label: 'Shipped' },
        { value: StatusEnum.OUT_FOR_DELIVERY, label: 'On the Way' },
        { value: StatusEnum.DELIVERED, label: 'Delivered' },
        { value: StatusEnum.CANCELLED, label: 'Cancelled' },
        { value: StatusEnum.RETURNED, label: 'Returned' },
        { value: StatusEnum.REFUNDED, label: 'Refunded' }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setIsModified(field === 'status' ? value !== order.status : true);
        setError('');
        setSuccess('');
    };

    const handleSave = async () => {
        try {
            setError('');
            
            if (!formData.status) {
                setError('Please select a status');
                return;
            }

            const saveData = {
                status: formData.status,
                notes: formData.notes || `Status updated to ${getStatusLabel(formData.status)}`
            };

            await onSave(saveData);
            setIsModified(false);
            setFormData(prev => ({ ...prev, notes: '' }));
            setSuccess('Order status updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Save error:', err);
            setError(err.message || 'Failed to save changes');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleString();
    };

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                        <Timeline />
                        Order Status
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                        onClick={handleSave}
                        disabled={!isModified || saving}
                        size="small"
                    >
                        {saving ? 'Saving...' : 'Update Status'}
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                <Stack spacing={2}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Current Status
                        </Typography>
                        <Chip
                            icon={getStatusIcon(order.status)}
                            label={getStatusLabel(order.status)}
                            color={getStatusColor(order.status)}
                            size="medium"
                            sx={{ mb: 2 }}
                        />
                    </Box>

                    <FormControl fullWidth>
                        <InputLabel>New Status</InputLabel>
                        <Select
                            value={formData.status}
                            label="New Status"
                            onChange={(e) => handleInputChange('status', e.target.value)}
                        >
                            {statusOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        {getStatusIcon(option.value)}
                                        {option.label}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Status Update Notes"
                        multiline
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Add a note about this status change (optional)"
                        helperText="This note will be saved in the order history"
                    />

                    <Box mt={2}>
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                            Order Timeline
                        </Typography>
                        <Stack spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                                Created: {formatDate(order.createdAt)}
                            </Typography>
                            {order.confirmedAt && (
                                <Typography variant="caption" color="text.secondary">
                                    Confirmed: {formatDate(order.confirmedAt)}
                                </Typography>
                            )}
                            {order.shippedAt && (
                                <Typography variant="caption" color="text.secondary">
                                    Shipped: {formatDate(order.shippedAt)}
                                </Typography>
                            )}
                            {order.deliveredAt && (
                                <Typography variant="caption" color="text.secondary">
                                    Delivered: {formatDate(order.deliveredAt)}
                                </Typography>
                            )}
                            {order.cancelledAt && (
                                <Typography variant="caption" color="text.secondary">
                                    Cancelled: {formatDate(order.cancelledAt)}
                                </Typography>
                            )}
                        </Stack>
                    </Box>
                </Stack>

                <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Note:</strong> Status changes are permanent and will trigger notifications 
                        to the customer. Ensure the status accurately reflects the current state of the order.
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default OrderStatusInfo;
