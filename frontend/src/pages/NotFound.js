import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
        }}
      >
        <ErrorIcon sx={{ fontSize: 100, color: 'error.main', mb: 4 }} />
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/"
          sx={{ mt: 3 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
