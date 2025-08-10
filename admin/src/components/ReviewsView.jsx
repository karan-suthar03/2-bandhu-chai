import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  getAdminReviews, 
  getReviewStats,
  deleteReview, 
  bulkDeleteReviews,
  updateReviewVerification,
  bulkUpdateReviewVerification
} from '../api';
import PaginationControl from './SectionComponents/PaginationControl.jsx';
import Filters from "./SectionComponents/Filters.jsx";
import MyTable from './SectionComponents/MyTable.jsx';
import useDataList from './hooks/useDataList.js';
import ReviewRow from './reviewsPage/ReviewRow.jsx';

const defaultFilters = {
  page: 1,
  limit: 12,
  search: '',
  _sort: 'createdAt',
  _order: 'desc',
};

const columns = [
  { label: 'ID' },
  { label: 'Reviewer', key: 'reviewerName' },
  { label: 'Email' },
  { label: 'Product' },
  { label: 'Rating', key: 'rating' },
  { label: 'Verified', key: 'isVerified' },
  { label: 'Created At', key: 'createdAt' },
  { label: 'Actions' },
];

const allExtraFilters = [
  { label: 'Reviewer Name', key: 'reviewerName' },
  { label: 'Reviewer Email', key: 'reviewerEmail' },
  { label: 'Product ID', key: 'productId' },
  { label: 'Rating', key: 'rating', isEnum: true, enumValues: [
      { label: '5 Stars', value: 5 },
      { label: '4 Stars', value: 4 },
      { label: '3 Stars', value: 3 },
      { label: '2 Stars', value: 2 },
      { label: '1 Star', value: 1 },
  ]},
  { label: 'Verification', key: 'verified', isEnum: true, enumValues: [
      { label: 'All', value: '' },
      { label: 'Verified', value: 'true' },
      { label: 'Unverified', value: 'false' },
  ]},
  { label: 'Created At', key: 'createdAt', isTime: true },
];

