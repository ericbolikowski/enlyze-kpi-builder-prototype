import React, { useCallback, useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { 
  DataGrid, 
  GridColDef,
  GridRowModesModel,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { DataRow } from '@/lib/dataGenerator';
import { getMachineVariables } from '@/lib/machines';
import { format } from 'date-fns';

type GridRowType = DataRow & { id: number };

interface DataGridViewProps {
  machineId: string;
  data: DataRow[];
  loading: boolean;
  onDataChange: (data: DataRow[]) => void;
}

const DataGridView: React.FC<DataGridViewProps> = React.memo(({
  machineId,
  data,
  loading,
  onDataChange,
}) => {
  const variables = useMemo(() => 
    machineId ? getMachineVariables(machineId) : [],
    [machineId]
  );

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  const columns = useMemo(() => [
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      width: 180,
      editable: false,
      renderCell: (params) => {
        try {
          return format(new Date(params.row.timestamp), 'yyyy-MM-dd HH:mm:ss');
        } catch (error) {
          console.error('Error formatting timestamp:', error);
          return 'Invalid date';
        }
      },
    },
    ...variables.map((variable) => ({
      field: variable.name,
      headerName: variable.name,
      width: 130,
      editable: true,
      type: 'number' as const,
      renderCell: (params: GridRenderCellParams) => {
        const value = params.value;
        if (value === null) {
          return '';
        }
        if (typeof value === 'number') {
          return value.toFixed(2);
        }
        return value ?? '';
      },
    })),
  ] as GridColDef<GridRowType>[], [variables]);

  const handleRowModesModelChange = useCallback((newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  }, []);

  const processRowUpdate = useCallback(
    (newRow: GridRowType) => {
      const updatedData = data.map((row, index) => 
        index === newRow.id ? { ...row, ...newRow } : row
      );
      onDataChange(updatedData);
      return newRow;
    },
    [data, onDataChange]
  );

  const handleProcessRowUpdateError = useCallback(() => {
    setRowModesModel({});
  }, []);

  const rows = useMemo(() => 
    data.map((row, index) => ({ ...row, id: index })),
    [data]
  );

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Data Grid
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="text.secondary">
            No data available. Please select a machine and load data.
          </Typography>
        </Box>
      ) : (
        <DataGrid<GridRowType>
          rows={rows}
          columns={columns}
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          sx={{
            '& .data-grid-header': {
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
          loading={loading}
        />
      )}
    </Box>
  );
});

DataGridView.displayName = 'DataGridView';

export default DataGridView; 