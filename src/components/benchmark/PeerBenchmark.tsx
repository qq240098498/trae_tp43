import { useState } from 'react';
import {
  Building2,
  Users,
  TrendingUp,
  Award,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Target,
  Info,
} from 'lucide-react';
import { useFinancialStore } from '@/store/useFinancialStore';
import { runPeerBenchmarkAnalysis, getPercentileColorClass } from '@/utils/financial/peerBenchmark';
import {
  formatPercent,
  formatTimes,
  formatTurns,
  formatNumber,
} from '@/utils/format';
import { cn } from '@/lib/utils';
import type { PeerBenchmarkResult, PeerAnalysisSummary } from '@/types/financial';
import type { LucideIcon } from 'lucide-react';

function formatBenchmarkValue(value: number | null, unit: string): string {
  if (value === null || value === undefined) return '—';
  switch (unit) {
    case '%':
      return formatPercent(value);
    case '倍':
      return formatTimes(value);
    case '次':
      return formatTurns(value);
    default:
      return formatNumber(value);
  }
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  subLabel,
  colorClass,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subLabel?: string;
  colorClass: string;
}) {
  return (
    <div className="card-base p-4 flex items-start gap-3">
      <div className={cn('p-2.5 rounded-xl shrink-0', colorClass)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-neutral-500 mb-0.5">{label}</div>
        <div className="font-display text-xl font-semibold text-neutral-800">{value}</div>
        {subLabel && <div className="text-[11px] text-neutral-400 mt-0.5">{subLabel}</div>}
      </div>
    </div>
  );
}

function BenchmarkBar({ benchmark }: { benchmark: PeerBenchmarkResult }) {
  const {
    companyValue,
    industryMin,
    industryMax,
    industryP25,
    industryMedian,
    industryP75,
    percentile,
    higherIsBetter,
  } = benchmark;

  const range = industryMax - industryMin;
  const safeRange = range === 0 ? 1 : range;

  const p25Pct = ((industryP25 - industryMin) / safeRange) * 100;
  const p50Pct = ((industryMedian - industryMin) / safeRange) * 100;
  const p75Pct = ((industryP75 - industryMin) / safeRange) * 100;

  let companyPct = 0;
  if (companyValue !== null && companyValue !== undefined) {
    companyPct = Math.max(0, Math.min(100, ((companyValue - industryMin) / safeRange) * 100));
  }

  const getCompanyColor = () => {
    if (!higherIsBetter) {
      if (percentile >= 75) return 'bg-accent-500';
      if (percentile >= 50) return 'bg-brand-500';
      if (percentile >= 25) return 'bg-warn-500';
      return 'bg-danger-500';
    }
    if (percentile >= 75) return 'bg-accent-500';
    if (percentile >= 50) return 'bg-brand-500';
    if (percentile >= 25) return 'bg-warn-500';
    return 'bg-danger-500';
  };

  return (
    <div className="space-y-2">
      <div className="relative h-10">
        <div className="absolute top-0 bottom-0 left-0 right-0 flex">
          <div
            className="h-full bg-danger-100/50"
            style={{ width: `${p25Pct}%` }}
          />
          <div
            className="h-full bg-warn-100/50"
            style={{ width: `${p50Pct - p25Pct}%` }}
          />
          <div
            className="h-full bg-brand-100/50"
            style={{ width: `${p75Pct - p50Pct}%` }}
          />
          <div
            className="h-full bg-accent-100/50"
            style={{ width: `${100 - p75Pct}%` }}
          />
        </div>

        <div
          className="absolute top-0 bottom-0 w-0.5 bg-neutral-300"
          style={{ left: `${p25Pct}%` }}
          title="25分位"
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-neutral-400"
          style={{ left: `${p50Pct}%` }}
          title="中位数"
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-neutral-300"
          style={{ left: `${p75Pct}%` }}
          title="75分位"
        />

        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md z-10 transition-all',
            getCompanyColor()
          )}
          style={{ left: `${companyPct}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
        <span>最差 {formatBenchmarkValue(industryMin, benchmark.ratioUnit)}</span>
        <span>25% {formatBenchmarkValue(industryP25, benchmark.ratioUnit)}</span>
        <span>中位 {formatBenchmarkValue(industryMedian, benchmark.ratioUnit)}</span>
        <span>75% {formatBenchmarkValue(industryP75, benchmark.ratioUnit)}</span>
        <span>最优 {formatBenchmarkValue(industryMax, benchmark.ratioUnit)}</span>
      </div>
    </div>
  );
}

function BenchmarkCard({ benchmark }: { benchmark: PeerBenchmarkResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-base p-5 animate-fade-in-up">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-display font-semibold text-neutral-800">{benchmark.ratioName}</h4>
            <span
              className={cn(
                'chip !text-[10px]',
                getPercentileColorClass(benchmark.percentileLevel)
              )}
            >
              {benchmark.percentileText}
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-2xl font-bold text-neutral-800">
              {formatBenchmarkValue(benchmark.companyValue, benchmark.ratioUnit)}
            </span>
            <span className="text-xs text-neutral-500">
              行业均值 {formatBenchmarkValue(benchmark.industryMean, benchmark.ratioUnit)}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
            分位排名
          </div>
          <div className="font-mono text-lg font-bold text-brand-600">
            {benchmark.higherIsBetter
              ? `Top ${(100 - benchmark.percentile).toFixed(0)}%`
              : `Top ${benchmark.percentile.toFixed(0)}%`}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <BenchmarkBar benchmark={benchmark} />
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-500 hover:text-brand-700 hover:bg-neutral-50 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5" />
          详细对标数据
        </span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 animate-fade-in-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                行业最低
              </div>
              <div className="font-mono text-sm font-semibold text-danger-600">
                {formatBenchmarkValue(benchmark.industryMin, benchmark.ratioUnit)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                25分位
              </div>
              <div className="font-mono text-sm font-semibold text-warn-600">
                {formatBenchmarkValue(benchmark.industryP25, benchmark.ratioUnit)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                75分位
              </div>
              <div className="font-mono text-sm font-semibold text-brand-600">
                {formatBenchmarkValue(benchmark.industryP75, benchmark.ratioUnit)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                行业最高
              </div>
              <div className="font-mono text-sm font-semibold text-accent-600">
                {formatBenchmarkValue(benchmark.industryMax, benchmark.ratioUnit)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-accent-50/50 border border-accent-100">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-accent-600 uppercase tracking-wider mb-2">
                <Award className="w-3 h-3" />
                行业标杆 Top 3
              </div>
              <div className="space-y-1.5">
                {benchmark.topPeers.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-neutral-700 truncate pr-2">
                      {i + 1}. {p.name}
                    </span>
                    <span className="font-mono font-semibold text-accent-700 shrink-0">
                      {formatBenchmarkValue(p.value, benchmark.ratioUnit)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-danger-50/50 border border-danger-100">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-danger-600 uppercase tracking-wider mb-2">
                <AlertTriangle className="w-3 h-3" />
                需关注企业
              </div>
              <div className="space-y-1.5">
                {benchmark.bottomPeers.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-neutral-700 truncate pr-2">
                      {i + 1}. {p.name}
                    </span>
                    <span className="font-mono font-semibold text-danger-700 shrink-0">
                      {formatBenchmarkValue(p.value, benchmark.ratioUnit)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getSummaryAdvice(summary: PeerAnalysisSummary): string {
  const { topTierCount, bottomTierCount, benchmarks } = summary;
  const total = benchmarks.length;

  if (topTierCount >= total * 0.6) {
    return '贵司多项核心指标处于行业领先水平，竞争优势明显。建议继续保持领先策略，同时关注潜在短板指标的持续改善。';
  }
  if (bottomTierCount >= total * 0.5) {
    return '贵司多项核心指标落后于行业平均水平，竞争压力较大。建议重点关注落后指标的深层原因分析，制定针对性改善方案。';
  }
  return '贵司整体处于行业中等水平，部分指标表现优秀但仍有提升空间。建议对标行业标杆企业，有针对性地优化薄弱环节。';
}

export default function PeerBenchmark() {
  const { ratios, data } = useFinancialStore();
  const summary = runPeerBenchmarkAnalysis(data, ratios);

  const advice = getSummaryAdvice(summary);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h2 className="section-title flex items-center gap-2">
          <Target className="w-7 h-7" />
          同业对标分析
        </h2>
        <p className="section-subtitle">
          自动匹配同行业上市公司公开财务数据，对核心指标进行横向对比，直观展示企业在行业中的竞争位置。
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up stagger-1">
        <SummaryCard
          icon={Building2}
          label="所属行业"
          value={summary.industryInfo.industryLabel}
          subLabel={summary.industryInfo.scaleLabel}
          colorClass="bg-brand-100 text-brand-700"
        />
        <SummaryCard
          icon={Users}
          label="对标样本"
          value={`${summary.totalPeers} 家`}
          subLabel="含行业内上市公司"
          colorClass="bg-accent-100 text-accent-700"
        />
        <SummaryCard
          icon={Award}
          label="领先指标"
          value={`${summary.topTierCount} 项`}
          subLabel="行业前25%"
          colorClass="bg-accent-100 text-accent-700"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="待改善指标"
          value={`${summary.bottomTierCount} 项`}
          subLabel="行业后50%"
          colorClass="bg-warn-100 text-warn-700"
        />
      </div>

      <div className="card-base p-5 animate-fade-in-up stagger-2 border-l-4 border-l-brand-500">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-brand-100 text-brand-700 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-brand-700 mb-1">综合分析</div>
            <p className="text-sm text-neutral-700 leading-relaxed">{advice}</p>
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up stagger-3">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-brand-600" />
          <h3 className="font-display text-lg font-semibold text-brand-700">
            核心指标横向对比
          </h3>
          <span className="text-xs text-neutral-500">
            共 {summary.benchmarks.length} 项关键财务指标
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {summary.benchmarks.map((b) => (
            <BenchmarkCard key={b.ratioId} benchmark={b} />
          ))}
        </div>
      </div>
    </div>
  );
}
