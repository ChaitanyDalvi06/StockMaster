import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Categories = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Categories
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Organize your products into categories
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Product categories will be displayed here</Typography>
      </Paper>
    </Box>
  );
};

export default Categories;

