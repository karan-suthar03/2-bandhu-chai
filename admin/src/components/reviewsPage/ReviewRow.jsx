import React, { memo } from 'react';
import { TableCell, TableRow, Checkbox, Chip, Tooltip, IconButton, Avatar, Stack } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Rating } from '@mui/material';

const ReviewRow = ({ review, selected, onSelectRow, onView, onVerify, onDelete }) => {
  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action(review);
  };

  return (
    <TableRow hover selected={!!selected} sx={{ cursor: 'default' }}>
      <TableCell padding="checkbox">
        <Checkbox
          color="primary"
          checked={!!selected}
          onChange={() => onSelectRow(review.id)}
        />
      </TableCell>
      <TableCell>{review.id}</TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 28, height: 28 }}>
            {review.reviewerName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <span>{review.reviewerName}</span>
        </Stack>
      </TableCell>
      <TableCell>{review.reviewerEmail}</TableCell>
      <TableCell>
        <Stack direction="column" spacing={0.5}>
          <span>{review.product?.name || 'N/A'}</span>
          <Stack direction="row" spacing={1} alignItems="center">
            {review.product?.id && (
              <span style={{ fontSize: '0.75rem', color: '#666' }}>ID: {review.product.id}</span>
            )}
            {review.product?.deactivated && (
              <Chip label="Deactivated" size="small" color="warning" />
            )}
          </Stack>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Rating value={review.rating} readOnly size="small" />
          <span>({review.rating})</span>
        </Stack>
      </TableCell>
      <TableCell>
        <Chip
          icon={review.isVerified ? <VerifiedIcon /> : <CancelIcon />}
          label={review.isVerified ? 'Verified' : 'Unverified'}
          color={review.isVerified ? 'success' : 'default'}
          size="small"
        />
      </TableCell>
      <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
      <TableCell align="center">
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <Tooltip title="View">
            <IconButton size="small" color="primary" onClick={(e) => handleActionClick(e, () => onView(review))}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={review.isVerified ? 'Unverify' : 'Verify'}>
            <IconButton size="small" color={review.isVerified ? 'warning' : 'success'} onClick={(e) => handleActionClick(e, () => onVerify(review, !review.isVerified))}>
              {review.isVerified ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={(e) => handleActionClick(e, () => onDelete(review))}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default memo(ReviewRow);
