import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const Alerts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [filters, setFilters] = useState({
    severity: '',
    source: '',
    startDate: '',
    endDate: ''
  });

  // Mock data for demonstration
  const mockAlerts = [
    { id: 1, title: 'Suspicious Login Attempt', severity: 'high', source: 'network', is_resolved: false, created_at: new Date().toISOString() },
    { id: 2, title: 'Unusual File Access', severity: 'medium', source: 'system', is_resolved: false, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, title: 'Port Scanning Detected', severity: 'high', source: 'network', is_resolved: true, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 4, title: 'Failed Authentication', severity: 'medium', source: 'application', is_resolved: false, created_at: new Date(Date.now() - 10800000).toISOString() },
    { id: 5, title: 'Configuration Change', severity: 'low', source: 'system', is_resolved: false, created_at: new Date(Date.now() - 14400000).toISOString() },
    { id: 6, title: 'Malware Detected', severity: 'high', source: 'network', is_resolved: false, created_at: new Date(Date.now() - 18000000).toISOString() },
    { id: 7, title: 'Unusual Network Traffic', severity: 'medium', source: 'network', is_resolved: false, created_at: new Date(Date.now() - 21600000).toISOString() },
    { id: 8, title: 'System Resource Exhaustion', severity: 'high', source: 'system', is_resolved: true, created_at: new Date(Date.now() - 25200000).toISOString() },
    { id: 9, title: 'Unauthorized Access Attempt', severity: 'high', source: 'application', is_resolved: false, created_at: new Date(Date.now() - 28800000).toISOString() },
    { id: 10, title: 'Data Exfiltration Attempt', severity: 'high', source: 'network', is_resolved: false, created_at: new Date(Date.now() - 32400000).toISOString() },
    { id: 11, title: 'Suspicious Process Execution', severity: 'medium', source: 'system', is_resolved: false, created_at: new Date(Date.now() - 36000000).toISOString() },
    { id: 12, title: 'Firewall Rule Violation', severity: 'medium', source: 'network', is_resolved: true, created_at: new Date(Date.now() - 39600000).toISOString() }
  ];

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real application, this would be an actual API call with filters
      // const response = await axios.get('/alerts', {
      //   params: {
      //     page: page + 1,
      //     per_page: rowsPerPage,
      //     ...filters
      //   }
      // });
      
      // Mock response
      setTimeout(() => {
        // Filter alerts based on current filters
        let filteredAlerts = [...mockAlerts];
        
        if (filters.severity) {
          filteredAlerts = filteredAlerts.filter(alert => alert.severity === filters.severity);
        }
        
        if (filters.source) {
          filteredAlerts = filteredAlerts.filter(alert => alert.source === filters.source);
        }
        
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          filteredAlerts = filteredAlerts.filter(alert => new Date(alert.created_at) >= startDate);
        }
        
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999); // End of day
          filteredAlerts = filteredAlerts.filter(alert => new Date(alert.created_at) <= endDate);
        }
        
        setTotalAlerts(filteredAlerts.length);
        
        // Paginate
        const paginatedAlerts = filteredAlerts.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        );
        
        setAlerts(paginatedAlerts);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [page, rowsPerPage, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };

  const handleViewAlert = (alertId) => {
    navigate(`/alerts/${alertId}`);
  };

  const handleRefresh = () => {
    fetchAlerts();
  };

  const handleClearFilters = () => {
    setFilters({
      severity: '',
      source: '',
      startDate: '',
      endDate: ''
    });
    setPage(0);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Security Alerts
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="severity-label">Severity</InputLabel>
              <Select
                labelId="severity-label"
                id="severity"
                name="severity"
                value={filters.severity}
                label="Severity"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="source-label">Source</InputLabel>
              <Select
                labelId="source-label"
                id="source"
                name="source"
                value={filters.source}
                label="Source"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="network">Network</MenuItem>
                <MenuItem value="system">System</MenuItem>
                <MenuItem value="application">Application</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              id="startDate"
              name="startDate"
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              id="endDate"
              name="endDate"
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Alerts Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress sx={{ my: 3 }} />
                  </TableCell>
                </TableRow>
              ) : alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No alerts found
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>{alert.id}</TableCell>
                    <TableCell>{alert.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={alert.severity}
                        color={getSeverityColor(alert.severity)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{alert.source}</TableCell>
                    <TableCell>
                      <Chip
                        label={alert.is_resolved ? 'Resolved' : 'Open'}
                        color={alert.is_resolved ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(alert.created_at)}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewAlert(alert.id)}
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalAlerts}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default Alerts;
