import type {
  AnomalyRecord,
  AnomalySeverity,
  FinancialData,
  BalanceSheet,
  IncomeStatement,
  CashFlowStatement,
  FinancialRatio,
  StatementType,
} from '@/types/financial';
import { changeAmount, changeRate } from '../format';

export const SEVERITY_THRESHOLDS = {
  critical: 0.5,
  warning: 0.3,
  notice: 0.15,
};

function getSeverity(rate: number): AnomalySeverity | null {
  const abs = Math.abs(rate);
  if (abs >= SEVERITY_THRESHOLDS.critical) return 'critical';
  if (abs >= SEVERITY_THRESHOLDS.warning) return 'warning';
  if (abs >= SEVERITY_THRESHOLDS.notice) return 'notice';
  return null;
}

function detectRate(
  value: number,
  threshold: number,
  higherIsWorse: boolean
): AnomalySeverity | null {
  if (higherIsWorse) {
    if (value >= threshold * 1.2) return 'critical';
    if (value >= threshold) return 'warning';
  } else {
    if (value <= threshold * 0.8) return 'critical';
    if (value <= threshold) return 'warning';
  }
  return null;
}

const POSSIBLE_REASONS_MAP: Record<string, string[]> = {
  // 资产负债表 - 资产
  cash: [
    '经营性现金流大幅波动',
    '大量偿还到期债务导致现金流出',
    '大额固定资产/股权投资支出',
    '筹资活动（借款、增资）变化',
    '季节性备货/回款周期影响',
  ],
  accountsReceivable: [
    '信用政策放宽，允许客户更长账期',
    '营业收入增长带来的自然增加',
    '主要客户付款能力下降，回款变慢',
    '年末突击销售产生大量应收',
    '坏账计提政策变化',
  ],
  inventory: [
    '为旺季订单或原材料涨价提前备货',
    '市场需求萎缩导致产品滞销',
    '新产线/新产品投产导致库存增加',
    '存货跌价准备计提政策变化',
    '供应链策略调整（如JIT转安全库存）',
  ],
  totalCurrentAssets: [
    '货币资金、应收账款、存货等任一主要项目大幅变动',
    '业务规模扩张或收缩',
    '资产重分类调整',
  ],
  fixedAssetsNet: [
    '新增大额固定资产投资（厂房、设备）',
    '处置老旧或闲置固定资产',
    '固定资产折旧/减值政策变化',
    '在建工程完工转入',
  ],
  totalAssets: [
    '业务规模扩大带来的整体资产扩张',
    '外部融资（借款/增资）到账后未使用',
    '大额并购或资产处置',
  ],
  // 负债
  shortTermBorrowings: [
    '补充流动资金缺口的新增贷款',
    '到期债务滚动续借',
    '压缩有息负债的主动偿还',
    '季节性资金需求变化',
  ],
  accountsPayable: [
    '采购量变化（扩大/减少生产）',
    '与供应商谈判延长/缩短付款账期',
    '资金紧张导致付款拖延',
    '存货采购增加带来的自然增长',
  ],
  totalCurrentLiabilities: [
    '短期借款和应付款等主要流动负债变化',
    '一年内到期的长期负债重分类',
    '预收款/合同负债波动',
  ],
  longTermBorrowings: [
    '长期项目融资（如扩产、并购）',
    '长短期债务结构调整',
    '提前偿还长期借款降低负债率',
  ],
  totalLiabilities: [
    '整体融资规模变化',
    '主动去杠杆或加杠杆策略',
    '经营性负债随业务规模自然波动',
  ],
  totalEquity: [
    '当期利润留存或亏损侵蚀',
    '增资扩股/回购注销股份',
    '分红派息',
    '其他综合收益变化（如可供出售金融资产浮盈浮亏）',
  ],
  // 利润表
  revenue: [
    '市场需求大幅变化',
    '核心产品价格调整',
    '销量大幅增减',
    '产品结构变化（高毛利/低毛利占比变化）',
    '并购/处置子公司带来合并范围变化',
    '会计政策变更（如收入确认准则调整）',
  ],
  costOfRevenue: [
    '原材料/人工等成本大幅涨跌',
    '营业收入联动变化',
    '生产效率变化（良品率、产能利用率）',
    '成本核算方法变更',
  ],
  grossProfit: [
    '毛利率变动（产品结构/定价/成本）',
    '营业收入的联动变化',
  ],
  sellingExpenses: [
    '营销策略调整（广告投放、促销活动）',
    '销售团队规模变化',
    '新市场/新产品开拓投入',
    '收入联动的提成/运费变化',
  ],
  adminExpenses: [
    '管理团队薪酬与股权激励',
    '办公场地搬迁或扩张',
    '中介费用（法律、审计、咨询）波动',
    '行政类费用管控力度变化',
  ],
  financialExpenses: [
    '有息负债规模变化（借款增减）',
    '市场利率大幅波动',
    '汇兑损益（涉外业务）',
    '利息资本化比例变化',
  ],
  rndExpenses: [
    '研发项目立项/结项节奏',
    '研发人员规模变化',
    '研发费用资本化/费用化政策调整',
    '新产品管线投入增加',
  ],
  operatingProfit: [
    '毛利率、费用率的综合变化',
    '核心主业经营状况变化',
  ],
  netProfit: [
    '营业利润的正常变动',
    '营业外收支（政府补助、资产处置）大额变化',
    '所得税政策或税率变化',
    '非经常性损益的一次性影响',
  ],
  // 现金流量表
  operatingNetCashFlow: [
    '营业收入与回款节奏不匹配',
    '存货和应收款大量占用资金',
    '应付款账期变化（供应商信用利用）',
    '经营性应付项目的增减',
  ],
  investingNetCashFlow: [
    '大额固定资产/无形资产购建支出',
    '对外股权投资或并购',
    '金融资产买卖',
    '处置长期资产回收资金',
  ],
  financingNetCashFlow: [
    '银行借款的借入和偿还',
    '股权融资（增资/增发/回购）',
    '股利/利息分配支付',
    '债券发行与兑付',
  ],
  netIncreaseInCash: [
    '三大活动现金流的综合结果',
    '汇率变动对现金的影响',
  ],
  // 比率指标
  'gross-margin': [
    '产品销售价格调整',
    '原材料/人工成本大幅波动',
    '产品结构变化（高毛利/低毛利产品占比变化）',
    '生产效率变化（良品率、产能利用率）',
    '成本核算方法变更',
  ],
  'net-margin': [
    '毛利率变动的传导影响',
    '期间费用率大幅变化',
    '非经常性损益（政府补助、资产处置）',
    '所得税政策或税率变化',
    '投资收益或公允价值变动损益波动',
  ],
  'debt-ratio': [
    '大规模举债融资（如扩产、并购）',
    '偿还债务降低杠杆',
    '利润留存积累增加净资产',
    '亏损侵蚀所有者权益',
    '资产重估或会计政策变更影响',
  ],
  'current-ratio': [
    '流动资产大幅增减（货币资金、应收、存货）',
    '流动负债大幅变化（短期借款、应付账款）',
    '长短期债务结构调整',
    '营运资金管理策略变化',
  ],
  'operating-margin': [
    '毛利率变动影响',
    '销售费用率/管理费用率大幅变化',
    '研发费用投入增减',
    '经营效率提升或下降',
    '业务结构变化',
  ],
  'inventory-turnover': [
    '销售速度变化（市场需求波动）',
    '库存策略调整（安全库存、JIT）',
    '产品结构变化影响周转速度',
    '供应链效率变化',
    '滞销库存增加或清理',
  ],
  'roe': [
    '盈利能力变化（净利率变动）',
    '资产运营效率变化（资产周转率）',
    '资本结构调整（权益乘数变化）',
    '净资产规模变化（增资、分红、亏损）',
  ],
};

