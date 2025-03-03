import React, { useState, useEffect, useMemo } from 'react';
import { Box, Skeleton } from '@mui/material';
import dynamic from 'next/dynamic';
import { getMachineVariables } from '@/lib/machines';
import { validateFormula } from '@/lib/formulaParser';
import type { MachineVariable } from '@/lib/machines';
import FormulaFeedback from './FormulaFeedback';

// Import Monaco editor dynamically to avoid SSR issues
const MonacoFormulaEditor = dynamic(
  () => import('./MonacoEditor'),
  { 
    ssr: false,
    loading: () => <Skeleton variant="rectangular" height="230px" width="100%" />
  }
);

interface NewFormulaEditorProps {
  machineId: string;
  formula: string;
  onChange: (value: string) => void;
}

const NewFormulaEditor: React.FC<NewFormulaEditorProps> = ({
  machineId,
  formula,
  onChange,
}) => {
  const [error, setError] = useState<string | null>(null);
  
  const variables = useMemo<MachineVariable[]>(() => getMachineVariables(machineId), [machineId]);
  const variableNames = useMemo(() => variables.map(v => v.name), [variables]);
  
  useEffect(() => {
    if (!formula.trim()) {
      setError(null);
      return;
    }

    const { isValid, error } = validateFormula(formula, variableNames);
    setError(isValid ? null : error || 'Invalid formula');
  }, [formula, variableNames]);

  const handleVariableClick = (variableName: string) => {
    onChange(formula + variableName);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      flexGrow: 1
    }}>
      {/* Monaco Editor */}
      <Box sx={{ flex: '1 0 auto', minHeight: '230px' }}>
        <MonacoFormulaEditor
          formula={formula}
          onChange={onChange}
          variables={variables}
          height="230px"
        />
      </Box>
      
      {/* Formula Feedback Component */}
      <FormulaFeedback 
        error={error}
        variables={variables}
        onVariableClick={handleVariableClick}
      />
    </Box>
  );
};

export default NewFormulaEditor; 