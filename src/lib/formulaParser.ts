import { Parser } from "expr-eval";
import { DataRow } from "./dataGenerator";

const parser = new Parser();

interface FormulaResult {
  isValid: boolean;
  error?: string;
  result?: number[];
}

export function validateFormula(
  formula: string,
  variables: string[]
): { isValid: boolean; error?: string } {
  if (!formula.trim()) {
    return { isValid: false, error: "Formula cannot be empty" };
  }

  try {
    const expr = parser.parse(formula);

    const usedVariables = expr.variables();

    const invalidVariables = usedVariables.filter(
      (v) => !variables.includes(v)
    );
    if (invalidVariables.length > 0) {
      return {
        isValid: false,
        error: `Unknown variable(s): ${invalidVariables.join(", ")}`,
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Invalid formula",
    };
  }
}

export function evaluateFormula(
  formula: string,
  data: DataRow[]
): FormulaResult {
  if (!formula.trim()) {
    return { isValid: false, error: "Formula cannot be empty" };
  }

  try {
    const expr = parser.parse(formula);

    const results = data.map((row) => {
      const context: Record<string, number> = {};
      Object.entries(row).forEach(([key, value]) => {
        if (key !== "timestamp") {
          context[key] = value;
        }
      });

      return expr.evaluate(context);
    });

    return { isValid: true, result: results };
  } catch (error) {
    return {
      isValid: false,
      error:
        error instanceof Error ? error.message : "Error evaluating formula",
    };
  }
}

export function aggregateResults(
  results: number[],
  aggregationType: string
): number {
  if (results.length === 0) return 0;

  switch (aggregationType) {
    case "average":
      return results.reduce((sum, val) => sum + val, 0) / results.length;

    case "median": {
      const sorted = [...results].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    }

    case "sum":
      return results.reduce((sum, val) => sum + val, 0);

    case "integration": {
      let sum = 0;
      for (let i = 1; i < results.length; i++) {
        sum += (results[i] + results[i - 1]) / 2;
      }
      return sum;
    }

    case "min":
      return Math.min(...results);

    case "max":
      return Math.max(...results);

    default:
      return results.reduce((sum, val) => sum + val, 0) / results.length;
  }
}
