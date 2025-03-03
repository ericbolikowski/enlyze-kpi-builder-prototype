'use client';

import React, { useState } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import dynamic from 'next/dynamic';
import { getMachineVariables } from '@/lib/machines';

// Use dynamic import to load Monaco Editor component on client-side only
const MonacoEditor = dynamic(
  () => import('@/components/MonacoEditor'),
  { ssr: false }
);

export default function TestMonacoPage() {
  const [formula, setFormula] = useState('spindleSpeed * 0.8');
  const machineId = 'cnc'; 
  const variables = getMachineVariables(machineId);

  const handleFormulaChange = (value: string) => {
    setFormula(value);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Monaco Editor Test Page
        </Typography>
        <Typography variant="body1" paragraph>
          This page demonstrates a simple implementation of Monaco Editor with autocomplete
          for machine variables and mathematical functions.
        </Typography>
        
        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            Available Variables:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {variables.map((variable) => (
              <Paper
                key={variable.name}
                sx={{
                  p: 1,
                  background: '#f0f0f0',
                  display: 'inline-block',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2">
                  {variable.name}: {variable.displayName} ({variable.unit})
                </Typography>
              </Paper>
            ))}
          </Box>
        
          <MonacoEditor
            formula={formula}
            onChange={handleFormulaChange}
            variables={variables}
            height="150px"
            showLineNumbers={true}
            borderStyle="paper"
          />
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Current Formula:</Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', p: 1, bgcolor: '#f5f5f5' }}>
              {formula}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
} 