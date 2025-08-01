import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { getAdminProducts, updateProduct, bulkDeactivateProducts, bulkActivateProducts } from '../api';
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
  { label: 'Deactivated', key: 'deactivated' },
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
  { label: 'Fast Delivery', key: 'fastDelivery', isBoolean: true },
  { label: 'Deactivated', key: 'deactivated', isBoolean: true }
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
    setSearchDebounce,
    refetch
  } = useDataList(defaultFilters, getAdminProducts);

  const [selectedIds, setSelectedIds] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState(''); // 'single' or 'bulk'
  const [actionMode, setActionMode] = useState(''); // 'activate' or 'deactivate'
  const [productToToggle, setProductToToggle] = useState(null);
  const [actionResult, setActionResult] = useState(null);
  const [selectedCount, setSelectedCount] = useState(0); // Store count when dialog opens
  const [refreshing, setRefreshing] = useState(false); // Track refresh state

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

  const handleToggleActivation = (product) => {
    setProductToToggle(product);
    setActionType('single');
    setActionMode(product.deactivated ? 'activate' : 'deactivate');
    setActionDialog(true);
  };

  const handleBulkAction = (mode) => {
    if (selectedIds.length === 0) {
      console.warn('No products selected for bulk action');
      return;
    }
    setSelectedCount(selectedIds.length);
    setActionType('bulk');
    setActionMode(mode);
    setActionDialog(true);
  };

  const executeAction = async () => {
    setActionLoading(true);
    setActionResult(null);
    
    try {
      let successCount = 0;
      const isActivating = actionMode === 'activate';
      
      if (actionType === 'single' && productToToggle) {
        const response = await updateProduct(productToToggle.id, { 
          deactivated: !isActivating 
        });
        
        if (response?.data?.success) {
          successCount = 1;
        } else {
          throw new Error(response?.data?.message || `Failed to ${actionMode} product`);
        }
      } else if (actionType === 'bulk') {
        if (selectedIds.length === 0) {
          throw new Error('No products selected for bulk operation');
        }

        const operationCount = selectedCount || selectedIds.length;
        if (operationCount === 0) {
          throw new Error('No products selected for bulk operation');
        }

        let response;
        if (isActivating) {
          response = await bulkActivateProducts(selectedIds);
        } else {
          response = await bulkDeactivateProducts(selectedIds);
        }
        
        if (response?.data?.success) {
          successCount = response.data.data?.activatedCount || response.data.data?.deactivatedCount || operationCount;
        } else {
          throw new Error(response?.data?.message || `Failed to ${actionMode} products`);
        }
      }
      
      setActionResult({
        type: 'success',
        message: `Successfully ${actionMode}d ${successCount} product${successCount > 1 ? 's' : ''}${actionType === 'bulk' ? ` out of ${selectedCount} selected` : ''}`
      });
      setSelectedIds([]);

      try {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        if (typeof refetch === 'function') {
          await refetch();
          console.log('Product list refreshed successfully');
        } else {
          console.error('refetch function is not available');
          window.location.reload();
        }
      } catch (refreshError) {
        console.error('Failed to refresh data:', refreshError);
        setActionResult(prev => ({
          ...prev,
          message: prev.message + ' (Data refresh failed, please reload the page manually)'
        }));
      } finally {
        setRefreshing(false);
      }
    } catch (error) {
      console.error('Action execution error:', error);
      
      let errorMessage = `Failed to ${actionMode} product${actionType === 'bulk' ? 's' : ''}`;
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (actionType === 'bulk' && selectedCount === 0) {
        errorMessage = 'No products were selected for the bulk operation';
      } else if (error.message?.includes('refetch')) {
        errorMessage += ' (Note: Data refresh failed, please reload the page to see changes)';
      }
      
      setActionResult({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setActionLoading(false);
    }
  };

  const closeActionDialog = () => {
    const wasSuccessful = actionResult?.type === 'success';
    
    setActionDialog(false);
    setActionType('');
    setActionMode('');
    setProductToToggle(null);
    setActionResult(null);
    setSelectedCount(0);
    if (wasSuccessful) {
      console.log('Dialog closed after successful operation, ensuring data is up to date');
      setTimeout(() => {
        if (typeof refetch === 'function') {
          refetch().catch(err => console.error('Final refetch failed:', err));
        }
      }, 100);
    }
  };

  return (
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Products Dashboard</Typography>
          <Box display="flex" gap={2}>
            <Button 
              variant="outlined" 
              onClick={() => {
                setRefreshing(true);
                refetch().finally(() => setRefreshing(false));
              }}
              disabled={loading || refreshing}
              size="small"
            >
              🔄 Refresh
            </Button>
            <Button variant="contained" onClick={() => navigate('/dashboard/products/add')}>
              + Add Product
            </Button>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" mb={2} gap={2}>
          <Filters
              filters={filters}
              setFilters={setFilters}
              searchDebounce={searchDebounce}
              setSearchDebounce={setSearchDebounce}
              allExtraFilters={allExtraFilters}
          />
          <Box display="flex" gap={2} alignItems="center">
            {selectedIds.length > 0 ? (
              <>
                <Button 
                  variant="contained" 
                  color="warning" 
                  onClick={() => handleBulkAction('deactivate')}
                  disabled={actionLoading}
                >
                  Deactivate Selected ({selectedIds.length})
                </Button>
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => handleBulkAction('activate')}
                  disabled={actionLoading}
                >
                  Activate Selected ({selectedIds.length})
                </Button>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Select products to activate or deactivate them
              </Typography>
            )}
            {(loading || refreshing) && <CircularProgress size={24} />}
            {refreshing && !loading && (
              <Typography variant="body2" color="primary">
                Refreshing data...
              </Typography>
            )}
          </Box>
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
                  onToggleActivation={handleToggleActivation}
                />
            ))}
        </MyTable>

        <PaginationControl
            pagination={pagination}
            filters={filters}
            setFilters={setFilters}
        />
        <Dialog open={actionDialog} onClose={closeActionDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {actionType === 'single' 
              ? `${actionMode === 'activate' ? 'Activate' : 'Deactivate'} Product: ${productToToggle?.name}` 
              : `${actionMode === 'activate' ? 'Activate' : 'Deactivate'} ${selectedCount} Selected Products`
            }
          </DialogTitle>
          <DialogContent>
            {actionResult ? (
              <Alert severity={actionResult.type} sx={{ mb: 2 }}>
                {actionResult.message}
              </Alert>
            ) : (
              <Typography>
                {actionType === 'single' 
                  ? `Are you sure you want to ${actionMode} "${productToToggle?.name}"?`
                  : `Are you sure you want to ${actionMode} ${selectedCount} selected products?`
                }
                <br /><br />
                {actionMode === 'deactivate' && (
                  <><strong>Note:</strong> Deactivated products will not be visible to customers and cannot be purchased.</>
                )}
                {actionMode === 'activate' && (
                  <><strong>Note:</strong> Activated products will be visible to customers and available for purchase.</>
                )}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeActionDialog} disabled={actionLoading}>
              {actionResult ? 'Close' : 'Cancel'}
            </Button>
            {!actionResult && (
              <Button 
                onClick={executeAction} 
                color={actionMode === 'activate' ? 'success' : 'warning'} 
                variant="contained"
                disabled={actionLoading}
              >
                {actionLoading ? <CircularProgress size={20} /> : `${actionMode === 'activate' ? 'Activate' : 'Deactivate'}`}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default ProductsView;
