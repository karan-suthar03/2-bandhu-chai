import React from 'react';
import {
  TableRow,
  TableCell,
  Button,
  Chip,
  Box,
  Typography,
  Tooltip,
  IconButton,
  Link
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoIcon from '@mui/icons-material/Info';
import LaunchIcon from '@mui/icons-material/Launch';
import { getEmailTypeColor, getEmailStatusColor } from './enums.js';
import { formatDate } from '../Utils/Utils.js';
import { useNavigate } from 'react-router-dom';

const EmailRow = ({ email, onView }) => {
  const navigate = useNavigate();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SENT':
        return '✓';
      case 'FAILED':
        return '✗';
      case 'PENDING':
        return '⏳';
      case 'RETRYING':
        return '🔄';
      default:
        return '?';
    }
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/view/${orderId}`);
  };

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="body2" fontWeight="bold">
          {email.id}
        </Typography>
      </TableCell>
      
      <TableCell>
        <Chip
          label={email.type?.replace(/_/g, ' ')}
          color={getEmailTypeColor(email.type)}
          size="small"
          variant="outlined"
        />
      </TableCell>
      
      <TableCell>
        <Typography variant="body2">
          {truncateText(email.sender, 25)}
        </Typography>
      </TableCell>
      
      <TableCell>
        <Typography variant="body2">
          {truncateText(email.recipient, 25)}
        </Typography>
      </TableCell>
      
      <TableCell>
        <Tooltip title={email.subject || ''}>
          <Typography variant="body2">
            {truncateText(email.subject, 30)}
          </Typography>
        </Tooltip>
      </TableCell>
      
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <Chip
            label={email.status}
            color={getEmailStatusColor(email.status)}
            size="small"
            icon={<span>{getStatusIcon(email.status)}</span>}
          />
        </Box>
      </TableCell>
      
      <TableCell>
        {email.orderId ? (
          <Link
            component="button"
            variant="body2"
            color="primary"
            fontWeight="bold"
            onClick={() => handleViewOrder(email.orderId)}
            sx={{
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            #{email.orderId}
          </Link>
        ) : (
          '-'
        )}
      </TableCell>
      
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2">
            {email.attempts || 0}
          </Typography>
          {email.attempts > 1 && (
            <Tooltip title="Multiple attempts made">
              <InfoIcon fontSize="small" color="warning" />
            </Tooltip>
          )}
        </Box>
      </TableCell>
      
      <TableCell>
        {email.errorMessage ? (
          <Tooltip title={email.errorMessage}>
            <Typography 
              variant="body2" 
              color="error"
              sx={{ 
                maxWidth: 100,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {truncateText(email.errorMessage, 20)}
            </Typography>
          </Tooltip>
        ) : (
          '-'
        )}
      </TableCell>
      
      <TableCell>
        <Typography variant="body2">
          {email.sentAt ? formatDate(email.sentAt) : '-'}
        </Typography>
      </TableCell>
      
      <TableCell>
        <Typography variant="body2">
          {formatDate(email.createdAt)}
        </Typography>
      </TableCell>
      
      <TableCell>
        <Box display="flex" gap={1}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => onView(email.id)}
              color="primary"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default EmailRow;
