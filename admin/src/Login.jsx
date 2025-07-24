import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { loginAdmin } from './api';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginAdmin(username, password);
      if (response.data.success) {
        if (onLogin) onLogin(response.data.admin);
      } else {
        setError(response.data.message || 'Invalid username or password');
      }
    } catch (err) {
      setError(
          err.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
      >
        <Paper
            elevation={3}
            sx={{
              p: 4,
              width: '100%',
              maxWidth: 400,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
            component="form"
            onSubmit={handleSubmit}
        >
          <Typography variant="h5" align="center">
            Admin Login
          </Typography>

          <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
          />

          <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              fullWidth
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </Paper>
      </Box>
  );
};

export default Login;
