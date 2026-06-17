import { useState, useMemo } from 'react';
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
  Layers,
  GitBranch,
  ArrowUpRight,
  ArrowDownRight,
  Grid3X3,
  ChevronRight,
  PieChart,
  Building,
  Factory,
  Landmark,
  Globe2,
  Box,
} from 'lucide-react';
import { useFinancialStore } from '@/store/useFinancialStore';
import {
  runPeerBenchmarkAnalysis,
  runAllSubsidiariesBenchmarkAnalysis,
  getPercentileColorClass,
  findStrongSubsidiaries,
  findWeakSubsidiaries,
} from '@/utils/financial/peerBenchmark';
import {
  formatPercent,
  formatTimes,
  formatTurns,
  formatNumber,
} from '@/utils/format';
import { cn } from '@/lib/utils';
import type {
  PeerBenchmarkResult,
  PeerAnalysisSummary,
  SubsidiaryPeerAnalysis,
  PercentileLevel,
  SubsidiaryFinancialData,
} from '@/types/financial';
import type { LucideIcon } from 'lucide-react';

type ViewMode = 'group' | 'subsidiaries' | 'comparison';

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

function getPercentileBadgeClass(level: PercentileLevel): string {
  switch (level) {
    case 'top10':
      return 'bg-accent-500';
    case 'top25':
      return 'bg-brand-500';
    case 'top50':
      return 'bg-neutral-400';
    case 'bottom50':
      return 'bg-warn-500';
    case 'bottom25':
      return 'bg-danger-500';
  }
}

