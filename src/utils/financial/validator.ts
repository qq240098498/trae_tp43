import type {
  BalanceSheet,
  IncomeStatement,
  CashFlowStatement,
  FinancialData,
  ValidationResult,
} from '@/types/financial';

export function validateBalanceSheet(bs: BalanceSheet): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const calcCurrentAssets =
    bs.cash +
    bs.accountsReceivable +
    bs.inventory +
    bs.otherCurrentAssets;
  if (Math.abs(calcCurrentAssets - bs.totalCurrentAssets) > 0.01) {
    errors.push(
      `[${bs.period}] 流动资产合计不匹配：计算值 ${calcCurrentAssets}，表内值 ${bs.totalCurrentAssets}`
    );
  }

  const calcNonCurrentAssets =
    bs.fixedAssetsNet +
    bs.intangibleAssets +
    bs.otherNonCurrentAssets;
  if (Math.abs(calcNonCurrentAssets - bs.totalNonCurrentAssets) > 0.01) {
    errors.push(
      `[${bs.period}] 非流动资产合计不匹配：计算值 ${calcNonCurrentAssets}，表内值 ${bs.totalNonCurrentAssets}`
    );
  }

  const calcTotalAssets = bs.totalCurrentAssets + bs.totalNonCurrentAssets;
  if (Math.abs(calcTotalAssets - bs.totalAssets) > 0.01) {
    errors.push(
      `[${bs.period}] 资产总计不匹配：流动资产+非流动资产=${calcTotalAssets}，表内值 ${bs.totalAssets}`
    );
  }

  const calcCurrentLiabilities =
    bs.shortTermBorrowings +
    bs.accountsPayable +
    bs.otherCurrentLiabilities;
  if (Math.abs(calcCurrentLiabilities - bs.totalCurrentLiabilities) > 0.01) {
    errors.push(
      `[${bs.period}] 流动负债合计不匹配`
    );
  }

  const calcNonCurrentLiabilities =
    bs.longTermBorrowings + bs.otherNonCurrentLiabilities;
  if (Math.abs(calcNonCurrentLiabilities - bs.totalNonCurrentLiabilities) > 0.01) {
    errors.push(
      `[${bs.period}] 非流动负债合计不匹配`
    );
  }

  const calcTotalLiabilities =
    bs.totalCurrentLiabilities + bs.totalNonCurrentLiabilities;
  if (Math.abs(calcTotalLiabilities - bs.totalLiabilities) > 0.01) {
    errors.push(
      `[${bs.period}] 负债总计不匹配`
    );
  }

  const calcEquity =
    bs.paidInCapital + bs.retainedEarnings + bs.otherEquity;
  if (Math.abs(calcEquity - bs.totalEquity) > 0.01) {
    errors.push(`[${bs.period}] 所有者权益合计不匹配`);
  }

  const calcLAndE = bs.totalLiabilities + bs.totalEquity;
  if (Math.abs(calcLAndE - bs.totalLiabilitiesAndEquity) > 0.01) {
    errors.push(`[${bs.period}] 负债与权益合计不匹配`);
  }

  if (Math.abs(bs.totalAssets - bs.totalLiabilitiesAndEquity) > 0.01) {
    errors.push(
      `[${bs.period}] 会计恒等式不平衡：资产 ${bs.totalAssets} ≠ 负债+权益 ${bs.totalLiabilitiesAndEquity}`
    );
  }

  if (bs.cash < 0) warnings.push(`[${bs.period}] 货币资金为负值`);
  if (bs.inventory < 0) warnings.push(`[${bs.period}] 存货为负值`);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateIncomeStatement(is: IncomeStatement): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const calcGross = is.revenue - is.costOfRevenue;
  if (Math.abs(calcGross - is.grossProfit) > 0.01) {
    errors.push(
      `[${is.period}] 毛利润不匹配：营收-成本=${calcGross}，表内值 ${is.grossProfit}`
    );
  }

  const calcOpProfit =
    is.grossProfit -
    is.sellingExpenses -
    is.adminExpenses -
    is.financialExpenses -
    is.rndExpenses;
  if (Math.abs(calcOpProfit - is.operatingProfit) > 0.01) {
    errors.push(`[${is.period}] 营业利润计算不匹配`);
  }

  const calcTotalProfit =
    is.operatingProfit + is.nonOperatingIncome - is.nonOperatingExpenses;
  if (Math.abs(calcTotalProfit - is.totalProfit) > 0.01) {
    errors.push(`[${is.period}] 利润总额计算不匹配`);
  }

  const calcNetProfit = is.totalProfit - is.incomeTaxExpense;
  if (Math.abs(calcNetProfit - is.netProfit) > 0.01) {
    errors.push(`[${is.period}] 净利润计算不匹配`);
  }

  if (is.revenue < 0) warnings.push(`[${is.period}] 营业收入为负`);
  if (is.netProfitToParent > is.netProfit) {
    warnings.push(`[${is.period}] 归母净利润大于净利润总额`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateCashFlowStatement(
  cf: CashFlowStatement
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const calcOpNet = cf.operatingCashInflow - cf.operatingCashOutflow;
  if (Math.abs(calcOpNet - cf.operatingNetCashFlow) > 0.01) {
    errors.push(`[${cf.period}] 经营活动净现金流计算不匹配`);
  }

  const calcInvNet = cf.investingCashInflow - cf.investingCashOutflow;
  if (Math.abs(calcInvNet - cf.investingNetCashFlow) > 0.01) {
    errors.push(`[${cf.period}] 投资活动净现金流计算不匹配`);
  }

  const calcFinNet = cf.financingCashInflow - cf.financingCashOutflow;
  if (Math.abs(calcFinNet - cf.financingNetCashFlow) > 0.01) {
    errors.push(`[${cf.period}] 筹资活动净现金流计算不匹配`);
  }

  const calcNetIncrease =
    cf.operatingNetCashFlow +
    cf.investingNetCashFlow +
    cf.financingNetCashFlow;
  if (Math.abs(calcNetIncrease - cf.netIncreaseInCash) > 0.01) {
    errors.push(`[${cf.period}] 现金净增加额与三活动合计不匹配`);
  }

  const calcEnding = cf.beginningCashBalance + cf.netIncreaseInCash;
  if (cf.beginningCashBalance > 0 && Math.abs(calcEnding - cf.endingCashBalance) > 0.01) {
    errors.push(`[${cf.period}] 期末现金余额=期初+净增加，不匹配`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateAllData(data: FinancialData): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  for (const bs of data.balanceSheets) {
    const r = validateBalanceSheet(bs);
    allErrors.push(...r.errors);
    allWarnings.push(...r.warnings);
  }

  for (const inc of data.incomeStatements) {
    const r = validateIncomeStatement(inc);
    allErrors.push(...r.errors);
    allWarnings.push(...r.warnings);
  }

  for (const cf of data.cashFlowStatements) {
    const r = validateCashFlowStatement(cf);
    allErrors.push(...r.errors);
    allWarnings.push(...r.warnings);
  }

  if (
    data.balanceSheets.length === 0 ||
    data.incomeStatements.length === 0 ||
    data.cashFlowStatements.length === 0
  ) {
    allErrors.push('三大报表数据不完整，请确保至少各有一期数据');
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}