function recordFromField<T extends object>(
  name: string,
  fieldKey: string,
  statementType: StatementType,
  current: T,
  previous: T,
  periodCurrent: string,
  periodPrevious: string,
  sourceTemplate: string
): AnomalyRecord | null {
  const cv = (current as Record<string, number>)[fieldKey];
  const pv = (previous as Record<string, number>)[fieldKey];
  if (pv === undefined || cv === undefined) return null;
  if (pv === 0 && cv === 0) return null;

  const rate = pv !== 0 ? (cv - pv) / pv : cv > 0 ? 1 : -1;
  const severity = pv !== 0 ? getSeverity(rate) : cv !== 0 ? 'warning' : null;
  if (!severity) return null;

  const threshold =
    severity === 'critical'
      ? SEVERITY_THRESHOLDS.critical
      : severity === 'warning'
      ? SEVERITY_THRESHOLDS.warning
      : SEVERITY_THRESHOLDS.notice;

  return {
    id: `${statementType}-${fieldKey}-${periodCurrent}-vs-${periodPrevious}`,
    indicatorName: name,
    statementType,
    fieldKey,
    currentPeriod: periodCurrent,
    previousPeriod: periodPrevious,
    currentValue: cv,
    previousValue: pv,
    changeAmount: changeAmount(cv, pv),
    changeRate: rate,
    severity,
    threshold,
    possibleReasons: POSSIBLE_REASONS_MAP[fieldKey] ?? [
      '业务规模变化',
      '相关政策与策略调整',
      '外部市场环境变化',
      '会计估计或政策变更',
    ],
    sourceTrace: `${sourceTemplate}[${periodPrevious}]·${name}(${fieldKey}) → ${sourceTemplate}[${periodCurrent}]·${name}(${fieldKey})`,
  };
}

