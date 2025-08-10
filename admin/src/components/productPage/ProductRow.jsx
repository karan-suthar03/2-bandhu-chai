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
import VisibilityIcon from '@mui/icons-material/Visibility';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import {formatCurrency, formatDiscount} from "../Utils/Utils.js";
import { useNavigate } from 'react-router-dom';

const ProductRow = ({ product, selected, onSelectRow, onToggleActivation }) => {
    const navigate = useNavigate();
    const isDeactivated = product.deactivated;
    
    return (
        <TableRow 
            hover 
            selected={!!selected} 
            onClick={() => onSelectRow(product.id)} 
            style={{ 
                cursor: 'pointer',
                opacity: isDeactivated ? 0.5 : 1,
                backgroundColor: isDeactivated ? '#f5f5f5' : 'inherit'
            }}
        >
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
                        src={product.image.smallUrl}
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
            <TableCell>{formatCurrency(product.defaultVariant?.price || 0)}</TableCell>
            <TableCell sx={{ textDecoration: 'line-through' }}>
                {product.defaultVariant?.oldPrice ? formatCurrency(product.defaultVariant.oldPrice) : '-'}
            </TableCell>
            <TableCell>{product.defaultVariant?.discount ? formatDiscount(product.defaultVariant.discount) : '-'}</TableCell>
            {[product.featured, product.defaultVariant?.stock || 0, product.badge, product.rating, product.isNew, product.organic, product.fastDelivery, product.deactivated]
                .map((value, index) => (
                    <TableCell key={index}>
                        {typeof value === 'boolean' ? (
                            <Chip
                                label={value ? 'Yes' : 'No'}
                                color={value ? (index === 7 ? 'error' : 'success') : 'default'}
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
                    <Tooltip title="View Product Details">
                        <IconButton 
                            size="small" 
                            color="info"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/products/view/${product.id}`);
                            }}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Product">
                        <IconButton 
                            size="small" 
                            color="primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/products/edit/${product.id}`);
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={isDeactivated ? "Activate Product" : "Deactivate Product"}>
                        <IconButton 
                            size="small" 
                            color={isDeactivated ? "success" : "warning"}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleActivation && onToggleActivation(product);
                            }}
                        >
                            {isDeactivated ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Stack>
            </TableCell>
        </TableRow>
    );
};

export default ProductRow;