const ReviewsView = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [reviewToVerify, setReviewToVerify] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [verifyType, setVerifyType] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const {
    filters,
    setFilters,
    sort,
    handleSortChange,
    data: reviews,
    pagination,
    loading,
    searchDebounce,
    setSearchDebounce,
    refetch,
  } = useDataList(defaultFilters, getAdminReviews);

  useEffect(() => {
    setSelectedIds([]);
  }, [filters, sort, reviews]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await getReviewStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch review stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(reviews.map(review => review.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (reviewId) => {
    setSelectedIds((prev) => (
      prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId]
    ));
  };

  const handleView = (review) => {
    navigate(`/reviews/view/${review.id}`);
  };

  const handleDelete = (review) => {
    setReviewToDelete(review);
    setDeleteType('single');
    setDeleteDialog(true);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setDeleteType('bulk');
    setDeleteDialog(true);
  };

  const handleVerify = (review, isVerified) => {
    setReviewToVerify({ ...review, newVerifiedStatus: isVerified });
    setVerifyType('single');
    setVerifyDialog(true);
  };

  const handleVerifySelected = (isVerified) => {
    if (selectedIds.length === 0) return;
    setReviewToVerify({ newVerifiedStatus: isVerified });
    setVerifyType('bulk');
    setVerifyDialog(true);
  };

  const executeDelete = async () => {
    setDeleteLoading(true);
    setDeleteResult(null);
    
    try {
      let response;
      if (deleteType === 'single' && reviewToDelete) {
        response = await deleteReview(reviewToDelete.id);
      } else if (deleteType === 'bulk') {
        response = await bulkDeleteReviews(selectedIds);
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
            await Promise.all([refetch(), fetchStats()]);
            console.log('Reviews list refreshed successfully');
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
        message: error.response?.data?.message || error.message || 'Failed to delete review(s)'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const executeVerify = async () => {
    setVerifyLoading(true);
    setVerifyResult(null);
    
    try {
      let response;
      if (verifyType === 'single' && reviewToVerify) {
        response = await updateReviewVerification(reviewToVerify.id, reviewToVerify.newVerifiedStatus);
      } else if (verifyType === 'bulk') {
        response = await bulkUpdateReviewVerification(selectedIds, reviewToVerify.newVerifiedStatus);
      }
      
      if (response?.data?.success) {
        setVerifyResult({
          type: 'success',
          message: response.data.message
        });
        setSelectedIds([]);

        try {
          setRefreshing(true);
          await new Promise(resolve => setTimeout(resolve, 500));
          if (typeof refetch === 'function') {
            await Promise.all([refetch(), fetchStats()]);
            console.log('Reviews list refreshed successfully');
          } else {
            console.error('refetch function is not available');
            window.location.reload();
          }
        } catch (refreshError) {
          console.error('Failed to refresh data:', refreshError);
          setVerifyResult(prev => ({
            ...prev,
            message: prev.message + ' (Data refresh failed, please reload the page manually)'
          }));
        } finally {
          setRefreshing(false);
        }
      } else {
        throw new Error(response?.data?.message || 'Update verification operation failed');
      }
    } catch (error) {
      setVerifyResult({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to update verification status'
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  const closeDeleteDialog = () => {
    const wasSuccessful = deleteResult?.type === 'success';
    
    setDeleteDialog(false);
    setDeleteType('');
    setReviewToDelete(null);
    setDeleteResult(null);
    
    if (wasSuccessful) {
      console.log('Dialog closed after successful operation, ensuring data is up to date');
      setTimeout(() => {
        if (typeof refetch === 'function') {
          Promise.all([refetch(), fetchStats()]).catch(err => console.error('Final refetch failed:', err));
        }
      }, 100);
    }
  };

  const closeVerifyDialog = () => {
    const wasSuccessful = verifyResult?.type === 'success';
    
    setVerifyDialog(false);
    setVerifyType('');
    setReviewToVerify(null);
    setVerifyResult(null);
    
    if (wasSuccessful) {
      console.log('Dialog closed after successful operation, ensuring data is up to date');
      setTimeout(() => {
        if (typeof refetch === 'function') {
          Promise.all([refetch(), fetchStats()]).catch(err => console.error('Final refetch failed:', err));
        }
      }, 100);
    }
  };

  const allSelected = useMemo(() => reviews.length > 0 && selectedIds.length === reviews.length, [selectedIds, reviews]);
  const someSelected = useMemo(() => selectedIds.length > 0 && selectedIds.length < reviews.length, [selectedIds, reviews]);

  const StatsCard = ({ title, value, subtitle, icon, color }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" component="div" color={color}>
              {value}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ fontSize: '2rem' }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Reviews Management</Typography>
        <Box display="flex" gap={2}>
          <Button 
            variant="outlined" 
            onClick={() => {
              setRefreshing(true);
              Promise.all([refetch(), fetchStats()]).finally(() => setRefreshing(false));
            }}
            disabled={loading || refreshing}
            size="small"
          >
            🔄 Refresh
          </Button>
        </Box>
      </Box>
      {!statsLoading && stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Reviews"
              value={stats.total}
              icon="📝"
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Verified"
              value={stats.verified}
              subtitle={`${stats.verificationRate.toFixed(1)}% verified`}
              icon="✅"
              color="success.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Unverified"
              value={stats.unverified}
              icon="⏳"
              color="warning.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Avg Rating"
              value={stats.averageRating.toFixed(1)}
              icon="⭐"
              color="info.main"
            />
          </Grid>
        </Grid>
      )}
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
            <>
              <Button 
                variant="contained" 
                color="success" 
                onClick={() => handleVerifySelected(true)}
                disabled={verifyLoading}
              >
                Verify Selected ({selectedIds.length})
              </Button>
              <Button 
                variant="contained" 
                color="warning" 
                onClick={() => handleVerifySelected(false)}
                disabled={verifyLoading}
              >
                Unverify Selected ({selectedIds.length})
              </Button>
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleDeleteSelected}
                disabled={deleteLoading}
              >
                Delete Selected ({selectedIds.length})
              </Button>
            </>
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
        {reviews.map((review) => (
          <ReviewRow
            key={review.id}
            review={review}
            selected={selectedIds.includes(review.id)}
            onSelectRow={handleSelectRow}
            onView={handleView}
            onVerify={handleVerify}
            onDelete={handleDelete}
          />
        ))}
      </MyTable>

      <PaginationControl
        pagination={pagination}
        filters={filters}
        setFilters={setFilters}
      />
      <Dialog open={deleteDialog} onClose={closeDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {deleteType === 'single' 
            ? `Delete Review from ${reviewToDelete?.reviewerName}` 
            : `Delete ${selectedIds.length} Selected Reviews`
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
                ? `Are you sure you want to delete the review from "${reviewToDelete?.reviewerName}"? This action cannot be undone.`
                : `Are you sure you want to delete ${selectedIds.length} selected reviews? This action cannot be undone.`
              }
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
      <Dialog open={verifyDialog} onClose={closeVerifyDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {verifyType === 'single' 
            ? `${reviewToVerify?.newVerifiedStatus ? 'Verify' : 'Unverify'} Review` 
            : `${reviewToVerify?.newVerifiedStatus ? 'Verify' : 'Unverify'} ${selectedIds.length} Selected Reviews`
          }
        </DialogTitle>
        <DialogContent>
          {verifyResult ? (
            <Alert severity={verifyResult.type} sx={{ mb: 2 }}>
              {verifyResult.message}
            </Alert>
          ) : (
            <Typography>
              {verifyType === 'single' 
                ? `Are you sure you want to ${reviewToVerify?.newVerifiedStatus ? 'verify' : 'unverify'} this review?`
                : `Are you sure you want to ${reviewToVerify?.newVerifiedStatus ? 'verify' : 'unverify'} ${selectedIds.length} selected reviews?`
              }
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeVerifyDialog} disabled={verifyLoading}>
            {verifyResult ? 'Close' : 'Cancel'}
          </Button>
          {!verifyResult && (
            <Button
              onClick={executeVerify}
              color="primary"
              variant="contained"
              disabled={verifyLoading}
            >
              {verifyLoading ? <CircularProgress size={20} /> : 'Confirm'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewsView;
