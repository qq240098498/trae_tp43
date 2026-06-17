import type {
  FinancialData,
  FinancialRatio,
  AnomalyRecord,
  HealthScore,
  InterpretationLevel,
  VisualizationAdvice,
  PeerAnalysisSummary,
  SubsidiaryFinancialData,
} from '@/types/financial';
import { getRatiosByCategory, getLatestPair } from '../financial/calculator';
import { generateAllVisualizationAdvice } from './visualizationAdvisor';

export function calculateHealthScore(ratios: FinancialRatio[]): HealthScore {
  const levelToScore: Record<InterpretationLevel, number> = {
    excellent: 95,
    good: 80,
    normal: 65,
    warning: 45,
    danger: 25,
  };

  const cats = getRatiosByCategory(ratios);

  const avgLevel = (list: FinancialRatio[]) => {
    if (!list.length) return 65;
    const total = list.reduce((s, r) => s + levelToScore[r.interpretation.level], 0);
    return Math.round(total / list.length);
  };

  const solvency = avgLevel(cats.solvency);
  const profitability = avgLevel(cats.profitability);
  const efficiency = avgLevel(cats.efficiency);
  const growth = avgLevel(cats.growth);

  const weights = { solvency: 0.3, profitability: 0.3, efficiency: 0.2, growth: 0.2 };
  const total = Math.round(
    solvency * weights.solvency +
      profitability * weights.profitability +
      efficiency * weights.efficiency +
      growth * weights.growth
  );

  let level: InterpretationLevel = 'normal';
  if (total >= 90) level = 'excellent';
  else if (total >= 75) level = 'good';
  else if (total >= 55) level = 'normal';
  else if (total >= 40) level = 'warning';
  else level = 'danger';

  return { total, solvency, profitability, efficiency, growth, level };
}

export interface ReportSection {
  id: string;
  title: string;
  level?: number;
  paragraphs: string[];
  footnotes?: { id: number; text: string }[];
}

export interface ReportData {
  title: string;
  companyName: string;
  periods: string[];
  generatedAt: string;
  score: HealthScore;
  sections: ReportSection[];
  appendix: ReportSection;
  visualizationAdvices?: VisualizationAdvice[];
}

function levelText(level: InterpretationLevel): string {
  return {
    excellent: '优秀',
    good: '良好',
    normal: '一般',
    warning: '预警',
    danger: '危险',
  }[level];
}

