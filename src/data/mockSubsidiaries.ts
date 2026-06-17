import type { SubsidiaryFinancialData, IndustryCategory, CompanyScale } from '@/types/financial';
import type { BalanceSheet, IncomeStatement, CashFlowStatement } from '@/types/financial';
import { industryLabels, scaleLabels } from './mockPeerCompanies';
import { mockCurrency, mockUnit } from './mockStatements';
import { calculateAllRatios } from '@/utils/financial/calculator';

function buildBalanceSheet(
  period: string,
  companyName: string,
  data: Partial<BalanceSheet>
): BalanceSheet {
  return {
    period,
    companyName,
    currency: mockCurrency,
    unit: mockUnit,
    cash: 1000,
    accountsReceivable: 2000,
    inventory: 1500,
    otherCurrentAssets: 500,
    totalCurrentAssets: 5000,
    fixedAssetsNet: 4000,
    intangibleAssets: 1000,
    otherNonCurrentAssets: 500,
    totalNonCurrentAssets: 5500,
    totalAssets: 10500,
    shortTermBorrowings: 1500,
    accountsPayable: 1200,
    otherCurrentLiabilities: 800,
    totalCurrentLiabilities: 3500,
    longTermBorrowings: 2000,
    otherNonCurrentLiabilities: 500,
    totalNonCurrentLiabilities: 2500,
    totalLiabilities: 6000,
    paidInCapital: 2000,
    retainedEarnings: 2000,
    otherEquity: 500,
    totalEquity: 4500,
    totalLiabilitiesAndEquity: 10500,
    ...data,
  } as BalanceSheet;
}

function buildIncomeStatement(
  period: string,
  companyName: string,
  data: Partial<IncomeStatement>
): IncomeStatement {
  return {
    period,
    companyName,
    currency: mockCurrency,
    unit: mockUnit,
    revenue: 8000,
    costOfRevenue: 5000,
    grossProfit: 3000,
    sellingExpenses: 800,
    adminExpenses: 500,
    financialExpenses: 300,
    rndExpenses: 400,
    operatingProfit: 1000,
    nonOperatingIncome: 50,
    nonOperatingExpenses: 30,
    totalProfit: 1020,
    incomeTaxExpense: 204,
    netProfit: 816,
    netProfitToParent: 800,
    ...data,
  } as IncomeStatement;
}

function buildCashFlowStatement(
  period: string,
  companyName: string,
  data: Partial<CashFlowStatement>
): CashFlowStatement {
  return {
    period,
    companyName,
    currency: mockCurrency,
    unit: mockUnit,
    operatingCashInflow: 8500,
    operatingCashOutflow: 7800,
    operatingNetCashFlow: 700,
    investingCashInflow: 100,
    investingCashOutflow: 1200,
    investingNetCashFlow: -1100,
    financingCashInflow: 1500,
    financingCashOutflow: 600,
    financingNetCashFlow: 900,
    netIncreaseInCash: 500,
    beginningCashBalance: 500,
    endingCashBalance: 1000,
    ...data,
  } as CashFlowStatement;
}

function detectScale(revenue: number): { scale: CompanyScale; scaleLabel: string } {
  let scale: CompanyScale;
  if (revenue < 50000) {
    scale = 'small';
  } else if (revenue < 200000) {
    scale = 'medium';
  } else if (revenue < 1000000) {
    scale = 'large';
  } else {
    scale = 'xlarge';
  }
  return { scale, scaleLabel: scaleLabels[scale] };
}

