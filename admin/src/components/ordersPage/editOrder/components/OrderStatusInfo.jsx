import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress, Chip, Stack } from '@mui/material';
import { Save, Timeline } from '@mui/icons-material';
import {StatusEnum} from "../../enums.js";
import {getStatusColor, getStatusIcon, getStatusLabel} from "../../Utils/orderUtils.jsx";
import {formatDate} from "../../../Utils/Utils.js";

const OrderStatusInfo = ({ order, onSave, saving }) => {
    const [status, setStatus] = useState(order.status);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const statusOptions = Object.values(StatusEnum);

    const handleSave = async () => {
        try {
            await onSave({ status, notes: notes || `Status updated to ${getStatusLabel(status)}` });
            setNotes('');
            setSuccess('Status updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update status.');
        }
    };

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}><Timeline /> Order Status</Typography>
                    <Button variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <Save />} onClick={handleSave} disabled={status === order.status || saving} size="small">{saving ? 'Updating...' : 'Update'}</Button>
                </Box>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">Current Status</Typography>
                        <Chip icon={getStatusIcon(order.status)} label={getStatusLabel(order.status)} color={getStatusColor(order.status)} sx={{ mt: 1 }} />
                    </Box>
                    <FormControl fullWidth>
                        <InputLabel>New Status</InputLabel>
                        <Select value={status} label="New Status" onChange={(e) => setStatus(e.target.value)}>
                            {statusOptions.map((opt) => <MenuItem key={opt} value={opt}>{getStatusLabel(opt)}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField fullWidth label="Status Update Notes" multiline rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note (optional)" />
                    <Box>
                        <Typography variant="caption" color="text.secondary">Created: {formatDate(order.createdAt)}</Typography><br/>
                        {order.confirmedAt && <Typography variant="caption" color="text.secondary">Confirmed: {formatDate(order.confirmedAt)}</Typography>}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default OrderStatusInfo;