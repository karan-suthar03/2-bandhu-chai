import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableCell, TableRow, Checkbox, Chip, Stack, Tooltip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {formatCurrency, formatDate} from "../Utils/Utils.js";
import {getPaymentMethodChipProps, getPaymentStatusChipProps, getStatusChipProps} from "./Utils/orderUtils.jsx";

const OrderRow = ({ order, selected, onSelectRow, onDelete, onEdit }) => {
    const navigate = useNavigate();

    const statusChipProps = React.useMemo(() => getStatusChipProps(order.status), [order.status]);
    const paymentStatusChipProps = React.useMemo(() => getPaymentStatusChipProps(order.paymentStatus), [order.paymentStatus]);
    const paymentMethodChipProps = React.useMemo(() => getPaymentMethodChipProps(order.paymentMethod), [order.paymentMethod]);

    const handleRowClick = () => {
        navigate(`/dashboard/orders/view/${order.id}`);
    };

    const handleActionClick = (e, action) => {
        e.stopPropagation();
        action(order);
    };

    return (
        <TableRow hover selected={!!selected} onClick={handleRowClick} sx={{ cursor: 'pointer' }}>
            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    color="primary"
                    checked={!!selected}
                    onChange={() => onSelectRow(order.id)}
                />
            </TableCell>
            <TableCell>{order.id}</TableCell>
            <TableCell>{order.customerName}</TableCell>
            <TableCell>{order.customerEmail}</TableCell>
            <TableCell>{order.customerPhone}</TableCell>
            <TableCell>
                <Chip {...statusChipProps} size="small" variant="filled" />
            </TableCell>
            <TableCell>
                <Chip {...paymentStatusChipProps} size="small" variant="filled" />
            </TableCell>
            <TableCell>
                <Chip {...paymentMethodChipProps} size="small" variant="outlined" />
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(order.finalTotal)}</TableCell>
            <TableCell>{formatCurrency(order.subtotal)}</TableCell>
            <TableCell>{formatCurrency(order.tax)}</TableCell>
            <TableCell>{formatCurrency(order.totalDiscount)}</TableCell>
            <TableCell>{formatDate(order.confirmedAt)}</TableCell>
            <TableCell>{formatDate(order.shippedAt)}</TableCell>
            <TableCell>{formatDate(order.deliveredAt)}</TableCell>
            <TableCell>{formatDate(order.createdAt)}</TableCell>
            <TableCell align="center">
                <Stack direction="row" spacing={0.5} justifyContent="center" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={(e) => handleActionClick(e, onEdit)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={(e) => handleActionClick(e, onDelete)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </TableCell>
        </TableRow>
    );
};

export default memo(OrderRow);