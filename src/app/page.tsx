'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  AppBar, 
  Toolbar, 
  Paper,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { KPI } from '@/lib/types';
import KpiList from '@/components/KpiList';
import Link from 'next/link';
import { kpiStore } from '@/lib/kpiUtils';
import BarChartIcon from '@mui/icons-material/BarChart';
import LightModeIcon from '@mui/icons-material/LightMode';
import { Tooltip } from '@mui/material';

export default function Home() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    fetchKpis();
  }, []);

  const fetchKpis = () => {
    try {
      const data = kpiStore.getAllKpis();
      setKpis(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching KPIs:', err);
      setError('Failed to load KPIs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this KPI?')) {
      return;
    }

    try {
      const deleted = kpiStore.deleteKpi(id);
      
      if (deleted) {
        setKpis(kpiStore.getAllKpis());
        setDeleteSuccess(true);
      } else {
        throw new Error('Failed to delete KPI');
      }
    } catch (err) {
      console.error('Error deleting KPI:', err);
      setError('Failed to delete KPI. Please try again later.');
    }
  };

  return (
    <>
      <AppBar position="static" elevation={2} sx={{ borderRadius: 0 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BarChartIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h5" component="div" fontWeight="500">
              KPI Builder
            </Typography>
          </Box>
          
          <Box>
            <IconButton 
              color="inherit" 
              edge="end" 
              onClick={() => {
                alert('Theme toggle functionality would be implemented here');
              }}
              sx={{ ml: 1 }}
            >
              <Tooltip title="Toggle Dark Mode">
                <LightModeIcon />
              </Tooltip>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight="500" 
              gutterBottom
              sx={{ mb: 1 }}  
            >
              KPI Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Monitor and manage your key performance indicators
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            component={Link}
            href="/create"
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: 3,
              fontWeight: 'bold',
              '&:hover': {
                boxShadow: 5,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s'
            }}
          >
            Create New KPI
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={2} sx={{ p: 0 }}>
          <KpiList 
            kpis={kpis} 
            loading={loading} 
            onDelete={handleDelete}
          />
        </Paper>
      </Container>

      <Snackbar
        open={deleteSuccess}
        autoHideDuration={6000}
        onClose={() => setDeleteSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setDeleteSuccess(false)} severity="success">
          KPI deleted successfully!
        </Alert>
      </Snackbar>
    </>
  );
}
