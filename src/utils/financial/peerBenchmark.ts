import type {
  PeerCompany,
  PeerBenchmarkResult,
  PeerAnalysisSummary,
  FinancialRatio,
  FinancialData,
  PercentileLevel,
  IndustryInfo,
  SubsidiaryFinancialData,
  SubsidiaryPeerAnalysis,
} from '@/types/financial';
import { getPeerCompaniesByIndustry, detectIndustryInfo } from '@/data/mockPeerCompanies';
import { getLatestPair } from './calculator';

export function percentile(sortedValues: number[], value: number): number {
  if (sortedValues.length === 0) return 50;
  let count = 0;
  for (const v of sortedValues) {
    if (v <= value) count++;
  }
  return (count / sortedValues.length) * 100;
}

export function quantile(sortedValues: number[], q: number): number {
  if (sortedValues.length === 0) return 0;
  const pos = (sortedValues.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedValues[base + 1] !== undefined) {
    return sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base]);
  }
  return sortedValues[base];
}

export function getPercentileLevel(
  pct: number,
  higherIsBetter: boolean
): PercentileLevel {
  if (higherIsBetter) {
    if (pct >= 90) return 'top10';
    if (pct >= 75) return 'top25';
    if (pct >= 50) return 'top50';
    if (pct >= 25) return 'bottom50';
    return 'bottom25';
  } else {
    const reversed = 100 - pct;
    if (reversed >= 90) return 'top10';
    if (reversed >= 75) return 'top25';
    if (reversed >= 50) return 'top50';
    if (reversed >= 25) return 'bottom50';
    return 'bottom25';
  }
}

export function getPercentileText(level: PercentileLevel, higherIsBetter: boolean): string {
  const betterText = higherIsBetter ? '前' : '后';
  const worseText = higherIsBetter ? '后' : '前';
  switch (level) {
    case 'top10':
      return `行业${betterText}10%，极具竞争力`;
    case 'top25':
      return `行业${betterText}25%，表现优秀`;
    case 'top50':
      return `行业${betterText}50%，处于中等偏上`;
    case 'bottom50':
      return `行业${worseText}50%，有待提升`;
    case 'bottom25':
      return `行业${worseText}25%，亟需改善`;
  }
}

export function getPercentileColorClass(level: PercentileLevel): string {
  switch (level) {
    case 'top10':
      return 'chip-excellent';
    case 'top25':
      return 'chip-good';
    case 'top50':
      return 'chip-normal';
    case 'bottom50':
      return 'chip-warning';
    case 'bottom25':
      return 'chip-danger';
  }
}

const BENCHMARK_RATIO_CONFIG: Record<
  string,
  { name: string; unit: string; higherIsBetter: boolean }
> = {
  'gross-margin': { name: '毛利率', unit: '%', higherIsBetter: true },
  'net-margin': { name: '净利率', unit: '%', higherIsBetter: true },
  'debt-ratio': { name: '资产负债率', unit: '%', higherIsBetter: false },
  'inventory-turnover': { name: '存货周转率', unit: '次', higherIsBetter: true },
  'asset-turnover': { name: '总资产周转率', unit: '次', higherIsBetter: true },
  'roe': { name: 'ROE (净资产收益率)', unit: '%', higherIsBetter: true },
  'current-ratio': { name: '流动比率', unit: '倍', higherIsBetter: true },
};

export function calculateBenchmarkForRatio(
  ratioId: string,
  companyValue: number | null,
  peers: PeerCompany[]
): PeerBenchmarkResult | null {
  const config = BENCHMARK_RATIO_CONFIG[ratioId];
  if (!config) return null;

  const validPeers = peers.filter((p) => p.ratios[ratioId] !== undefined && p.ratios[ratioId] !== null);
  if (validPeers.length === 0) return null;

  const peerValues = validPeers
    .map((p) => p.ratios[ratioId])
    .filter((v): v is number => v !== undefined && v !== null);

  const sortedValues = [...peerValues].sort((a, b) => a - b);

  const min = sortedValues[0];
  const max = sortedValues[sortedValues.length - 1];
  const mean = peerValues.reduce((s, v) => s + v, 0) / peerValues.length;
  const median = quantile(sortedValues, 0.5);
  const p25 = quantile(sortedValues, 0.25);
  const p75 = quantile(sortedValues, 0.75);

  let pct = 50;
  if (companyValue !== null && companyValue !== undefined) {
    pct = percentile(sortedValues, companyValue);
  }

  const level = getPercentileLevel(pct, config.higherIsBetter);
  const text = getPercentileText(level, config.higherIsBetter);

  const topPeers = validPeers
    .map((p) => ({ name: p.name, value: p.ratios[ratioId] }))
    .sort((a, b) => (config.higherIsBetter ? b.value - a.value : a.value - b.value))
    .slice(0, 3);

  const bottomPeers = validPeers
    .map((p) => ({ name: p.name, value: p.ratios[ratioId] }))
    .sort((a, b) => (config.higherIsBetter ? a.value - b.value : b.value - a.value))
    .slice(0, 3);

  return {
    ratioId,
    ratioName: config.name,
    ratioUnit: config.unit,
    companyValue,
    industryMin: min,
    industryMax: max,
    industryMean: mean,
    industryMedian: median,
    industryP25: p25,
    industryP75: p75,
    percentile: pct,
    percentileLevel: level,
    percentileText: text,
    higherIsBetter: config.higherIsBetter,
    sampleCount: validPeers.length,
    topPeers,
    bottomPeers,
  };
}

