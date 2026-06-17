import type {
  FinancialRatio,
  CalculationTrace,
  FinancialData,
} from '@/types/financial';
import { avg, safeDiv, changeRate } from '../format';
import { interpretRatio } from '../interpreter/ratioInterpreter';

type StatementPair<T> = { current: T; previous: T | null };

export function getLatestPair<T extends { period: string }>(list: T[]): StatementPair<T> {
  const sorted = [...list].sort((a, b) => (a.period < b.period ? 1 : -1));
  return {
    current: sorted[0],
    previous: sorted[1] ?? null,
  };
}

function BS(label: string, period: string, field: string) {
  return `资产负债表[${period}]·${label}(${field})`;
}
function IS(label: string, period: string, field: string) {
  return `利润表[${period}]·${label}(${field})`;
}
function _CF(label: string, period: string, field: string) {
  return `现金流量表[${period}]·${label}(${field})`;
}
void _CF;

function buildTrace(
  formula: string,
  numLabel: string,
  numValue: number,
  numSource: string,
  denLabel: string,
  denValue: number,
  denSource: string,
  result: number | null,
  unit: string
): CalculationTrace {
  const steps: string[] = [];
  steps.push(`公式：${formula}`);
  steps.push(`分子（${numLabel}）= ${numValue.toLocaleString('zh-CN')}  [来源：${numSource}]`);
  steps.push(`分母（${denLabel}）= ${denValue.toLocaleString('zh-CN')}  [来源：${denSource}]`);
  steps.push(`代入：${numValue.toLocaleString('zh-CN')} ÷ ${denValue.toLocaleString('zh-CN')}`);
  if (result !== null) {
    if (unit === '%') {
      steps.push(`结果：${result.toFixed(4)} = ${(result * 100).toFixed(2)}%`);
    } else if (unit === '天') {
      steps.push(`结果：${result.toFixed(2)} 天`);
    } else {
      steps.push(`结果：${result.toFixed(4)} ${unit}`);
    }
  } else {
    steps.push('结果：分母为0，无法计算');
  }
  return {
    numerator: { label: numLabel, value: numValue, source: numSource },
    denominator: { label: denLabel, value: denValue, source: denSource },
    steps,
  };
}

function buildGrowthTrace(
  name: string,
  currentLabel: string,
  currentValue: number,
  currentSource: string,
  previousLabel: string,
  previousValue: number,
  previousSource: string,
  result: number | null
): CalculationTrace {
  const steps: string[] = [];
  steps.push(`公式：${name}增长率 = (本期 - 上期) / 上期`);
  steps.push(`本期${currentLabel} = ${currentValue.toLocaleString('zh-CN')}  [来源：${currentSource}]`);
  steps.push(`上期${previousLabel} = ${previousValue.toLocaleString('zh-CN')}  [来源：${previousSource}]`);
  steps.push(
    `代入：(${currentValue.toLocaleString('zh-CN')} - ${previousValue.toLocaleString('zh-CN')}) ÷ ${previousValue.toLocaleString('zh-CN')}`
  );
  if (result !== null) {
    steps.push(`结果：${result.toFixed(4)} = ${(result * 100).toFixed(2)}%`);
  } else {
    steps.push('结果：上期值为0，无法计算增长率');
  }
  return {
    numerator: {
      label: `本期${currentLabel} - 上期${previousLabel}`,
      value: currentValue - previousValue,
      source: `${currentSource} - ${previousSource}`,
    },
    denominator: {
      label: `上期${previousLabel}`,
      value: previousValue,
      source: previousSource,
    },
    steps,
  };
}

function r(
  id: string,
  name: string,
  category: FinancialRatio['category'],
  value: number | null,
  previousValue: number | null,
  unit: string,
  benchmark: FinancialRatio['benchmark'],
  formula: string,
  calculation: CalculationTrace | null
): FinancialRatio {
  return {
    id,
    name,
    category,
    value,
    previousValue,
    unit,
    benchmark,
    formula,
    calculation,
    interpretation: interpretRatio(id, name, value, benchmark),
  };
}

