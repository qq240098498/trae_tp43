import type {
  ChartType,
  ChartRecommendation,
  VisualizationAdvice,
  AnalysisCategory,
  PeerAnalysisSummary,
  FinancialRatio,
  AnomalyRecord,
  SubsidiaryFinancialData,
  PeerBenchmarkResult,
} from '@/types/financial';

const CHART_TYPE_NAMES: Record<ChartType, string> = {
  line: '折线图',
  bar: '条形图',
  pie: '饼图',
  waterfall: '瀑布图',
  column: '柱状图',
  area: '面积图',
};

const CATEGORY_LABELS: Record<AnalysisCategory, string> = {
  trend: '趋势变化',
  structure: '结构占比',
  comparison: '同业对比',
  composition: '构成分析',
  distribution: '分布情况',
};

function createLineChartAdvice(
  id: string,
  category: AnalysisCategory,
  conclusion: string,
  title: string,
  subtitle: string,
  xLabel: string,
  yLabel: string,
  dataLabel: string,
  unit: string,
  series: { name: string; description: string }[],
  priority: 'high' | 'medium' | 'low',
  purpose: string,
  tips: string[]
): VisualizationAdvice {
  return {
    id,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    conclusion,
    priority,
    recommendations: [
      {
        chartType: 'line',
        chartTypeName: CHART_TYPE_NAMES['line'],
        chartTitle: title,
        chartSubtitle: subtitle,
        purpose,
        axisConfig: {
          xAxisLabel: xLabel,
          yAxisLabel: yLabel,
          dataLabel,
          unit,
        },
        dataSeries: series,
        designTips: [
          '建议使用平滑曲线，数据点用圆点标注',
          '关键节点（如异常值、拐点）建议添加数据标签',
          '多条折线使用不同色系，主数据使用强调色',
          ...tips,
        ],
        suitableForReport: true,
      },
      {
        chartType: 'area',
        chartTypeName: CHART_TYPE_NAMES['area'],
        chartTitle: title + '（面积图）',
        chartSubtitle: subtitle,
        purpose: '强调趋势的累计效应与量级感，适合展示整体走势与规模感强烈的场景',
        axisConfig: {
          xAxisLabel: xLabel,
          yAxisLabel: yLabel,
          dataLabel,
          unit,
        },
        dataSeries: series,
        designTips: [
          '使用渐变填充色，透明度建议60-70%',
          '多条面积图建议叠加展示，按重要性从下到上排列',
          '底部区域使用浅色，重要数据使用深色',
        ],
        suitableForReport: true,
      },
    ],
  };
}

function createBarChartAdvice(
  id: string,
  category: AnalysisCategory,
  conclusion: string,
  title: string,
  subtitle: string,
  xLabel: string,
  yLabel: string,
  dataLabel: string,
  unit: string,
  series: { name: string; description: string }[],
  priority: 'high' | 'medium' | 'low',
  purpose: string,
  tips: string[]
): VisualizationAdvice {
  return {
    id,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    conclusion,
    priority,
    recommendations: [
      {
        chartType: 'bar',
        chartTypeName: CHART_TYPE_NAMES['bar'],
        chartTitle: title,
        chartSubtitle: subtitle,
        purpose,
        axisConfig: {
          xAxisLabel: xLabel,
          yAxisLabel: yLabel,
          dataLabel,
          unit,
        },
        dataSeries: series,
        designTips: [
          '按数值大小排序，便于快速定位最优/最差',
          '本企业数据使用强调色突出显示',
          '行业平均/中位数可用参考线标注',
          ...tips,
        ],
        suitableForReport: true,
      },
      {
        chartType: 'column',
        chartTypeName: CHART_TYPE_NAMES['column'],
        chartTitle: title + '（柱状图）',
        chartSubtitle: subtitle,
        purpose: '垂直展示对比，适合类别较少的对比场景',
        axisConfig: {
          xAxisLabel: xLabel,
          yAxisLabel: yLabel,
          dataLabel,
          unit,
        },
        dataSeries: series,
        designTips: [
          '类别数量建议不超过8个',
          '柱状图之间留出适当间隙',
          '数值较大的类别使用强调色',
        ],
        suitableForReport: true,
      },
    ],
  };
}