function inspectBalanceSheets(list: BalanceSheet[]): AnomalyRecord[] {
  const res: AnomalyRecord[] = [];
  if (list.length < 2) return res;
  const sorted = [...list].sort((a, b) => (a.period < b.period ? 1 : -1));
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = sorted[i];
    const prev = sorted[i + 1];
    const fields: [string, string][] = [
      ['货币资金', 'cash'],
      ['应收账款', 'accountsReceivable'],
      ['存货', 'inventory'],
      ['流动资产合计', 'totalCurrentAssets'],
      ['固定资产净额', 'fixedAssetsNet'],
      ['无形资产', 'intangibleAssets'],
      ['非流动资产合计', 'totalNonCurrentAssets'],
      ['资产总计', 'totalAssets'],
      ['短期借款', 'shortTermBorrowings'],
      ['应付账款', 'accountsPayable'],
      ['流动负债合计', 'totalCurrentLiabilities'],
      ['长期借款', 'longTermBorrowings'],
      ['负债总计', 'totalLiabilities'],
      ['所有者权益合计', 'totalEquity'],
    ];
    for (const [name, key] of fields) {
      const rec = recordFromField(name, key, 'balance', curr, prev, curr.period, prev.period, '资产负债表');
      if (rec) res.push(rec);
    }
  }
  return res;
}

function inspectIncomeStatements(list: IncomeStatement[]): AnomalyRecord[] {
  const res: AnomalyRecord[] = [];
  if (list.length < 2) return res;
  const sorted = [...list].sort((a, b) => (a.period < b.period ? 1 : -1));
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = sorted[i];
    const prev = sorted[i + 1];
    const fields: [string, string][] = [
      ['营业收入', 'revenue'],
      ['营业成本', 'costOfRevenue'],
      ['毛利润', 'grossProfit'],
      ['销售费用', 'sellingExpenses'],
      ['管理费用', 'adminExpenses'],
      ['财务费用', 'financialExpenses'],
      ['研发费用', 'rndExpenses'],
      ['营业利润', 'operatingProfit'],
      ['利润总额', 'totalProfit'],
      ['净利润', 'netProfit'],
      ['归母净利润', 'netProfitToParent'],
    ];
    for (const [name, key] of fields) {
      const rec = recordFromField(name, key, 'income', curr, prev, curr.period, prev.period, '利润表');
      if (rec) res.push(rec);
    }
  }
  return res;
}