function createSubsidiary(
  id: string,
  name: string,
  industry: IndustryCategory,
  description: string,
  financialData: {
    bs2023: Partial<BalanceSheet>;
    bs2024: Partial<BalanceSheet>;
    bs2025: Partial<BalanceSheet>;
    is2023: Partial<IncomeStatement>;
    is2024: Partial<IncomeStatement>;
    is2025: Partial<IncomeStatement>;
    cf2023: Partial<CashFlowStatement>;
    cf2024: Partial<CashFlowStatement>;
    cf2025: Partial<CashFlowStatement>;
  }
): SubsidiaryFinancialData {
  const revenue2025 = (financialData.is2025.revenue ?? 0);
  const { scale, scaleLabel } = detectScale(revenue2025);

  const data = {
    balanceSheets: [
      buildBalanceSheet('2023年度', name, financialData.bs2023),
      buildBalanceSheet('2024年度', name, financialData.bs2024),
      buildBalanceSheet('2025年度', name, financialData.bs2025),
    ],
    incomeStatements: [
      buildIncomeStatement('2023年度', name, financialData.is2023),
      buildIncomeStatement('2024年度', name, financialData.is2024),
      buildIncomeStatement('2025年度', name, financialData.is2025),
    ],
    cashFlowStatements: [
      buildCashFlowStatement('2023年度', name, financialData.cf2023),
      buildCashFlowStatement('2024年度', name, financialData.cf2024),
      buildCashFlowStatement('2025年度', name, financialData.cf2025),
    ],
  };

  const ratios = calculateAllRatios(data);

  return {
    id,
    name,
    industry,
    industryLabel: industryLabels[industry],
    scale,
    scaleLabel,
    description,
    data,
    ratios,
  };
}

