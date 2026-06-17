import { useState } from 'react';
import { Shield, TrendingUp, Gauge, Rocket, ChevronDown, ChevronUp, Lightbulb, Calculator, Info } from 'lucide-react';
import { useFinancialStore } from '@/store/useFinancialStore';
import { getRatiosByCategory } from '@/utils/financial/calculator';
import {
  formatNumber,
  formatPercent,
  formatTimes,
  formatTurns,
  formatDays,
} from '@/utils/format';
import { cn } from '@/lib/utils';
import type { RatioCategory, FinancialRatio, InterpretationLevel } from '@/types/financial';
import type { LucideIcon } from 'lucide-react';
import PeerBenchmark from '@/components/benchmark/PeerBenchmark';

const categoryConfig: Record<RatioCategory, { label: string; icon: LucideIcon; color: string; desc: string }> = {
  solvency: { label: '偿债能力', icon: Shield, color: 'brand', desc: '评估企业偿还到期债务的能力' },
  profitability: { label: '盈利能力', icon: TrendingUp, color: 'accent', desc: '衡量企业赚取利润的效率' },
  efficiency: { label: '运营效率', icon: Gauge, color: 'warn', desc: '反映企业资产运营与周转速度' },
  growth: { label: '成长能力', icon: Rocket, color: 'brand', desc: '体现企业规模与利润的增长态势' },
};

const levelTextMap: Record<InterpretationLevel, string> = {
  excellent: '优秀',
  good: '良好',
  normal: '一般',
  warning: '预警',
  danger: '危险',
};

const levelColorMap: Record<InterpretationLevel, string> = {
  excellent: 'chip-excellent',
  good: 'chip-good',
  normal: 'chip-normal',
  warning: 'chip-warning',
  danger: 'chip-danger',
};

function formatRatioValue(ratio: FinancialRatio): string {
  if (ratio.value === null) return '—';
  switch (ratio.unit) {
    case '%':
      return formatPercent(ratio.value);
    case '倍':
      return formatTimes(ratio.value);
    case '次':
      return formatTurns(ratio.value);
    case '天':
      return formatDays(ratio.value);
    default:
      return formatNumber(ratio.value);
  }
}

function RatioCard({ ratio }: { ratio: FinancialRatio }) {
  const [expanded, setExpanded] = useState(false);
  const { openSourcePanel } = useFinancialStore();

  const handleOpenSource = () => {
    if (!ratio.calculation) return;
    openSourcePanel({
      title: ratio.name,
      formula: ratio.formula,
      steps: ratio.calculation.steps,
      numerator: ratio.calculation.numerator,
      denominator: ratio.calculation.denominator,
    });
  };

  const getStatusBarColor = () => {
    if (!ratio.benchmark || ratio.value === null) return 'bg-neutral-200';
    const { level } = ratio.interpretation;
    if (level === 'excellent' || level === 'good') return 'bg-accent-500';
    if (level === 'warning') return 'bg-warn-500';
    if (level === 'danger') return 'bg-danger-500';
    return 'bg-brand-400';
  };

  const prevDisplay =
    ratio.previousValue !== null
      ? ratio.unit === '%'
        ? formatPercent(ratio.previousValue)
        : ratio.unit === '倍'
        ? formatTimes(ratio.previousValue)
        : ratio.unit === '次'
        ? formatTurns(ratio.previousValue)
        : ratio.unit === '天'
        ? formatDays(ratio.previousValue)
        : formatNumber(ratio.previousValue)
      : '—';

  return (
    <div className="card-base p-5 animate-fade-in-up">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-display font-semibold text-neutral-800">{ratio.name}</h4>
            <span className={cn('chip !text-[10px]', levelColorMap[ratio.interpretation.level])}>
              {levelTextMap[ratio.interpretation.level]}
            </span>
          </div>
          <p className="text-xs text-neutral-500 truncate">{ratio.interpretation.summary}</p>
        </div>
        <button
          onClick={handleOpenSource}
          className="shrink-0 p-2 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
          title="查看计算过程与数据来源"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="font-mono text-3xl font-bold text-neutral-800">{formatRatioValue(ratio)}</div>
          {ratio.previousValue !== null && (
            <div className="text-xs text-neutral-500 mt-1">上期：{prevDisplay}</div>
          )}
        </div>
        {ratio.benchmark && (
          <div className="text-right">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">参考</div>
            <div className="text-xs font-medium text-neutral-600">
              {ratio.benchmark.higherIsBetter ? '≥' : '≤'}
              {ratio.unit === '%'
                ? formatPercent(ratio.benchmark.good)
                : `${ratio.benchmark.good}${ratio.unit}`}
            </div>
          </div>
        )}
      </div>

      <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden mb-4">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getStatusBarColor())}
          style={{
            width: ratio.value !== null && ratio.benchmark
              ? `${Math.min(100, Math.abs(ratio.value) / (ratio.benchmark.good * 1.5) * 100)}%`
              : '0%',
          }}
        />
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-500 hover:text-brand-700 hover:bg-neutral-50 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5" />
          通俗解读
        </span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 animate-fade-in-up">
          <div className="p-3 rounded-lg bg-accent-50/50 border border-accent-100">
            <p className="text-sm text-neutral-700 leading-relaxed">
              {ratio.interpretation.detail}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-brand-50/50 border border-brand-100">
            <div className="text-[10px] font-medium text-brand-600 uppercase tracking-wider mb-1">
              生活化类比
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed">
              {ratio.interpretation.analogy}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
              <Calculator className="w-3 h-3" />
              计算公式
            </div>
            <p className="font-mono text-sm text-neutral-700">{ratio.formula}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Ratios() {
  const [activeCategory, setActiveCategory] = useState<RatioCategory | 'all'>('all');
  const { ratios } = useFinancialStore();
  const categorized = getRatiosByCategory(ratios);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h2 className="section-title">财务比率分析</h2>
        <p className="section-subtitle">
          四大类核心财务比率计算，每项指标配通俗化解读与生活化类比，所有数值均可追溯计算过程与数据来源。
        </p>
      </div>

      <div className="flex flex-wrap gap-2 animate-fade-in-up stagger-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeCategory === 'all'
              ? 'bg-brand-gradient text-white shadow-sm'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-200 hover:text-brand-700'
          )}
        >
          全部（{ratios.length}）
        </button>
        {(Object.keys(categoryConfig) as RatioCategory[]).map((cat) => {
          const cfg = categoryConfig[cat];
          const Icon = cfg.icon;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeCategory === cat
                  ? 'bg-brand-gradient text-white shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-200 hover:text-brand-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {cfg.label}（{categorized[cat].length}）
            </button>
          );
        })}
      </div>

      {(Object.keys(categoryConfig) as RatioCategory[])
        .filter((cat) => activeCategory === 'all' || activeCategory === cat)
        .map((cat) => {
          const cfg = categoryConfig[cat];
          const Icon = cfg.icon;
          const list = categorized[cat];
          if (activeCategory === 'all' && list.length === 0) return null;
          return (
            <div key={cat} className="space-y-3 animate-fade-in-up">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-brand-600" />
                <h3 className="font-display text-lg font-semibold text-brand-700">{cfg.label}</h3>
                <span className="text-xs text-neutral-500">{cfg.desc}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((ratio) => (
                  <RatioCard key={ratio.id} ratio={ratio} />
                ))}
              </div>
            </div>
          );
        })}

      <div className="pt-6 mt-6 border-t border-neutral-200">
        <PeerBenchmark />
      </div>
    </div>
  );
}