export function calculateAllRatios(data: FinancialData): FinancialRatio[] {
  const ratios: FinancialRatio[] = [];

  const bsPair = getLatestPair(data.balanceSheets);
  const isPair = getLatestPair(data.incomeStatements);
  const cfPair = getLatestPair(data.cashFlowStatements);

  const bs = bsPair.current;
  const prevBs = bsPair.previous;
  const is = isPair.current;
  const prevIs = isPair.previous;
  const cf = cfPair.current;

  const p = bs.period;
  const prevP = prevBs?.period ?? '';

  // ============ 偿债能力 ============
  {
    const val = safeDiv(bs.totalCurrentAssets, bs.totalCurrentLiabilities);
    const prevVal = prevBs ? safeDiv(prevBs.totalCurrentAssets, prevBs.totalCurrentLiabilities) : null;
    ratios.push(
      r(
        'current-ratio',
        '流动比率',
        'solvency',
        val,
        prevVal,
        '倍',
        { good: 2, warning: 1.5, danger: 1, higherIsBetter: true },
        '流动资产 ÷ 流动负债',
        buildTrace(
          '流动比率 = 流动资产 / 流动负债',
          '流动资产合计', bs.totalCurrentAssets, BS('流动资产合计', p, 'totalCurrentAssets'),
          '流动负债合计', bs.totalCurrentLiabilities, BS('流动负债合计', p, 'totalCurrentLiabilities'),
          val, '倍'
        )
      )
    );
  }

  {
    const num = bs.totalCurrentAssets - bs.inventory;
    const val = safeDiv(num, bs.totalCurrentLiabilities);
    const prevVal = prevBs
      ? safeDiv(prevBs.totalCurrentAssets - prevBs.inventory, prevBs.totalCurrentLiabilities)
      : null;
    ratios.push(
      r(
        'quick-ratio',
        '速动比率',
        'solvency',
        val,
        prevVal,
        '倍',
        { good: 1, warning: 0.8, danger: 0.5, higherIsBetter: true },
        '(流动资产 - 存货) ÷ 流动负债',
        buildTrace(
          '速动比率 = (流动资产 - 存货) / 流动负债',
          '流动资产-存货', num, BS('流动资产合计-存货', p, 'totalCurrentAssets-inventory'),
          '流动负债合计', bs.totalCurrentLiabilities, BS('流动负债合计', p, 'totalCurrentLiabilities'),
          val, '倍'
        )
      )
    );
  }

  {
    const val = safeDiv(bs.totalLiabilities, bs.totalAssets);
    const prevVal = prevBs ? safeDiv(prevBs.totalLiabilities, prevBs.totalAssets) : null;
    ratios.push(
      r(
        'debt-ratio',
        '资产负债率',
        'solvency',
        val,
        prevVal,
        '%',
        { good: 0.5, warning: 0.7, danger: 0.85, higherIsBetter: false },
        '总负债 ÷ 总资产 × 100%',
        buildTrace(
          '资产负债率 = 总负债 / 总资产',
          '负债总计', bs.totalLiabilities, BS('负债总计', p, 'totalLiabilities'),
          '资产总计', bs.totalAssets, BS('资产总计', p, 'totalAssets'),
          val, '%'
        )
      )
    );
  }

  {
    const val = safeDiv(bs.totalAssets, bs.totalEquity);
    const prevVal = prevBs ? safeDiv(prevBs.totalAssets, prevBs.totalEquity) : null;
    ratios.push(
      r(
        'equity-multiplier',
        '权益乘数',
        'solvency',
        val,
        prevVal,
        '倍',
        { good: 2, warning: 3, danger: 5, higherIsBetter: false },
        '总资产 ÷ 所有者权益',
        buildTrace(
          '权益乘数 = 总资产 / 所有者权益',
          '资产总计', bs.totalAssets, BS('资产总计', p, 'totalAssets'),
          '所有者权益合计', bs.totalEquity, BS('所有者权益合计', p, 'totalEquity'),
          val, '倍'
        )
      )
    );
  }

  {
    const ebit = is.operatingProfit + is.financialExpenses;
    const interestExpense = Math.max(is.financialExpenses, 1);
    const val = safeDiv(ebit, interestExpense);
    const prevVal = prevIs
      ? safeDiv(prevIs.operatingProfit + prevIs.financialExpenses, Math.max(prevIs.financialExpenses, 1))
      : null;
    ratios.push(
      r(
        'interest-coverage',
        '利息保障倍数',
        'solvency',
        val,
        prevVal,
        '倍',
        { good: 5, warning: 3, danger: 1, higherIsBetter: true },
        '息税前利润 ÷ 利息费用',
        buildTrace(
          '利息保障倍数 = 息税前利润(EBIT) / 利息费用',
          '息税前利润(营业利润+财务费用)', ebit,
          IS('营业利润+财务费用', p, 'operatingProfit+financialExpenses'),
          '利息费用(≈财务费用)', interestExpense,
          IS('财务费用', p, 'financialExpenses'),
          val, '倍'
        )
      )
    );
  }

  // ============ 盈利能力 ============
  {
    const val = safeDiv(is.grossProfit, is.revenue);
    const prevVal = prevIs ? safeDiv(prevIs.grossProfit, prevIs.revenue) : null;
    ratios.push(
      r(
        'gross-margin',
        '毛利率',
        'profitability',
        val,
        prevVal,
        '%',
        { good: 0.4, warning: 0.25, danger: 0.15, higherIsBetter: true },
        '(营业收入 - 营业成本) ÷ 营业收入 × 100%',
        buildTrace(
          '毛利率 = 毛利润 / 营业收入',
          '毛利润', is.grossProfit, IS('毛利润', p, 'grossProfit'),
          '营业收入', is.revenue, IS('营业收入', p, 'revenue'),
          val, '%'
        )
      )
    );
  }

  {
    const val = safeDiv(is.netProfit, is.revenue);
    const prevVal = prevIs ? safeDiv(prevIs.netProfit, prevIs.revenue) : null;
    ratios.push(
      r(
        'net-margin',
        '净利率',
        'profitability',
        val,
        prevVal,
        '%',
        { good: 0.15, warning: 0.08, danger: 0.03, higherIsBetter: true },
        '净利润 ÷ 营业收入 × 100%',
        buildTrace(
          '净利率 = 净利润 / 营业收入',
          '净利润', is.netProfit, IS('净利润', p, 'netProfit'),
          '营业收入', is.revenue, IS('营业收入', p, 'revenue'),
          val, '%'
        )
      )
    );
  }

  {
    const avgEquity = prevBs ? avg(bs.totalEquity, prevBs.totalEquity) : bs.totalEquity;
    const val = safeDiv(is.netProfit, avgEquity);
    const prevVal = null;
    ratios.push(
      r(
        'roe',
        'ROE (净资产收益率)',
        'profitability',
        val,
        prevVal,
        '%',
        { good: 0.15, warning: 0.08, danger: 0.03, higherIsBetter: true },
        '净利润 ÷ 平均所有者权益 × 100%',
        buildTrace(
          'ROE = 净利润 / 平均净资产',
          '净利润', is.netProfit, IS('净利润', p, 'netProfit'),
          `平均所有者权益(${prevP}+${p})/2`, avgEquity,
          `(${BS('所有者权益合计', prevP, 'totalEquity')} + ${BS('所有者权益合计', p, 'totalEquity')}) / 2`,
          val, '%'
        )
      )
    );
  }

  {
    const avgAssets = prevBs ? avg(bs.totalAssets, prevBs.totalAssets) : bs.totalAssets;
    const val = safeDiv(is.netProfit, avgAssets);
    ratios.push(
      r(
        'roa',
        'ROA (总资产收益率)',
        'profitability',
        val,
        null,
        '%',
        { good: 0.08, warning: 0.04, danger: 0.01, higherIsBetter: true },
        '净利润 ÷ 平均总资产 × 100%',
        buildTrace(
          'ROA = 净利润 / 平均总资产',
          '净利润', is.netProfit, IS('净利润', p, 'netProfit'),
          `平均总资产(${prevP}+${p})/2`, avgAssets,
          `(${BS('资产总计', prevP, 'totalAssets')} + ${BS('资产总计', p, 'totalAssets')}) / 2`,
          val, '%'
        )
      )
    );
  }

  {
    const val = safeDiv(is.operatingProfit, is.revenue);
    const prevVal = prevIs ? safeDiv(prevIs.operatingProfit, prevIs.revenue) : null;
    ratios.push(
      r(
        'operating-margin',
        '营业利润率',
        'profitability',
        val,
        prevVal,
        '%',
        { good: 0.2, warning: 0.1, danger: 0.05, higherIsBetter: true },
        '营业利润 ÷ 营业收入 × 100%',
        buildTrace(
          '营业利润率 = 营业利润 / 营业收入',
          '营业利润', is.operatingProfit, IS('营业利润', p, 'operatingProfit'),
          '营业收入', is.revenue, IS('营业收入', p, 'revenue'),
          val, '%'
        )
      )
    );
  }

  {
    const totalExpenses =
      is.sellingExpenses + is.adminExpenses + is.financialExpenses + is.rndExpenses;
    const val = safeDiv(totalExpenses, is.revenue);
    ratios.push(
      r(
        'expense-ratio',
        '费用率',
        'profitability',
        val,
        null,
        '%',
        { good: 0.15, warning: 0.25, danger: 0.35, higherIsBetter: false },
        '(销售+管理+财务+研发费用) ÷ 营业收入 × 100%',
        buildTrace(
          '费用率 = 期间费用合计 / 营业收入',
          '期间费用合计(销管财研)', totalExpenses,
          IS('销管财研四项费用之和', p, 'selling+admin+financial+rnd'),
          '营业收入', is.revenue, IS('营业收入', p, 'revenue'),
          val, '%'
        )
      )
    );
  }

  // ============ 运营效率 ============
  {
    const avgAR = prevBs
      ? avg(bs.accountsReceivable, prevBs.accountsReceivable)
      : bs.accountsReceivable;
    const val = safeDiv(is.revenue, avgAR);
    ratios.push(
      r(
        'ar-turnover',
        '应收账款周转率',
        'efficiency',
        val,
        null,
        '次',
        { good: 8, warning: 4, danger: 2, higherIsBetter: true },
        '营业收入 ÷ 平均应收账款',
        buildTrace(
          '应收账款周转率 = 营业收入 / 平均应收账款',
          '营业收入', is.revenue, IS('营业收入', p, 'revenue'),
          `平均应收账款(${prevP}+${p})/2`, avgAR,
          `(${BS('应收账款', prevP, 'accountsReceivable')} + ${BS('应收账款', p, 'accountsReceivable')}) / 2`,
          val, '次'
        )
      )
    );
  }

  {
    const avgAR = prevBs
      ? avg(bs.accountsReceivable, prevBs.accountsReceivable)
      : bs.accountsReceivable;
    const turnover = safeDiv(is.revenue, avgAR);
    const val = turnover ? 365 / turnover : null;
    ratios.push(
      r(
        'ar-days',
        '应收账款周转天数',
        'efficiency',
        val,
        null,
        '天',
        { good: 45, warning: 90, danger: 180, higherIsBetter: false },
        '365 ÷ 应收账款周转率',
        {
          numerator: { label: '365天', value: 365, source: '会计年度天数常量' },
          denominator: {
            label: '应收账款周转率',
            value: turnover ?? 0,
            source: '由应收账款周转率计算得出（见比率ar-turnover）',
          },
          steps: [
            '公式：应收账款周转天数 = 365 / 应收账款周转率',
            `应收账款周转率 = ${turnover ? turnover.toFixed(2) + ' 次' : '无法计算'}`,
            `周转天数 = 365 ÷ ${turnover ? turnover.toFixed(2) : 'N/A'} = ${val ? val.toFixed(1) + ' 天' : '无法计算'}`,
          ],
        }
      )
    );
  }

  {
    const avgInv = prevBs ? avg(bs.inventory, prevBs.inventory) : bs.inventory;
    const val = safeDiv(is.costOfRevenue, avgInv);
    ratios.push(
      r(
        'inventory-turnover',
        '存货周转率',
        'efficiency',
        val,
        null,
        '次',
        { good: 6, warning: 3, danger: 1.5, higherIsBetter: true },
        '营业成本 ÷ 平均存货',
        buildTrace(
          '存货周转率 = 营业成本 / 平均存货',
          '营业成本', is.costOfRevenue, IS('营业成本', p, 'costOfRevenue'),
          `平均存货(${prevP}+${p})/2`, avgInv,
          `(${BS('存货', prevP, 'inventory')} + ${BS('存货', p, 'inventory')}) / 2`,
          val, '次'
        )
      )
    );
  }

  {
    const avgInv = prevBs ? avg(bs.inventory, prevBs.inventory) : bs.inventory;
    const turnover = safeDiv(is.costOfRevenue, avgInv);
    const val = turnover ? 365 / turnover : null;
    ratios.push(
      r(
        'inventory-days',
        '存货周转天数',
        'efficiency',
        val,
        null,
        '天',
        { good: 60, warning: 120, danger: 240, higherIsBetter: false },
        '365 ÷ 存货周转率',
        {
          numerator: { label: '365天', value: 365, source: '会计年度天数常量' },
          denominator: {
            label: '存货周转率',
            value: turnover ?? 0,
            source: '由存货周转率计算得出（见比率inventory-turnover）',
          },
          steps: [
            '公式：存货周转天数 = 365 / 存货周转率',
            `存货周转率 = ${turnover ? turnover.toFixed(2) + ' 次' : '无法计算'}`,
            `周转天数 = 365 ÷ ${turnover ? turnover.toFixed(2) : 'N/A'} = ${val ? val.toFixed(1) + ' 天' : '无法计算'}`,
          ],
        }
      )
    );
  }

  {
    const avgAssets = prevBs ? avg(bs.totalAssets, prevBs.totalAssets) : bs.totalAssets;
    const val = safeDiv(is.revenue, avgAssets);
    ratios.push(
      r(
        'asset-turnover',
        '总资产周转率',
        'efficiency',
        val,
        null,
        '次',
        { good: 1, warning: 0.6, danger: 0.3, higherIsBetter: true },
        '营业收入 ÷ 平均总资产',
        buildTrace(
          '总资产周转率 = 营业收入 / 平均总资产',
          '营业收入', is.revenue, IS('营业收入', p, 'revenue'),
          `平均总资产(${prevP}+${p})/2`, avgAssets,
          `(${BS('资产总计', prevP, 'totalAssets')} + ${BS('资产总计', p, 'totalAssets')}) / 2`,
          val, '次'
        )
      )
    );
  }

  // ============ 成长能力 ============
  {
    const rate = prevIs ? changeRate(is.revenue, prevIs.revenue) : null;
    ratios.push(
      r(
        'revenue-growth',
        '营业收入增长率',
        'growth',
        rate,
        null,
        '%',
        { good: 0.2, warning: 0.1, danger: 0, higherIsBetter: true },
        '(本期营收 - 上期营收) ÷ 上期营收 × 100%',
        prevIs && rate !== null
          ? buildGrowthTrace(
              '营业收入',
              '营业收入',
              is.revenue,
              IS('营业收入', p, 'revenue'),
              '营业收入',
              prevIs.revenue,
              IS('营业收入', prevP, 'revenue'),
              rate
            )
          : null
      )
    );
  }

  {
    const rate = prevIs ? changeRate(is.netProfit, prevIs.netProfit) : null;
    ratios.push(
      r(
        'net-profit-growth',
        '净利润增长率',
        'growth',
        rate,
        null,
        '%',
        { good: 0.2, warning: 0.1, danger: -0.1, higherIsBetter: true },
        '(本期净利润 - 上期净利润) ÷ 上期净利润 × 100%',
        prevIs && rate !== null
          ? buildGrowthTrace(
              '净利润',
              '净利润',
              is.netProfit,
              IS('净利润', p, 'netProfit'),
              '净利润',
              prevIs.netProfit,
              IS('净利润', prevP, 'netProfit'),
              rate
            )
          : null
      )
    );
  }

  {
    const rate = prevBs ? changeRate(bs.totalAssets, prevBs.totalAssets) : null;
    ratios.push(
      r(
        'asset-growth',
        '总资产增长率',
        'growth',
        rate,
        null,
        '%',
        { good: 0.15, warning: 0.05, danger: -0.05, higherIsBetter: true },
        '(期末总资产 - 期初总资产) ÷ 期初总资产 × 100%',
        prevBs && rate !== null
          ? buildGrowthTrace(
              '总资产',
              '期末总资产',
              bs.totalAssets,
              BS('资产总计', p, 'totalAssets'),
              '期初总资产',
              prevBs.totalAssets,
              BS('资产总计', prevP, 'totalAssets'),
              rate
            )
          : null
      )
    );
  }

  {
    const rate = prevBs ? changeRate(bs.totalEquity, prevBs.totalEquity) : null;
    ratios.push(
      r(
        'equity-growth',
        '净资产增长率',
        'growth',
        rate,
        null,
        '%',
        { good: 0.15, warning: 0.05, danger: -0.05, higherIsBetter: true },
        '(期末净资产 - 期初净资产) ÷ 期初净资产 × 100%',
        prevBs && rate !== null
          ? buildGrowthTrace(
              '净资产',
              '期末所有者权益',
              bs.totalEquity,
              BS('所有者权益合计', p, 'totalEquity'),
              '期初所有者权益',
              prevBs.totalEquity,
              BS('所有者权益合计', prevP, 'totalEquity'),
              rate
            )
          : null
      )
    );
  }

  // 补充 cf 以消除未使用参数警告（实际可扩展CF相关比率）
  void cf;
  void cfPair;

  return ratios;
}

export function getRatiosByCategory(ratios: FinancialRatio[]) {
  return {
    solvency: ratios.filter((r) => r.category === 'solvency'),
    profitability: ratios.filter((r) => r.category === 'profitability'),
    efficiency: ratios.filter((r) => r.category === 'efficiency'),
    growth: ratios.filter((r) => r.category === 'growth'),
  };
}
