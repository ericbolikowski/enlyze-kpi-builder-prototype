import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton,
  Tooltip,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Fade,
  CardHeader,
  Avatar,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import { KPI } from '@/lib/types';
import { format } from 'date-fns';
import { getMachineById } from '@/lib/machines';
import Link from 'next/link';

interface KpiListProps {
  kpis: KPI[];
  loading: boolean;
  onDelete?: (id: string) => void;
}

const KpiList: React.FC<KpiListProps> = ({ kpis, loading, onDelete }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (kpis.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No KPIs have been created yet. Create your first KPI to get started.
        </Typography>
      </Paper>
    );
  }

  const getChartIcon = (chartType?: string) => {
    switch (chartType) {
      case 'bar':
        return <BarChartIcon />;
      case 'stackedArea':
        return <StackedLineChartIcon />;
      default:
        return <ShowChartIcon />;
    }
  };

  const getAggregationColor = (type: string) => {
    switch (type) {
      case 'avg':
        return theme.palette.primary.main;
      case 'sum':
        return theme.palette.success.main;
      case 'min':
        return theme.palette.info.main;
      case 'max':
        return theme.palette.warning.main;
      case 'count':
        return theme.palette.secondary.main;
      case 'median':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Grid container spacing={3}>
      {kpis.map((kpi) => {
        const machine = getMachineById(kpi.machineId);
        const aggregationColor = getAggregationColor(kpi.aggregationType);
        const chartIcon = getChartIcon(kpi.chartType);
        
        return (
          <Grid item xs={12} sm={6} md={4} key={kpi.id}>
            <Fade in={true} timeout={300}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                  borderRadius: 2
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: aggregationColor }} aria-label="chart-type">
                      {chartIcon}
                    </Avatar>
                  }
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h6" noWrap sx={{ fontWeight: 500 }}>
                        {kpi.name || 'Unnamed KPI'}
                      </Typography>
                      {kpi.chartType === 'stackedArea' && (
                        <Chip 
                          size="small" 
                          label="EXPERIMENTAL" 
                          color="warning" 
                          sx={{ ml: 1, height: 20 }} 
                        />
                      )}
                    </Box>
                  }
                  subheader={machine?.name || kpi.machineId}
                />
                
                <Divider />
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Formula
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontFamily: 'monospace',
                        backgroundColor: theme.palette.action.hover,
                        p: 1,
                        borderRadius: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {kpi.formula}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={kpi.aggregationType.toUpperCase()} 
                      size="small" 
                      sx={{ 
                        backgroundColor: aggregationColor,
                        color: '#fff',
                        fontWeight: 'bold'
                      }} 
                    />
                    
                    <Typography variant="caption" color="text.secondary">
                      Created: {kpi.createdAt ? format(new Date(kpi.createdAt), 'yyyy-MM-dd') : 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                  <Tooltip title="Edit KPI">
                    <IconButton 
                      aria-label="edit" 
                      color="primary" 
                      size="small"
                      component={Link}
                      href={`/kpi/${kpi.id}`}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  
                  {onDelete && (
                    <Tooltip title="Delete KPI">
                      <IconButton 
                        aria-label="delete" 
                        color="error" 
                        size="small"
                        onClick={() => onDelete(kpi.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </CardActions>
              </Card>
            </Fade>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default KpiList; 