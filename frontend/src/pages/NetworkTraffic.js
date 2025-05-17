import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  NetworkCheck as NetworkCheckIcon,
  Warning as WarningIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const NetworkTraffic = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTraffic, setTotalTraffic] = useState(0);
  const [anomalousTraffic, setAnomalousTraffic] = useState(0);
  const [anomalyRate, setAnomalyRate] = useState(0);
  const [timeRange, setTimeRange] = useState('24h');
  const [filters, setFilters] = useState({
    sourceIp: '',
    destinationIp: '',
    protocol: '',
    isAnomalous: ''
  });

  // Mock data for demonstration
  const generateMockTrafficData = () => {
    const protocols = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'DNS', 'SSH'];
    const data = [];
    
    for (let i = 1; i <= 100; i++) {
      const isAnomalous = Math.random() < 0.15; // 15% chance of being anomalous
      data.push({
        id: i,
        source_ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        destination_ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        source_port: Math.floor(Math.random() * 65535),
        destination_port: Math.floor(Math.random() * 65535),
        protocol: protocols[Math.floor(Math.random() * protocols.length)],
        packet_size: Math.floor(Math.random() * 1500),
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
        is_anomalous: isAnomalous,
        anomaly_score: isAnomalous ? 0.7 + Math.random() * 0.3 : Math.random() * 0.3,
        anomaly_type: isAnomalous ? ['Suspicious Port Access', 'Large Packet Size', 'Unusual Traffic Pattern', 'Port Scanning'][Math.floor(Math.random() * 4)] : null
      });
    }
    
    return data;
  };

  const fetchTrafficData = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real application, this would be an actual API call
      // const response = await axios.get(`/analysis/network-traffic?time_range=${timeRange}`);
      
      // Mock response
      setTimeout(() => {
        const mockData = generateMockTrafficData();
        
        // Filter data based on current filters
        let filteredData = [...mockData];
        
        if (filters.sourceIp) {
          filteredData = filteredData.filter(item => 
            item.source_ip.includes(filters.sourceIp)
          );
        }
        
        if (filters.destinationIp) {
          filteredData = filteredData.filter(item => 
            item.destination_ip.includes(filters.destinationIp)
          );
        }
        
        if (filters.protocol) {
          filteredData = filteredData.filter(item => 
            item.protocol === filters.protocol
          );
        }
        
        if (filters.isAnomalous !== '') {
          const isAnomalous = filters.isAnomalous === 'true';
          filteredData = filteredData.filter(item => 
            item.is_anomalous === isAnomalous
          );
        }
        
        // Calculate statistics
        setTotalTraffic(filteredData.length);
        const anomalous = filteredData.filter(item => item.is_anomalous);
        setAnomalousTraffic(anomalous.length);
        setAnomalyRate((anomalous.length / filteredData.length) * 100);
        
        // Paginate
        const paginatedData = filteredData.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        );
        
        setTrafficData(paginatedData);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching traffic data:', err);
      setError('Failed to load network traffic data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrafficData();
  }, [page, rowsPerPage, timeRange, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };

  const handleRefresh = () => {
    fetchTrafficData();
  };

  const handleClearFilters = () => {
    setFilters({
      sourceIp: '',
      destinationIp: '',
      protocol: '',
      isAnomalous: ''
    });
    setPage(0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Chart data for traffic distribution
  const trafficPieData = {
    labels: ['Normal Traffic', 'Anomalous Traffic'],
    datasets: [
      {
        data: [totalTraffic - anomalousTraffic, anomalousTraffic],
        backgroundColor: ['#4caf50', '#f44336'],
        borderColor: ['#388e3c', '#d32f2f'],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for anomaly types
  const anomalyTypeData = {
    labels: ['Suspicious Port Access', 'Large Packet Size', 'Unusual Traffic Pattern', 'Port Scanning'],
    datasets: [
      {
        data: [
          trafficData.filter(item => item.anomaly_type === 'Suspicious Port Access').length,
          trafficData.filter(item => item.anomaly_type === 'Large Packet Size').length,
          trafficData.filter(item => item.anomaly_type === 'Unusual Traffic Pattern').length,
          trafficData.filter(item => item.anomaly_type === 'Port Scanning').length
        ],
        backgroundColor: ['#f44336', '#ff9800', '#2196f3', '#9c27b0'],
        borderColor: ['#d32f2f', '#f57c00', '#1976d2', '#7b1fa2'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Network Traffic Analysis
        </Typography>
        <Box>
          <Button 
            variant={timeRange === '24h' ? 'contained' : 'outlined'} 
            size="small" 
            onClick={() => handleTimeRangeChange('24h')}
            sx={{ mr: 1 }}
          >
            24h
          </Button>
          <Button 
            variant={timeRange === '7d' ? 'contained' : 'outlined'} 
            size="small" 
            onClick={() => handleTimeRangeChange('7d')}
            sx={{ mr: 1 }}
          >
            7d
          </Button>
          <Button 
            variant={timeRange === '30d' ? 'contained' : 'outlined'} 
            size="small" 
            onClick={() => handleTimeRangeChange('30d')}
            sx={{ mr: 2 }}
          >
            30d
          </Button>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="Traffic Summary" 
              subheader={`Total Packets: ${totalTraffic.toLocaleString()}`}
              avatar={<NetworkCheckIcon color="primary" />}
            />
            <CardContent>
              <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                <Pie data={trafficPieData} options={{ maintainAspectRatio: false }} />
              </Box>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="h5" color="error">
                  {anomalyRate.toFixed(2)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Anomaly Rate
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="Anomalous Traffic" 
              subheader={`${anomalousTraffic.toLocaleString()} anomalous packets detected`}
              avatar={<WarningIcon color="error" />}
            />
            <CardContent>
              <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                <Pie data={anomalyTypeData} options={{ maintainAspectRatio: false }} />
              </Box>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Distribution of Anomaly Types
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="Security Recommendations" 
              avatar={<SecurityIcon color="primary" />}
            />
            <CardContent>
              <Typography variant="body1" paragraph>
                Based on the current traffic analysis:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Monitor suspicious port access attempts from external IPs
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Review firewall rules to block known malicious traffic patterns
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Implement rate limiting for connections from single sources
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Consider additional IDS/IPS solutions for enhanced protection
                  </Typography>
                </li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Source IP"
              name="sourceIp"
              value={filters.sourceIp}
              onChange={handleFilterChange}
              placeholder="e.g. 192.168.1"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Destination IP"
              name="destinationIp"
              value={filters.destinationIp}
              onChange={handleFilterChange}
              placeholder="e.g. 10.0.0"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="protocol-label">Protocol</InputLabel>
              <Select
                labelId="protocol-label"
                id="protocol"
                name="protocol"
                value={filters.protocol}
                label="Protocol"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="TCP">TCP</MenuItem>
                <MenuItem value="UDP">UDP</MenuItem>
                <MenuItem value="ICMP">ICMP</MenuItem>
                <MenuItem value="HTTP">HTTP</MenuItem>
                <MenuItem value="HTTPS">HTTPS</MenuItem>
                <MenuItem value="DNS">DNS</MenuItem>
                <MenuItem value="SSH">SSH</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="anomalous-label">Anomalous</InputLabel>
              <Select
                labelId="anomalous-label"
                id="isAnomalous"
                name="isAnomalous"
                value={filters.isAnomalous}
                label="Anomalous"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Traffic Data Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Source IP</TableCell>
                <TableCell>Destination IP</TableCell>
                <TableCell>Protocol</TableCell>
                <TableCell>Source Port</TableCell>
                <TableCell>Destination Port</TableCell>
                <TableCell>Packet Size</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress sx={{ my: 3 }} />
                  </TableCell>
                </TableRow>
              ) : trafficData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No traffic data found
                  </TableCell>
                </TableRow>
              ) : (
                trafficData.map((item) => (
                  <TableRow key={item.id} sx={{ 
                    backgroundColor: item.is_anomalous ? 'rgba(244, 67, 54, 0.08)' : 'inherit'
                  }}>
                    <TableCell>{item.source_ip}</TableCell>
                    <TableCell>{item.destination_ip}</TableCell>
                    <TableCell>{item.protocol}</TableCell>
                    <TableCell>{item.source_port}</TableCell>
                    <TableCell>{item.destination_port}</TableCell>
                    <TableCell>{item.packet_size} bytes</TableCell>
                    <TableCell>
                      {item.is_anomalous ? (
                        <Tooltip title={item.anomaly_type || 'Unknown'}>
                          <Chip
                            label="Anomalous"
                            color="error"
                            size="small"
                          />
                        </Tooltip>
                      ) : (
                        <Chip
                          label="Normal"
                          color="success"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>{formatDate(item.timestamp)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalTraffic}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default NetworkTraffic;
