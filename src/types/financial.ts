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
