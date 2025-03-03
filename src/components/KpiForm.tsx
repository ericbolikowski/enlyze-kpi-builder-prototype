import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  Alert,
  Typography,
  InputAdornment,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import MachineSelector from './MachineSelector';
import { aggregationOptions } from '@/lib/machines';

interface KpiFormProps {
  machineId: string;
  aggregationType: string;
  onMachineChange: (machineId: string) => void;
  onAggregationChange: (aggregationType: string) => void;
  onSave: (name: string) => Promise<void>;
  isFormulaValid: boolean;
  initialName?: string;
  isEditMode?: boolean;
}

const KpiForm: React.FC<KpiFormProps> = ({
  machineId,
  aggregationType,
  onMachineChange,
  onAggregationChange,
  onSave,
  isFormulaValid,
  initialName = '',
  isEditMode = false,
}) => {
  const [name, setName] = useState(initialName);
  const [nameError, setNameError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const theme = useTheme();
  
  useEffect(() => {
    if (initialName) {
      setName(initialName);
    }
  }, [initialName]);
  
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    if (event.target.value.trim() === '') {
      setNameError('KPI name is required');
    } else {
      setNameError(null);
    }
  };
  
  const handleAggregationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAggregationChange(event.target.value);
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (name.trim() === '') {
      setNameError('KPI name is required');
      return;
    }
    
    if (!isFormulaValid) {
      return;
    }
    
    try {
      await onSave(name);
      setSuccessOpen(true);
      if (!isEditMode) {
        setName('');
      }
    } catch (error) {
      console.error('Error saving KPI:', error);
    }
  };
  
  const handleCloseSuccess = () => {
    setSuccessOpen(false);
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
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="500" color="primary">
        Basic Information
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="KPI Name"
          id="kpi-name"
          value={name}
          onChange={handleNameChange}
          error={!!nameError}
          helperText={nameError}
          required
          variant="outlined"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DriveFileRenameOutlineIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />
        
        <MachineSelector
          selectedMachineId={machineId}
          onMachineChange={onMachineChange}
        />
      </Box>
      
      <Typography variant="h6" gutterBottom fontWeight="500" color="primary" sx={{ mt: 4 }}>
        Aggregation Method
      </Typography>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          mb: 2 
        }}
      >
        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup
            row
            value={aggregationType}
            onChange={handleAggregationChange}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: 1,
            }}
          >
            {aggregationOptions.map((option) => {
              const color = getAggregationColor(option.value);
              return (
                <Paper
                  key={option.value}
                  elevation={0}
                  sx={{
                    border: `1px solid ${alpha(color, 0.3)}`,
                    borderRadius: 2,
                    backgroundColor: aggregationType === option.value 
                      ? alpha(color, 0.1)
                      : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha(color, 0.07),
                    }
                  }}
                >
                  <FormControlLabel
                    value={option.value}
                    control={
                      <Radio 
                        sx={{ 
                          color: color,
                          '&.Mui-checked': {
                            color: color,
                          }
                        }} 
                      />
                    }
                    label={
                      <Typography 
                        variant="body2" 
                        fontWeight={aggregationType === option.value ? 'bold' : 'normal'}
                      >
                        {option.label}
                      </Typography>
                    }
                    sx={{ 
                      margin: 0, 
                      width: '100%',
                      padding: '4px 8px',
                    }}
                  />
                </Paper>
              );
            })}
          </RadioGroup>
        </FormControl>
      </Paper>
      
      <Snackbar
        open={successOpen}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          KPI {isEditMode ? 'updated' : 'saved'} successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KpiForm; 