function createPieChartAdvice(
  id: string,
  category: AnalysisCategory,
  conclusion: string,
  title: string,
  subtitle: string,
  dataLabel: string,
  unit: string,
  yLabel: string,
  series: { name: string; description: string }[],
  priority: 'high' | 'medium' | 'low',
  purpose: string,
  tips: string[]
): VisualizationAdvice {
  return {
    id,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    conclusion,
    priority,
    recommendations: [
      {
        chartType: 'pie',
        chartTypeName: CHART_TYPE_NAMES['pie'],
        chartTitle: title,
        chartSubtitle: subtitle,
        purpose,
        axisConfig: {
          xAxisLabel: '',
          yAxisLabel: '',
          dataLabel,
          unit,
        },
        dataSeries: series,
        designTips: [
          '扇区数量建议控制在5-7个以内，过多可合并为「其他」',
          '从12点钟方向开始，按占比从大到小顺时针排列',
          '标注百分比标签，同时显示数值与占比',
          ...tips,
        ],
        suitableForReport: true,
      },
      {
        chartType: 'waterfall',
        chartTypeName: CHART_TYPE_NAMES['waterfall'],
        chartTitle: title.replace('占比', '构成瀑布图').replace('结构', '构成'),
        chartSubtitle: subtitle,
        purpose: '展示各构成项对总量的贡献与增减变化，适合结构分析与贡献度分析',
        axisConfig: {
          xAxisLabel: '构成项目',
          yAxisLabel: yLabel,
          dataLabel,
          unit,
        },
        dataSeries: series,
        designTips: [
          '正向贡献用绿色/蓝色，负向贡献用红色/橙色',
          '总计项用中性色（如灰色或深蓝色',
          '每根柱子顶部标注数值与占比',
        ],
        suitableForReport: true,
      },
    ],
  };
}

export function generateTrendVisualization(
  ratios: FinancialRatio[]
): VisualizationAdvice[] {
  const advice: VisualizationAdvice[] = [];

  const profitabilityRatios = ratios.filter(
    (r) => r.category === 'profitability' && r.value !== null
  );
  if (profitabilityRatios.length > 0) {
    const names = profitabilityRatios.map((r) => ({
      name: r.name,
      description: `${r.name}反映企业${r.interpretation.summary}`,
    }));
    advice.push(
      createLineChartAdvice(
        'trend-profitability',
        'trend',
        '盈利能力趋势分析：跟踪核心盈利指标随时间变化趋势，反映企业盈利水平的发展态势',
        '盈利能力指标趋势分析',
        '多期核心盈利指标对比',
        '报告期',
        '比率值',
        '指标值',
        '%',
        names,
        'high',
        '直观展示毛利率、净利率、ROE等核心盈利指标的历史走势，判断企业盈利水平的变化趋势与波动情况',
        ['建议标注行业平均水平作为参考线']
      )
    );
  }

  const solvencyRatios = ratios.filter(
    (r) => r.category === 'solvency' && r.value !== null
  );
  if (solvencyRatios.length > 0) {
    const names = solvencyRatios.map((r) => ({
      name: r.name,
      description: `${r.name}反映企业${r.interpretation.summary}`,
    }));
    advice.push(
      createLineChartAdvice(
        'trend-solvency',
        'trend',
        '偿债能力趋势分析：观察偿债能力指标的历史走势，评估企业财务风险的变化趋势',
        '偿债能力指标趋势分析',
        '多期偿债能力指标对比',
        '报告期',
        '比率值',
        '指标值',
        '倍/%',
        names,
        'medium',
        '展示资产负债率、流动比率等偿债指标的变化趋势，判断企业财务稳健性的发展方向',
        ['关键阈值线（如流动比率2倍线）']
      )
    );
  }

  const efficiencyRatios = ratios.filter(
    (r) => r.category === 'efficiency' && r.value !== null
  );
  if (efficiencyRatios.length > 0) {
    const names = efficiencyRatios.map((r) => ({
      name: r.name,
      description: `${r.name}反映企业${r.interpretation.summary}`,
    }));
    advice.push(
      createLineChartAdvice(
        'trend-efficiency',
        'trend',
        '运营效率趋势分析：跟踪运营效率指标变化，反映企业资产运营能力的变化',
        '运营效率指标趋势分析',
        '多期运营效率指标对比',
        '报告期',
        '周转次数/天数',
        '指标值',
        '次/天',
        names,
        'medium',
        '展示存货周转率、总资产周转率等效率指标的历史走势，评估企业运营管理效率的变化趋势',
        ['周转率越高表示效率越好，注意与行业对比']
      )
    );
  }

  const growthRatios = ratios.filter(
    (r) => r.category === 'growth' && r.value !== null
  );
  if (growthRatios.length > 0) {
    const names = growthRatios.map((r) => ({
      name: r.name,
      description: `${r.name}反映企业${r.interpretation.summary}`,
    }));
    advice.push(
      createLineChartAdvice(
        'trend-growth',
        'trend',
        '成长能力趋势分析：展示成长指标的历史走势，判断企业发展速度与成长性',
        '成长能力指标趋势分析',
        '多期成长能力指标对比',
        '报告期',
        '增长率',
        '增长率',
        '%',
        names,
        'high',
        '直观展示营收增长率、利润增长率等成长指标的变化趋势，反映企业发展速度与增长动力',
        ['添加零值参考线，正负增长一目了然']
      )
    );
  }

  return advice;
}