function inspectCashFlowStatements(list: CashFlowStatement[]): AnomalyRecord[] {
  const res: AnomalyRecord[] = [];
  if (list.length < 2) return res;
  const sorted = [...list].sort((a, b) => (a.period < b.period ? 1 : -1));
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = sorted[i];
    const prev = sorted[i + 1];
    const fields: [string, string][] = [
      ['经营活动净现金流', 'operatingNetCashFlow'],
      ['投资活动净现金流', 'investingNetCashFlow'],
      ['筹资活动净现金流', 'financingNetCashFlow'],
      ['现金净增加额', 'netIncreaseInCash'],
      ['经营活动现金流入', 'operatingCashInflow'],
      ['经营活动现金流出', 'operatingCashOutflow'],
    ];
    for (const [name, key] of fields) {
      const rec = recordFromField(name, key, 'cashflow', curr, prev, curr.period, prev.period, '现金流量表');
      if (rec) res.push(rec);
    }
  }
  return res;
}

function inspectRatios(ratios: FinancialRatio[]): AnomalyRecord[] {
  const res: AnomalyRecord[] = [];
  for (const r of ratios) {
    // 阈值型异常
    if (r.benchmark && r.value !== null) {
      let sev: AnomalySeverity | null = null;
      let specialSource = '';
      if (r.id === 'debt-ratio') {
        sev = detectRate(r.value, 0.7, true) ?? detectRate(r.value, 0.85, true) ? detectRate(r.value, 0.85, true) : detectRate(r.value, 0.7, true);
        if (r.value >= 0.85) { sev = 'critical'; specialSource = '特殊规则：资产负债率≥85%'; }
        else if (r.value >= 0.7) { sev = 'warning'; specialSource = '特殊规则：资产负债率≥70%'; }
      } else if (r.id === 'current-ratio') {
        if (r.value < 1) { sev = 'warning'; specialSource = '特殊规则：流动比率<1'; }
      } else if (r.id === 'interest-coverage') {
        if (r.value < 1) { sev = 'critical'; specialSource = '特殊规则：利息保障倍数<1'; }
        else if (r.value < 1.5) { sev = 'warning'; specialSource = '特殊规则：利息保障倍数<1.5'; }
      }
      if (sev) {
        res.push({
          id: `ratio-threshold-${r.id}`,
          indicatorName: r.name + '（阈值型）',
          statementType: 'ratio',
          fieldKey: r.id,
          currentPeriod: '本期',
          previousPeriod: '阈值',
          currentValue: r.value,
          previousValue: r.benchmark.danger,
          changeAmount: 0,
          changeRate: 0,
          severity: sev,
          threshold: r.benchmark.danger,
          possibleReasons: [
            '偿债能力指标恶化，可能由债务规模上升、利润下滑等原因造成',
            '建议与流动比率、速动比率等其他偿债指标交叉验证',
            `触发依据：${specialSource}`,
          ],
          sourceTrace: `比率[id=${r.id}] · 公式：${r.formula} · 规则：${specialSource || '参考行业基准'}`,
        });
      }
    }

    // 环比型异常
    if (r.value !== null && r.previousValue !== null && r.previousValue !== 0) {
      const rate = (r.value - r.previousValue) / r.previousValue;
      const sev = getSeverity(rate);
      if (sev && Math.abs(r.previousValue) > 0.001) {
        res.push({
          id: `ratio-change-${r.id}`,
          indicatorName: r.name + '（环比）',
          statementType: 'ratio',
          fieldKey: r.id,
          currentPeriod: '本期',
          previousPeriod: '上期',
          currentValue: r.value,
          previousValue: r.previousValue,
          changeAmount: r.value - r.previousValue,
          changeRate: rate,
          severity: sev,
          threshold:
            sev === 'critical' ? SEVERITY_THRESHOLDS.critical : sev === 'warning' ? SEVERITY_THRESHOLDS.warning : SEVERITY_THRESHOLDS.notice,
          possibleReasons: POSSIBLE_REASONS_MAP[r.id] ?? [
            '分子/分母任一项目大幅变化均可能影响比率',
            '建议展开查看比率计算过程中的分子分母数据来源',
          ],
          sourceTrace: `比率[id=${r.id}] · 公式：${r.formula} · 上期 → 本期`,
        });
      }
    }
  }
  return res;
}

