import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  AppBar, 
  Toolbar, 
  Grid, 
  Paper,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Divider,
  Fade,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NewFormulaEditor from '@/components/NewFormulaEditor';
import DataGridView from '@/components/DataGridView';
import ChartView from '@/components/ChartView';
import KpiForm from '@/components/KpiForm';
import { DataRow, generateMachineData } from '@/lib/dataGenerator';
import { evaluateFormula, validateFormula } from '@/lib/formulaParser';
import { getMachineVariables } from '@/lib/machines';
import { KPI } from '@/lib/types';
import { kpiStore } from '@/lib/kpiUtils';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

type AggregationType = 'avg' | 'median' | 'sum' | 'min' | 'max' | 'count';

interface KpiFormContainerProps {
  isEditMode?: boolean;
  initialKpi?: KPI | null;
  title: string;
}

const KpiFormContainer: React.FC<KpiFormContainerProps> = ({
  isEditMode = false,
  initialKpi = null,
  title
}) => {
  const router = useRouter();
  
  const [machineId, setMachineId] = useState<string>(initialKpi?.machineId || 'cnc');
  const [data, setData] = useState<DataRow[]>([]);
  const [formulaResults, setFormulaResults] = useState<number[] | null>(null);
  const [formula, setFormula] = useState<string>(initialKpi?.formula || '');
  const [aggregationType, setAggregationType] = useState<AggregationType>(
    (initialKpi?.aggregationType as AggregationType) || 'avg'
  );
  const [dataSize, setDataSize] = useState<number | string>(100);
  const [customSize, setCustomSize] = useState<string>('');
  const [showCustomSize, setShowCustomSize] = useState(false);
  
  const [isFormulaValid, setIsFormulaValid] = useState(false);
  const [formulaError, setFormulaError] = useState<string | undefined>(undefined);
  const [dataLoading, setDataLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chartType, setChartType] = useState<'line' | 'bar' | 'stackedArea'>(
    initialKpi?.chartType as 'line' | 'bar' | 'stackedArea' || 'line'
  );
  const [showThresholds, setShowThresholds] = useState<boolean>(
    initialKpi?.thresholds?.target !== undefined || 
    chartType === 'bar'
  );
  const [thresholds, setThresholds] = useState<{
    target?: number;
    warning?: number;
    critical?: number;
  }>({
    target: initialKpi?.thresholds?.target,
    warning: initialKpi?.thresholds?.warning,
    critical: initialKpi?.thresholds?.critical,
  });

  const handleMachineChange = useCallback((newMachineId: string) => {
    setMachineId(newMachineId);
    setData([]);
    if (!isEditMode) {
      setFormula('');
    }
    setFormulaResults(null);
  }, [isEditMode]);

  const handleFormulaChange = useCallback((newFormula: string) => {
    setFormula(newFormula);
  }, []);

  const handleDataChange = useCallback((updatedData: DataRow[]) => {
    setData(updatedData);
  }, []);

  const handleAggregationChange = useCallback((newType: string) => {
    setAggregationType(newType as AggregationType);
  }, []);

  const handleDataSizeChange = useCallback((event: SelectChangeEvent<number | string>) => {
    const value = event.target.value;
    if (value === 'custom') {
      setShowCustomSize(true);
      setDataSize('custom');
    } else {
      setShowCustomSize(false);
      setDataSize(value as number);
    }
  }, []);

  const handleCustomSizeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCustomSize(value);
  }, []);

  const handleChartTypeChange = useCallback((
    _event: React.MouseEvent<HTMLElement>,
    newChartType: 'line' | 'bar' | 'stackedArea' | null
  ) => {
    if (newChartType !== null) {
      setChartType(newChartType);
      if (newChartType === 'bar' && !showThresholds) {
        setShowThresholds(true);
      }
    }
  }, [showThresholds]);

  const handleThresholdChange = (type: 'target' | 'warning' | 'critical') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setThresholds((prev) => ({
      ...prev,
      [type]: value === '' ? undefined : Number(value),
    }));
  };

  const handleSaveKpi = async (kpiName: string) => {
    if (!isFormulaValid || !machineId || formula.trim() === '') {
      return;
    }
    
    try {
      setIsSaving(true);
      
      const thresholdsData = showThresholds ? {
        target: thresholds.target,
        warning: thresholds.warning,
        critical: thresholds.critical,
      } : undefined;
      
      if (isEditMode && initialKpi) {
        const updatedKpi = kpiStore.updateKpi(initialKpi.id, {
          name: kpiName, 
          machineId,
          formula,
          aggregationType,
          chartType,
          thresholds: thresholdsData,
        });

        if (!updatedKpi) {
          throw new Error('Failed to update KPI');
        }
      } else {
        kpiStore.createKpi({
          name: kpiName, 
          machineId,
          formula,
          aggregationType,
          chartType,
          thresholds: thresholdsData,
        });
      }
      
      router.push('/');
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'saving'} KPI:`, error);
      setError(`Failed to ${isEditMode ? 'update' : 'save'} KPI. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const evaluateFormulaValue = useCallback(() => {
    if (!formula.trim() || !isFormulaValid || data.length === 0) {
      setFormulaResults(null);
      return;
    }

    const result = evaluateFormula(formula, data);
    if ('isValid' in result && result.isValid && result.result) {
      setFormulaResults(result.result);
    } else {
      setFormulaResults(null);
    }
  }, [formula, isFormulaValid, data]);

  useEffect(() => {
    const timeoutId = setTimeout(evaluateFormulaValue, 300);
    return () => clearTimeout(timeoutId);
  }, [evaluateFormulaValue]);

  const loadData = useCallback(() => {
    if (!machineId) return;
    
    try {
      setDataLoading(true);
      const size = dataSize === 'custom' ? parseInt(customSize, 10) : dataSize as number;
      if (isNaN(size) || size < 1) {
        throw new Error('Invalid data size');
      }
      const newData = generateMachineData(machineId, size);
      setData(newData);
    } catch (error) {
      console.error('Error generating test data:', error);
      setError('Failed to generate test data. Please check the data size.');
    } finally {
      setDataLoading(false);
    }
  }, [machineId, dataSize, customSize]);

  useEffect(() => {
    if (machineId) {
      loadData();
    }
  }, [machineId, loadData]);

  useEffect(() => {
    if (!machineId) {
      return;
    }

    if (formula.trim() === '') {
      setIsFormulaValid(false);
      setFormulaError(undefined);
      return;
    }

    const variables = getMachineVariables(machineId).map((v) => v.name);
    const { isValid, error } = validateFormula(formula, variables);
    setIsFormulaValid(isValid);
    setFormulaError(isValid ? undefined : error || 'Invalid formula');
  }, [formula, machineId]);

  return (
    <Container maxWidth="xl" sx={{ pb: 4 }}>
      {/* Header */}
      <AppBar position="static" elevation={2} sx={{ mb: 4, borderRadius: '0' }}>
        <Toolbar sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Link href="/" passHref style={{ textDecoration: 'none' }}>
            <Button
              variant="text"
              color="inherit"
              startIcon={<ArrowBackIcon />}
              sx={{
                fontWeight: 'medium',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Dashboard
            </Button>
          </Link>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box 
              component="span" 
              sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'primary.dark',
                width: 32,
                height: 32,
                borderRadius: '50%',
                mr: 1.5
              }}
            >
              {isEditMode ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
            </Box>
            {title}
          </Typography>
          
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              if (isFormulaValid && formula.trim() !== '') {
                const formElement = document.querySelector('form');
                if (formElement) {
                  formElement.dispatchEvent(new Event('submit', { bubbles: true }));
                }
              }
            }}
            disabled={!isFormulaValid || formula.trim() === '' || isSaving}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: 2,
              fontWeight: 'bold',
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s',
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            {isSaving ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Saving...
              </>
            ) : (
              isEditMode ? 'UPDATE KPI' : 'CREATE KPI'
            )}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3, pt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* KPI Form */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <KpiForm 
                machineId={machineId}
                aggregationType={aggregationType}
                onMachineChange={handleMachineChange}
                onAggregationChange={handleAggregationChange}
                onSave={handleSaveKpi}
                isFormulaValid={isFormulaValid}
                initialName={initialKpi?.name}
                isEditMode={isEditMode}
              />
            </Paper>
          </Grid>

          {/* Chart Type Selection and Thresholds */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom color="primary" fontWeight={500}>
                Chart Options
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  Chart Type
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                  {[
                    { value: 'line', icon: <ShowChartIcon />, label: 'Line Chart', desc: 'Best for time series data with continuous values' },
                    { value: 'bar', icon: <BarChartIcon />, label: 'Bar Chart', desc: 'Show values with threshold indicators' },
                    { value: 'stackedArea', icon: <StackedLineChartIcon />, label: 'Stacked Area', desc: 'EXPERIMENTAL: Show individual components of additive formulas. May not display correctly.', disabled: !formula.includes('+') }
                  ].map((option) => (
                    <Paper
                      key={option.value}
                      elevation={chartType === option.value ? 3 : 0}
                      sx={{
                        width: { xs: '100%', sm: 'calc(33.33% - 16px)' },
                        minWidth: '200px',
                        borderRadius: 2,
                        p: 2,
                        cursor: option.disabled ? 'not-allowed' : 'pointer',
                        border: theme => `1px solid ${chartType === option.value 
                          ? theme.palette.primary.main 
                          : theme.palette.divider}`,
                        backgroundColor: theme => chartType === option.value 
                          ? alpha(theme.palette.primary.main, 0.05)
                          : option.disabled ? alpha(theme.palette.action.disabledBackground, 0.3) : 'transparent',
                        transition: 'all 0.2s',
                        opacity: option.disabled ? 0.6 : 1,
                        '&:hover': {
                          backgroundColor: theme => option.disabled 
                            ? alpha(theme.palette.action.disabledBackground, 0.3)
                            : alpha(theme.palette.primary.main, chartType === option.value ? 0.05 : 0.02),
                          transform: option.disabled ? 'none' : 'translateY(-2px)',
                        }
                      }}
                      onClick={(event) => !option.disabled && handleChartTypeChange(event, option.value as 'line' | 'bar' | 'stackedArea')}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        textAlign: 'center'
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          mb: 1,
                          backgroundColor: theme => alpha(theme.palette.primary.main, chartType === option.value ? 0.2 : 0.1),
                          color: theme => chartType === option.value 
                            ? theme.palette.primary.main 
                            : theme.palette.text.primary
                        }}>
                          {option.icon}
                        </Box>
                        <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                          {option.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.desc}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showThresholds}
                      onChange={(e) => setShowThresholds(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="subtitle1" fontWeight="medium">
                      Show Thresholds
                    </Typography>
                  }
                />

                {showThresholds && (
                  <Fade in={showThresholds}>
                    <Card variant="outlined" sx={{ mt: 2, borderRadius: 2, overflow: 'visible' }}>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                          Threshold Values
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Set target, warning, and critical thresholds for your KPI
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="Target"
                              type="number"
                              value={thresholds.target === undefined ? '' : thresholds.target}
                              onChange={handleThresholdChange('target')}
                              fullWidth
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Box
                                      sx={{
                                        width: 16,
                                        height: 16,
                                        bgcolor: 'primary.main',
                                        borderRadius: '50%',
                                        mr: 1,
                                        boxShadow: '0 0 0 3px rgba(33, 150, 243, 0.2)'
                                      }}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="Warning"
                              type="number"
                              value={thresholds.warning === undefined ? '' : thresholds.warning}
                              onChange={handleThresholdChange('warning')}
                              fullWidth
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Box
                                      sx={{
                                        width: 16,
                                        height: 16,
                                        bgcolor: 'warning.main',
                                        borderRadius: '50%',
                                        mr: 1,
                                        boxShadow: '0 0 0 3px rgba(255, 215, 0, 0.2)'
                                      }}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="Critical"
                              type="number"
                              value={thresholds.critical === undefined ? '' : thresholds.critical}
                              onChange={handleThresholdChange('critical')}
                              fullWidth
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Box
                                      sx={{
                                        width: 16,
                                        height: 16,
                                        bgcolor: 'error.main',
                                        borderRadius: '50%',
                                        mr: 1,
                                        boxShadow: '0 0 0 3px rgba(255, 0, 0, 0.2)'
                                      }}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Fade>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Data Controls */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, height: 500, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Machine Data</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="data-size-label">Data Points</InputLabel>
                    <Select
                      labelId="data-size-label"
                      value={dataSize}
                      label="Data Points"
                      onChange={handleDataSizeChange}
                      disabled={dataLoading}
                    >
                      <MenuItem value={50}>50</MenuItem>
                      <MenuItem value={100}>100</MenuItem>
                      <MenuItem value={250}>250</MenuItem>
                      <MenuItem value={500}>500</MenuItem>
                      <MenuItem value={1000}>1000</MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
                    </Select>
                  </FormControl>
                  {showCustomSize && (
                    <TextField
                      label="Custom Size"
                      type="number"
                      value={customSize}
                      onChange={handleCustomSizeChange}
                      disabled={dataLoading}
                      size="small"
                      InputProps={{
                        inputProps: { min: 1 },
                        endAdornment: <InputAdornment position="end">points</InputAdornment>,
                      }}
                      sx={{ width: 150 }}
                    />
                  )}
                  <Button 
                    variant="contained" 
                    disabled={!machineId || dataLoading || (showCustomSize && !customSize)} 
                    onClick={loadData}
                  >
                    {dataLoading ? <CircularProgress size={24} /> : 'Load Random Data'}
                  </Button>
                </Box>
              </Box>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <DataGridView 
                  machineId={machineId}
                  data={data} 
                  loading={dataLoading}
                  onDataChange={handleDataChange}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Formula Editor */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>Formula Editor</Typography>
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <NewFormulaEditor 
                  machineId={machineId}
                  formula={formula}
                  onChange={handleFormulaChange}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Chart View */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Chart View</Typography>
              <ChartView 
                data={data}
                formulaResults={formulaResults}
                formula={formula}
                aggregationType={aggregationType}
                loading={dataLoading}
                error={formulaError}
                chartType={chartType}
                thresholds={showThresholds ? thresholds : undefined}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default KpiFormContainer; 