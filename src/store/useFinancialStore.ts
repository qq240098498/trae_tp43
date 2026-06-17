import { create } from 'zustand';
import type {
  FinancialData,
  FinancialRatio,
  AnomalyRecord,
  ValidationResult,
  HealthScore,
  SubsidiaryFinancialData,
} from '@/types/financial';
import { mockFinancialData } from '@/data/mockStatements';
import { mockSubsidiaries, recalculateSubsidiaryRatios } from '@/data/mockSubsidiaries';
import { calculateAllRatios } from '@/utils/financial/calculator';
import { detectAllAnomalies } from '@/utils/financial/anomaly';
import { validateAllData } from '@/utils/financial/validator';
import { calculateHealthScore } from '@/utils/interpreter/reportGenerator';

interface FinancialState {
  data: FinancialData;
  ratios: FinancialRatio[];
  anomalies: AnomalyRecord[];
  validation: ValidationResult;
  healthScore: HealthScore | null;
  selectedPeriodIndex: number;
  sourcePanelOpen: boolean;
  sourcePanelContent: {
    title: string;
    steps: string[];
    formula: string;
    numerator?: { label: string; value: number; source: string };
    denominator?: { label: string; value: number; source: string };
  } | null;
  subsidiaries: SubsidiaryFinancialData[];
  selectedSubsidiaryId: string | null;

  recalculateAll: () => void;
  setData: (data: FinancialData) => void;
  setSelectedPeriodIndex: (index: number) => void;
  openSourcePanel: (
    content: FinancialState['sourcePanelContent']
  ) => void;
  closeSourcePanel: () => void;
  importFromJSON: (json: string) => boolean;
  exportToJSON: () => string;
  resetToMock: () => void;
  setSelectedSubsidiaryId: (id: string | null) => void;
  updateSubsidiaryData: (id: string, data: FinancialData) => void;
}

const STORAGE_KEY = 'financial-analyzer-data-v1';

function loadInitialData(): FinancialData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FinancialData;
      if (
        parsed.balanceSheets &&
        parsed.incomeStatements &&
        parsed.cashFlowStatements &&
        parsed.balanceSheets.length > 0
      ) {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  return {
    balanceSheets: mockFinancialData.balanceSheets.map((bs) => ({ ...bs })),
    incomeStatements: mockFinancialData.incomeStatements.map((is) => ({ ...is })),
    cashFlowStatements: mockFinancialData.cashFlowStatements.map((cf) => ({ ...cf })),
  };
}

export const useFinancialStore = create<FinancialState>((set, get) => {
  const initialData = loadInitialData();
  const initialValidation = validateAllData(initialData);
  const initialRatios = calculateAllRatios(initialData);
  const initialAnomalies = detectAllAnomalies(initialData, initialRatios);
  const initialScore = calculateHealthScore(initialRatios);
  const initialSubsidiaries = mockSubsidiaries.map((s) => ({ ...s }));

  return {
    data: initialData,
    ratios: initialRatios,
    anomalies: initialAnomalies,
    validation: initialValidation,
    healthScore: initialScore,
    selectedPeriodIndex: 0,
    sourcePanelOpen: false,
    sourcePanelContent: null,
    subsidiaries: initialSubsidiaries,
    selectedSubsidiaryId: null,

    recalculateAll: () => {
      const data = get().data;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        /* ignore */
      }
      const validation = validateAllData(data);
      const ratios = calculateAllRatios(data);
      const anomalies = detectAllAnomalies(data, ratios);
      const healthScore = calculateHealthScore(ratios);
      set({ validation, ratios, anomalies, healthScore });
    },

    setData: (data) => {
      const maxIndex = Math.max(0, data.balanceSheets.length - 1);
      const safeIndex = Math.min(get().selectedPeriodIndex, maxIndex);
      set({ data, selectedPeriodIndex: safeIndex });
      get().recalculateAll();
    },

    setSelectedPeriodIndex: (index) => set({ selectedPeriodIndex: index }),

    openSourcePanel: (content) => set({ sourcePanelOpen: true, sourcePanelContent: content }),

    closeSourcePanel: () => set({ sourcePanelOpen: false, sourcePanelContent: null }),

    importFromJSON: (json) => {
      try {
        const parsed = JSON.parse(json) as FinancialData;
        if (
          parsed.balanceSheets &&
          parsed.incomeStatements &&
          parsed.cashFlowStatements
        ) {
          get().setData(parsed);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },

    exportToJSON: () => JSON.stringify(get().data, null, 2),

    resetToMock: () => {
      const freshData: FinancialData = {
        balanceSheets: mockFinancialData.balanceSheets.map((bs) => ({ ...bs })),
        incomeStatements: mockFinancialData.incomeStatements.map((is) => ({ ...is })),
        cashFlowStatements: mockFinancialData.cashFlowStatements.map((cf) => ({ ...cf })),
      };
      const validation = validateAllData(freshData);
      const ratios = calculateAllRatios(freshData);
      const anomalies = detectAllAnomalies(freshData, ratios);
      const healthScore = calculateHealthScore(ratios);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
      } catch {
        /* ignore */
      }
      set({
        data: freshData,
        validation,
        ratios,
        anomalies,
        healthScore,
        selectedPeriodIndex: 0,
        sourcePanelOpen: false,
        sourcePanelContent: null,
        subsidiaries: mockSubsidiaries.map((s) => ({ ...s })),
        selectedSubsidiaryId: null,
      });
    },

    setSelectedSubsidiaryId: (id) => set({ selectedSubsidiaryId: id }),

    updateSubsidiaryData: (id, data) => {
      set((state) => ({
        subsidiaries: state.subsidiaries.map((sub) => {
          if (sub.id !== id) return sub;
          const updated = { ...sub, data };
          return recalculateSubsidiaryRatios(updated);
        }),
      }));
    },
  };
});
