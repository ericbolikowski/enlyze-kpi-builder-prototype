'use client';

import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import KpiFormContainer from '@/components/KpiFormContainer';
import { KPI } from '@/lib/types';
import { kpiStore } from '@/lib/kpiUtils';

export default function KpiDetail() {
  const params = useParams();
  const id = params.id as string;
  
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const kpiData = kpiStore.getKpiById(id);
      
      if (kpiData) {
        setKpi(kpiData);
        setError(null);
      } else {
        setError('KPI not found');
      }
    } catch (err) {
      console.error('Error fetching KPI:', err);
      setError('Failed to load KPI. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !kpi) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'KPI not found'}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={Link} 
          href="/"
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <KpiFormContainer 
      title={`Edit KPI: ${kpi.name}`}
      isEditMode={true}
      initialKpi={kpi}
    />
  );
} 