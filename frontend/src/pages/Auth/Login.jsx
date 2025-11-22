import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Side - Form */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: '#0A0A0A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          {/* Logo */}
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontSize: 20 }}>📦</Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                StockMaster
              </Typography>
            </Box>
          </Box>

          {/* Title */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: '#FFFFFF',
                mb: 1.5,
              }}
            >
              Log in
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                color: '#94A3B8',
              }}
            >
              Welcome back! Please enter your details.
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ mb: 2.5 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#E2E8F0',
                  mb: 0.75,
                }}
              >
                Email
              </Typography>
              <TextField
                fullWidth
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1A1A1A',
                    color: '#FFFFFF',
                    '& fieldset': {
                      borderColor: '#2D2D2D',
                    },
                    '&:hover fieldset': {
                      borderColor: '#404040',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366F1',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#FFFFFF',
                    '&::placeholder': {
                      color: '#64748B',
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#E2E8F0',
                  mb: 0.75,
                }}
              >
                Password
              </Typography>
              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#64748B' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1A1A1A',
                    color: '#FFFFFF',
                    '& fieldset': {
                      borderColor: '#2D2D2D',
                    },
                    '&:hover fieldset': {
                      borderColor: '#404040',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366F1',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#FFFFFF',
                    '&::placeholder': {
                      color: '#64748B',
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#6366F1',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#8B5CF6',
                  },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              fullWidth
              type="submit"
              disabled={loading}
              sx={{
                mb: 3,
                py: 1.5,
                backgroundColor: '#6366F1',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: 16,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#5558E3',
                },
                '&:disabled': {
                  backgroundColor: '#374151',
                  color: '#6B7280',
                },
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography sx={{ color: '#94A3B8', fontSize: 14 }}>
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    fontWeight: 600,
                    color: '#6366F1',
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#8B5CF6',
                    },
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 8 }}>
            <Typography sx={{ fontSize: 14, color: '#64748B' }}>
              © StockMaster 2024
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Side - Hero */}
      <Box
        sx={{
          flex: 1,
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          p: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Sparkles */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '15%',
            fontSize: '3rem',
            animation: 'sparkle 2s ease-in-out infinite',
            '@keyframes sparkle': {
              '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
              '50%': { opacity: 1, transform: 'scale(1.2)' },
            },
          }}
        >
          ✨
        </Box>

        <Box sx={{ maxWidth: 600, textAlign: 'center', color: '#FFFFFF', zIndex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: 48, md: 64 },
              mb: 3,
              lineHeight: 1.2,
            }}
          >
            Start managing your inventory efficiently
          </Typography>
          <Typography
            sx={{
              fontSize: 20,
              mb: 4,
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            Powerful inventory management with AI-powered voice assistant.
            Get full access to all features.
          </Typography>

          {/* Reviews */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', mr: 1 }}>
                {[...Array(5)].map((_, i) => (
                  <Typography key={i} sx={{ fontSize: 20 }}>
                    ⭐
                  </Typography>
                ))}
              </Box>
              <Typography sx={{ fontWeight: 600, fontSize: 18 }}>5.0</Typography>
            </Box>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              from 200+ reviews
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