export function generateStructureVisualization(
  subsidiaries: SubsidiaryFinancialData[]
): VisualizationAdvice[] {
  const advice: VisualizationAdvice[] = [];

  if (subsidiaries.length > 0) {
    const hasContribution = subsidiaries.filter(
      (s) => s.groupContribution !== undefined
    );

    if (hasContribution.length > 0) {
      const names = hasContribution.map((s) => ({
        name: s.name,
        description: `${s.industryLabel} · ${s.scaleLabel}`,
      }));

      advice.push(
        createPieChartAdvice(
          'structure-revenue',
          'structure',
          '营收结构分析：各子公司/业务板块对集团总营收的贡献占比',
          '集团营收结构占比',
          '各子公司营收贡献占比',
          '营收占比',
          '%',
          '营收金额',
          names,
          'high',
          '清晰展示各业务板块/子公司在集团总营收中的占比情况，直观反映营收来源结构与核心业务贡献',
          ['突出显示核心贡献子公司，占比最大的扇区分离显示']
        )
      );

      advice.push(
        createPieChartAdvice(
          'structure-profit',
          'structure',
          '利润结构分析：各子公司/业务板块对集团总利润的贡献占比',
          '集团利润结构占比',
          '各子公司利润贡献占比',
          '利润占比',
          '%',
          '利润金额',
          names,
          'high',
          '展示各业务板块利润贡献结构，识别利润核心来源，评估业务结构合理性',
          ['与营收结构对比分析，判断利润贡献度', '识别高盈利/低盈利业务板块']
        )
      );

      advice.push(
        createPieChartAdvice(
          'structure-asset',
          'structure',
          '资产结构分析：各子公司资产规模占集团总资产的比例',
          '集团资产结构占比',
          '各子公司资产规模占比',
          '资产占比',
          '%',
          '资产金额',
          names,
          'medium',
          '展示集团资产在各子公司的分布情况，反映资源配置结构',
          ['资产规模与利润贡献对比，判断资产使用效率']
        )
      );
    }
  }

  return advice;
}

