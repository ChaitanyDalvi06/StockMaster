import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Link,
  Alert,
  Typography,
} from '@mui/material';
import { Email as EmailIcon, VpnKey as KeyIcon } from '@mui/icons-material';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword({ email: formData.email });
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      toast.success('Password reset successful!');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <Box textAlign="center">
        <Typography variant="h6" gutterBottom color="success.main">
          ✓ Password Reset Successful!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          You can now login with your new password.
        </Typography>
        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          fullWidth
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {step === 1 ? 'Forgot Password?' : 'Reset Password'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {step === 1
          ? 'Enter your email and we\'ll send you an OTP'
          : 'Enter the OTP sent to your email'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {step === 1 ? (
        <Box component="form" onSubmit={handleRequestOTP}>
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoFocus
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={<EmailIcon />}
            sx={{ mb: 2 }}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component={RouterLink}
              to="/login"
              variant="body2"
              sx={{ textDecoration: 'none' }}
            >
              Back to Login
            </Link>
          </Box>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleResetPassword}>
          <TextField
            fullWidth
            label="OTP Code"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            required
            autoFocus
            sx={{ mb: 2 }}
            helperText="Check your email for the 6-digit code"
          />

          <TextField
            fullWidth
            label="New Password"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            helperText="Minimum 6 characters"
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={<KeyIcon />}
            sx={{ mb: 2 }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => setStep(1)}
              sx={{ textDecoration: 'none' }}
            >
              Resend OTP
            </Link>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ForgotPassword;

