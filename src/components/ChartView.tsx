import React, { useMemo, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  CircularProgress, 
  Alert,
  IconButton,
  Dialog,
  AppBar,
  Toolbar,
  AlertTitle,
} from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import ReactECharts from 'echarts-for-react';
import { EChartsOption, TooltipComponentOption } from 'echarts';
import { format } from 'date-fns';
import { DataRow } from '@/lib/dataGenerator';
import { aggregateResults } from '@/lib/formulaParser';
import { CallbackDataParams } from 'echarts/types/dist/shared';

interface MarkLineItem {
  name: string;
  yAxis: number;
  label: {
    formatter?: string;
    position?: 'insideEndTop';
    show?: boolean;
    fontSize?: number;
  };
  lineStyle: {
    type: 'solid' | 'dashed';
    width: number;
    color: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EChartsSeries = any;

interface ChartViewProps {
  data: DataRow[];
  formulaResults: number[] | null;
  formula: string;
  aggregationType: string;
  loading: boolean;
  error?: string;
  chartType?: 'line' | 'bar' | 'stackedArea';
  thresholds?: {
    target?: number;
    warning?: number;
    critical?: number;
  };
  title?: string;
  isLoading?: boolean;
}

const ChartView: React.FC<ChartViewProps> = ({
  data,
  formulaResults,
  formula,
  aggregationType,
  loading,
  error,
  chartType = 'line',
  thresholds = {},
  title,
  isLoading,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timestamps = data.map((row) => format(new Date(row.timestamp), 'HH:mm:ss'));
  
  const aggregatedValue = useMemo(() => {
    if (!formulaResults || formulaResults.length === 0) return null;
    return aggregateResults(formulaResults, aggregationType);
  }, [formulaResults, aggregationType]);
  
  const getChartOptions = (fullscreen: boolean): EChartsOption => {
    const values = formulaResults || [];
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    const thresholdValues = [
      thresholds.target,
      thresholds.warning,
      thresholds.critical
    ].filter((val): val is number => val !== undefined);
    
    const maxWithThresholds = thresholdValues.length > 0
      ? Math.max(max, ...thresholdValues)
      : max;
    
    const minWithThresholds = thresholdValues.length > 0
      ? Math.min(min, ...thresholdValues)
      : min;
    
    const rangeWithThresholds = maxWithThresholds - minWithThresholds;
    
    const basePadding = rangeWithThresholds * 0.1;
    const thresholdPadding = thresholdValues.length > 0 
      ? rangeWithThresholds * (0.05 * thresholdValues.length) // Add more padding for each threshold
      : 0;
    const padding = Math.max(basePadding, thresholdPadding);
    
    let yMax, yMin;
    
    if (minWithThresholds >= 0) {
      yMin = 0;
      yMax = maxWithThresholds + padding;
    } else {
      yMin = minWithThresholds - padding;
      yMax = maxWithThresholds + padding;
      
      if (maxWithThresholds > 0) {
        const absMax = Math.max(Math.abs(yMax), Math.abs(yMin));
        yMax = absMax;
        yMin = -absMax;
      }
    }
    
    if (thresholdValues.length > 0) {
      const labelSpace = rangeWithThresholds * (0.05 * thresholdValues.length);
      yMax += labelSpace;
      
      if (yMin < 0) {
        yMin -= labelSpace;
      }
    }
    
    const getInterval = (range: number) => {
      if (range === 0 || !isFinite(range)) return 1;
      
      const magnitude = Math.floor(Math.log10(Math.abs(range)));
      const scale = Math.pow(10, magnitude - 1);
      const normalizedRange = range / scale;
      
      let factor;
      if (normalizedRange <= 2) factor = 0.2;
      else if (normalizedRange <= 5) factor = 0.5;
      else if (normalizedRange <= 10) factor = 1;
      else factor = 2;
      
      return Math.ceil(range / (10 * factor)) * (scale * factor);
    };

    const markLineData: MarkLineItem[] = [];
    
    if (thresholds.target !== undefined) {
      markLineData.push({
        name: 'Target',
        yAxis: thresholds.target,
        label: {
          formatter: `Target: ${thresholds.target}`,
          position: 'insideEndTop',
          fontSize: 11,
        },
        lineStyle: {
          type: 'solid' as const,
          width: 2,
          color: '#2ecc71'  
        }
      });
    }
    
    if (thresholds.warning !== undefined) {
      markLineData.push({
        name: 'Warning',
        yAxis: thresholds.warning,
        label: {
          formatter: `Warning: ${thresholds.warning}`,
          position: 'insideEndTop',
          fontSize: 11,
        },
        lineStyle: {
          type: 'dashed' as const,
          width: 2,
          color: '#f39c12' 
        }
      });
    }
    
    if (thresholds.critical !== undefined) {
      markLineData.push({
        name: 'Critical',
        yAxis: thresholds.critical,
        label: {
          formatter: `Critical: ${thresholds.critical}`,
          position: 'insideEndTop',
          fontSize: 11,
        },
        lineStyle: {
          type: 'dashed' as const,
          width: 2,
          color: '#e74c3c' 
        }
      });
    }
    
    if (aggregatedValue !== null) {
      markLineData.push({
        name: `${aggregationType.charAt(0).toUpperCase() + aggregationType.slice(1)}`,
        yAxis: aggregatedValue,
        label: {
          formatter: `${aggregationType.charAt(0).toUpperCase() + aggregationType.slice(1)}: {c}`,
          position: 'insideEndTop' as const,
          fontSize: 11,
        },
        lineStyle: {
          type: 'solid' as const,
          width: 2,
          color: '#3498db' 
        }
      });
    }
    
    if (min < 0 && max > 0) {
      markLineData.push({
        name: 'Zero',
        yAxis: 0,
        label: {
          show: false
        },
        lineStyle: {
          type: 'solid' as const,
          width: 1,
          color: '#34495e'
        }
      });
    }

    let series: EChartsSeries[] = [];

    const getGradient = (color: string, opacity: number = 0.2) => ({
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: color }, 
        { offset: 1, color: `rgba(255, 255, 255, ${opacity})` } 
      ]
    });

    const commonVisualSettings = {
      symbol: 'circle',
      showSymbol: formulaResults && formulaResults.length <= 100,
      symbolSize: 7,
      lineStyle: {
        width: fullscreen ? 4 : 3,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowBlur: 10,
        shadowOffsetY: 5,
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          borderWidth: 3,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    };

    if (chartType === 'line') {
      series = [{
        name: 'Formula Result',
        type: 'line',
        data: formulaResults || [],
        smooth: true,
        sampling: 'lttb',
        ...commonVisualSettings,
        areaStyle: {
          opacity: 0.2,
          color: getGradient('#3498db')
        },
        markLine: {
          data: markLineData,
          symbol: ['none', 'none'],
          lineStyle: {
            width: 2
          },
          label: {
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            padding: [4, 6],
            borderRadius: 4,
            formatter: '{b}: {c}',
            fontSize: 12
          }
        },
        markArea: min < 0 ? {
          silent: true,
          itemStyle: {
            opacity: 0.05,
            color: '#34495e'
          },
          data: [[{
            yAxis: 0
          }, {
            yAxis: min
          }]]
        } : undefined
      }];
    }
    else if (chartType === 'bar') {
      series = [{
        name: 'Formula Result',
        type: 'bar',
        data: formulaResults?.map(value => {
          const itemStyle = {
            color: new Function('return ' + 'function(params) { return new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: "#2ecc71" }, { offset: 1, color: "#27ae60" }]); }')(),
            borderRadius: [4, 4, 0, 0],
            shadowColor: 'rgba(0,0,0,0.1)',
            shadowBlur: 10,
            shadowOffsetY: 5
          };
          
          if (thresholds.target !== undefined && thresholds.critical !== undefined && 
              ((thresholds.critical > thresholds.target && value >= thresholds.critical) || 
              (thresholds.critical < thresholds.target && value <= thresholds.critical))) {
            itemStyle.color = new Function('return ' + 'function(params) { return new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: "#e74c3c" }, { offset: 1, color: "#c0392b" }]); }')();
          } else if (thresholds.target !== undefined && thresholds.warning !== undefined && 
                    ((thresholds.warning > thresholds.target && value >= thresholds.warning) || 
                    (thresholds.warning < thresholds.target && value <= thresholds.warning))) {
            itemStyle.color = new Function('return ' + 'function(params) { return new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: "#f39c12" }, { offset: 1, color: "#d35400" }]); }')();
          }
          
          return {
            value,
            itemStyle,
          };
        }) || [],
        barWidth: '60%',
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0,0,0,0.3)'
          }
        },
        markLine: {
          data: markLineData,
          symbol: ['none', 'none'],
          lineStyle: {
            width: 2
          },
          label: {
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            padding: [4, 6],
            borderRadius: 4,
            formatter: '{b}: {c}',
            fontSize: 12
          }
        }
      }];
    } 
    else if (chartType === 'stackedArea' && formula.includes('+')) {
      const components = formula.split('+').map(c => c.trim());
      
      series = components.map((component, index) => {
        const colorMap = [
          '#3498db', '#2ecc71', '#9b59b6', '#e74c3c', 
          '#f39c12', '#1abc9c', '#34495e', '#2980b9'
        ];
        const baseColor = colorMap[index % colorMap.length];
        
        const componentData = data.map(row => {
          const value = row[component as keyof DataRow];
          return typeof value === 'number' ? value : 0;
        });
        
        return {
          name: component,
          type: 'line',
          stack: 'Total',
          areaStyle: {
            opacity: 0.8,
            color: getGradient(baseColor, 0.6)
          },
          emphasis: {
            focus: 'series',
            areaStyle: {
              opacity: 0.9
            }
          },
          data: componentData,
          color: baseColor,
          smooth: true,
          symbolSize: 6,
          showSymbol: false,
          lineStyle: {
            width: 2
          }
        };
      });
    }

