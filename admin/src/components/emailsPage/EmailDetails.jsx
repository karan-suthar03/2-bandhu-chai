import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Button,
  Alert,
  Divider,
  Paper,
  CircularProgress,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LaunchIcon from '@mui/icons-material/Launch';
import { getEmailLogs, getOrderEmailLogs } from '../../api';
import { getEmailTypeColor, getEmailStatusColor } from './enums.js';
import { formatDate } from '../Utils/Utils.js';

const EmailDetails = () => {
  const { emailId } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [orderEmails, setOrderEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingOrderEmails, setLoadingOrderEmails] = useState(false);

  useEffect(() => {
    fetchEmailDetails();
  }, [emailId]);

  const fetchEmailDetails = async () => {
    try {
      setLoading(true);
      const response = await getEmailLogs({ 
        page: 1, 
        limit: 1000
      });
      
      if (response.data.success) {
        const emailLogs = response.data.data || [];
        const foundEmail = emailLogs.find(e => e.id === parseInt(emailId));
        if (foundEmail) {
          setEmail(foundEmail);
          if (foundEmail.orderId) {
            fetchOrderEmails(foundEmail.orderId);
          }
        } else {
          setError('Email not found');
        }
      }
    } catch (err) {
      setError('Failed to fetch email details');
      console.error('Error fetching email details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderEmails = async (orderId) => {
    try {
      setLoadingOrderEmails(true);
      const response = await getOrderEmailLogs(orderId);
      if (response.data.success) {
        setOrderEmails(response.data.emailLogs.filter(e => e.id !== parseInt(emailId)));
      }
    } catch (err) {
      console.error('Error fetching order emails:', err);
    } finally {
      setLoadingOrderEmails(false);
    }
  };

  const handleGoBack = () => {
    navigate('/emails');
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/view/${orderId}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SENT':
        return <CheckCircleIcon color="success" />;
      case 'FAILED':
        return <ErrorIcon color="error" />;
      case 'PENDING':
        return <CircularProgress size={20} />;
      case 'RETRYING':
        return <CircularProgress size={20} color="warning" />;
      default:
        return <ErrorIcon color="disabled" />;
    }
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
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Back to Emails
        </Button>
      </Box>
    );
  }

  if (!email) {
    return (
      <Box p={3}>
        <Alert severity="warning">Email not found</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Back to Emails
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="#" 
          onClick={handleGoBack}
          sx={{ textDecoration: 'none' }}
        >
          Emails
        </Link>
        <Typography color="text.primary">Email #{email.id}</Typography>
      </Breadcrumbs>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Email Details #{email.id}
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
          variant="outlined"
        >
          Back to Emails
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <EmailIcon fontSize="large" color="primary" />
                <Box>
                  <Typography variant="h6">
                    {email.subject || 'No Subject'}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mt={1}>
                    <Chip
                      label={email.type?.replace(/_/g, ' ')}
                      color={getEmailTypeColor(email.type)}
                      size="small"
                    />
                    <Box display="flex" alignItems="center" gap={1}>
                      {getStatusIcon(email.status)}
                      <Chip
                        label={email.status}
                        color={getEmailStatusColor(email.status)}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <PersonIcon color="action" />
                    <Typography variant="subtitle2">Sender:</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ ml: 3 }}>
                    {email.sender || 'noreply@bandhuchai.com'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <PersonIcon color="action" />
                    <Typography variant="subtitle2">Recipient:</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ ml: 3 }}>
                    {email.recipient}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CalendarTodayIcon color="action" />
                    <Typography variant="subtitle2">Created:</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ ml: 3 }}>
                    {formatDate(email.createdAt)}
                  </Typography>
                </Grid>

                {email.sentAt && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Sent At:
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(email.sentAt)}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Attempts:
                  </Typography>
                  <Typography variant="body1">
                    {email.attempts || 0}
                  </Typography>
                </Grid>

                {email.orderId && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Related Order:
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewOrder(email.orderId)}
                        startIcon={<LaunchIcon />}
                        sx={{ textTransform: 'none' }}
                      >
                        Order #{email.orderId}
                      </Button>
                    </Box>
                  </Grid>
                )}

                {email.errorMessage && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom color="error">
                      Error Message:
                    </Typography>
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {email.errorMessage}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          {email.order && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Order Information
                  </Typography>
                  <Tooltip title="View Order Details">
                    <IconButton
                      size="small"
                      onClick={() => handleViewOrder(email.orderId)}
                      color="primary"
                    >
                      <LaunchIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2" gutterBottom>
                  <strong>Order ID:</strong> #{email.orderId}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Customer:</strong> {email.order.customerName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Status:</strong> {email.order.status}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Total:</strong> ₹{email.order.finalTotal}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => handleViewOrder(email.orderId)}
                  startIcon={<LaunchIcon />}
                  sx={{ mt: 2, textTransform: 'none' }}
                >
                  View Order Details
                </Button>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Email Metadata
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>ID:</strong> {email.id}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Type:</strong> {email.type}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Status:</strong> {email.status}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Attempts:</strong> {email.attempts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {email.orderId && orderEmails.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Other Emails for Order #{email.orderId}
                </Typography>
                {loadingOrderEmails ? (
                  <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Sent At</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderEmails.map((orderEmail) => (
                          <TableRow key={orderEmail.id}>
                            <TableCell>
                              <Chip
                                label={orderEmail.type?.replace(/_/g, ' ')}
                                color={getEmailTypeColor(orderEmail.type)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={orderEmail.status}
                                color={getEmailStatusColor(orderEmail.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {orderEmail.sentAt ? formatDate(orderEmail.sentAt) : '-'}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                onClick={() => navigate(`/emails/view/${orderEmail.id}`)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default EmailDetails;
