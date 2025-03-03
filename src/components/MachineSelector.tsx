import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  FormHelperText 
} from '@mui/material';
import { machines } from '@/lib/machines';

interface MachineSelectorProps {
  selectedMachineId: string;
  onMachineChange: (machineId: string) => void;
  error?: string;
}

const MachineSelector: React.FC<MachineSelectorProps> = ({
  selectedMachineId,
  onMachineChange,
  error
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onMachineChange(event.target.value);
  };

  return (
    <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
      <InputLabel id="machine-selector-label">Select Machine</InputLabel>
      <Select
        labelId="machine-selector-label"
        id="machine-selector"
        value={selectedMachineId}
        label="Select Machine"
        onChange={handleChange}
        data-testid="machine-selector"
      >
        {machines.map((machine) => (
          <MenuItem key={machine.id} value={machine.id}>
            {machine.name}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default MachineSelector; 