export function detectAllAnomalies(
  data: FinancialData,
  ratios: FinancialRatio[]
): AnomalyRecord[] {
  const res = [
    ...inspectBalanceSheets(data.balanceSheets),
    ...inspectIncomeStatements(data.incomeStatements),
    ...inspectCashFlowStatements(data.cashFlowStatements),
    ...inspectRatios(ratios),
  ];
  const severityOrder: Record<AnomalySeverity, number> = {
    critical: 0,
    warning: 1,
    notice: 2,
  };
  res.sort((a, b) => {
    const s = severityOrder[a.severity] - severityOrder[b.severity];
    if (s !== 0) return s;
    return Math.abs(b.changeRate) - Math.abs(a.changeRate);
  });
  return res;
}

export function getAnomalyCounts(records: AnomalyRecord[]) {
  return {
    critical: records.filter((r) => r.severity === 'critical').length,
    warning: records.filter((r) => r.severity === 'warning').length,
    notice: records.filter((r) => r.severity === 'notice').length,
    total: records.length,
  };
}

const MEAN_DEVIATION_THRESHOLD = 0.15;
const MIN_SAMPLE_COUNT = 2;

function calcMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function calcStdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

interface HistoricalIndicator {
  name: string;
  fieldKey: string;
  statementType: StatementType;
  values: { period: string; value: number }[];
}

function extractBalanceSheetIndicators(data: FinancialData): HistoricalIndicator[] {
  const fields: [string, string][] = [
    ['货币资金', 'cash'],
    ['应收账款', 'accountsReceivable'],
    ['存货', 'inventory'],
    ['流动资产合计', 'totalCurrentAssets'],
    ['固定资产净额', 'fixedAssetsNet'],
    ['资产总计', 'totalAssets'],
    ['短期借款', 'shortTermBorrowings'],
    ['应付账款', 'accountsPayable'],
    ['流动负债合计', 'totalCurrentLiabilities'],
    ['长期借款', 'longTermBorrowings'],
    ['负债总计', 'totalLiabilities'],
    ['所有者权益合计', 'totalEquity'],
  ];

  const sorted = [...data.balanceSheets].sort((a, b) =>
    a.period < b.period ? -1 : 1
  );

  return fields.map(([name, key]) => ({
    name,
    fieldKey: key,
    statementType: 'balance' as StatementType,
    values: sorted.map((bs) => ({
      period: bs.period,
      value: (bs as unknown as Record<string, number>)[key],
    })),
  }));
}

function extractIncomeStatementIndicators(data: FinancialData): HistoricalIndicator[] {
  const fields: [string, string][] = [
    ['营业收入', 'revenue'],
    ['营业成本', 'costOfRevenue'],
    ['毛利润', 'grossProfit'],
    ['销售费用', 'sellingExpenses'],
    ['管理费用', 'adminExpenses'],
    ['财务费用', 'financialExpenses'],
    ['研发费用', 'rndExpenses'],
    ['营业利润', 'operatingProfit'],
    ['利润总额', 'totalProfit'],
    ['净利润', 'netProfit'],
  ];

  const sorted = [...data.incomeStatements].sort((a, b) =>
    a.period < b.period ? -1 : 1
  );

  return fields.map(([name, key]) => ({
    name,
    fieldKey: key,
    statementType: 'income' as StatementType,
    values: sorted.map((is) => ({
      period: is.period,
      value: (is as unknown as Record<string, number>)[key],
    })),
  }));
}

