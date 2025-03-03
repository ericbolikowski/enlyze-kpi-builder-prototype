import { KPI } from "./types";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "kpi-store-data";

export class KpiStore {
  private kpis: KPI[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem(STORAGE_KEY);

      if (storedData) {
        try {
          this.kpis = JSON.parse(storedData);
          this.migrateKpis();
        } catch (e) {
          console.error("Failed to parse KPI data from localStorage:", e);
          this.initializeDefaultKpis();
        }
      } else {
        this.initializeDefaultKpis();
      }
    }
  }

  private initializeDefaultKpis() {
    this.kpis = [];

    this.saveToLocalStorage();
  }

  private saveToLocalStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.kpis));
    }
  }

  private migrateKpis() {
    let needsUpdate = false;

    this.kpis = this.kpis.map((kpi) => {
      const updatedKpi = { ...kpi };

      if (!updatedKpi.chartType) {
        updatedKpi.chartType = "line";
        needsUpdate = true;
      }

      return updatedKpi;
    });

    if (needsUpdate) {
      this.saveToLocalStorage();
    }
  }

  getAllKpis(): KPI[] {
    return [...this.kpis];
  }

  getKpiById(id: string): KPI | undefined {
    return this.kpis.find((kpi) => kpi.id === id);
  }

  createKpi(kpi: Omit<KPI, "id" | "createdAt" | "updatedAt">): KPI {
    const now = new Date().toISOString();
    const newKpi: KPI = {
      ...kpi,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    this.kpis.push(newKpi);
    this.saveToLocalStorage();
    return newKpi;
  }

  updateKpi(
    id: string,
    updates: Partial<Omit<KPI, "id" | "createdAt" | "updatedAt">>
  ): KPI | undefined {
    const index = this.kpis.findIndex((kpi) => kpi.id === id);
    if (index === -1) return undefined;

    const updatedKpi: KPI = {
      ...this.kpis[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.kpis[index] = updatedKpi;
    this.saveToLocalStorage();
    return updatedKpi;
  }

  deleteKpi(id: string): boolean {
    const initialLength = this.kpis.length;
    this.kpis = this.kpis.filter((kpi) => kpi.id !== id);
    const deleted = this.kpis.length < initialLength;
    if (deleted) {
      this.saveToLocalStorage();
    }
    return deleted;
  }

  clearAll(): void {
    this.kpis = [];
    this.saveToLocalStorage();
  }
}

export const kpiStore = new KpiStore();
