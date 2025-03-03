export interface DataRow {
  timestamp: number;
  [key: string]: number;
}

export interface Machine {
  id: string;
  name: string;
  description: string;
  variables: MachineVariable[];
}

export interface MachineVariable {
  name: string;
  label: string;
  unit: string;
  description: string;
  min?: number;
  max?: number;
}

export interface KPI {
  id: string;
  name: string;
  machineId: string;
  formula: string;
  aggregationType: string;
  chartType?: "line" | "bar" | "stackedArea";
  thresholds?: {
    target?: number;
    warning?: number;
    critical?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FormulaValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormulaEvaluationResult {
  isValid: boolean;
  result?: DataRow[];
  error?: string;
}

export interface ChartData {
  timestamps: string[];
  values: number[];
}

export interface ChartViewProps {
  data: DataRow[];
  formulaResults?: number[] | null;
  formula?: string;
  aggregationType?: string;
  loading?: boolean;
  error?: string;
}

export interface DataGridViewProps {
  data: DataRow[];
  machineId: string;
  onDataChange?: (data: DataRow[]) => void;
  loading?: boolean;
  readOnly?: boolean;
}

export interface FormulaEditorProps {
  machineId: string;
  formula: string;
  onChange: (value: string) => void;
  variables?: string[];
  error?: string;
}

export interface KpiFormProps {
  machineId: string;
  onMachineChange: (machineId: string) => void;
  formula: string;
  onFormulaChange?: (formula: string) => void;
  aggregationType: string;
  onAggregationChange: (aggregationType: string) => void;
  onSave: (name: string) => Promise<void> | void;
  isSaving?: boolean;
  isFormulaValid?: boolean;
  initialName?: string;
}