function extractCashFlowIndicators(data: FinancialData): HistoricalIndicator[] {
  const fields: [string, string][] = [
    ['经营活动净现金流', 'operatingNetCashFlow'],
    ['投资活动净现金流', 'investingNetCashFlow'],
    ['筹资活动净现金流', 'financingNetCashFlow'],
    ['现金净增加额', 'netIncreaseInCash'],
  ];

  const sorted = [...data.cashFlowStatements].sort((a, b) =>
    a.period < b.period ? -1 : 1
  );

  return fields.map(([name, key]) => ({
    name,
    fieldKey: key,
    statementType: 'cashflow' as StatementType,
    values: sorted.map((cf) => ({
      period: cf.period,
      value: (cf as unknown as Record<string, number>)[key],
    })),
  }));
}

function extractRatioIndicators(data: FinancialData): HistoricalIndicator[] {
  const bsSorted = [...data.balanceSheets].sort((a, b) =>
    a.period < b.period ? -1 : 1
  );
  const isSorted = [...data.incomeStatements].sort((a, b) =>
    a.period < b.period ? -1 : 1
  );

  const ratios: { name: string; fieldKey: string; calc: (bs: BalanceSheet, is: IncomeStatement, prevBs: BalanceSheet | null) => number | null }[] = [
    {
      name: '毛利率',
      fieldKey: 'gross-margin',
      calc: (bs, is) => is.revenue !== 0 ? is.grossProfit / is.revenue : null,
    },
    {
      name: '净利率',
      fieldKey: 'net-margin',
      calc: (bs, is) => is.revenue !== 0 ? is.netProfit / is.revenue : null,
    },
    {
      name: '资产负债率',
      fieldKey: 'debt-ratio',
      calc: (bs) => bs.totalAssets !== 0 ? bs.totalLiabilities / bs.totalAssets : null,
    },
    {
      name: '流动比率',
      fieldKey: 'current-ratio',
      calc: (bs) => bs.totalCurrentLiabilities !== 0 ? bs.totalCurrentAssets / bs.totalCurrentLiabilities : null,
    },
    {
      name: '营业利润率',
      fieldKey: 'operating-margin',
      calc: (bs, is) => is.revenue !== 0 ? is.operatingProfit / is.revenue : null,
    },
    {
      name: '存货周转率',
      fieldKey: 'inventory-turnover',
      calc: (bs, is) => bs.inventory !== 0 ? is.costOfRevenue / bs.inventory : null,
    },
    {
      name: 'ROE',
      fieldKey: 'roe',
      calc: (bs, is) => bs.totalEquity !== 0 ? is.netProfit / bs.totalEquity : null,
    },
  ];

  return ratios.map((r) => {
    const values: { period: string; value: number }[] = [];
    for (let i = 0; i < isSorted.length; i++) {
      const bs = bsSorted[i];
      const is = isSorted[i];
      const prevBs = i > 0 ? bsSorted[i - 1] : null;
      if (bs && is) {
        const val = r.calc(bs, is, prevBs);
        if (val !== null && val !== undefined && !isNaN(val)) {
          values.push({ period: is.period, value: val });
        }
      }
    }
    return {
      name: r.name,
      fieldKey: r.fieldKey,
      statementType: 'ratio' as StatementType,
      values,
    };
  });
}

