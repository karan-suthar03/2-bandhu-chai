import React, { useState, useMemo, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  TableRow,
  TableCell
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getEmailLogs, getEmailStats, retryFailedEmails } from '../api';
import PaginationControl from './SectionComponents/PaginationControl.jsx';
import Filters from "./SectionComponents/Filters.jsx";
import MyTable from "./SectionComponents/MyTable.jsx";
import EmailRow from "./emailsPage/EmailRow.jsx";
import useDataList from "./hooks/useDataList.js";
import { EmailTypeEnum, EmailStatusEnum } from "./emailsPage/enums.js";
import RefreshIcon from '@mui/icons-material/Refresh';
import EmailIcon from '@mui/icons-material/Email';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

const defaultFilters = {
  page: 1,
  limit: 12,
  type: '',
  status: '',
  recipient: '',
  orderId: '',
  _sort: 'createdAt',
  _order: 'desc',
};

const columns = [
  { label: 'ID', key: 'id' },
  { label: 'Type', key: 'type' },
  { label: 'Sender', key: 'sender' },
  { label: 'Recipient', key: 'recipient' },
  { label: 'Subject', key: 'subject' },
  { label: 'Status', key: 'status' },
  { label: 'Order ID', key: 'orderId' },
  { label: 'Attempts', key: 'attempts' },
  { label: 'Error Message', key: 'errorMessage' },
  { label: 'Sent At', key: 'sentAt' },
  { label: 'Created At', key: 'createdAt' },
  { label: 'Actions' },
];

const emailTypeEnumList = Object.keys(EmailTypeEnum).map(key => ({
  label: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
  value: EmailTypeEnum[key]
}));

const emailStatusEnumList = Object.keys(EmailStatusEnum).map(key => ({
  label: key.charAt(0) + key.slice(1).toLowerCase(),
  value: EmailStatusEnum[key]
}));

const EmailsView = () => {
  const navigate = useNavigate();
  const [emailStats, setEmailStats] = useState(null);
  const [retryDialog, setRetryDialog] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);
  const [retryResult, setRetryResult] = useState(null);

  const {
    data: emails,
    pagination,
    loading,
    filters,
    setFilters,
    sort,
    handleSortChange,
    searchDebounce,
    setSearchDebounce,
    refetch: refresh
  } = useDataList(defaultFilters, getEmailLogs);

  useEffect(() => {
    fetchEmailStats();
  }, []);

  const fetchEmailStats = async () => {
    try {
      const response = await getEmailStats();
      if (response.data.success) {
        setEmailStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching email stats:', error);
    }
  };

  const handleRetryFailedEmails = async () => {
    setRetryLoading(true);
    try {
      const response = await retryFailedEmails(3);
      if (response.data.success) {
        setRetryResult(response.data);
        refresh();
        fetchEmailStats();
      }
    } catch (error) {
      console.error('Error retrying failed emails:', error);
      setRetryResult({ error: 'Failed to retry emails' });
    } finally {
      setRetryLoading(false);
    }
  };

  const handleViewEmail = (emailId) => {
    navigate(`/emails/view/${emailId}`);
  };

  const allExtraFilters = [
    {
      label: 'Email Type',
      key: 'type',
      isEnum: true,
      enumValues: [
        { label: 'All Types', value: '' },
        ...emailTypeEnumList
      ]
    },
    {
      label: 'Status',
      key: 'status',
      isEnum: true,
      enumValues: [
        { label: 'All Statuses', value: '' },
        ...emailStatusEnumList
      ]
    },
    {
      label: 'Recipient Email',
      key: 'recipient'
    },
    {
      label: 'Order ID',
      key: 'orderId'
    }
  ];

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value || 0}
            </Typography>
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading && !emails) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Email Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={refresh}
            startIcon={<RefreshIcon />}
            disabled={loading}
          >
            Refresh
          </Button>
          {(emailStats && (emailStats.failed > 0 || emailStats.pending > 0)) && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => setRetryDialog(true)}
              startIcon={<RefreshIcon />}
            >
              Retry Failed Emails
            </Button>
          )}
        </Box>
      </Box>
      {emailStats && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Email Statistics
          </Typography>
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Emails"
                value={emailStats.total}
                icon={<EmailIcon sx={{ fontSize: 40 }} />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Sent Successfully"
                value={emailStats.sent}
                icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Failed"
                value={emailStats.failed}
                icon={<ErrorIcon sx={{ fontSize: 40 }} />}
                color="error"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pending"
                value={emailStats.pending}
                icon={<PendingIcon sx={{ fontSize: 40 }} />}
                color="warning"
              />
            </Grid>
          </Grid>
        </Box>
      )}
      <Filters
        filters={filters}
        setFilters={setFilters}
        searchDebounce={searchDebounce}
        setSearchDebounce={setSearchDebounce}
        allExtraFilters={allExtraFilters}
      />
      {loading && !emails ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <MyTable
          sort={sort}
          handleSortChange={handleSortChange}
          columns={columns}
        >
          {emails && emails.length > 0 ? (
            emails.map((email) => (
              <EmailRow
                key={email.id}
                email={email}
                onView={handleViewEmail}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Typography variant="body2" color="textSecondary" py={3}>
                  No emails found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </MyTable>
      )}
      <PaginationControl
        pagination={pagination}
        filters={filters}
        setFilters={setFilters}
      />
      <Dialog open={retryDialog} onClose={() => setRetryDialog(false)}>
        <DialogTitle>Retry Failed Emails</DialogTitle>
        <DialogContent>
          <Typography>
            This will attempt to resend all failed emails that haven't exceeded the maximum retry attempts.
            Are you sure you want to continue?
          </Typography>
          {retryResult && (
            <Alert 
              severity={retryResult.error ? "error" : "success"} 
              sx={{ mt: 2 }}
            >
              {retryResult.error || `Successfully retried ${retryResult.retriedCount} emails`}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRetryDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRetryFailedEmails}
            disabled={retryLoading}
            variant="contained"
            color="warning"
          >
            {retryLoading ? <CircularProgress size={20} /> : 'Retry Failed Emails'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailsView;
