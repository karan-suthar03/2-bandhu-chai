import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert,
  Card,
  CardContent,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Breadcrumbs,
  Link,
  Grid,
  Divider
} from '@mui/material';
import { 
  ArrowBack, 
  Delete, 
  Verified, 
  Cancel,
  CheckCircle,
  Person,
  Inventory,
  Star,
  Email,
  CalendarToday
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getAdminReview, 
  deleteReview, 
  updateReviewVerification 
} from '../../api';

const ReviewDetails = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchReview();
  }, [reviewId]);

  const fetchReview = async () => {
    try {
      setLoading(true);
      const response = await getAdminReview(reviewId);
      setReview(response.data.review);
    } catch (err) {
      setError('Failed to load review details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      const response = await deleteReview(reviewId);
      if (response.data.success) {
        setResult({
          type: 'success',
          message: 'Review deleted successfully'
        });
        setTimeout(() => {
          navigate('/dashboard/reviews');
        }, 2000);
      }
    } catch (err) {
      setResult({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete review'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleVerify = async (isVerified) => {
    try {
      setVerifyLoading(true);
      const response = await updateReviewVerification(reviewId, isVerified);
      if (response.data.success) {
        setReview(prev => ({ ...prev, isVerified }));
        setResult({
          type: 'success',
          message: response.data.message
        });
      }
    } catch (err) {
      setResult({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update verification status'
      });
    } finally {
      setVerifyLoading(false);
      setVerifyDialog(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/dashboard/reviews')}
          sx={{ mt: 2 }}
          startIcon={<ArrowBack />}
        >
          Back to Reviews
        </Button>
      </Box>
    );
  }

  if (!review) {
    return (
      <Box p={3}>
        <Alert severity="warning">Review not found</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/dashboard/reviews')}
          sx={{ mt: 2 }}
          startIcon={<ArrowBack />}
        >
          Back to Reviews
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link color="inherit" href="/dashboard" sx={{ textDecoration: 'none' }}>
          Dashboard
        </Link>
        <Link color="inherit" href="/dashboard/reviews" sx={{ textDecoration: 'none' }}>
          Reviews
        </Link>
        <Typography color="text.primary">Review Details</Typography>
      </Breadcrumbs>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom display="flex" alignItems="center" gap={1}>
            <Star color="primary" />
            Review #{review.id}
          </Typography>
          <Chip
            icon={review.isVerified ? <Verified /> : <Cancel />}
            label={review.isVerified ? 'Verified' : 'Unverified'}
            color={review.isVerified ? 'success' : 'default'}
            size="medium"
          />
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard/reviews')}
            startIcon={<ArrowBack />}
          >
            Back to Reviews
          </Button>
          <Button
            variant={review.isVerified ? "outlined" : "contained"}
            color={review.isVerified ? "warning" : "success"}
            onClick={() => setVerifyDialog(true)}
            disabled={verifyLoading}
            startIcon={review.isVerified ? <Cancel /> : <CheckCircle />}
          >
            {review.isVerified ? 'Mark as Unverified' : 'Mark as Verified'}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => setDeleteDialog(true)}
            disabled={deleteLoading}
            startIcon={<Delete />}
          >
            Delete Review
          </Button>
        </Box>
      </Box>

      {result && (
        <Alert severity={result.type} sx={{ mb: 3 }} onClose={() => setResult(null)}>
          {result.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <Person color="primary" />
                Reviewer Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}>
                  {review.reviewerName.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">{review.reviewerName}</Typography>
                  <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
                    <Email fontSize="small" />
                    {review.reviewerEmail || 'No email provided'}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" mb={2}>
                <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Reviewed on {formatDate(review.createdAt)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <Inventory color="primary" />
                Product Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {review.product?.name || 'Product not found'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Product ID: {review.productId}
                </Typography>
                {review.product?.deactivated && (
                  <Chip 
                    label="Product Deactivated" 
                    color="warning" 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/dashboard/products/view/${review.productId}`)}
                disabled={!review.product}
              >
                View Product
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review Content
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Rating
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Rating value={review.rating} readOnly size="large" />
                  <Typography variant="h6" color="primary">
                    {review.rating} out of 5
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Comment
                </Typography>
                {review.comment ? (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        "{review.comment}"
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    No comment provided
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review Metadata
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Review ID
                  </Typography>
                  <Typography variant="body1">#{review.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body1">{formatDate(review.createdAt)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Updated At
                  </Typography>
                  <Typography variant="body1">{formatDate(review.updatedAt)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Verification Status
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {review.isVerified ? <Verified color="success" /> : <Cancel color="disabled" />}
                    <Typography variant="body1">
                      {review.isVerified ? 'Verified' : 'Unverified'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this review from {review.reviewerName}? 
            This action cannot be undone and will also update the product's rating.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={verifyDialog} onClose={() => setVerifyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {review.isVerified ? 'Mark as Unverified' : 'Mark as Verified'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {review.isVerified ? 'unverify' : 'verify'} this review?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleVerify(!review.isVerified)}
            color="primary"
            variant="contained"
            disabled={verifyLoading}
          >
            {verifyLoading ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewDetails;
