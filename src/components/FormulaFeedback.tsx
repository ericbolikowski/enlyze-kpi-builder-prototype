import React from 'react';
import { Box, Typography, Alert, Chip, Tooltip } from '@mui/material';
import type { MachineVariable } from '@/lib/machines';

interface FormulaFeedbackProps {
  error: string | null;
  variables: MachineVariable[];
  onVariableClick: (variableName: string) => void;
}

const FormulaFeedback: React.FC<FormulaFeedbackProps> = ({
  error,
  variables,
  onVariableClick,
}) => {
  return (
    <Box>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 2, 
            mb: 2,
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            '& .MuiAlert-message': {
              width: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }}
        >
          {error}
        </Alert>
      )}
      
      {/* Variable Chips */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Available Variables:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {variables.map((variable) => (
            <Tooltip
              key={variable.name}
              title={
                <React.Fragment>
                  <Typography variant="subtitle2">{variable.displayName}</Typography>
                  <Typography variant="body2">{variable.unit}</Typography>
                  <Typography variant="body2">{variable.additionalInfo}</Typography>
                </React.Fragment>
              }
              arrow
              placement="top"
            >
              <Chip
                label={variable.name}
                color="primary"
                variant="filled"
                size="small"
                onClick={() => onVariableClick(variable.name)}
                sx={{ 
                  fontWeight: 'medium',
                  cursor: 'pointer',
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default FormulaFeedback; 