    return {
      animation: true,
      grid: {
        left: '5%',   
        right: '5%',
        bottom: '15%', 
        top: '10%',   
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: CallbackDataParams[]) => {
          const dataIndex = params[0].dataIndex;
          if (!data[dataIndex]) return '';
          
          const timestamp = format(new Date(data[dataIndex].timestamp), 'yyyy-MM-dd HH:mm:ss');
          
          if (chartType === 'stackedArea') {
            let result = `${timestamp}<br/>`;
            params.forEach(param => {
              const value = param.value as number;
              const color = param.color as string;
              result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>${param.seriesName}: ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}<br/>`;
            });
            return result;
          } else {
            const value = params[0].value as number;
            return `${timestamp}<br/>${formula} = ${value.toLocaleString(undefined, {
              maximumFractionDigits: 2
            })}`;
          }
        },
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      } as TooltipComponentOption,
      legend: chartType === 'stackedArea' ? {
        data: formula.split('+').map(c => c.trim()),
        orient: 'horizontal',
        top: 0
      } : undefined,
      xAxis: {
        type: 'category',
        data: timestamps,
        name: 'Time',
        nameLocation: 'middle',
        nameGap: 35,
        axisLabel: {
          rotate: 45,
          fontSize: 10,
          hideOverlap: true
        },
      },
      yAxis: {
        type: 'value',
        name: 'Formula Result',
        nameLocation: 'middle',
        nameGap: 50,
        min: yMin,
        max: yMax,
        interval: getInterval(yMax - yMin),
        splitNumber: 10, 
        axisLine: {
          show: true,
          onZero: min < 0 ? true : false, 
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            opacity: 0.7
          }
        },
        axisLabel: {
          formatter: (value: number) => {
            if (Math.abs(value) >= 1000) {
              return value.toLocaleString(undefined, {
                notation: 'compact',
                maximumFractionDigits: 1
              });
            }
            return value.toFixed(1);
          },
          fontSize: 11
        }
      },
      series: series,
      dataZoom: [
        {
          type: 'slider',
          start: 0,
          end: 100,
          height: 20,
          bottom: 5,
          brushSelect: true,
          handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        },
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
      ],
    };
  };

  const handleFullscreenOpen = () => setIsFullscreen(true);
  const handleFullscreenClose = () => setIsFullscreen(false);

  const renderChart = (fullscreen: boolean = false) => (
    formulaResults && formulaResults.length > 0 ? (
      <ReactECharts
        option={getChartOptions(fullscreen)}
        style={{ 
          height: fullscreen ? '100%' : '350px',
          width: '100%',
          minHeight: fullscreen ? '400px' : '350px'
        }}
        notMerge={true}
        lazyUpdate={true}
      />
    ) : null
  );

  return (
    <Box sx={{ 
      height: { xs: '100%', md: 'calc(100% - 20px)' }, 
      minHeight: 400,
      display: 'flex', 
      flexDirection: 'column', 
      position: 'relative'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <Typography variant="h6" component="h2" gutterBottom={false}>
          {title || 'Chart View'}
          {isLoading && (
            <CircularProgress 
              size={20} 
              sx={{ ml: 2, verticalAlign: 'middle' }} 
            />
          )}
        </Typography>
        <Box>
          {aggregationType && aggregatedValue !== null && (
            <Chip 
              label={`${aggregationType.charAt(0).toUpperCase() + aggregationType.slice(1)}: ${aggregatedValue.toFixed(2)}`}
              color="primary"
              size="small"
              sx={{ mr: 1, fontWeight: 'bold' }}
            />
          )}
          <IconButton 
            size="small" 
            onClick={handleFullscreenOpen}
            aria-label="Fullscreen"
          >
            <FullscreenIcon />
          </IconButton>
        </Box>
      </Box>

      {chartType === 'stackedArea' && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Experimental Feature</AlertTitle>
          This stacked area chart is experimental and might not always display correctly, especially with complex formulas.
        </Alert>
      )}
      
      <Paper sx={{ 
        flexGrow: 1, 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 400,
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            {error}
          </Alert>
        ) : !formulaResults || formulaResults.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="text.secondary">
              Enter a valid formula to see results
            </Typography>
          </Box>
        ) : (
          renderChart()
        )}
      </Paper>

      {/* Fullscreen Dialog */}
      <Dialog
        fullScreen
        open={isFullscreen}
        onClose={handleFullscreenClose}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Chart View
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleFullscreenClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ 
          height: 'calc(100vh - 64px)', 
          p: 3,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {chartType === 'stackedArea' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>Experimental Feature</AlertTitle>
              This stacked area chart is experimental and might not always display correctly, especially with complex formulas.
            </Alert>
          )}
          <Box sx={{ flexGrow: 1, minHeight: 0 }}>
            {renderChart(true)}
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ChartView; 