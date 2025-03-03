import { getMachineById, getMachineVariables } from "./machines";

export interface DataRow {
  timestamp: number;
  [key: string]: number;
}

interface VariableConfig {
  base: number;
  variation: number;
  min?: number;
  max?: number;
  trend?: "up" | "down" | "stable" | "oscillating";
}

const defaultConfigs: Record<string, Record<string, VariableConfig>> = {
  cnc: {
    spindleSpeed: { base: 2000, variation: 200, min: 1500, max: 2500 },
    toolVibration: { base: 50, variation: 15, min: 20, max: 100 },
    feedRate: { base: 120, variation: 30, min: 50, max: 200 },
    coolantFlowRate: { base: 8, variation: 2, min: 5, max: 12 },
    powerConsumption: { base: 45, variation: 10, min: 25, max: 70 },
  },
  injection: {
    injectionPressure: { base: 800, variation: 100, min: 600, max: 1000 },
    meltTemperature: { base: 200, variation: 15, min: 180, max: 240 },
    cycleTime: { base: 30, variation: 5, min: 20, max: 45 },
    clampingForce: { base: 500, variation: 50, min: 400, max: 650 },
  },
  packaging: {
    conveyorSpeed: { base: 1.5, variation: 0.3, min: 0.8, max: 2.5 },
    sensorTriggerCount: { base: 120, variation: 25, min: 70, max: 180 },
    motorCurrent: { base: 15, variation: 3, min: 10, max: 25 },
    packageCount: { base: 35, variation: 10, min: 15, max: 60 },
  },
};

function generateRandomValue(
  config: VariableConfig,
  index: number,
  total: number
): number {
  let value = config.base;

  if (config.trend === "up") {
    const factor = index / total;
    value = config.base + config.variation * 2 * factor;
  } else if (config.trend === "down") {
    const factor = 1 - index / total;
    value = config.base + config.variation * 2 * factor;
  } else if (config.trend === "oscillating") {
    const period = total / 3;
    value =
      config.base + config.variation * Math.sin((index / period) * 2 * Math.PI);
  } else {
    value = config.base + (Math.random() * 2 - 1) * config.variation;
  }

  if (config.min !== undefined && value < config.min) {
    value = config.min;
  }
  if (config.max !== undefined && value > config.max) {
    value = config.max;
  }

  return Number(value.toFixed(2));
}

export function generateMachineData(
  machineId: string,
  rowCount: number = 100
): DataRow[] {
  const machine = getMachineById(machineId);
  if (!machine) {
    throw new Error(`Machine with ID ${machineId} not found`);
  }

  const variables = getMachineVariables(machineId);
  const configs = defaultConfigs[machineId] || {};

  const now = Date.now();
  const timeStep = 60000;

  const rows: DataRow[] = [];

  for (let i = 0; i < rowCount; i++) {
    const timestamp = now - (rowCount - i) * timeStep;
    const row: DataRow = { timestamp };

    variables.forEach((variable) => {
      const config = configs[variable.name] || { base: 100, variation: 20 };
      row[variable.name] = generateRandomValue(config, i, rowCount);
    });

    rows.push(row);
  }

  return rows;
}
