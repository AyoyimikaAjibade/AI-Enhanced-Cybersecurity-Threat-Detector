import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Warning as WarningIcon,
  Security as SecurityIcon,
  NetworkCheck as NetworkCheckIcon,
  Storage as StorageIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [threatMetrics, setThreatMetrics] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    resolved: 0
  });
  const [networkStats, setNetworkStats] = useState({
    totalTraffic: 0,
    anomalousTraffic: 0,
    blockedConnections: 0
  });
  const [systemStats, setSystemStats] = useState({
    totalLogs: 0,
    anomalousLogs: 0,
    criticalEvents: 0
  });

  // Mock data for demonstration
  const generateMockDashboardData = () => {
    // Recent alerts
    const alerts = [
      {
        id: 1,
        title: 'Suspicious Login Attempt',
        description: 'Multiple failed login attempts detected from unusual IP address',
        severity: 'high',
        source: 'network',
        created_at: new Date().toISOString(),
        is_resolved: false
      },
      {
        id: 2,
        title: 'Unusual File Access',
        description: 'User accessed sensitive files outside normal working hours',
        severity: 'medium',
        source: 'system',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        is_resolved: false
      },
      {
        id: 3,
        title: 'Port Scanning Detected',
        description: 'Sequential port scanning activity detected from external IP',
        severity: 'high',
        source: 'network',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        is_resolved: true
      },
      {
        id: 4,
        title: 'Unusual Process Execution',
        description: 'Unusual process execution detected with elevated privileges',
        severity: 'medium',
        source: 'system',
        created_at: new Date(Date.now() - 10800000).toISOString(),
        is_resolved: false
      },
      {
        id: 5,
        title: 'Potential Data Exfiltration',
        description: 'Large outbound data transfer detected to unknown external endpoint',
        severity: 'high',
        source: 'network',
        created_at: new Date(Date.now() - 14400000).toISOString(),
        is_resolved: false
      }
    ];

    // Threat metrics
    const metrics = {
      total: 42,
      high: 12,
      medium: 18,
      low: 12,
      resolved: 15
    };

    // Network stats
    const network = {
      totalTraffic: 15782,
      anomalousTraffic: 237,
      blockedConnections: 89
    };

    // System stats
    const system = {
      totalLogs: 8943,
      anomalousLogs: 156,
      criticalEvents: 23
    };

    // Threat timeline (last 7 days)
    const today = new Date();
    const threatTimeline = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        high: Math.floor(Math.random() * 5),
        medium: Math.floor(Math.random() * 8),
        low: Math.floor(Math.random() * 10)
      };
    });

    // Traffic distribution by protocol
    const trafficByProtocol = {
      labels: ['HTTP/S', 'SSH', 'FTP', 'DNS', 'SMTP', 'Other'],
      data: [45, 15, 8, 20, 7, 5]
    };

    // Alert sources
    const alertSources = {
      labels: ['Network', 'System', 'Application', 'User'],
      data: [55, 25, 15, 5]
    };

    return {
      alerts,
      metrics,
      network,
      system,
      threatTimeline,
      trafficByProtocol,
      alertSources
    };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real application, this would be an actual API call
        // const response = await axios.get('/dashboard');
        // setDashboardData(response.data);
        
        // Mock response
        setTimeout(() => {
          const mockData = generateMockDashboardData();
          setDashboardData(mockData);
          setRecentAlerts(mockData.alerts);
          setThreatMetrics(mockData.metrics);
          setNetworkStats(mockData.network);
          setSystemStats(mockData.system);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <ErrorIcon fontSize="small" color="error" />;
      case 'medium':
        return <WarningIcon fontSize="small" color="warning" />;
      case 'low':
        return <InfoIcon fontSize="small" color="info" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'network':
        return <NetworkCheckIcon fontSize="small" />;
      case 'system':
        return <StorageIcon fontSize="small" />;
      case 'application':
        return <SecurityIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  // Chart data for threat timeline
  const threatTimelineData = {
    labels: dashboardData?.threatTimeline.map(item => item.date) || [],
    datasets: [
      {
        label: 'High',
        data: dashboardData?.threatTimeline.map(item => item.high) || [],
        backgroundColor: 'rgba(244, 67, 54, 0.5)',
        borderColor: 'rgba(244, 67, 54, 1)',
        borderWidth: 1,
      },
      {
        label: 'Medium',
        data: dashboardData?.threatTimeline.map(item => item.medium) || [],
        backgroundColor: 'rgba(255, 152, 0, 0.5)',
        borderColor: 'rgba(255, 152, 0, 1)',
        borderWidth: 1,
      },
      {
        label: 'Low',
        data: dashboardData?.threatTimeline.map(item => item.low) || [],
        backgroundColor: 'rgba(33, 150, 243, 0.5)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 1,
      }
    ],
  };

  // Chart data for traffic by protocol
  const trafficByProtocolData = {
    labels: dashboardData?.trafficByProtocol.labels || [],
    datasets: [
      {
        data: dashboardData?.trafficByProtocol.data || [],
        backgroundColor: [
          'rgba(33, 150, 243, 0.7)',
          'rgba(76, 175, 80, 0.7)',
          'rgba(255, 152, 0, 0.7)',
          'rgba(156, 39, 176, 0.7)',
          'rgba(233, 30, 99, 0.7)',
          'rgba(158, 158, 158, 0.7)'
        ],
        borderColor: [
          'rgba(33, 150, 243, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(156, 39, 176, 1)',
          'rgba(233, 30, 99, 1)',
          'rgba(158, 158, 158, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for alert sources
  const alertSourcesData = {
    labels: dashboardData?.alertSources.labels || [],
    datasets: [
      {
        data: dashboardData?.alertSources.data || [],
        backgroundColor: [
          'rgba(244, 67, 54, 0.7)',
          'rgba(76, 175, 80, 0.7)',
          'rgba(255, 152, 0, 0.7)',
          'rgba(33, 150, 243, 0.7)'
        ],
        borderColor: [
          'rgba(244, 67, 54, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(33, 150, 243, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Security Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Security Alerts
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {threatMetrics.total}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Chip 
                  label={`${threatMetrics.high} High`} 
                  size="small" 
                  color="error" 
                  sx={{ mr: 0.5 }} 
                />
                <Chip 
                  label={`${threatMetrics.medium} Medium`} 
                  size="small" 
                  color="warning" 
                  sx={{ mr: 0.5 }} 
                />
                <Chip 
                  label={`${threatMetrics.low} Low`} 
                  size="small" 
                  color="info" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NetworkCheckIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Network Traffic
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {networkStats.totalTraffic.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Chip 
                  label={`${networkStats.anomalousTraffic} Anomalous`} 
                  size="small" 
                  color="error" 
                  sx={{ mr: 0.5 }} 
                />
                <Chip 
                  label={`${networkStats.blockedConnections} Blocked`} 
                  size="small" 
                  color="success" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  System Logs
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {systemStats.totalLogs.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Chip 
                  label={`${systemStats.anomalousLogs} Anomalous`} 
                  size="small" 
                  color="error" 
                  sx={{ mr: 0.5 }} 
                />
                <Chip 
                  label={`${systemStats.criticalEvents} Critical`} 
                  size="small" 
                  color="warning" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Threat Status
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {threatMetrics.resolved}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Chip 
                  label="Resolved" 
                  size="small" 
                  color="success" 
                  sx={{ mr: 0.5 }} 
                />
                <Chip 
                  label={`${threatMetrics.total - threatMetrics.resolved} Pending`} 
                  size="small" 
                  color="warning" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Recent Alerts */}
      <Grid container spacing={3}>
        {/* Threat Timeline */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Threat Timeline (Last 7 Days)
              </Typography>
            </Box>
            <Box sx={{ height: 300 }}>
              <Bar 
                data={threatTimelineData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                      beginAtZero: true
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Alerts */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Recent Alerts
              </Typography>
              <Button 
                component={Link} 
                to="/alerts" 
                size="small" 
                endIcon={<ArrowForwardIcon />}
              >
                View All
              </Button>
            </Box>
            <List>
              {recentAlerts.map((alert, index) => (
                <React.Fragment key={alert.id}>
                  <ListItem 
                    component={Link} 
                    to={`/alerts/${alert.id}`} 
                    sx={{ 
                      textDecoration: 'none', 
                      color: 'inherit',
                      bgcolor: alert.is_resolved ? 'transparent' : (
                        alert.severity === 'high' ? 'rgba(244, 67, 54, 0.08)' : 
                        alert.severity === 'medium' ? 'rgba(255, 152, 0, 0.08)' : 
                        'transparent'
                      )
                    }}
                  >
                    <ListItemIcon>
                      {getSeverityIcon(alert.severity)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" component="span">
                            {alert.title}
                          </Typography>
                          {alert.is_resolved && (
                            <Chip 
                              label="Resolved" 
                              size="small" 
                              color="success" 
                              sx={{ ml: 1 }} 
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {alert.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            {getSourceIcon(alert.source)}
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, mr: 1 }}>
                              {alert.source}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(alert.created_at)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentAlerts.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Traffic Distribution */}
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              <NetworkCheckIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Traffic Distribution by Protocol
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              <Pie 
                data={trafficByProtocolData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Alert Sources */}
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Alert Sources
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              <Pie 
                data={alertSourcesData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
