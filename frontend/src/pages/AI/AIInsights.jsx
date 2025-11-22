import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import { Psychology as AIIcon } from '@mui/icons-material';

const AIInsights = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        AI Insights
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Smart inventory analytics powered by AI
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <AIIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Demand Forecasting
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                AI-powered demand predictions will be displayed here
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <AIIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Reorder Suggestions
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Smart reorder recommendations will be displayed here
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                AI Assistant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chat with the AI assistant about your inventory
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIInsights;

