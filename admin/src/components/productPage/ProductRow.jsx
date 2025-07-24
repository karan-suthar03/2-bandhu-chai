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

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

const formatDiscount = (discount) =>
    discount === 0 ? 'No Discount' : `${parseFloat((discount * 100).toFixed(2))}%`;

const ProductRow = ({ product }) => {
    return (
        <TableRow hover>
            <TableCell padding="checkbox">
                <Checkbox color="primary" />
            </TableCell>
            <TableCell>{product.id}</TableCell>
            <TableCell>
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        style={{ borderRadius: 4, objectFit: 'cover' }}
                    />
                ) : (
                    <Box
                        width={48}
                        height={48}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bgcolor="grey.100"
                        borderRadius={1}
                        fontSize={12}
                        color="text.secondary"
                    >
                        No Image
                    </Box>
                )}
            </TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.category}</TableCell>
            <TableCell>{formatCurrency(product.price)}</TableCell>
            <TableCell sx={{ textDecoration: 'line-through' }}>
                {formatCurrency(product.oldPrice)}
            </TableCell>
            <TableCell>{formatDiscount(product.discount)}</TableCell>
            {[product.featured, product.stock, product.badge, product.rating, product.isNew, product.organic, product.fastDelivery]
                .map((value, index) => (
                    <TableCell key={index}>
                        {typeof value === 'boolean' ? (
                            <Chip
                                label={value ? 'Yes' : 'No'}
                                color={value ? 'success' : 'default'}
                                size="small"
                                variant={value ? 'filled' : 'outlined'}
                            />
                        ) : index === 3 ? (
                            value ? value.toFixed(1) : 'N/A'
                        ) : (
                            value
                        )}
                    </TableCell>
                ))}
            <TableCell align="center">
                <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title="Edit">
                        <IconButton size="small" color="primary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" color="error">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </TableCell>
        </TableRow>
    );
};

export default ProductRow;
