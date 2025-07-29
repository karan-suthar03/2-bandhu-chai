import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import {getAdminOrders} from '../api';
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
  { label: 'Order Number', key: 'orderNumber' },
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
  {label: 'Order Number', key: 'orderNumber'},
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
  const {
    filters, setFilters,
    sort, handleSortChange,
    data: orders,
    pagination,
    loading,
    searchDebounce,
    setSearchDebounce
  } = useDataList(defaultFilters, getAdminOrders);

  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setSelectedIds([]);
  }, [filters, sort, orders]);

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(orders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const allSelected = useMemo(() => orders.length > 0 && selectedIds.length === orders.length, [selectedIds, orders]);
  const someSelected = useMemo(() => selectedIds.length > 0 && selectedIds.length < orders.length, [selectedIds, orders]);

  return (
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Order Dashboard</Typography>
          <Button variant="contained">+ Add Order</Button>
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
          {
            orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  selected={selectedIds.includes(order.id)}
                  onSelectRow={handleSelectRow}
                />
            ))
          }
        </MyTable>

        <PaginationControl
            pagination={pagination}
            filters={filters}
            setFilters={setFilters}
        />
      </Box>
  );
};

export default OrdersView;