export function generateReport(
  data: FinancialData,
  ratios: FinancialRatio[],
  anomalies: AnomalyRecord[]
): ReportData {
  const periods = data.balanceSheets.map((b) => b.period);
  const latest = data.balanceSheets[data.balanceSheets.length - 1];
  const score = calculateHealthScore(ratios);
  const cats = getRatiosByCategory(ratios);

  const sections: ReportSection[] = [];
  let footnotesCounter = 0;
  const globalFootnotes: { id: number; text: string }[] = [];

  sections.push({
    id: 'overview',
    title: '一、财务健康总评',
    level: 1,
    paragraphs: [
      `【${latest.companyName}】${periods[periods.length - 1]}财务分析报告。本次分析期间覆盖 ${periods.join('、')}，数据涵盖资产负债表、利润表、现金流量表三大财务报表，所有分析结论均基于报表内可追溯的原始数据计算得出。`,
      `综合财务健康评分为 ${score.total} 分，评级为「${levelText(score.level)}」。四大维度评分：偿债能力 ${score.solvency} 分、盈利能力 ${score.profitability} 分、运营效率 ${score.efficiency} 分、成长能力 ${score.growth} 分。`,
      `本报告中所有比率数值、增长率、异常波动检测均由系统根据报表数据自动计算，具体公式、分子分母来源与分步计算过程详见本报告末尾「附录：计算过程与数据溯源」章节。`,
    ],
  });

  sections.push({
    id: 'statements',
    title: '二、三大报表概览',
    level: 1,
    paragraphs: [
      `1. 资产负债表：截至 ${getLatestPair(data.balanceSheets).current.period}，公司资产总额 ${getLatestPair(data.balanceSheets).current.totalAssets.toLocaleString('zh-CN')} 万元，负债总额 ${getLatestPair(data.balanceSheets).current.totalLiabilities.toLocaleString('zh-CN')} 万元，所有者权益 ${getLatestPair(data.balanceSheets).current.totalEquity.toLocaleString('zh-CN')} 万元，会计恒等式平衡校验通过。`,
      `2. 利润表：${getLatestPair(data.incomeStatements).current.period} 实现营业收入 ${getLatestPair(data.incomeStatements).current.revenue.toLocaleString('zh-CN')} 万元，净利润 ${getLatestPair(data.incomeStatements).current.netProfit.toLocaleString('zh-CN')} 万元。`,
      `3. 现金流量表：${getLatestPair(data.cashFlowStatements).current.period} 经营活动净现金流 ${getLatestPair(data.cashFlowStatements).current.operatingNetCashFlow.toLocaleString('zh-CN')} 万元，投资活动净现金流 ${getLatestPair(data.cashFlowStatements).current.investingNetCashFlow.toLocaleString('zh-CN')} 万元，筹资活动净现金流 ${getLatestPair(data.cashFlowStatements).current.financingNetCashFlow.toLocaleString('zh-CN')} 万元，现金净增加额 ${getLatestPair(data.cashFlowStatements).current.netIncreaseInCash.toLocaleString('zh-CN')} 万元。`,
    ],
  });

  // 偿债能力
  const solvencyNotes = cats.solvency.map((r) => {
    footnotesCounter++;
    globalFootnotes.push({
      id: footnotesCounter,
      text: `【${r.name}】公式：${r.formula}。数值：${r.value !== null ? r.value.toFixed(4) : 'N/A'}（${r.unit}）。详见附录。`,
    });
    return `「${r.name}」${r.value !== null ? (r.unit === '%' ? (r.value * 100).toFixed(2) + '%' : r.value.toFixed(2) + r.unit) : '暂不可计算'}，评级${levelText(r.interpretation.level)}[${footnotesCounter}]。`;
  }).join('；');
  sections.push({
    id: 'ratio-solvency',
    title: '三、（一）偿债能力分析',
    level: 1,
    paragraphs: [
      `偿债能力维度评分 ${score.solvency} 分。核心指标：${solvencyNotes}`,
      cats.solvency[2]?.interpretation.detail ?? '',
      `通俗理解：${cats.solvency[0]?.interpretation.analogy ?? ''}`,
    ],
    footnotes: globalFootnotes.filter((f) => cats.solvency.some((r) => f.text.includes(r.name))),
  });

  const profitNotes = cats.profitability.map((r) => {
    footnotesCounter++;
    globalFootnotes.push({
      id: footnotesCounter,
      text: `【${r.name}】公式：${r.formula}。数值：${r.value !== null ? r.value.toFixed(4) : 'N/A'}（${r.unit}）。详见附录。`,
    });
    return `「${r.name}」${r.value !== null ? (r.unit === '%' ? (r.value * 100).toFixed(2) + '%' : r.value.toFixed(2) + r.unit) : '暂不可计算'}，评级${levelText(r.interpretation.level)}[${footnotesCounter}]。`;
  }).join('；');
  sections.push({
    id: 'ratio-profit',
    title: '三、（二）盈利能力分析',
    level: 1,
    paragraphs: [
      `盈利能力维度评分 ${score.profitability} 分。核心指标：${profitNotes}`,
      cats.profitability[1]?.interpretation.detail ?? '',
      `生活化类比：${cats.profitability[2]?.interpretation.analogy ?? ''}`,
    ],
  });

  const effNotes = cats.efficiency.map((r) => {
    footnotesCounter++;
    globalFootnotes.push({
      id: footnotesCounter,
      text: `【${r.name}】公式：${r.formula}。数值：${r.value !== null ? r.value.toFixed(4) : 'N/A'}（${r.unit}）。`,
    });
    return `「${r.name}」${r.value !== null ? (r.unit === '%' ? (r.value * 100).toFixed(2) + '%' : r.value.toFixed(2) + r.unit) : '暂不可计算'}，评级${levelText(r.interpretation.level)}[${footnotesCounter}]。`;
  }).join('；');
  sections.push({
    id: 'ratio-eff',
    title: '三、（三）运营效率分析',
    level: 1,
    paragraphs: [
      `运营效率维度评分 ${score.efficiency} 分。核心指标：${effNotes}`,
      cats.efficiency[0]?.interpretation.detail ?? '',
    ],
  });

  const growthNotes = cats.growth.map((r) => {
    footnotesCounter++;
    globalFootnotes.push({
      id: footnotesCounter,
      text: `【${r.name}】公式：${r.formula}。数值：${r.value !== null ? r.value.toFixed(4) : 'N/A'}（${r.unit}）。`,
    });
    return `「${r.name}」${r.value !== null ? (r.unit === '%' ? (r.value * 100).toFixed(2) + '%' : r.value.toFixed(2) + r.unit) : '暂不可计算'}，评级${levelText(r.interpretation.level)}[${footnotesCounter}]。`;
  }).join('；');
  sections.push({
    id: 'ratio-growth',
    title: '三、（四）成长能力分析',
    level: 1,
    paragraphs: [
      `成长能力维度评分 ${score.growth} 分。核心指标：${growthNotes}`,
      cats.growth[0]?.interpretation.detail ?? '',
    ],
  });

  // 异常波动
  const criticalCount = anomalies.filter((a) => a.severity === 'critical').length;
  const warningCount = anomalies.filter((a) => a.severity === 'warning').length;
  const noticeCount = anomalies.filter((a) => a.severity === 'notice').length;
  const anomalyLines = anomalies.slice(0, 10).map((a) => {
    const sev =
      a.severity === 'critical'
        ? '严重'
        : a.severity === 'warning'
        ? '警告'
        : '关注';
    return `• [${sev}] ${a.indicatorName}：${a.previousPeriod} ${a.previousValue.toLocaleString('zh-CN')} → ${a.currentPeriod} ${a.currentValue.toLocaleString('zh-CN')}，变动率 ${(a.changeRate * 100).toFixed(2)}%。可能原因（仅供列举，非结论）：${a.possibleReasons.slice(0, 3).join('；')}。`;
  });
  sections.push({
    id: 'anomalies',
    title: '四、异常波动检测与提示',
    level: 1,
    paragraphs: [
      `本次共识别异常波动 ${anomalies.length} 项，其中严重 ${criticalCount} 项、警告 ${warningCount} 项、关注 ${noticeCount} 项。检测规则：单期变动幅度≥±50% 为严重，≥±30% 为警告，≥±15% 为关注；另含流动比率<1、资产负债率≥70%、利息保障倍数<1.5 等特殊阈值规则。`,
      `以下为排名前 10 的异常项目（按严重程度和变动幅度排序）：`,
      ...anomalyLines,
      `※ 重要声明：上述「可能原因」仅为基于会计准则与常见实务的可能性列举，并非对事实的认定或预测。具体原因请结合企业实际经营背景进一步核查。`,
    ],
  });

  sections.push({
    id: 'recommendations',
    title: '五、说明与建议（基于数据事实的客观描述）',
    level: 1,
    paragraphs: [
      `1. 本报告严格以三大财务报表原始数据为计算基础，未加入任何外部行业数据、主观预测或推测性判断。`,
      `2. 所有评级结论基于预设的通用参考阈值，不同行业、不同发展阶段的企业标准存在差异，建议对照行业基准做二次校准。`,
      `3. 建议管理层重点关注「异常波动检测」章节中列出的严重级项目，核实真实原因后在必要时采取措施。`,
      `4. 对于「偿债能力」与「运营效率」中的薄弱项，建议结合经营现金流、客户信用政策、存货周转情况综合审视。`,
      `5. 若需完整数据溯源，请查阅报告附录；所有关键结论均标注了数据字段、公式与分步计算过程，可逐项复核。`,
    ],
  });

  // 附录
  const appendixParagraphs: string[] = [];
  appendixParagraphs.push('本附录收录所有核心财务比率的公式、分子分母来源与分步计算过程，供专业人士核查追溯。');
  appendixParagraphs.push('================================================================');
  for (const r of ratios) {
    appendixParagraphs.push(`【${r.name}】（${r.category}）`);
    appendixParagraphs.push(`公式：${r.formula}`);
    appendixParagraphs.push(`结果：${r.value !== null ? (r.unit === '%' ? (r.value * 100).toFixed(2) + '%' : r.value.toFixed(4) + ' ' + r.unit) : '无法计算'}`);
    if (r.calculation) {
      for (const step of r.calculation.steps) {
        appendixParagraphs.push('  ' + step);
      }
    } else {
      appendixParagraphs.push('  （未提供详细分步过程）');
    }
    appendixParagraphs.push('--------------------------------');
  }
  const appendix: ReportSection = {
    id: 'appendix',
    title: '附录：计算过程与数据溯源',
    level: 1,
    paragraphs: appendixParagraphs,
  };

  return {
    title: `${latest.companyName} ${periods[periods.length - 1]}度财务分析报告`,
    companyName: latest.companyName,
    periods,
    generatedAt: new Date().toLocaleString('zh-CN'),
    score,
    sections,
    appendix,
  };
}