function getSubsidiaryIcon(industry: string): LucideIcon {
  switch (industry) {
    case 'manufacturing':
      return Factory;
    case 'finance':
      return Landmark;
    case 'retail':
      return Globe2;
    case 'technology':
      return Box;
    default:
      return Building;
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

interface TreeNodeProps {
  id: string;
  name: string;
  level: number;
  isParent: boolean;
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  analysis: SubsidiaryPeerAnalysis | null;
  groupSummary: PeerAnalysisSummary | null;
  industryLabel: string;
  scaleLabel: string;
  contribution?: {
    revenueRatio: number;
    profitRatio: number;
    assetRatio: number;
  };
  industry: string;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}

function TreeNode({
  id,
  name,
  level,
  isParent,
  isSelected,
  isExpanded,
  hasChildren,
  analysis,
  groupSummary,
  industryLabel,
  scaleLabel,
  contribution,
  industry,
  onToggle,
  onSelect,
}: TreeNodeProps) {
  const Icon = isParent ? Layers : getSubsidiaryIcon(industry);
  const summary = isParent ? groupSummary : analysis?.summary;
  const topCount = summary?.topTierCount ?? 0;
  const bottomCount = summary?.bottomTierCount ?? 0;
  const total = summary?.benchmarks.length ?? 0;
  const strongPct = total > 0 ? (topCount / total) * 100 : 0;
  const weakPct = total > 0 ? (bottomCount / total) * 100 : 0;

  const handleClick = () => {
    if (isParent) {
      onToggle(id);
    } else {
      onSelect(id);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={cn(
          'relative flex items-stretch cursor-pointer transition-all duration-300',
          level === 0 ? 'mb-2' : 'mb-1'
        )}
      >
        {level > 0 && (
          <div className="flex items-stretch">
            <div
              className={cn(
                'w-1 rounded-full mx-2 transition-colors',
                isSelected ? 'bg-brand-500' : 'bg-neutral-200'
              )}
            />
          </div>
        )}

        <div
          className={cn(
            'flex-1 flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300',
            level === 0
              ? 'bg-gradient-to-r from-brand-50 to-brand-100/50 border border-brand-200'
              : 'bg-white border border-neutral-200 hover:border-brand-200',
            isSelected && !isParent && 'ring-2 ring-brand-500 border-brand-400 shadow-md',
            !isParent && 'hover:shadow-card-hover'
          )}
        >
          <div
            className={cn(
              'p-2.5 rounded-xl shrink-0',
              isParent
                ? 'bg-brand-gradient text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600'
            )}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={cn(
                  'font-display font-semibold truncate',
                  level === 0 ? 'text-lg text-brand-800' : 'text-neutral-800'
                )}
              >
                {name}
              </span>
              {isParent && (
                <span className="chip !text-[10px] bg-brand-100 text-brand-700 border-brand-200">
                  <Users className="w-3 h-3 mr-0.5" />
                  母公司
                </span>
              )}
            </div>
            <div className="text-[11px] text-neutral-500">
              {industryLabel} · {scaleLabel}
            </div>
          </div>

          <div className="hidden sm:block shrink-0 min-w-[120px] text-right">
            {contribution && (
              <div className="space-y-1">
                <div className="flex items-center justify-end gap-1.5 text-[10px] text-neutral-500">
                  <PieChart className="w-3 h-3" />
                  <span>营收占比</span>
                  <span className="font-mono font-semibold text-brand-600">
                    {formatPercent(contribution.revenueRatio)}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1.5 text-[10px] text-neutral-500">
                  <span>利润占比</span>
                  <span className="font-mono font-semibold text-accent-600">
                    {formatPercent(contribution.profitRatio)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            {topCount > 0 && (
              <span className="chip !text-[10px] bg-accent-50 text-accent-700 border-accent-200">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {topCount}
              </span>
            )}
            {bottomCount > 0 && (
              <span className="chip !text-[10px] bg-warn-50 text-warn-700 border-warn-200">
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
                {bottomCount}
              </span>
            )}
          </div>

          {hasChildren && isParent && (
            <div className="shrink-0 ml-1">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-brand-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-brand-600" />
              )}
            </div>
          )}
          {!isParent && (
            <div className="shrink-0 ml-1">
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div>
          )}
        </div>
      </div>

      {level > 0 && (
        <div className="ml-5 mb-1">
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 rounded-l-full"
              style={{ width: `${strongPct}%` }}
            />
            <div
              className="h-full bg-warn-500"
              style={{
                left: `${100 - weakPct}%`,
                width: `${weakPct}%`,
                float: 'right',
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
            <span>领先 {strongPct.toFixed(0)}%</span>
            <span>待改善 {weakPct.toFixed(0)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function OrgTreeView({
  groupSummary,
  subsidiaryAnalyses,
  subsidiaries,
  selectedId,
  onSelect,
}: {
  groupSummary: PeerAnalysisSummary;
  subsidiaryAnalyses: SubsidiaryPeerAnalysis[];
  subsidiaries: SubsidiaryFinancialData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const groupId = 'group-parent';

  const sortedAnalyses = useMemo(
    () => [...subsidiaryAnalyses].sort((a, b) => {
      const subA = subsidiaries.find((s) => s.id === a.subsidiaryId);
      const subB = subsidiaries.find((s) => s.id === b.subsidiaryId);
      return (subA?.order ?? 0) - (subB?.order ?? 0);
    }),
    [subsidiaryAnalyses, subsidiaries]
  );

  const handleToggle = () => setExpanded(!expanded);

  const handleSelect = (id: string) => {
    onSelect(id);
  };

  return (
    <div className="card-base p-4">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-5 h-5 text-brand-600" />
        <h3 className="font-display text-base font-semibold text-brand-700">
          组织架构
        </h3>
        <span className="text-xs text-neutral-500">
          点击子公司查看详细对标
        </span>
      </div>

      <div className="space-y-2">
        <TreeNode
          id={groupId}
          name="蓝海智能装备集团"
          level={0}
          isParent={true}
          isSelected={selectedId === null}
          isExpanded={expanded}
          hasChildren={sortedAnalyses.length > 0}
          analysis={null}
          groupSummary={groupSummary}
          industryLabel={groupSummary.industryInfo.industryLabel}
          scaleLabel={groupSummary.industryInfo.scaleLabel}
          industry="manufacturing"
          onToggle={handleToggle}
          onSelect={() => onSelect('')}
        />

        {expanded && (
          <div className="ml-4 mt-2 space-y-2 pl-2 border-l-2 border-dashed border-brand-200">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-2 ml-2">
              子公司 / 业务板块
            </div>
            {sortedAnalyses.map((analysis) => {
              const sub = subsidiaries.find((s) => s.id === analysis.subsidiaryId);
              if (!sub) return null;
              return (
                <TreeNode
                  key={analysis.subsidiaryId}
                  id={analysis.subsidiaryId}
                  name={analysis.subsidiaryName}
                  level={1}
                  isParent={false}
                  isSelected={selectedId === analysis.subsidiaryId}
                  isExpanded={false}
                  hasChildren={false}
                  analysis={analysis}
                  groupSummary={null}
                  industryLabel={analysis.summary.industryInfo.industryLabel}
                  scaleLabel={analysis.summary.industryInfo.scaleLabel}
                  contribution={sub.groupContribution}
                  industry={sub.industry}
                  onToggle={() => {}}
                  onSelect={handleSelect}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SubsidiaryComparisonTable({ analyses }: { analyses: SubsidiaryPeerAnalysis[] }) {
  const ratioNames = [
    { id: 'gross-margin', name: '毛利率', unit: '%' },
    { id: 'net-margin', name: '净利率', unit: '%' },
    { id: 'debt-ratio', name: '资产负债率', unit: '%' },
    { id: 'inventory-turnover', name: '存货周转率', unit: '次' },
    { id: 'roe', name: 'ROE', unit: '%' },
    { id: 'current-ratio', name: '流动比率', unit: '倍' },
  ];

  return (
    <div className="card-base overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider sticky left-0 bg-neutral-50 z-10">
                指标
              </th>
              {analyses.map((a) => (
                <th
                  key={a.subsidiaryId}
                  className="px-4 py-3 text-center text-xs font-medium text-neutral-700 whitespace-nowrap"
                >
                  {a.subsidiaryName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {ratioNames.map((ratio) => {
              const values = analyses.map((a) => {
                const b = a.summary.benchmarks.find((x) => x.ratioId === ratio.id);
                return b || null;
              });

              const validValues = values
                .filter((v): v is PeerBenchmarkResult => v !== null && v.companyValue !== null)
                .map((v) => ({ value: v.companyValue!, higherIsBetter: v.higherIsBetter }));

              if (validValues.length === 0) return null;

              const allSame = validValues.every(
                (v, _, arr) => v.value === arr[0].value
              );

              let bestIdx = -1;
              let worstIdx = -1;

              if (!allSame) {
                const sorted = [...validValues].sort((a, b) => {
                  const dir = a.higherIsBetter ? 1 : -1;
                  return (b.value - a.value) * dir;
                });
                const bestVal = sorted[0].value;
                const worstVal = sorted[sorted.length - 1].value;
                bestIdx = validValues.findIndex((v) => v.value === bestVal);
                worstIdx = validValues.findIndex((v) => v.value === worstVal);
              }

              return (
                <tr key={ratio.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-neutral-700 sticky left-0 bg-white font-medium">
                    {ratio.name}
                  </td>
                  {values.map((b, idx) => {
                    if (!b || b.companyValue === null) {
                      return (
                        <td key={idx} className="px-4 py-3 text-center text-sm text-neutral-400">
                          —
                        </td>
                      );
                    }
                    return (
                      <td key={idx} className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={cn(
                              'font-mono text-sm font-semibold',
                              idx === bestIdx && !allSame && 'text-accent-600',
                              idx === worstIdx && !allSame && 'text-danger-600',
                              idx !== bestIdx && idx !== worstIdx && 'text-neutral-700'
                            )}
                          >
                            {formatBenchmarkValue(b.companyValue, ratio.unit)}
                          </span>
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full',
                              getPercentileBadgeClass(b.percentileLevel)
                            )}
                            title={b.percentileText}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200">
        <div className="flex items-center gap-6 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-500" />
            <span>最优</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            <span>良好</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warn-500" />
            <span>待改善</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-danger-500" />
            <span>落后</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContributionOverview({ subsidiaries }: { subsidiaries: SubsidiaryFinancialData[] }) {
  const sorted = useMemo(
    () =>
      [...subsidiaries].sort(
        (a, b) => (b.groupContribution?.revenueRatio ?? 0) - (a.groupContribution?.revenueRatio ?? 0)
      ),
    [subsidiaries]
  );

  return (
    <div className="card-base p-5">
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-5 h-5 text-brand-600" />
        <h3 className="font-display text-base font-semibold text-brand-700">
          集团贡献度（按营收）
        </h3>
      </div>
      <div className="space-y-3">
        {sorted.map((sub, idx) => {
          const ratio = sub.groupContribution?.revenueRatio ?? 0;
          const Icon = getSubsidiaryIcon(sub.industry);
          return (
            <div key={sub.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-neutral-400 w-4">{idx + 1}</span>
                  <Icon className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span className="text-neutral-700 truncate">{sub.name}</span>
                </div>
                <span className="font-mono font-semibold text-brand-600 shrink-0 ml-2">
                  {formatPercent(ratio)}
                </span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden ml-6">
                <div
                  className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
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
  const { ratios, data, subsidiaries, selectedSubsidiaryId, setSelectedSubsidiaryId } =
    useFinancialStore();

  const [viewMode, setViewMode] = useState<ViewMode>('group');

  const groupSummary = useMemo(() => runPeerBenchmarkAnalysis(data, ratios), [data, ratios]);

  const subsidiaryAnalyses = useMemo(
    () => runAllSubsidiariesBenchmarkAnalysis(subsidiaries),
    [subsidiaries]
  );

  const strongSubs = useMemo(
    () => findStrongSubsidiaries(subsidiaryAnalyses),
    [subsidiaryAnalyses]
  );
  const weakSubs = useMemo(
    () => findWeakSubsidiaries(subsidiaryAnalyses),
    [subsidiaryAnalyses]
  );

  const selectedAnalysis = useMemo(
    () => subsidiaryAnalyses.find((a) => a.subsidiaryId === selectedSubsidiaryId) || null,
    [subsidiaryAnalyses, selectedSubsidiaryId]
  );

  const currentSummary = selectedSubsidiaryId
    ? selectedAnalysis?.summary || null
    : groupSummary;

  const currentName = selectedSubsidiaryId
    ? selectedAnalysis?.subsidiaryName || ''
    : '集团整体';

  const groupAdvice = getSummaryAdvice(groupSummary);

  const handleSubsidiarySelect = (id: string) => {
    if (id === '') {
      setSelectedSubsidiaryId(null);
      setViewMode('group');
    } else {
      setSelectedSubsidiaryId(id);
      setViewMode('subsidiaries');
    }
  };

  const viewModeTabs: { mode: ViewMode; label: string; icon: LucideIcon }[] = [
    { mode: 'group', label: '集团概览', icon: Layers },
    { mode: 'subsidiaries', label: '子公司对标', icon: GitBranch },
    { mode: 'comparison', label: '横向对比', icon: Grid3X3 },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h2 className="section-title flex items-center gap-2">
          <Target className="w-7 h-7" />
          同业对标分析
        </h2>
        <p className="section-subtitle">
          自动匹配同行业上市公司公开财务数据，支持集团整体与各子公司拆分对标，直观展示企业在行业中的竞争位置。
        </p>
      </div>

      <div className="flex flex-wrap gap-2 animate-fade-in-up">
        {viewModeTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = viewMode === tab.mode;
          return (
            <button
              key={tab.mode}
              onClick={() => {
                setViewMode(tab.mode);
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-gradient text-white shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-200 hover:text-brand-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {viewMode === 'group' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-1">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard
                icon={Building2}
                label="所属行业"
                value={groupSummary.industryInfo.industryLabel}
                subLabel={groupSummary.industryInfo.scaleLabel}
                colorClass="bg-brand-100 text-brand-700"
              />
              <SummaryCard
                icon={Users}
                label="对标样本"
                value={`${groupSummary.totalPeers} 家`}
                subLabel="含行业内上市公司"
                colorClass="bg-accent-100 text-accent-700"
              />
              <SummaryCard
                icon={Award}
                label="领先指标"
                value={`${groupSummary.topTierCount} 项`}
                subLabel="行业前25%"
                colorClass="bg-accent-100 text-accent-700"
              />
              <SummaryCard
                icon={AlertTriangle}
                label="待改善指标"
                value={`${groupSummary.bottomTierCount} 项`}
                subLabel="行业后50%"
                colorClass="bg-warn-100 text-warn-700"
              />
            </div>

            <div className="card-base p-5 border-l-4 border-l-brand-500">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-brand-100 text-brand-700 shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-brand-700 mb-1">
                    集团整体综合分析
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed">{groupAdvice}</p>
                </div>
              </div>
            </div>

            {(strongSubs.length > 0 || weakSubs.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strongSubs.length > 0 && (
                  <div className="card-base p-4 border-l-4 border-l-accent-500">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-accent-600" />
                      <span className="text-sm font-medium text-accent-700">优势子公司</span>
                      <span className="text-xs text-neutral-500">
                        60%以上指标行业领先
                      </span>
                    </div>
                    <div className="space-y-2">
                      {strongSubs.map((s) => (
                        <div
                          key={s.subsidiaryId}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-neutral-700">{s.subsidiaryName}</span>
                          <span className="chip !text-[10px] bg-accent-50 text-accent-700 border-accent-200">
                            领先 {s.summary.topTierCount} 项
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {weakSubs.length > 0 && (
                  <div className="card-base p-4 border-l-4 border-l-warn-500">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-warn-600" />
                      <span className="text-sm font-medium text-warn-700">需重点关注</span>
                      <span className="text-xs text-neutral-500">
                        50%以上指标落后行业
                      </span>
                    </div>
                    <div className="space-y-2">
                      {weakSubs.map((s) => (
                        <div
                          key={s.subsidiaryId}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-neutral-700">{s.subsidiaryName}</span>
                          <span className="chip !text-[10px] bg-warn-50 text-warn-700 border-warn-200">
                            落后 {s.summary.bottomTierCount} 项
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <OrgTreeView
              groupSummary={groupSummary}
              subsidiaryAnalyses={subsidiaryAnalyses}
              subsidiaries={subsidiaries}
              selectedId={selectedSubsidiaryId}
              onSelect={handleSubsidiarySelect}
            />

            <ContributionOverview subsidiaries={subsidiaries} />
          </div>
        </div>
      )}

      {viewMode === 'comparison' && (
        <div className="animate-fade-in-up stagger-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-600" />
              <h3 className="font-display text-lg font-semibold text-brand-700">
                子公司核心指标横向对比
              </h3>
            </div>
          </div>
          <SubsidiaryComparisonTable analyses={subsidiaryAnalyses} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContributionOverview subsidiaries={subsidiaries} />
            <OrgTreeView
              groupSummary={groupSummary}
              subsidiaryAnalyses={subsidiaryAnalyses}
              subsidiaries={subsidiaries}
              selectedId={selectedSubsidiaryId}
              onSelect={handleSubsidiarySelect}
            />
          </div>
        </div>
      )}

      {viewMode === 'subsidiaries' && currentSummary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up stagger-2">
            <SummaryCard
              icon={Building2}
              label="所属行业"
              value={currentSummary.industryInfo.industryLabel}
              subLabel={currentSummary.industryInfo.scaleLabel}
              colorClass="bg-brand-100 text-brand-700"
            />
            <SummaryCard
              icon={Users}
              label="对标样本"
              value={`${currentSummary.totalPeers} 家`}
              subLabel="含行业内上市公司"
              colorClass="bg-accent-100 text-accent-700"
            />
            <SummaryCard
              icon={Award}
              label="领先指标"
              value={`${currentSummary.topTierCount} 项`}
              subLabel="行业前25%"
              colorClass="bg-accent-100 text-accent-700"
            />
            <SummaryCard
              icon={AlertTriangle}
              label="待改善指标"
              value={`${currentSummary.bottomTierCount} 项`}
              subLabel="行业后50%"
              colorClass="bg-warn-100 text-warn-700"
            />
          </div>

          <div className="card-base p-5 animate-fade-in-up stagger-3 border-l-4 border-l-brand-500">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-brand-100 text-brand-700 shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-brand-700 mb-1">
                  {currentName} 综合分析
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {selectedAnalysis
                    ? getSummaryAdvice(selectedAnalysis.summary)
                    : groupAdvice}
                </p>
              </div>
            </div>
          </div>

          <div className="animate-fade-in-up stagger-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-brand-600" />
              <h3 className="font-display text-lg font-semibold text-brand-700">
                核心指标横向对比
              </h3>
              <span className="text-xs text-neutral-500">
                共 {currentSummary.benchmarks.length} 项关键财务指标
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {currentSummary.benchmarks.map((b) => (
                <BenchmarkCard key={b.ratioId} benchmark={b} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
