import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ProductDetails = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Product Details
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Product details will be displayed here</Typography>
      </Paper>
    </Box>
  );
};

export default ProductDetails;

