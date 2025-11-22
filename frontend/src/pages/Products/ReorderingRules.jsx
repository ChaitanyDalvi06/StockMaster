import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ReorderingRules = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Reordering Rules
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Automate stock replenishment
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Reordering rules configuration will be displayed here</Typography>
      </Paper>
    </Box>
  );
};

export default ReorderingRules;

