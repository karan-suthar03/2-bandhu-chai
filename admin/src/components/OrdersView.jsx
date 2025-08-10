import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {getAdminOrders, deleteOrder, deleteOrders} from '../api';
import PaginationControl from './SectionComponents/PaginationControl.jsx';
import Filters from "./SectionComponents/Filters.jsx";
import MyTable from "./SectionComponents/MyTable.jsx";
import OrderRow from "./ordersPage/OrderRow.jsx";
import useDataList from "./hooks/useDataList.js";
import {PaymentMethodEnum, PaymentStatusEnum, StatusEnum} from "./ordersPage/enums.js";

const defaultFilters = {
  page: 1,
  limit: 12,
  category: '',
  search: '',
  _sort: '',
  _order: 'asc',
};

const columns = [
  { label: 'Order ID', key: 'id' },
  { label: 'Customer Name', key: 'customerName' },
  { label: 'Customer Email', key: 'customerEmail' },
  { label: 'Customer Phone', key: 'customerPhone' },
  { label: 'Status', key: 'status' },
  { label: 'Payment Status', key: 'paymentStatus' },
  { label: 'Payment Method', key: 'paymentMethod' },
  { label: 'Final Total', key: 'finalTotal' },
  { label: 'Subtotal', key: 'subtotal' },
  { label: 'Tax', key: 'tax' },
  { label: 'Discount', key: 'totalDiscount' },
  { label: 'Confirmed At', key: 'confirmedAt' },
  { label: 'Shipped At', key: 'shippedAt' },
  { label: 'Delivered At', key: 'deliveredAt' },
  { label: 'Created At', key: 'createdAt' },
  { label: 'Actions' },
];

const statusEnumList = Object.keys(StatusEnum).map(key => ({
  label: key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' '),
  value: StatusEnum[key]
}));

const paymentStatusEnumList = Object.keys(PaymentStatusEnum).map(key => ({
  label: key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' '),
  value: PaymentStatusEnum[key]
}));
const paymentMethodEnumList = Object.keys(PaymentMethodEnum).map(key => ({
  label: key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' '),
  value: PaymentMethodEnum[key]
}));

const allExtraFilters = [
  {label: 'Order ID', key: 'id'},
  {label: 'Customer Name', key: 'customerName'},
  {label: 'Customer Email', key: 'customerEmail'},
  {label: 'Customer Phone', key: 'customerPhone'},
  {label: 'Status', key: 'status', isEnum: true, enumValues: statusEnumList},
  {label: 'Payment Status', key: 'paymentStatus', isEnum: true, enumValues: paymentStatusEnumList},
  {label: 'Payment Method', key: 'paymentMethod', isEnum: true, enumValues: paymentMethodEnumList},
  {label: 'Min Total', key: 'minTotal'},
  {label: 'Max Total', key: 'maxTotal'},
  {label: 'Created At', key: 'createdAt', isTime: true},
  {label: 'Confirmed At', key: 'confirmedAt', isTime: true},
  {label: 'Shipped At', key: 'shippedAt', isTime: true},
  {label: 'Delivered At', key: 'deliveredAt', isTime: true},
]

const OrdersView = () => {
  const navigate = useNavigate();
  const {
    filters, setFilters,
    sort, handleSortChange,
    data: orders,
    pagination,
    loading,
    searchDebounce,
    setSearchDebounce,
    refetch
  } = useDataList(defaultFilters, getAdminOrders);

  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState(''); // 'single' or 'bulk'
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleteResult, setDeleteResult] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // Track refresh state

  useEffect(() => {
    setSelectedIds([]);
  }, [filters, sort, orders]);

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(orders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteSingle = (order) => {
    setOrderToDelete(order);
    setDeleteType('single');
    setDeleteDialog(true);
  };

  const handleEdit = (order) => {
    navigate(`/orders/edit/${order.id}`);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setDeleteType('bulk');
    setDeleteDialog(true);
  };

  const executeDelete = async () => {
    setDeleteLoading(true);
    setDeleteResult(null);
    
    try {
      let response;
      if (deleteType === 'single' && orderToDelete) {
        response = await deleteOrder(orderToDelete.id);
      } else if (deleteType === 'bulk') {
        response = await deleteOrders(selectedIds);
      }
      
      if (response?.data?.success) {
        setDeleteResult({
          type: 'success',
          message: response.data.message
        });
        setSelectedIds([]);

        try {
          setRefreshing(true);
          await new Promise(resolve => setTimeout(resolve, 500));
          if (typeof refetch === 'function') {
            await refetch();
            console.log('Order list refreshed successfully');
          } else {
            console.error('refetch function is not available');
            window.location.reload();
          }
        } catch (refreshError) {
          console.error('Failed to refresh data:', refreshError);
          setDeleteResult(prev => ({
            ...prev,
            message: prev.message + ' (Data refresh failed, please reload the page manually)'
          }));
        } finally {
          setRefreshing(false);
        }
      } else {
        throw new Error(response?.data?.message || 'Delete operation failed');
      }
    } catch (error) {
      setDeleteResult({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to delete'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeDeleteDialog = () => {
    const wasSuccessful = deleteResult?.type === 'success';
    
    setDeleteDialog(false);
    setDeleteType('');
    setOrderToDelete(null);
    setDeleteResult(null);
    
    if (wasSuccessful) {
      console.log('Dialog closed after successful operation, ensuring data is up to date');
      setTimeout(() => {
        if (typeof refetch === 'function') {
          refetch().catch(err => console.error('Final refetch failed:', err));
        }
      }, 100);
    }
  };

  const allSelected = useMemo(() => orders.length > 0 && selectedIds.length === orders.length, [selectedIds, orders]);
  const someSelected = useMemo(() => selectedIds.length > 0 && selectedIds.length < orders.length, [selectedIds, orders]);

  return (
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Order Dashboard</Typography>
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
            {selectedIds.length > 0 && (
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleDeleteSelected}
                disabled={deleteLoading}
              >
                Delete Selected ({selectedIds.length})
              </Button>
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
          {
            orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  selected={selectedIds.includes(order.id)}
                  onSelectRow={handleSelectRow}
                  onDelete={handleDeleteSingle}
                  onEdit={handleEdit}
                />
            ))
          }
        </MyTable>

        <PaginationControl
            pagination={pagination}
            filters={filters}
            setFilters={setFilters}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={closeDeleteDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {deleteType === 'single' 
              ? `Delete Order #${orderToDelete?.id}` 
              : `Delete ${selectedIds.length} Selected Orders`
            }
          </DialogTitle>
          <DialogContent>
            {deleteResult ? (
              <Alert severity={deleteResult.type} sx={{ mb: 2 }}>
                {deleteResult.message}
              </Alert>
            ) : (
              <Typography>
                {deleteType === 'single' 
                  ? `Are you sure you want to delete order #${orderToDelete?.id}? This action cannot be undone.`
                  : `Are you sure you want to delete ${selectedIds.length} selected orders? This action cannot be undone.`
                }
                <br /><br />
                <strong>Note:</strong> Only PENDING or CANCELLED orders can be deleted.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog} disabled={deleteLoading}>
              {deleteResult ? 'Close' : 'Cancel'}
            </Button>
            {!deleteResult && (
              <Button 
                onClick={executeDelete} 
                color="error" 
                variant="contained"
                disabled={deleteLoading}
              >
                {deleteLoading ? <CircularProgress size={20} /> : 'Delete'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default OrdersView;
