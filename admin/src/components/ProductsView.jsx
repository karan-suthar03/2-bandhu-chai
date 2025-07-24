import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { getAdminProducts } from '../api';
import PaginationControl from './productPage/PaginationControl.jsx';
import ProductTable from './productPage/ProductTable.jsx';
import ProductFilters from './productPage/ProductFilters.jsx';

const defaultFilters = {
  page: 1,
  limit: 12,
  category: '',
  search: '',
  _sort: '',
  _order: 'asc',
};

const ProductsView = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState(defaultFilters);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchDebounce, setSearchDebounce] = useState('');
  const [sort, setSort] = useState({ field: '', _order: 'asc' });

  // Sync filters from URL on load
  useEffect(() => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = isNaN(value) ? value : Number(value);
    }
    const updatedFilters = { ...defaultFilters, ...params };
    setFilters(updatedFilters);
    setSearchDebounce(updatedFilters.search);
    setSort({ field: updatedFilters._sort, _order: updatedFilters._order });
  }, [searchParams]);

  // Update URL when filters change
  useEffect(() => {
    const newParams = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== '' && filters[key] != null) {
        newParams[key] = filters[key];
      }
    });
    setSearchParams(newParams);
  }, [filters]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getAdminProducts(filters);
        setProducts(response.data.data);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  // Handle sorting
  const handleSortChange = (field) => {
    setSort((prev) => {
      const order = prev.field === field && prev.order === 'asc' ? 'desc' : 'asc';
      setFilters((prevFilters) => ({
        ...prevFilters,
        _sort: field,
        _order: order,
        page: 1,
      }));
      return { field, order };
    });
  };

  const columns = [
    { label: 'ID', key: 'id' },
    { label: 'Image' },
    { label: 'Name', key: 'name' },
    { label: 'Category', key: 'category' },
    { label: 'Price', key: 'price' },
    { label: 'Old Price', key: 'oldPrice' },
    { label: 'Discount', key: 'discount' },
    { label: 'Featured', key: 'featured' },
    { label: 'Stock', key: 'stock' },
    { label: 'Badge', key: 'badge' },
    { label: 'Rating', key: 'rating' },
    { label: 'Is New', key: 'isNew' },
    { label: 'Is Organic', key: 'organic' },
    { label: 'Fast Delivery', key: 'fastDelivery' },
    { label: 'Actions' },
  ];

  return (
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Products Dashboard</Typography>
          <Button variant="contained">+ Add Product</Button>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" mb={2} gap={2}>
          <ProductFilters
              filters={filters}
              setFilters={setFilters}
              searchDebounce={searchDebounce}
              setSearchDebounce={setSearchDebounce}
          />
          {loading && <CircularProgress size={24} />}
        </Box>

        <ProductTable
            products={products}
            sort={sort}
            handleSortChange={handleSortChange}
            columns={columns}
        />

        <PaginationControl
            pagination={pagination}
            filters={filters}
            setFilters={setFilters}
        />
      </Box>
  );
};

export default ProductsView;