export function detectMeanDeviationAnomalies(
  data: FinancialData,
  maxPeriods: number = 8
): AnomalyRecord[] {
  const indicators: HistoricalIndicator[] = [
    ...extractBalanceSheetIndicators(data),
    ...extractIncomeStatementIndicators(data),
    ...extractCashFlowIndicators(data),
    ...extractRatioIndicators(data),
  ];

  const anomalies: AnomalyRecord[] = [];

  for (const indicator of indicators) {
    const validValues = indicator.values.filter(
      (v) => v.value !== null && v.value !== undefined && !isNaN(v.value)
    );

    if (validValues.length < MIN_SAMPLE_COUNT) continue;

    const recentValues = validValues.slice(-maxPeriods);
    const current = recentValues[recentValues.length - 1];
    const historical = recentValues.slice(0, -1);

    if (historical.length === 0) continue;

    const historicalNums = historical.map((v) => v.value);
    const mean = calcMean(historicalNums);
    const stdDev = calcStdDev(historicalNums, mean);

    if (mean === 0) continue;

    const deviation = (current.value - mean) / Math.abs(mean);

    if (Math.abs(deviation) >= MEAN_DEVIATION_THRESHOLD) {
      const severity: AnomalySeverity =
        Math.abs(deviation) >= 0.5 ? 'critical' :
        Math.abs(deviation) >= 0.3 ? 'warning' : 'notice';

      const prevValue = historical[historical.length - 1]?.value ?? 0;
      const changeAmt = current.value - prevValue;
      const changeRt = prevValue !== 0 ? changeAmt / prevValue : 0;

      anomalies.push({
        id: `mean-dev-${indicator.statementType}-${indicator.fieldKey}-${current.period}`,
        indicatorName: indicator.name,
        statementType: indicator.statementType,
        fieldKey: indicator.fieldKey,
        currentPeriod: current.period,
        previousPeriod: historical[historical.length - 1]?.period ?? '',
        currentValue: current.value,
        previousValue: prevValue,
        changeAmount: changeAmt,
        changeRate: changeRt,
        severity,
        threshold: MEAN_DEVIATION_THRESHOLD,
        possibleReasons: POSSIBLE_REASONS_MAP[indicator.fieldKey] ?? [
          '业务规模变化',
          '相关政策与策略调整',
          '外部市场环境变化',
          '会计估计或政策变更',
        ],
        sourceTrace: `均值偏离分析 · ${indicator.name} · 基于${historical.length}期历史数据`,
        historicalMean: mean,
        historicalStdDev: stdDev,
        deviationFromMean: deviation,
        deviationType: deviation >= 0 ? 'above' : 'below',
        sampleCount: historical.length,
        anomalyType: 'mean-deviation',
      });
    }
  }

  const severityOrder: Record<AnomalySeverity, number> = {
    critical: 0,
    warning: 1,
    notice: 2,
  };
  anomalies.sort((a, b) => {
    const s = severityOrder[a.severity] - severityOrder[b.severity];
    if (s !== 0) return s;
    return Math.abs(b.deviationFromMean ?? 0) - Math.abs(a.deviationFromMean ?? 0);
  });

  return anomalies;
}

export function getMeanDeviationAnomalySummary(anomalies: AnomalyRecord[]) {
  const meanDevAnomalies = anomalies.filter((a) => a.anomalyType === 'mean-deviation');
  return {
    total: meanDevAnomalies.length,
    critical: meanDevAnomalies.filter((a) => a.severity === 'critical').length,
    warning: meanDevAnomalies.filter((a) => a.severity === 'warning').length,
    notice: meanDevAnomalies.filter((a) => a.severity === 'notice').length,
  };
}

export function getMeanDeviationAnomalyByField(
  anomalies: AnomalyRecord[],
  fieldKey: string
): AnomalyRecord | undefined {
  return anomalies.find(
    (a) => a.anomalyType === 'mean-deviation' && a.fieldKey === fieldKey
  );
}

export { changeRate, changeAmount };