export function runPeerBenchmarkAnalysis(
  data: FinancialData,
  ratios: FinancialRatio[]
): PeerAnalysisSummary {
  const bsPair = getLatestPair(data.balanceSheets);
  const isPair = getLatestPair(data.incomeStatements);
  const bs = bsPair.current;
  const is = isPair.current;

  const industryInfo: IndustryInfo = detectIndustryInfo({
    revenue: is?.revenue,
    totalAssets: bs?.totalAssets,
  });

  const peers = getPeerCompaniesByIndustry(industryInfo.industry, industryInfo.scale);

  const ratioIdToValue = new Map<string, number | null>();
  for (const r of ratios) {
    ratioIdToValue.set(r.id, r.value);
  }

  const targetRatioIds = Object.keys(BENCHMARK_RATIO_CONFIG);
  const benchmarks: PeerBenchmarkResult[] = [];

  for (const id of targetRatioIds) {
    const companyVal = ratioIdToValue.get(id);
    const result = calculateBenchmarkForRatio(id, companyVal ?? null, peers);
    if (result) {
      benchmarks.push(result);
    }
  }

  let topTierCount = 0;
  let midTierCount = 0;
  let bottomTierCount = 0;

  for (const b of benchmarks) {
    if (b.percentileLevel === 'top10' || b.percentileLevel === 'top25') {
      topTierCount++;
    } else if (b.percentileLevel === 'top50') {
      midTierCount++;
    } else {
      bottomTierCount++;
    }
  }

  return {
    industryInfo,
    totalPeers: peers.length,
    topTierCount,
    midTierCount,
    bottomTierCount,
    benchmarks,
  };
}

export function runSubsidiaryBenchmarkAnalysis(
  subsidiary: SubsidiaryFinancialData
): SubsidiaryPeerAnalysis {
  const industryInfo: IndustryInfo = {
    industry: subsidiary.industry,
    industryLabel: subsidiary.industryLabel,
    scale: subsidiary.scale,
    scaleLabel: subsidiary.scaleLabel,
  };

  const peers = getPeerCompaniesByIndustry(subsidiary.industry, subsidiary.scale);

  const ratioIdToValue = new Map<string, number | null>();
  for (const r of subsidiary.ratios) {
    ratioIdToValue.set(r.id, r.value);
  }

  const targetRatioIds = Object.keys(BENCHMARK_RATIO_CONFIG);
  const benchmarks: PeerBenchmarkResult[] = [];

  for (const id of targetRatioIds) {
    const companyVal = ratioIdToValue.get(id);
    const result = calculateBenchmarkForRatio(id, companyVal ?? null, peers);
    if (result) {
      benchmarks.push(result);
    }
  }

  let topTierCount = 0;
  let midTierCount = 0;
  let bottomTierCount = 0;

  for (const b of benchmarks) {
    if (b.percentileLevel === 'top10' || b.percentileLevel === 'top25') {
      topTierCount++;
    } else if (b.percentileLevel === 'top50') {
      midTierCount++;
    } else {
      bottomTierCount++;
    }
  }

  return {
    subsidiaryId: subsidiary.id,
    subsidiaryName: subsidiary.name,
    summary: {
      industryInfo,
      totalPeers: peers.length,
      topTierCount,
      midTierCount,
      bottomTierCount,
      benchmarks,
    },
  };
}

export function runAllSubsidiariesBenchmarkAnalysis(
  subsidiaries: SubsidiaryFinancialData[]
): SubsidiaryPeerAnalysis[] {
  return subsidiaries.map((sub) => runSubsidiaryBenchmarkAnalysis(sub));
}

export function findWeakSubsidiaries(
  analyses: SubsidiaryPeerAnalysis[],
  threshold = 0.5
): SubsidiaryPeerAnalysis[] {
  return analyses.filter((a) => {
    const total = a.summary.benchmarks.length;
    if (total === 0) return false;
    return a.summary.bottomTierCount / total >= threshold;
  });
}

export function findStrongSubsidiaries(
  analyses: SubsidiaryPeerAnalysis[],
  threshold = 0.6
): SubsidiaryPeerAnalysis[] {
  return analyses.filter((a) => {
    const total = a.summary.benchmarks.length;
    if (total === 0) return false;
    return a.summary.topTierCount / total >= threshold;
  });
}
