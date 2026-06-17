export interface FinancialStatement {
  period: string;
  companyName: string;
  currency: string;
  unit: string;
}

export interface BalanceSheet extends FinancialStatement {
  cash: number;
  accountsReceivable: number;
  inventory: number;
  otherCurrentAssets: number;
  totalCurrentAssets: number;
  fixedAssetsNet: number;
  intangibleAssets: number;
  otherNonCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalAssets: number;

  shortTermBorrowings: number;
  accountsPayable: number;
  otherCurrentLiabilities: number;
  totalCurrentLiabilities: number;
  longTermBorrowings: number;
  otherNonCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  totalLiabilities: number;

  paidInCapital: number;
  retainedEarnings: number;
  otherEquity: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
}

export interface IncomeStatement extends FinancialStatement {
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  sellingExpenses: number;
  adminExpenses: number;
  financialExpenses: number;
  rndExpenses: number;
  operatingProfit: number;
  nonOperatingIncome: number;
  nonOperatingExpenses: number;
  totalProfit: number;
  incomeTaxExpense: number;
  netProfit: number;
  netProfitToParent: number;
}

export interface CashFlowStatement extends FinancialStatement {
  operatingCashInflow: number;
  operatingCashOutflow: number;
  operatingNetCashFlow: number;

  investingCashInflow: number;
  investingCashOutflow: number;
  investingNetCashFlow: number;

  financingCashInflow: number;
  financingCashOutflow: number;
  financingNetCashFlow: number;

  netIncreaseInCash: number;
  beginningCashBalance: number;
  endingCashBalance: number;
}

export type RatioCategory =
  | 'solvency'
  | 'profitability'
  | 'efficiency'
  | 'growth';

export interface RatioBenchmark {
  good: number;
  warning: number;
  danger: number;
  higherIsBetter: boolean;
}

export interface CalculationTrace {
  numerator: { label: string; value: number; source: string };
  denominator: { label: string; value: number; source: string };
  steps: string[];
}

export type InterpretationLevel =
  | 'excellent'
  | 'good'
  | 'normal'
  | 'warning'
  | 'danger';

export interface Interpretation {
  level: InterpretationLevel;
  summary: string;
  detail: string;
  analogy: string;
}

export interface FinancialRatio {
  id: string;
  name: string;
  category: RatioCategory;
  value: number | null;
  previousValue: number | null;
  unit: string;
  benchmark: RatioBenchmark | null;
  formula: string;
  calculation: CalculationTrace | null;
  interpretation: Interpretation;
}

export type AnomalySeverity = 'critical' | 'warning' | 'notice';
export type StatementType = 'balance' | 'income' | 'cashflow' | 'ratio';

export interface AnomalyRecord {
  id: string;
  indicatorName: string;
  statementType: StatementType;
  fieldKey: string;
  currentPeriod: string;
  previousPeriod: string;
  currentValue: number;
  previousValue: number;
  changeAmount: number;
  changeRate: number;
  severity: AnomalySeverity;
  threshold: number;
  possibleReasons: string[];
  sourceTrace: string;
  historicalMean?: number;
  historicalStdDev?: number;
  deviationFromMean?: number;
  deviationType?: 'above' | 'below';
  sampleCount?: number;
  anomalyType?: 'period-over-period' | 'mean-deviation' | 'threshold';
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FinancialData {
  balanceSheets: BalanceSheet[];
  incomeStatements: IncomeStatement[];
  cashFlowStatements: CashFlowStatement[];
}

export interface HealthScore {
  total: number;
  solvency: number;
  profitability: number;
  efficiency: number;
  growth: number;
  level: InterpretationLevel;
}

export interface SubsidiaryFinancialData {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  order: number;
  industry: IndustryCategory;
  industryLabel: string;
  scale: CompanyScale;
  scaleLabel: string;
  description: string;
  data: FinancialData;
  ratios: FinancialRatio[];
  groupContribution?: {
    revenueRatio: number;
    profitRatio: number;
    assetRatio: number;
  };
}

export interface GroupCompanyStructure {
  parent: {
    id: string;
    name: string;
  };
  subsidiaries: SubsidiaryFinancialData[];
}

export interface SubsidiaryPeerAnalysis {
  subsidiaryId: string;
  subsidiaryName: string;
  parentId: string | null;
  level: number;
  summary: PeerAnalysisSummary;
  groupContribution?: {
    revenueRatio: number;
    profitRatio: number;
    assetRatio: number;
  };
}

export type IndustryCategory =
  | 'manufacturing'
  | 'retail'
  | 'technology'
  | 'services'
  | 'realestate'
  | 'finance';

export type CompanyScale = 'small' | 'medium' | 'large' | 'xlarge';

export interface IndustryInfo {
  industry: IndustryCategory;
  industryLabel: string;
  scale: CompanyScale;
  scaleLabel: string;
}

export interface PeerCompany {
  id: string;
  name: string;
  stockCode: string;
  industry: IndustryCategory;
  scale: CompanyScale;
  revenue: number;
  totalAssets: number;
  ratios: Record<string, number>;
}

export type PercentileLevel = 'top10' | 'top25' | 'top50' | 'bottom50' | 'bottom25';

export interface PeerBenchmarkResult {
  ratioId: string;
  ratioName: string;
  ratioUnit: string;
  companyValue: number | null;
  industryMin: number;
  industryMax: number;
  industryMean: number;
  industryMedian: number;
  industryP25: number;
  industryP75: number;
  percentile: number;
  percentileLevel: PercentileLevel;
  percentileText: string;
  higherIsBetter: boolean;
  sampleCount: number;
  topPeers: { name: string; value: number }[];
  bottomPeers: { name: string; value: number }[];
}

export type ChartType = 'line' | 'bar' | 'pie' | 'waterfall' | 'column' | 'area';

export type AnalysisCategory = 'trend' | 'structure' | 'comparison' | 'composition' | 'distribution';

export interface ChartAxisConfig {
  xAxisLabel: string;
  yAxisLabel: string;
  dataLabel: string;
  unit: string;
}

export interface ChartRecommendation {
  chartType: ChartType;
  chartTypeName: string;
  chartTitle: string;
  chartSubtitle?: string;
  purpose: string;
  axisConfig: ChartAxisConfig;
  dataSeries: {
    name: string;
    description: string;
  }[];
  designTips: string[];
  suitableForReport: boolean;
}

export interface VisualizationAdvice {
  id: string;
  category: AnalysisCategory;
  categoryLabel: string;
  conclusion: string;
  recommendations: ChartRecommendation[];
  priority: 'high' | 'medium' | 'low';
}

export interface PeerAnalysisSummary {
  industryInfo: IndustryInfo;
  totalPeers: number;
  topTierCount: number;
  midTierCount: number;
  bottomTierCount: number;
  benchmarks: PeerBenchmarkResult[];
}