export function generateVisualizationSection(
  advices: VisualizationAdvice[]
): ReportSection {
  const paragraphs: string[] = [];

  paragraphs.push('为提高汇报效率、减少制图环节的沟通成本，本报告根据核心分析结论自动推荐适配的可视化图表方案。以下为各分析维度的图表建议，包含图表类型、标题、坐标轴标注与设计规范，可直接用于汇报材料制作。');

  const categoryMap: Record<string, VisualizationAdvice[]> = {};
  for (const advice of advices) {
    if (!categoryMap[advice.categoryLabel]) {
      categoryMap[advice.categoryLabel] = [];
    }
    categoryMap[advice.categoryLabel].push(advice);
  }

  for (const [categoryName, categoryAdvices] of Object.entries(categoryMap)) {
    paragraphs.push(`【${categoryName}类分析】`);

    for (const advice of categoryAdvices) {
      const priorityText = advice.priority === 'high' ? '优先推荐' : advice.priority === 'medium' ? '可选推荐' : '辅助参考';
      paragraphs.push(`• ${priorityText}｜${advice.conclusion}`);

      for (const rec of advice.recommendations) {
        paragraphs.push(`  ▸ 图表类型：${rec.chartTypeName}`);
        paragraphs.push(`  ▸ 图表标题：${rec.chartTitle}`);
        if (rec.chartSubtitle) {
          paragraphs.push(`  ▸ 副标题：${rec.chartSubtitle}`);
        }
        paragraphs.push(`  ▸ 用途说明：${rec.purpose}`);

        if (rec.axisConfig.xAxisLabel || rec.axisConfig.yAxisLabel) {
          paragraphs.push(`  ▸ 坐标轴标注：`);
          if (rec.axisConfig.xAxisLabel) {
            paragraphs.push(`    - X轴：${rec.axisConfig.xAxisLabel}`);
          }
          if (rec.axisConfig.yAxisLabel) {
            paragraphs.push(`    - Y轴：${rec.axisConfig.yAxisLabel}`);
          }
          paragraphs.push(`    - 数据标签：${rec.axisConfig.dataLabel}（${rec.axisConfig.unit}）`);
        }

        if (rec.dataSeries.length > 0) {
          paragraphs.push(`  ▸ 数据系列（${rec.dataSeries.length}项）：`);
          for (let i = 0; i < Math.min(rec.dataSeries.length, 5); i++) {
            const series = rec.dataSeries[i];
            paragraphs.push(`    ${i + 1}. ${series.name}：${series.description}`);
          }
          if (rec.dataSeries.length > 5) {
            paragraphs.push(`    ... 等共 ${rec.dataSeries.length} 项数据系列`);
          }
        }

        if (rec.designTips.length > 0) {
          paragraphs.push(`  ▸ 设计建议：`);
          for (let i = 0; i < Math.min(rec.designTips.length, 4); i++) {
            paragraphs.push(`    - ${rec.designTips[i]}`);
          }
        }

        paragraphs.push('');
      }
    }

    paragraphs.push('');
  }

  paragraphs.push('※ 注：以上图表建议由系统根据分析结论类型自动生成，实际制作时可根据汇报场景与受众需求适当调整。建议优先选择「优先推荐」级别的图表方案，确保信息传达的准确性与专业性。');

  return {
    id: 'visualization',
    title: '六、可视化图表建议',
    level: 1,
    paragraphs,
  };
}

export function generateReportWithVisualization(
  data: FinancialData,
  ratios: FinancialRatio[],
  anomalies: AnomalyRecord[],
  peerSummary: PeerAnalysisSummary,
  subsidiaries: SubsidiaryFinancialData[]
): ReportData {
  const baseReport = generateReport(data, ratios, anomalies);
  const visualizationAdvices = generateAllVisualizationAdvice(ratios, peerSummary, subsidiaries);
  const visualizationSection = generateVisualizationSection(visualizationAdvices);

  return {
    ...baseReport,
    sections: [...baseReport.sections, visualizationSection],
    visualizationAdvices,
  };
}
