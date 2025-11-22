import React from 'react';
import { Box, Container, Paper } from '@mui/material';

const AuthLayout = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 3,
          }}
        >
          <Box textAlign="center" mb={3}>
            <Box
              component="h1"
              sx={{
                fontSize: '2rem',
                fontWeight: 700,
                color: 'primary.main',
                mb: 1,
              }}
            >
              📦 StockMaster
            </Box>
            <Box component="p" sx={{ color: 'text.secondary' }}>
              AI-Powered Inventory Management
            </Box>
          </Box>
          {children}
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;

