import {
    TableCell,
    TableRow,
    Checkbox,
    Chip,
    Stack,
    Tooltip,
    IconButton,
    Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {PaymentMethodEnum, PaymentStatusEnum, StatusEnum} from "./enums.js";
import dayjs from 'dayjs';

const OrderRow = ({ order, selected, onSelectRow, onDelete, onEdit }) => {
    return (
        <TableRow hover selected={!!selected} onClick={() => onSelectRow(order.id)} style={{ cursor: 'pointer' }}>
            <TableCell padding="checkbox" onClick={e => e.stopPropagation()}>
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
                {order.status ? (
                    <Chip
                        label={{
                            [StatusEnum.PENDING]: 'Pending',
                            [StatusEnum.CONFIRMED]: 'Confirmed',
                            [StatusEnum.PROCESSING]: 'Processing',
                            [StatusEnum.SHIPPED]: 'Shipped',
                            [StatusEnum.OUT_FOR_DELIVERY]: 'On the Way',
                            [StatusEnum.DELIVERED]: 'Delivered',
                            [StatusEnum.CANCELLED]: 'Cancelled',
                            [StatusEnum.RETURNED]: 'Returned',
                            [StatusEnum.REFUNDED]: 'Refunded'
                        }[order.status]}
                        color={
                            {
                                [StatusEnum.DELIVERED]: 'success',
                                [StatusEnum.CANCELLED]: 'error',
                                [StatusEnum.REFUNDED]: 'info',
                                [StatusEnum.RETURNED]: 'warning'
                            }[order.status] || 'default'
                        }
                        size="small"
                        variant="filled"
                        sx={{
                            bgcolor:
                                {
                                    [StatusEnum.PENDING]: '#ff9800',
                                    [StatusEnum.CONFIRMED]: '#2196f3',
                                    [StatusEnum.PROCESSING]: '#00bcd4',
                                    [StatusEnum.SHIPPED]: '#673ab7',
                                    [StatusEnum.OUT_FOR_DELIVERY]: '#3f51b5'
                                }[order.status],
                            color: '#fff'
                        }}
                    />
                ) : (
                    <Box width={48} height={24} display="flex" alignItems="center" justifyContent="center">
                        N/A
                    </Box>
                )}
            </TableCell>
            <TableCell>
                <Chip
                    label={{
                        [PaymentStatusEnum.PENDING]: 'Pending',
                        [PaymentStatusEnum.COMPLETED]: 'Paid',
                        [PaymentStatusEnum.FAILED]: 'Failed',
                        [PaymentStatusEnum.REFUNDED]: 'Refunded'
                    }[order.paymentStatus]}
                    size="small"
                    variant="filled"
                    sx={{
                        bgcolor: {
                            [PaymentStatusEnum.PENDING]: '#ff9800',
                            [PaymentStatusEnum.COMPLETED]: '#4caf50',
                            [PaymentStatusEnum.FAILED]: '#f44336',
                            [PaymentStatusEnum.REFUNDED]: '#03a9f4'
                        }[order.paymentStatus],
                        color: '#fff'
                    }}
                />
            </TableCell>
            <TableCell>
                <Chip
                    label={{
                        [PaymentMethodEnum.CASH_ON_DELIVERY]: 'Cash On Delivery',
                        [PaymentMethodEnum.CREDIT_CARD]: 'Credit Card',
                        [PaymentMethodEnum.DEBIT_CARD]: 'Debit Card',
                        [PaymentMethodEnum.UPI]: 'UPI',
                        [PaymentMethodEnum.NET_BANKING]: 'Net Banking',
                        [PaymentMethodEnum.WALLET]: 'Wallet'
                    }[order.paymentMethod]}
                    size="small"
                    variant="outlined"
                    sx={{
                        bgcolor: {
                            [PaymentMethodEnum.CASH_ON_DELIVERY]: '#795548',
                            [PaymentMethodEnum.CREDIT_CARD]: '#3f51b5',
                            [PaymentMethodEnum.DEBIT_CARD]: '#009688',
                            [PaymentMethodEnum.UPI]: '#4caf50',
                            [PaymentMethodEnum.NET_BANKING]: '#2196f3',
                            [PaymentMethodEnum.WALLET]: '#ff9800'
                        }[order.paymentMethod],
                        color: '#fff',
                        border: 'none'
                    }}
                />
            </TableCell>
            <TableCell>{order.finalTotal}</TableCell>
            <TableCell>{order.subtotal}</TableCell>
            <TableCell>{order.tax}</TableCell>
            <TableCell>{order.totalDiscount}</TableCell>
            <TableCell>{order.confirmedAt ? dayjs(order.confirmedAt).format('DD MMM YYYY, hh:mm A') : '—'}</TableCell>
            <TableCell>{order.shippedAt ? dayjs(order.shippedAt).format('DD MMM YYYY, hh:mm A') : '—'}</TableCell>
            <TableCell>{order.deliveredAt ? dayjs(order.deliveredAt).format('DD MMM YYYY, hh:mm A') : '—'}</TableCell>
            <TableCell>{order.createdAt ? dayjs(order.createdAt).format('DD MMM YYYY, hh:mm A') : '—'}</TableCell>
            <TableCell align="center">
                <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title="Edit">
                        <IconButton 
                            size="small" 
                            color="primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit && onEdit(order);
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton 
                            size="small" 
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete && onDelete(order);
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </TableCell>
        </TableRow>
    );
};

export default OrderRow;
