export interface MachineVariable {
  name: string;
  displayName: string;
  unit: string;
  additionalInfo: string;
}

export interface Machine {
  id: string;
  name: string;
  variables: MachineVariable[];
}

export const machines: Machine[] = [
  {
    id: "cnc",
    name: "CNC Machine",
    variables: [
      {
        name: "spindleSpeed",
        displayName: "Spindle Speed",
        unit: "RPM",
        additionalInfo: "Controls cutting accuracy",
      },
      {
        name: "toolVibration",
        displayName: "Tool Vibration",
        unit: "Hz",
        additionalInfo: "Detects tool wear",
      },
      {
        name: "feedRate",
        displayName: "Feed Rate",
        unit: "mm/s",
        additionalInfo: "Speed of cutting/milling process",
      },
      {
        name: "coolantFlowRate",
        displayName: "Coolant Flow Rate",
        unit: "L/min",
        additionalInfo: "Prevents overheating",
      },
      {
        name: "powerConsumption",
        displayName: "Power Consumption",
        unit: "kW",
        additionalInfo: "Monitors efficiency",
      },
    ],
  },
  {
    id: "injection",
    name: "Injection Molding Machine",
    variables: [
      {
        name: "injectionPressure",
        displayName: "Injection Pressure",
        unit: "bar",
        additionalInfo: "Affects material flow and part quality",
      },
      {
        name: "meltTemperature",
        displayName: "Melt Temperature",
        unit: "°C",
        additionalInfo: "Determines material viscosity",
      },
      {
        name: "cycleTime",
        displayName: "Cycle Time",
        unit: "s",
        additionalInfo: "Total time to produce one part",
      },
      {
        name: "clampingForce",
        displayName: "Clamping Force",
        unit: "kN",
        additionalInfo: "Holds mold closed during injection",
      },
    ],
  },
  {
    id: "packaging",
    name: "Packaging Machine",
    variables: [
      {
        name: "conveyorSpeed",
        displayName: "Conveyor Speed",
        unit: "m/s",
        additionalInfo: "Speed of product movement",
      },
      {
        name: "sensorTriggerCount",
        displayName: "Sensor Trigger Count",
        unit: "count",
        additionalInfo: "Number of products detected",
      },
      {
        name: "motorCurrent",
        displayName: "Motor Current",
        unit: "A",
        additionalInfo: "Indicates load on motors",
      },
      {
        name: "packageCount",
        displayName: "Package Count",
        unit: "count/min",
        additionalInfo: "Packaging production rate",
      },
    ],
  },
];

export function getMachineById(id: string): Machine | undefined {
  return machines.find((machine) => machine.id === id);
}

export function getMachineVariables(machineId: string): MachineVariable[] {
  const machine = getMachineById(machineId);
  return machine ? machine.variables : [];
}

export const aggregationOptions = [
  { value: "average", label: "Average" },
  { value: "median", label: "Median" },
  { value: "sum", label: "Sum" },
  { value: "integration", label: "Integration" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
];
