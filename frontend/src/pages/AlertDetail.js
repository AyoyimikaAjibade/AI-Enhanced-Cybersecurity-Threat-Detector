import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  NetworkCheck as NetworkCheckIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Code as CodeIcon
} from '@mui/icons-material';

const AlertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  // Mock data for demonstration
  const mockAlerts = [
    { 
      id: 1, 
      title: 'Suspicious Login Attempt', 
      description: 'Multiple failed login attempts detected from unusual IP address',
      severity: 'high', 
      source: 'network', 
      is_resolved: false, 
      created_at: new Date().toISOString(),
      details: {
        source_ip: '192.168.1.100',
        destination_ip: '10.0.0.5',
        port: 22,
        protocol: 'SSH',
        attempts: 15,
        timeframe: '5 minutes',
        username: 'admin',
        location: 'Unknown'
      }
    },
    { 
      id: 2, 
      title: 'Unusual File Access', 
      description: 'User accessed sensitive files outside normal working hours',
      severity: 'medium', 
      source: 'system', 
      is_resolved: false, 
      created_at: new Date(Date.now() - 3600000).toISOString(),
      details: {
        user: 'jsmith',
        file_path: '/var/data/financial/q2_reports.xlsx',
        access_time: '2023-06-15T02:34:12Z',
        normal_hours: '8:00 AM - 6:00 PM',
        previous_access: '2023-06-14T14:22:05Z',
        ip_address: '10.0.0.45'
      }
    },
    { 
      id: 3, 
      title: 'Port Scanning Detected', 
      description: 'Sequential port scanning activity detected from external IP',
      severity: 'high', 
      source: 'network', 
      is_resolved: true, 
      created_at: new Date(Date.now() - 7200000).toISOString(),
      resolved_at: new Date(Date.now() - 5400000).toISOString(),
      resolved_by: 'admin',
      resolution_notes: 'Blocked IP at firewall level and reported to ISP',
      details: {
        source_ip: '203.0.113.45',
        ports_scanned: '20-25, 80, 443, 3306, 5432',
        duration: '3 minutes',
        scan_type: 'TCP SYN',
        firewall_action: 'Block',
        country_of_origin: 'Unknown'
      }
    }
  ];

  useEffect(() => {
    const fetchAlertDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real application, this would be an actual API call
        // const response = await axios.get(`/alerts/${id}`);
        // setAlert(response.data);
        
        // Mock response
        setTimeout(() => {
          const foundAlert = mockAlerts.find(a => a.id === parseInt(id));
          
          if (foundAlert) {
            setAlert(foundAlert);
          } else {
            setError('Alert not found');
          }
          
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error fetching alert details:', err);
        setError('Failed to load alert details. Please try again later.');
        setLoading(false);
      }
    };

    fetchAlertDetails();
  }, [id]);

  const handleBack = () => {
    navigate('/alerts');
  };

  const handleResolve = async () => {
    try {
      // In a real application, this would be an actual API call
      // await axios.put(`/alerts/${id}/resolve`);
      
      // Update local state
      setAlert(prev => ({
        ...prev,
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: 'current_user'
      }));
    } catch (err) {
      console.error('Error resolving alert:', err);
      setError('Failed to resolve alert. Please try again later.');
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <ErrorIcon fontSize="large" color="error" />;
      case 'medium':
        return <WarningIcon fontSize="large" color="warning" />;
      case 'low':
        return <InfoIcon fontSize="large" color="info" />;
      default:
        return <InfoIcon fontSize="large" />;
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'network':
        return <NetworkCheckIcon />;
      case 'system':
        return <StorageIcon />;
      case 'application':
        return <SecurityIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !alert) {
    return (
      <Box sx={{ mt: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
          Back to Alerts
        </Button>
        <Alert severity="error">
          {error || 'Alert not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 3 }}>
        Back to Alerts
      </Button>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={1}>
            {getSeverityIcon(alert.severity)}
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {alert.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {alert.description}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Chip
              label={alert.severity.toUpperCase()}
              color={
                alert.severity === 'high' ? 'error' : 
                alert.severity === 'medium' ? 'warning' : 'info'
              }
              sx={{ mb: 1 }}
            />
            <Chip
              label={alert.is_resolved ? 'RESOLVED' : 'OPEN'}
              color={alert.is_resolved ? 'success' : 'default'}
              icon={alert.is_resolved ? <CheckCircleIcon /> : undefined}
              sx={{ mb: 1 }}
            />
            {!alert.is_resolved && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleResolve}
                startIcon={<CheckCircleIcon />}
              >
                Mark as Resolved
              </Button>
            )}
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Alert Information" 
                subheader="Basic information about this alert"
              />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TimelineIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Created At" 
                      secondary={formatDate(alert.created_at)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      {getSourceIcon(alert.source)}
                    </ListItemIcon>
                    <ListItemText 
                      primary="Source" 
                      secondary={alert.source.charAt(0).toUpperCase() + alert.source.slice(1)} 
                    />
                  </ListItem>
                  {alert.is_resolved && (
                    <>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Resolved At" 
                          secondary={formatDate(alert.resolved_at)} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <SecurityIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Resolved By" 
                          secondary={alert.resolved_by} 
                        />
                      </ListItem>
                      {alert.resolution_notes && (
                        <ListItem>
                          <ListItemIcon>
                            <InfoIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Resolution Notes" 
                            secondary={alert.resolution_notes} 
                          />
                        </ListItem>
                      )}
                    </>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Technical Details" 
                subheader="Detailed information about the alert"
              />
              <CardContent>
                {alert.details && Object.keys(alert.details).length > 0 ? (
                  <List>
                    {Object.entries(alert.details).map(([key, value]) => (
                      <ListItem key={key}>
                        <ListItemIcon>
                          <CodeIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                          secondary={value} 
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No additional details available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AlertDetail;
