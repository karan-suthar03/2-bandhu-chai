import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { getAdminProducts } from '../api';
import PaginationControl from './SectionComponents/PaginationControl.jsx';
import Filters from "./SectionComponents/Filters.jsx";
import MyTable from "./SectionComponents/MyTable.jsx";
import ProductRow from "./productPage/ProductRow.jsx";
import useDataList from "./hooks/useDataList.js";
import { useNavigate } from 'react-router-dom';

const defaultFilters = {
  page: 1,
  limit: 12,
  category: '',
  search: '',
  _sort: '',
  _order: 'asc',
};

const columns = [
  { label: 'Id', key: 'id' },
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
const allExtraFilters = [
  { label: 'Id', key: 'id', isBoolean: false},
  { label: 'Description', key: 'description', isBoolean: false },
  { label: 'Badge', key: 'badge', isBoolean: false },
  { label: 'Min Price', key: 'minPrice', isBoolean: false },
  { label: 'Max Price', key: 'maxPrice', isBoolean: false },
  { label: 'Category', key: 'category', isBoolean: false },
  { label: 'Min Stock', key: 'minStock', isBoolean: false },
  { label: 'Max Stock', key: 'maxStock', isBoolean: false },
  { label: 'Featured', key: 'featured', isBoolean: true },
  { label: 'Organic', key: 'organic', isBoolean: true },
  { label: 'Is New', key: 'isNew', isBoolean: true },
  { label: 'Fast Delivery', key: 'fastDelivery', isBoolean: true }
]

const ProductsView = () => {
  const navigate = useNavigate();
  const {
    filters, setFilters,
    sort, handleSortChange,
    data: products,
    pagination,
    loading,
    searchDebounce,
    setSearchDebounce
  } = useDataList(defaultFilters, getAdminProducts);

  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setSelectedIds([]);
  }, [filters, sort, products]);

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(products.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const allSelected = useMemo(() => products.length > 0 && selectedIds.length === products.length, [selectedIds, products]);
  const someSelected = useMemo(() => selectedIds.length > 0 && selectedIds.length < products.length, [selectedIds, products]);

  return (
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Products Dashboard</Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard/products/add')}>+ Add Product</Button>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" mb={2} gap={2}>
          <Filters
              filters={filters}
              setFilters={setFilters}
              searchDebounce={searchDebounce}
              setSearchDebounce={setSearchDebounce}
              allExtraFilters={allExtraFilters}
          />
          {loading && <CircularProgress size={24} />}
        </Box>
        <Box mb={1}>
          <Typography variant="subtitle1">
            Selected Rows: {selectedIds.length}
          </Typography>
        </Box>
        <MyTable
            sort={sort}
            handleSortChange={handleSortChange}
            columns={columns}
            onSelectAll={handleSelectAll}
            allSelected={allSelected}
            someSelected={someSelected}
        >
            {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  selected={selectedIds.includes(product.id)}
                  onSelectRow={handleSelectRow}
                />
            ))}
        </MyTable>

        <PaginationControl
            pagination={pagination}
            filters={filters}
            setFilters={setFilters}
        />
      </Box>
  );
};

export default ProductsView;
