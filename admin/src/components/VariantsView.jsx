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
import Filters from "./SectionComponents/Filters.jsx";
import MyTable from "./SectionComponents/MyTable.jsx";
import VariantRow from "./variantsPage/VariantRow.jsx";
import useDataList from "./hooks/useDataList.js";
import { useNavigate } from 'react-router-dom';

const defaultFilters = {
    page: 1,
    limit: 15,
    search: '',
};

const columns = [
    { label: 'SKU' },
    { label: 'Product' },
    { label: 'Image' },
    { label: 'Category' },
    { label: 'Size' },
    { label: 'Price' },
    { label: 'Old Price' },
    { label: 'Discount' },
    { label: 'Stock' },
    { label: 'Status' },
];

const VariantsView = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const {
        filters, setFilters,
        data: variants,
        pagination,
        loading,
        searchDebounce,
        setSearchDebounce
    } = useDataList(defaultFilters, getAllVariants);

    const allExtraFilters = [
        { label: 'SKU', key: 'sku' },
        { label: 'Product ID', key: 'productId' },
        { label: 'Size', key: 'size' },
        { label: 'Min Price', key: 'minPrice' },
        { label: 'Max Price', key: 'maxPrice' },
        { label: 'Min Stock', key: 'minStock' },
        { label: 'Max Stock', key: 'maxStock' },
        { 
            label: 'Low Stock Only', 
            key: 'lowStock', 
            isEnum: true, 
            enumValues: [
                { label: 'All', value: '' },
                { label: 'Low Stock Only', value: 'true' },
            ]
        },
        { 
            label: 'Out of Stock Only', 
            key: 'outOfStock', 
            isEnum: true, 
            enumValues: [
                { label: 'All', value: '' },
                { label: 'Out of Stock Only', value: 'true' },
            ]
        },
    ];

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
            
            <Filters
                filters={filters}
                setFilters={setFilters}
                searchDebounce={searchDebounce}
                setSearchDebounce={setSearchDebounce}
                allExtraFilters={allExtraFilters}
            />
            
            <MyTable
                columns={columns}
            >
                {variants && Array.isArray(variants) ? variants.map((variant) => (
                    <VariantRow
                        key={variant.id}
                        variant={variant}
                        onViewProduct={(productId) => navigate(`/products/view/${productId}`)}
                    />
                )) : loading ? (
                    <TableRow>
                        <TableCell colSpan={columns.length} style={{ textAlign: 'center', padding: '20px' }}>
                            Loading variants...
                        </TableCell>
                    </TableRow>
                ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} style={{ textAlign: 'center', padding: '20px' }}>
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