export const mockSubsidiaries: SubsidiaryFinancialData[] = [
  createSubsidiary(
    'sub-eng',
    '工程机械事业部',
    'manufacturing',
    '核心业务板块，专注于挖掘机、起重机等工程机械设备的研发、生产与销售，是集团主要收入和利润来源。',
    {
      bs2023: {
        cash: 3200, accountsReceivable: 5200, inventory: 4100, otherCurrentAssets: 1300,
        totalCurrentAssets: 13800, fixedAssetsNet: 12500, intangibleAssets: 2800, otherNonCurrentAssets: 1800,
        totalNonCurrentAssets: 17100, totalAssets: 30900,
        shortTermBorrowings: 3500, accountsPayable: 3200, otherCurrentLiabilities: 1500, totalCurrentLiabilities: 8200,
        longTermBorrowings: 5200, otherNonCurrentLiabilities: 1000, totalNonCurrentLiabilities: 6200, totalLiabilities: 14400,
        paidInCapital: 6000, retainedEarnings: 8500, otherEquity: 2000, totalEquity: 16500, totalLiabilitiesAndEquity: 30900,
      },
      bs2024: {
        cash: 4200, accountsReceivable: 7200, inventory: 5800, otherCurrentAssets: 1800,
        totalCurrentAssets: 19000, fixedAssetsNet: 15200, intangibleAssets: 3500, otherNonCurrentAssets: 2400,
        totalNonCurrentAssets: 21100, totalAssets: 40100,
        shortTermBorrowings: 5200, accountsPayable: 4500, otherCurrentLiabilities: 2200, totalCurrentLiabilities: 11900,
        longTermBorrowings: 6800, otherNonCurrentLiabilities: 1400, totalNonCurrentLiabilities: 8200, totalLiabilities: 20100,
        paidInCapital: 7200, retainedEarnings: 10200, otherEquity: 2600, totalEquity: 20000, totalLiabilitiesAndEquity: 40100,
      },
      bs2025: {
        cash: 3500, accountsReceivable: 11500, inventory: 9500, otherCurrentAssets: 2300,
        totalCurrentAssets: 26800, fixedAssetsNet: 18200, intangibleAssets: 4500, otherNonCurrentAssets: 3000,
        totalNonCurrentAssets: 25700, totalAssets: 52500,
        shortTermBorrowings: 9500, accountsPayable: 6800, otherCurrentLiabilities: 3500, totalCurrentLiabilities: 19800,
        longTermBorrowings: 10000, otherNonCurrentLiabilities: 2000, totalNonCurrentLiabilities: 12000, totalLiabilities: 31800,
        paidInCapital: 8000, retainedEarnings: 9200, otherEquity: 3500, totalEquity: 20700, totalLiabilitiesAndEquity: 52500,
      },
      is2023: {
        revenue: 25000, costOfRevenue: 15800, grossProfit: 9200,
        sellingExpenses: 2100, adminExpenses: 1400, financialExpenses: 780, rndExpenses: 1500, operatingProfit: 3420,
        nonOperatingIncome: 220, nonOperatingExpenses: 140, totalProfit: 3500, incomeTaxExpense: 700, netProfit: 2800, netProfitToParent: 2700,
      },
      is2024: {
        revenue: 35000, costOfRevenue: 21800, grossProfit: 13200,
        sellingExpenses: 2900, adminExpenses: 2000, financialExpenses: 1120, rndExpenses: 2200, operatingProfit: 4980,
        nonOperatingIncome: 290, nonOperatingExpenses: 210, totalProfit: 5060, incomeTaxExpense: 1012, netProfit: 4048, netProfitToParent: 3900,
      },
      is2025: {
        revenue: 42000, costOfRevenue: 27800, grossProfit: 14200,
        sellingExpenses: 4200, adminExpenses: 2800, financialExpenses: 2250, rndExpenses: 2900, operatingProfit: 2050,
        nonOperatingIncome: 350, nonOperatingExpenses: 520, totalProfit: 1880, incomeTaxExpense: 376, netProfit: 1504, netProfitToParent: 1420,
      },
      cf2023: {
        operatingCashInflow: 26800, operatingCashOutflow: 23500, operatingNetCashFlow: 3300,
        investingCashInflow: 360, investingCashOutflow: 3900, investingNetCashFlow: -3540,
        financingCashInflow: 6800, financingCashOutflow: 2650, financingNetCashFlow: 4150,
        netIncreaseInCash: 3910, beginningCashBalance: 0, endingCashBalance: 3910,
      },
      cf2024: {
        operatingCashInflow: 37200, operatingCashOutflow: 33500, operatingNetCashFlow: 3700,
        investingCashInflow: 530, investingCashOutflow: 6200, investingNetCashFlow: -5670,
        financingCashInflow: 7900, financingCashOutflow: 3750, financingNetCashFlow: 4150,
        netIncreaseInCash: 2180, beginningCashBalance: 3200, endingCashBalance: 5380,
      },
      cf2025: {
        operatingCashInflow: 37800, operatingCashOutflow: 39200, operatingNetCashFlow: -1400,
        investingCashInflow: 900, investingCashOutflow: 5500, investingNetCashFlow: -4600,
        financingCashInflow: 12000, financingCashOutflow: 5750, financingNetCashFlow: 6250,
        netIncreaseInCash: 250, beginningCashBalance: 4200, endingCashBalance: 4450,
      },
    }
  ),

  createSubsidiary(
    'sub-storage',
    '智能仓储设备子公司',
    'manufacturing',
    '专注于自动化立体仓库、智能分拣系统等仓储物流设备的研发制造，是集团战略新兴业务板块，增长迅速。',
    {
      bs2023: {
        cash: 1500, accountsReceivable: 1800, inventory: 1200, otherCurrentAssets: 500,
        totalCurrentAssets: 5000, fixedAssetsNet: 2200, intangibleAssets: 800, otherNonCurrentAssets: 500,
        totalNonCurrentAssets: 3500, totalAssets: 8500,
        shortTermBorrowings: 1200, accountsPayable: 1000, otherCurrentLiabilities: 500, totalCurrentLiabilities: 2700,
        longTermBorrowings: 1500, otherNonCurrentLiabilities: 300, totalNonCurrentLiabilities: 1800, totalLiabilities: 4500,
        paidInCapital: 2000, retainedEarnings: 1500, otherEquity: 500, totalEquity: 4000, totalLiabilitiesAndEquity: 8500,
      },
      bs2024: {
        cash: 1800, accountsReceivable: 2600, inventory: 1800, otherCurrentAssets: 700,
        totalCurrentAssets: 6900, fixedAssetsNet: 3000, intangibleAssets: 1200, otherNonCurrentAssets: 700,
        totalNonCurrentAssets: 4900, totalAssets: 11800,
        shortTermBorrowings: 1800, accountsPayable: 1500, otherCurrentLiabilities: 700, totalCurrentLiabilities: 4000,
        longTermBorrowings: 2200, otherNonCurrentLiabilities: 400, totalNonCurrentLiabilities: 2600, totalLiabilities: 6600,
        paidInCapital: 2800, retainedEarnings: 1800, otherEquity: 600, totalEquity: 5200, totalLiabilitiesAndEquity: 11800,
      },
      bs2025: {
        cash: 1600, accountsReceivable: 3800, inventory: 2800, otherCurrentAssets: 1000,
        totalCurrentAssets: 9200, fixedAssetsNet: 4200, intangibleAssets: 1800, otherNonCurrentAssets: 1000,
        totalNonCurrentAssets: 7000, totalAssets: 16200,
        shortTermBorrowings: 3200, accountsPayable: 2200, otherCurrentLiabilities: 1200, totalCurrentLiabilities: 6600,
        longTermBorrowings: 3500, otherNonCurrentLiabilities: 600, totalNonCurrentLiabilities: 4100, totalLiabilities: 10700,
        paidInCapital: 3200, retainedEarnings: 1700, otherEquity: 600, totalEquity: 5500, totalLiabilitiesAndEquity: 16200,
      },
      is2023: {
        revenue: 8500, costOfRevenue: 5100, grossProfit: 3400,
        sellingExpenses: 720, adminExpenses: 450, financialExpenses: 210, rndExpenses: 680, operatingProfit: 1340,
        nonOperatingIncome: 80, nonOperatingExpenses: 50, totalProfit: 1370, incomeTaxExpense: 274, netProfit: 1096, netProfitToParent: 1050,
      },
      is2024: {
        revenue: 13200, costOfRevenue: 7800, grossProfit: 5400,
        sellingExpenses: 1100, adminExpenses: 700, financialExpenses: 310, rndExpenses: 1050, operatingProfit: 2240,
        nonOperatingIncome: 120, nonOperatingExpenses: 80, totalProfit: 2280, incomeTaxExpense: 456, netProfit: 1824, netProfitToParent: 1750,
      },
      is2025: {
        revenue: 18500, costOfRevenue: 10800, grossProfit: 7700,
        sellingExpenses: 1650, adminExpenses: 1050, financialExpenses: 450, rndExpenses: 1480, operatingProfit: 3070,
        nonOperatingIncome: 150, nonOperatingExpenses: 180, totalProfit: 3040, incomeTaxExpense: 608, netProfit: 2432, netProfitToParent: 2350,
      },
      cf2023: {
        operatingCashInflow: 9200, operatingCashOutflow: 8100, operatingNetCashFlow: 1100,
        investingCashInflow: 150, investingCashOutflow: 1500, investingNetCashFlow: -1350,
        financingCashInflow: 2700, financingCashOutflow: 1050, financingNetCashFlow: 1650,
        netIncreaseInCash: 1400, beginningCashBalance: 0, endingCashBalance: 1400,
      },
      cf2024: {
        operatingCashInflow: 14200, operatingCashOutflow: 12600, operatingNetCashFlow: 1600,
        investingCashInflow: 220, investingCashOutflow: 2200, investingNetCashFlow: -1980,
        financingCashInflow: 3200, financingCashOutflow: 1500, financingNetCashFlow: 1700,
        netIncreaseInCash: 1320, beginningCashBalance: 1500, endingCashBalance: 2820,
      },
      cf2025: {
        operatingCashInflow: 19800, operatingCashOutflow: 18200, operatingNetCashFlow: 1600,
        investingCashInflow: 350, investingCashOutflow: 3200, investingNetCashFlow: -2850,
        financingCashInflow: 4200, financingCashOutflow: 2100, financingNetCashFlow: 2100,
        netIncreaseInCash: 850, beginningCashBalance: 1800, endingCashBalance: 2650,
      },
    }
  ),

  createSubsidiary(
    'sub-parts',
    '精密零部件制造子公司',
    'manufacturing',
    '为集团内部配套为主，同时对外销售高端液压件、传动部件等精密零部件，是产业链垂直整合的重要环节。',
    {
      bs2023: {
        cash: 1200, accountsReceivable: 2100, inventory: 1600, otherCurrentAssets: 600,
        totalCurrentAssets: 5500, fixedAssetsNet: 3800, intangibleAssets: 1200, otherNonCurrentAssets: 600,
        totalNonCurrentAssets: 5600, totalAssets: 11100,
        shortTermBorrowings: 1300, accountsPayable: 1100, otherCurrentLiabilities: 600, totalCurrentLiabilities: 3000,
        longTermBorrowings: 1800, otherNonCurrentLiabilities: 400, totalNonCurrentLiabilities: 2200, totalLiabilities: 5200,
        paidInCapital: 2500, retainedEarnings: 2800, otherEquity: 600, totalEquity: 5900, totalLiabilitiesAndEquity: 11100,
      },
      bs2024: {
        cash: 1400, accountsReceivable: 2800, inventory: 2100, otherCurrentAssets: 800,
        totalCurrentAssets: 7100, fixedAssetsNet: 4500, intangibleAssets: 1500, otherNonCurrentAssets: 800,
        totalNonCurrentAssets: 6800, totalAssets: 13900,
        shortTermBorrowings: 1800, accountsPayable: 1500, otherCurrentLiabilities: 800, totalCurrentLiabilities: 4100,
        longTermBorrowings: 2200, otherNonCurrentLiabilities: 500, totalNonCurrentLiabilities: 2700, totalLiabilities: 6800,
        paidInCapital: 3000, retainedEarnings: 3300, otherEquity: 800, totalEquity: 7100, totalLiabilitiesAndEquity: 13900,
      },
      bs2025: {
        cash: 1200, accountsReceivable: 4200, inventory: 3200, otherCurrentAssets: 1000,
        totalCurrentAssets: 9600, fixedAssetsNet: 5500, intangibleAssets: 1800, otherNonCurrentAssets: 1000,
        totalNonCurrentAssets: 8300, totalAssets: 17900,
        shortTermBorrowings: 3500, accountsPayable: 2200, otherCurrentLiabilities: 1200, totalCurrentLiabilities: 6900,
        longTermBorrowings: 3200, otherNonCurrentLiabilities: 600, totalNonCurrentLiabilities: 3800, totalLiabilities: 10700,
        paidInCapital: 3500, retainedEarnings: 2800, otherEquity: 900, totalEquity: 7200, totalLiabilitiesAndEquity: 17900,
      },
      is2023: {
        revenue: 9800, costOfRevenue: 6100, grossProfit: 3700,
        sellingExpenses: 650, adminExpenses: 520, financialExpenses: 280, rndExpenses: 650, operatingProfit: 1600,
        nonOperatingIncome: 100, nonOperatingExpenses: 60, totalProfit: 1640, incomeTaxExpense: 328, netProfit: 1312, netProfitToParent: 1280,
      },
      is2024: {
        revenue: 14500, costOfRevenue: 8800, grossProfit: 5700,
        sellingExpenses: 950, adminExpenses: 720, financialExpenses: 380, rndExpenses: 950, operatingProfit: 2700,
        nonOperatingIncome: 140, nonOperatingExpenses: 90, totalProfit: 2750, incomeTaxExpense: 550, netProfit: 2200, netProfitToParent: 2150,
      },
      is2025: {
        revenue: 19200, costOfRevenue: 11800, grossProfit: 7400,
        sellingExpenses: 1350, adminExpenses: 1050, financialExpenses: 580, rndExpenses: 1350, operatingProfit: 3070,
        nonOperatingIncome: 170, nonOperatingExpenses: 250, totalProfit: 2990, incomeTaxExpense: 598, netProfit: 2392, netProfitToParent: 2320,
      },
      cf2023: {
        operatingCashInflow: 10500, operatingCashOutflow: 9200, operatingNetCashFlow: 1300,
        investingCashInflow: 180, investingCashOutflow: 1800, investingNetCashFlow: -1620,
        financingCashInflow: 2400, financingCashOutflow: 1080, financingNetCashFlow: 1320,
        netIncreaseInCash: 1000, beginningCashBalance: 0, endingCashBalance: 1000,
      },
      cf2024: {
        operatingCashInflow: 15600, operatingCashOutflow: 13600, operatingNetCashFlow: 2000,
        investingCashInflow: 260, investingCashOutflow: 2500, investingNetCashFlow: -2240,
        financingCashInflow: 3100, financingCashOutflow: 1560, financingNetCashFlow: 1540,
        netIncreaseInCash: 1300, beginningCashBalance: 1200, endingCashBalance: 2500,
      },
      cf2025: {
        operatingCashInflow: 20500, operatingCashOutflow: 19600, operatingNetCashFlow: 900,
        investingCashInflow: 420, investingCashOutflow: 3400, investingNetCashFlow: -2980,
        financingCashInflow: 4200, financingCashOutflow: 2340, financingNetCashFlow: 1860,
        netIncreaseInCash: -220, beginningCashBalance: 1400, endingCashBalance: 1180,
      },
    }
  ),

  createSubsidiary(
    'sub-finance',
    '融资租赁子公司',
    'finance',
    '为集团客户提供设备融资租赁、分期付款等金融服务，支持主业销售，同时开展第三方金融业务。',
    {
      bs2023: {
        cash: 8200, accountsReceivable: 12800, inventory: 0, otherCurrentAssets: 2000,
        totalCurrentAssets: 23000, fixedAssetsNet: 800, intangibleAssets: 200, otherNonCurrentAssets: 15000,
        totalNonCurrentAssets: 16000, totalAssets: 39000,
        shortTermBorrowings: 8000, accountsPayable: 500, otherCurrentLiabilities: 1500, totalCurrentLiabilities: 10000,
        longTermBorrowings: 18000, otherNonCurrentLiabilities: 2000, totalNonCurrentLiabilities: 20000, totalLiabilities: 30000,
        paidInCapital: 5000, retainedEarnings: 3000, otherEquity: 1000, totalEquity: 9000, totalLiabilitiesAndEquity: 39000,
      },
      bs2024: {
        cash: 9500, accountsReceivable: 18500, inventory: 0, otherCurrentAssets: 2800,
        totalCurrentAssets: 30800, fixedAssetsNet: 1000, intangibleAssets: 300, otherNonCurrentAssets: 22000,
        totalNonCurrentAssets: 23300, totalAssets: 54100,
        shortTermBorrowings: 12000, accountsPayable: 700, otherCurrentLiabilities: 2200, totalCurrentLiabilities: 14900,
        longTermBorrowings: 25000, otherNonCurrentLiabilities: 2800, totalNonCurrentLiabilities: 27800, totalLiabilities: 42700,
        paidInCapital: 6000, retainedEarnings: 4200, otherEquity: 1200, totalEquity: 11400, totalLiabilitiesAndEquity: 54100,
      },
      bs2025: {
        cash: 7800, accountsReceivable: 25000, inventory: 0, otherCurrentAssets: 3500,
        totalCurrentAssets: 36300, fixedAssetsNet: 1200, intangibleAssets: 400, otherNonCurrentAssets: 30000,
        totalNonCurrentAssets: 31600, totalAssets: 67900,
        shortTermBorrowings: 18000, accountsPayable: 900, otherCurrentLiabilities: 3000, totalCurrentLiabilities: 21900,
        longTermBorrowings: 32000, otherNonCurrentLiabilities: 3500, totalNonCurrentLiabilities: 35500, totalLiabilities: 57400,
        paidInCapital: 6500, retainedEarnings: 2800, otherEquity: 1200, totalEquity: 10500, totalLiabilitiesAndEquity: 67900,
      },
      is2023: {
        revenue: 4800, costOfRevenue: 800, grossProfit: 4000,
        sellingExpenses: 350, adminExpenses: 450, financialExpenses: 1800, rndExpenses: 50, operatingProfit: 1350,
        nonOperatingIncome: 120, nonOperatingExpenses: 40, totalProfit: 1430, incomeTaxExpense: 286, netProfit: 1144, netProfitToParent: 1100,
      },
      is2024: {
        revenue: 6800, costOfRevenue: 1200, grossProfit: 5600,
        sellingExpenses: 480, adminExpenses: 620, financialExpenses: 2600, rndExpenses: 80, operatingProfit: 1820,
        nonOperatingIncome: 180, nonOperatingExpenses: 60, totalProfit: 1940, incomeTaxExpense: 388, netProfit: 1552, netProfitToParent: 1500,
      },
      is2025: {
        revenue: 8800, costOfRevenue: 1500, grossProfit: 7300,
        sellingExpenses: 620, adminExpenses: 800, financialExpenses: 3800, rndExpenses: 100, operatingProfit: 1980,
        nonOperatingIncome: 150, nonOperatingExpenses: 250, totalProfit: 1880, incomeTaxExpense: 376, netProfit: 1504, netProfitToParent: 1450,
      },
      cf2023: {
        operatingCashInflow: 5200, operatingCashOutflow: 18500, operatingNetCashFlow: -13300,
        investingCashInflow: 18500, investingCashOutflow: 800, investingNetCashFlow: 17700,
        financingCashInflow: 15000, financingCashOutflow: 4500, financingNetCashFlow: 10500,
        netIncreaseInCash: 14900, beginningCashBalance: 0, endingCashBalance: 14900,
      },
      cf2024: {
        operatingCashInflow: 7400, operatingCashOutflow: 24500, operatingNetCashFlow: -17100,
        investingCashInflow: 25800, investingCashOutflow: 1200, investingNetCashFlow: 24600,
        financingCashInflow: 20000, financingCashOutflow: 6500, financingNetCashFlow: 13500,
        netIncreaseInCash: 21000, beginningCashBalance: 8200, endingCashBalance: 29200,
      },
      cf2025: {
        operatingCashInflow: 9500, operatingCashOutflow: 32000, operatingNetCashFlow: -22500,
        investingCashInflow: 33500, investingCashOutflow: 1600, investingNetCashFlow: 31900,
        financingCashInflow: 26000, financingCashOutflow: 9200, financingNetCashFlow: 16800,
        netIncreaseInCash: 26200, beginningCashBalance: 9500, endingCashBalance: 35700,
      },
    }
  ),

  createSubsidiary(
    'sub-trade',
    '国际贸易子公司',
    'retail',
    '负责集团产品的海外销售与国际采购，开展进出口贸易业务，开拓"一带一路"沿线市场。',
    {
      bs2023: {
        cash: 1800, accountsReceivable: 2500, inventory: 2200, otherCurrentAssets: 800,
        totalCurrentAssets: 7300, fixedAssetsNet: 1200, intangibleAssets: 500, otherNonCurrentAssets: 600,
        totalNonCurrentAssets: 2300, totalAssets: 9600,
        shortTermBorrowings: 2000, accountsPayable: 2200, otherCurrentLiabilities: 800, totalCurrentLiabilities: 5000,
        longTermBorrowings: 1500, otherNonCurrentLiabilities: 300, totalNonCurrentLiabilities: 1800, totalLiabilities: 6800,
        paidInCapital: 1500, retainedEarnings: 1000, otherEquity: 300, totalEquity: 2800, totalLiabilitiesAndEquity: 9600,
      },
      bs2024: {
        cash: 2400, accountsReceivable: 3800, inventory: 3200, otherCurrentAssets: 1100,
        totalCurrentAssets: 10500, fixedAssetsNet: 1500, intangibleAssets: 700, otherNonCurrentAssets: 800,
        totalNonCurrentAssets: 3000, totalAssets: 13500,
        shortTermBorrowings: 3000, accountsPayable: 3200, otherCurrentLiabilities: 1200, totalCurrentLiabilities: 7400,
        longTermBorrowings: 2200, otherNonCurrentLiabilities: 400, totalNonCurrentLiabilities: 2600, totalLiabilities: 10000,
        paidInCapital: 1800, retainedEarnings: 1300, otherEquity: 400, totalEquity: 3500, totalLiabilitiesAndEquity: 13500,
      },
      bs2025: {
        cash: 1500, accountsReceivable: 5200, inventory: 4500, otherCurrentAssets: 1500,
        totalCurrentAssets: 12700, fixedAssetsNet: 1800, intangibleAssets: 900, otherNonCurrentAssets: 1000,
        totalNonCurrentAssets: 3700, totalAssets: 16400,
        shortTermBorrowings: 4500, accountsPayable: 4200, otherCurrentLiabilities: 1700, totalCurrentLiabilities: 10400,
        longTermBorrowings: 2800, otherNonCurrentLiabilities: 500, totalNonCurrentLiabilities: 3300, totalLiabilities: 13700,
        paidInCapital: 2000, retainedEarnings: 400, otherEquity: 300, totalEquity: 2700, totalLiabilitiesAndEquity: 16400,
      },
      is2023: {
        revenue: 9900, costOfRevenue: 8500, grossProfit: 1400,
        sellingExpenses: 980, adminExpenses: 380, financialExpenses: 530, rndExpenses: 120, operatingProfit: -610,
        nonOperatingIncome: 30, nonOperatingExpenses: 20, totalProfit: -600, incomeTaxExpense: 0, netProfit: -600, netProfitToParent: -580,
      },
      is2024: {
        revenue: 12500, costOfRevenue: 10600, grossProfit: 1900,
        sellingExpenses: 1370, adminExpenses: 560, financialExpenses: 790, rndExpenses: 150, operatingProfit: -970,
        nonOperatingIncome: 50, nonOperatingExpenses: 30, totalProfit: -950, incomeTaxExpense: 0, netProfit: -950, netProfitToParent: -920,
      },
      is2025: {
        revenue: 9500, costOfRevenue: 8500, grossProfit: 1000,
        sellingExpenses: 1980, adminExpenses: 800, financialExpenses: 1120, rndExpenses: 170, operatingProfit: -3070,
        nonOperatingIncome: 100, nonOperatingExpenses: 200, totalProfit: -3170, incomeTaxExpense: 0, netProfit: -3170, netProfitToParent: -3000,
      },
      cf2023: {
        operatingCashInflow: 10700, operatingCashOutflow: 10200, operatingNetCashFlow: 500,
        investingCashInflow: 40, investingCashOutflow: 400, investingNetCashFlow: -360,
        financingCashInflow: 2500, financingCashOutflow: 840, financingNetCashFlow: 1660,
        netIncreaseInCash: 1800, beginningCashBalance: 0, endingCashBalance: 1800,
      },
      cf2024: {
        operatingCashInflow: 13400, operatingCashOutflow: 13100, operatingNetCashFlow: 300,
        investingCashInflow: 60, investingCashOutflow: 550, investingNetCashFlow: -490,
        financingCashInflow: 3200, financingCashOutflow: 1470, financingNetCashFlow: 1730,
        netIncreaseInCash: 1540, beginningCashBalance: 1800, endingCashBalance: 3340,
      },
      cf2025: {
        operatingCashInflow: 10200, operatingCashOutflow: 12200, operatingNetCashFlow: -2000,
        investingCashInflow: 80, investingCashOutflow: 700, investingNetCashFlow: -620,
        financingCashInflow: 3800, financingCashOutflow: 2080, financingNetCashFlow: 1720,
        netIncreaseInCash: -900, beginningCashBalance: 2400, endingCashBalance: 1500,
      },
    }
  ),
];

export function getSubsidiaryById(id: string): SubsidiaryFinancialData | undefined {
  return mockSubsidiaries.find((s) => s.id === id);
}

export function recalculateSubsidiaryRatios(subsidiary: SubsidiaryFinancialData): SubsidiaryFinancialData {
  return {
    ...subsidiary,
    ratios: calculateAllRatios(subsidiary.data),
  };
}
