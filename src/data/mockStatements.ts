import type {
  BalanceSheet,
  IncomeStatement,
  CashFlowStatement,
  FinancialData,
} from '@/types/financial';

export const mockCompanyName = '蓝海智能装备有限公司';
export const mockCurrency = 'CNY';
export const mockUnit = '万元';

export const balanceSheet2023: BalanceSheet = {
  period: '2023年度',
  companyName: mockCompanyName,
  currency: mockCurrency,
  unit: mockUnit,

  cash: 8200,
  accountsReceivable: 12500,
  inventory: 9800,
  otherCurrentAssets: 3200,
  totalCurrentAssets: 33700,

  fixedAssetsNet: 28500,
  intangibleAssets: 6800,
  otherNonCurrentAssets: 4200,
  totalNonCurrentAssets: 39500,
  totalAssets: 73200,

  shortTermBorrowings: 8000,
  accountsPayable: 7200,
  otherCurrentLiabilities: 3500,
  totalCurrentLiabilities: 18700,

  longTermBorrowings: 12000,
  otherNonCurrentLiabilities: 2300,
  totalNonCurrentLiabilities: 14300,
  totalLiabilities: 33000,

  paidInCapital: 15000,
  retainedEarnings: 22500,
  otherEquity: 2700,
  totalEquity: 40200,
  totalLiabilitiesAndEquity: 73200,
};

export const balanceSheet2024: BalanceSheet = {
  period: '2024年度',
  companyName: mockCompanyName,
  currency: mockCurrency,
  unit: mockUnit,

  cash: 9800,
  accountsReceivable: 16800,
  inventory: 14200,
  otherCurrentAssets: 4100,
  totalCurrentAssets: 44900,

  fixedAssetsNet: 35600,
  intangibleAssets: 8500,
  otherNonCurrentAssets: 5600,
  totalNonCurrentAssets: 49700,
  totalAssets: 94600,

  shortTermBorrowings: 12000,
  accountsPayable: 10500,
  otherCurrentLiabilities: 5200,
  totalCurrentLiabilities: 27700,

  longTermBorrowings: 16000,
  otherNonCurrentLiabilities: 3200,
  totalNonCurrentLiabilities: 19200,
  totalLiabilities: 46900,

  paidInCapital: 18000,
  retainedEarnings: 25800,
  otherEquity: 3900,
  totalEquity: 47700,
  totalLiabilitiesAndEquity: 94600,
};

export const balanceSheet2025: BalanceSheet = {
  period: '2025年度',
  companyName: mockCompanyName,
  currency: mockCurrency,
  unit: mockUnit,

  cash: 7600,
  accountsReceivable: 26500,
  inventory: 22800,
  otherCurrentAssets: 5300,
  totalCurrentAssets: 62200,

  fixedAssetsNet: 41200,
  intangibleAssets: 10500,
  otherNonCurrentAssets: 6800,
  totalNonCurrentAssets: 58500,
  totalAssets: 120700,

  shortTermBorrowings: 22000,
  accountsPayable: 15800,
  otherCurrentLiabilities: 8200,
  totalCurrentLiabilities: 46000,

  longTermBorrowings: 23000,
  otherNonCurrentLiabilities: 4600,
  totalNonCurrentLiabilities: 27600,
  totalLiabilities: 73600,

  paidInCapital: 20000,
  retainedEarnings: 22100,
  otherEquity: 5000,
  totalEquity: 47100,
  totalLiabilitiesAndEquity: 120700,
};

export const incomeStatement2023: IncomeStatement = {
  period: '2023年度',
  companyName: mockCompanyName,
  currency: mockCurrency,
  unit: mockUnit,

  revenue: 58000,
  costOfRevenue: 36500,
  grossProfit: 21500,
  sellingExpenses: 4800,
  adminExpenses: 3200,
  financialExpenses: 1800,
  rndExpenses: 3500,
  operatingProfit: 8200,
  nonOperatingIncome: 520,
  nonOperatingExpenses: 320,
  totalProfit: 8400,
  incomeTaxExpense: 1680,
  netProfit: 6720,
  netProfitToParent: 6500,
};

export const incomeStatement2024: IncomeStatement = {
  period: '2024年度',
  companyName: mockCompanyName,
  currency: mockCurrency,
  unit: mockUnit,

  revenue: 82000,
  costOfRevenue: 50800,
  grossProfit: 31200,
  sellingExpenses: 6800,
  adminExpenses: 4600,
  financialExpenses: 2600,
  rndExpenses: 5200,
  operatingProfit: 12000,
  nonOperatingIncome: 680,
  nonOperatingExpenses: 480,
  totalProfit: 12200,
  incomeTaxExpense: 2440,
  netProfit: 9760,
  netProfitToParent: 9400,
};

export const incomeStatement2025: IncomeStatement = {
  period: '2025年度',
  companyName: mockCompanyName,
  currency: mockCurrency,
  unit: mockUnit,

  revenue: 98000,
  costOfRevenue: 64700,
  grossProfit: 33300,
  sellingExpenses: 9800,
  adminExpenses: 6500,
  financialExpenses: 5200,
  rndExpenses: 6800,
  operatingProfit: 5000,
  nonOperatingIncome: 820,
  nonOperatingExpenses: 1200,
  totalProfit: 4620,
  incomeTaxExpense: 924,
  netProfit: 3696,
  netProfitToParent: 3500,
};

export const cashFlowStatement2023: CashFlowStatement = {
  period: '2023年度',
  companyName: mockCompanyName,
  currency: mockCurrency,
  unit: mockUnit,

  operatingCashInflow: 62500,
  operatingCashOutflow: 54800,
  operatingNetCashFlow: 7700,

  investingCashInflow: 850,
  investingCashOutflow: 9200,
  investingNetCashFlow: -8350,

  financingCashInflow: 15800,
  financingCashOutflow: 6200,
  financingNetCashFlow: 9600,

  netIncreaseInCash: 8950,
  beginningCashBalance: 0,
  endingCashBalance: 8950,
};

export const cashFlowStatement2024: CashFlowStatement = {
  period: '2024年度',
  companyName: mockCompanyName,
  currency: mockCurrency,
  unit: mockUnit,

  operatingCashInflow: 86500,
  operatingCashOutflow: 77800,
  operatingNetCashFlow: 8700,

  investingCashInflow: 1250,
  investingCashOutflow: 14500,
  investingNetCashFlow: -13250,

  financingCashInflow: 18500,
  financingCashOutflow: 8800,
  financingNetCashFlow: 9700,

  netIncreaseInCash: 5150,
  beginningCashBalance: 8200,
  endingCashBalance: 13350,
};

export const cashFlowStatement2025: CashFlowStatement = {
  period: '2025年度',
  companyName: mockCompanyName,
  currency: mockCurrency,
  unit: mockUnit,

  operatingCashInflow: 88200,
  operatingCashOutflow: 91500,
  operatingNetCashFlow: -3300,

  investingCashInflow: 2100,
  investingCashOutflow: 12800,
  investingNetCashFlow: -10700,

  financingCashInflow: 28000,
  financingCashOutflow: 13400,
  financingNetCashFlow: 14600,

  netIncreaseInCash: 600,
  beginningCashBalance: 9800,
  endingCashBalance: 10400,
};

export const mockFinancialData: FinancialData = {
  balanceSheets: [balanceSheet2023, balanceSheet2024, balanceSheet2025],
  incomeStatements: [incomeStatement2023, incomeStatement2024, incomeStatement2025],
  cashFlowStatements: [cashFlowStatement2023, cashFlowStatement2024, cashFlowStatement2025],
};