export function generateComparisonVisualization(
  summary: PeerAnalysisSummary
): VisualizationAdvice[] {
  const advice: VisualizationAdvice[] = [];

  if (summary.benchmarks.length > 0) {
    const benchmarkSeries = summary.benchmarks.map((b) => ({
      name: b.ratioName,
      description: `本企业${b.ratioName}为${b.companyValue ?? 'N/A'}${b.ratioUnit}，行业均值${b.industryMean.toFixed(2)}${b.ratioUnit}`,
    }));

    advice.push(
      createBarChartAdvice(
      'comparison-overall',
      'comparison',
      '同业对标全景：本企业核心财务指标与行业对比，直观展示各项指标的行业位置',
      '核心指标同业对标',
      '本企业 vs 行业平均',
      '财务指标',
      '指标值',
      '指标值',
      summary.benchmarks[0]?.ratioUnit || '%',
      benchmarkSeries,
      'high',
      '一站式对比本企业与行业平均水平的差异，快速识别优势与短板指标',
      [
        '本企业用品牌色，行业平均用灰色',
        '可增加行业中位数、75分位值参考线',
        '标注优势/待改善指标用颜色区分',
      ]
    )
  );

    const topBenchmarks = summary.benchmarks
      .filter((b) => b.percentileLevel === 'top10' || b.percentileLevel === 'top25')
      .slice(0, 5);
    if (topBenchmarks.length > 0) {
      const topSeries = topBenchmarks.map((b) => ({
        name: b.ratioName,
        description: `行业排名前25%，${b.percentileText}`,
      }));
      advice.push(
        createBarChartAdvice(
          'comparison-strong',
          'comparison',
          '领先指标对标：行业领先指标与行业标杆企业对比，展示竞争优势',
          '领先指标行业对标',
          '本企业 vs 行业标杆',
          '指标名称',
          '指标值',
          '指标值',
          topBenchmarks[0]?.ratioUnit || '%',
          topSeries,
          'high',
          '突出展示企业优势指标在行业中的领先地位，对标行业Top3标杆企业',
          [
            '显示行业最优值用绿色标注',
            '本企业值用品牌强调色',
          ]
        )
      );
    }

    const weakBenchmarks = summary.benchmarks
      .filter((b) => b.percentileLevel === 'bottom50' || b.percentileLevel === 'bottom25')
      .slice(0, 5);
    if (weakBenchmarks.length > 0) {
      const weakSeries = weakBenchmarks.map((b) => ({
        name: b.ratioName,
        description: `行业后50%，${b.percentileText}`,
      }));
      advice.push(
        createBarChartAdvice(
          'comparison-weak',
          'comparison',
          '待改善指标对标：落后指标与行业平均/标杆对比，明确改进方向',
          '待改善指标行业对标',
          '本企业 vs 行业平均',
          '指标名称',
          '指标值',
          '指标值',
          weakBenchmarks[0]?.ratioUnit || '%',
          weakSeries,
          'high',
          '清晰展示待改善指标与行业平均水平的差距，为管理层明确改进方向与目标值',
          [
            '标注差距用警示色（橙色/红色',
            '显示行业均值作为目标参考线',
          ]
        )
      );
    }
  }

  return advice;
}

export function generateAllVisualizationAdvice(
  ratios: FinancialRatio[],
  summary: PeerAnalysisSummary,
  subsidiaries: SubsidiaryFinancialData[]
): VisualizationAdvice[] {
  const trendAdvice = generateTrendVisualization(ratios);
  const structureAdvice = generateStructureVisualization(subsidiaries);
  const comparisonAdvice = generateComparisonVisualization(summary);

  return [...trendAdvice, ...structureAdvice, ...comparisonAdvice];
}

export function getChartTypeIcon(chartType: ChartType): string {
  const icons: Record<ChartType, string> = {
    line: '📈',
    bar: '📊',
    pie: '🥧',
    waterfall: '🔻',
    column: '📶',
    area: '📉',
  };
  return icons[chartType];
}

export function getCategoryIcon(category: AnalysisCategory): string {
  const icons: Record<AnalysisCategory, string> = {
    trend: '📈',
    structure: '🏗️',
    comparison: '⚖️',
    composition: '🧩',
    distribution: '📊',
  };
  return icons[category];
}

export function getPriorityLabel(priority: 'high' | 'medium' | 'low'): string {
  return {
    high: '优先推荐',
    medium: '可选推荐',
    low: '辅助参考',
  }[priority];
}

export function getPriorityColorClass(priority: 'high' | 'medium' | 'low'): string {
  return {
    high: 'bg-accent-500',
    medium: 'bg-brand-500',
    low: 'bg-neutral-400',
  }[priority];
}

export function getPriorityTextClass(priority: 'high' | 'medium' | 'low'): string {
  return {
    high: 'text-accent-600',
    medium: 'text-brand-600',
    low: 'text-neutral-500',
  }[priority];
}
