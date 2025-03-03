import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';
import dynamic from 'next/dynamic';
import { getMachineVariables } from '@/lib/machines';
import { validateFormula } from '@/lib/formulaParser';
import type { MachineVariable } from '@/lib/machines';

const MonacoEditorComponent = dynamic(
  () => import('./MonacoEditor'),
  { ssr: false }
);

interface FormulaEditorProps {
  machineId: string;
  formula: string;
  onChange: (value: string) => void;
}

const FormulaEditor: React.FC<FormulaEditorProps> = ({
  machineId,
  formula,
  onChange,
}) => {
  const [error, setError] = useState<string | null>(null);
  
  const variables = useMemo(() => getMachineVariables(machineId), [machineId]);
  const variableNames = useMemo(() => variables.map(v => v.name), [variables]);
  
  useEffect(() => {
    if (!formula.trim()) {
      setError(null);
      return;
    }

    const { isValid, error } = validateFormula(formula, variableNames);
    setError(isValid ? null : error || 'Invalid formula');
  }, [formula, variableNames]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Formula Editor
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <MonacoEditorComponent
        formula={formula}
        onChange={onChange}
        variables={variables}
        height="120px"
        borderStyle="paper"
      />
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Available Variables:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {variables.map((variable: MachineVariable) => (
            <Paper
              key={variable.name}
              sx={{
                py: 0.5,
                px: 1.5,
                background: 'primary.light',
                color: 'primary.contrastText',
                cursor: 'pointer',
                '&:hover': { background: 'primary.main' },
                borderRadius: 1
              }}
              onClick={() => onChange(formula + variable.name)}
              title={`${variable.displayName} (${variable.unit}): ${variable.additionalInfo}`}
            >
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {variable.name}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default FormulaEditor; 