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
import {formatCurrency, formatDiscount} from "../Utils/Utils.js";

const ProductRow = ({ product, selected, onSelectRow }) => {
    return (
        <TableRow hover selected={!!selected} onClick={() => onSelectRow(product.id)} style={{ cursor: 'pointer' }}>
            <TableCell padding="checkbox" onClick={e => e.stopPropagation()}>
                <Checkbox
                    color="primary"
                    checked={!!selected}
                    onChange={() => onSelectRow(product.id)}
                />
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
