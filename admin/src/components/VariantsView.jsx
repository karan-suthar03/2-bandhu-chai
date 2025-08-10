import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Alert,
    Stack,
    TableRow,
    TableCell
} from '@mui/material';
import { 
    Inventory as InventoryIcon
} from '@mui/icons-material';
import { getAllVariants } from '../api';
import PaginationControl from './SectionComponents/PaginationControl.jsx';
import MyTable from "./SectionComponents/MyTable.jsx";
import VariantRow from "./variantsPage/VariantRow.jsx";
import useDataList from "./hooks/useDataList.js";
import { useNavigate } from 'react-router-dom';

const defaultFilters = {
    page: 1,
    limit: 15,
    search: '',
    _sort: 'createdAt',
    _order: 'desc',
};

const columns = [
    { label: 'SKU', key: 'sku', field: 'sku' },
    { label: 'Product', key: 'productName', field: 'product.name' },
    { label: 'Category', key: 'category', field: 'product.category' },
    { label: 'Size', key: 'size', field: 'size' },
    { label: 'Price', key: 'price', field: 'price' },
    { label: 'Old Price', key: 'oldPrice', field: 'oldPrice' },
    { label: 'Discount', key: 'discount', field: 'discount' },
    { label: 'Stock', key: 'stock', field: 'stock' },
    { label: 'Status', key: 'status', field: 'stock' },
];

const VariantsView = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const {
        filters, setFilters,
        sort, handleSortChange,
        data: variants,
        pagination,
        loading
    } = useDataList(defaultFilters, getAllVariants);

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Product Variants Management
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/products')}
                    >
                        View Products
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/products/add')}
                        startIcon={<InventoryIcon />}
                    >
                        Add Product
                    </Button>
                </Stack>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            <MyTable
                sort={sort}
                handleSortChange={handleSortChange}
                columns={columns}
                onSelectAll={() => {}}
                allSelected={false}
                someSelected={false}
            >
                {variants && Array.isArray(variants) ? variants.map((variant) => (
                    <VariantRow
                        key={variant.id}
                        variant={variant}
                        onViewProduct={(productId) => navigate(`/products/view/${productId}`)}
                    />
                )) : loading ? (
                    <TableRow>
                        <TableCell colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '20px' }}>
                            Loading variants...
                        </TableCell>
                    </TableRow>
                ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '20px' }}>
                            No variants found
                        </TableCell>
                    </TableRow>
                )}
            </MyTable>
            <PaginationControl
                pagination={pagination}
                filters={filters}
                setFilters={setFilters}
            />
        </Box>
    );
};

export default VariantsView;
