import { useState } from 'react';
import {
  LineChart,
  BarChart3,
  PieChart,
  TrendingUp,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  CheckCircle2,
  Copy,
  Sparkles,
} from 'lucide-react';
import type {
  VisualizationAdvice,
  ChartRecommendation,
  ChartType,
  AnalysisCategory,
} from '@/types/financial';
import {
  getPriorityLabel,
  getPriorityColorClass,
  getPriorityTextClass,
} from '@/utils/interpreter/visualizationAdvisor';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const chartTypeIcons: Record<ChartType, LucideIcon> = {
  line: LineChart,
  bar: BarChart3,
  pie: PieChart,
  waterfall: Layers,
  column: BarChart3,
  area: TrendingUp,
};

const categoryIcons: Record<AnalysisCategory, LucideIcon> = {
  trend: TrendingUp,
  structure: PieChart,
  comparison: Award,
  composition: Layers,
  distribution: BarChart3,
};

const categoryColorMap: Record<AnalysisCategory, string> = {
  trend: 'bg-accent-100 text-accent-700',
  structure: 'bg-brand-100 text-brand-700',
  comparison: 'bg-warn-100 text-warn-700',
  composition: 'bg-purple-100 text-purple-700',
  distribution: 'bg-neutral-100 text-neutral-700',
};

function ChartRecommendationCard({ recommendation }: { recommendation: ChartRecommendation }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const ChartIcon = chartTypeIcons[recommendation.chartType];

  const handleCopyTitle = () => {
    navigator.clipboard?.writeText(recommendation.chartTitle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 rounded-xl bg-white border border-neutral-200 hover:border-brand-300 transition-all hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className={cn(
          'p-2.5 rounded-xl shrink-0',
          recommendation.chartType === 'line' && 'bg-accent-50 text-accent-600',
          recommendation.chartType === 'bar' && 'bg-brand-50 text-brand-600',
          recommendation.chartType === 'pie' && 'bg-warn-50 text-warn-600',
          recommendation.chartType === 'waterfall' && 'bg-purple-50 text-purple-600',
          recommendation.chartType === 'column' && 'bg-blue-50 text-blue-600',
          recommendation.chartType === 'area' && 'bg-green-50 text-green-600',
        )}>
          <ChartIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h5 className="font-semibold text-neutral-800 text-sm">{recommendation.chartTypeName}</h5>
            {recommendation.suitableForReport && (
              <span className="chip !text-[10px] bg-accent-50 text-accent-700 border-accent-200 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                适合汇报
              </span>
            )}
          </div>
          <h4 className="font-display font-bold text-base text-neutral-900 mb-1.5">
            {recommendation.chartTitle}
          </h4>
          {recommendation.chartSubtitle && (
            <p className="text-xs text-neutral-500 mb-2">{recommendation.chartSubtitle}</p>
          )}
          <p className="text-xs text-neutral-600 leading-relaxed mb-3">{recommendation.purpose}</p>

          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-500 hover:text-brand-700 hover:bg-neutral-50 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              图表制作规范
            </span>
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expanded && (
            <div className="mt-3 space-y-3 animate-fade-in-up">
              {recommendation.axisConfig.xAxisLabel && (
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-neutral-400 mb-0.5">X轴标注</div>
                      <div className="font-medium text-neutral-700">
                        {recommendation.axisConfig.xAxisLabel}
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-400 mb-0.5">Y轴标注</div>
                      <div className="font-medium text-neutral-700">
                        {recommendation.axisConfig.yAxisLabel}
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-400 mb-0.5">数据标签</div>
                      <div className="font-medium text-neutral-700">
                        {recommendation.axisConfig.dataLabel}
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-400 mb-0.5">数值单位</div>
                      <div className="font-medium text-neutral-700">
                        {recommendation.axisConfig.unit}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {recommendation.dataSeries.length > 0 && (
                <div className="p-3 rounded-lg bg-brand-50/50 border border-brand-100">
                  <div className="text-[10px] font-medium text-brand-600 uppercase tracking-wider mb-2">
                    数据系列
                  </div>
                  <div className="space-y-1.5">
                    {recommendation.dataSeries.map((series, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="font-medium text-neutral-800">• {series.name}</div>
                        <div className="text-neutral-500 text-[11px] ml-3">{series.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-accent-50/50 border border-accent-100">
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-accent-600 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3" />
                  设计建议
                </div>
                <ul className="space-y-1.5">
                  {recommendation.designTips.map((tip, idx) => (
                    <li key={idx} className="text-xs text-neutral-600 flex items-start gap-2">
                      <span className="text-accent-500 mt-0.5">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleCopyTitle}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-medium bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? '已复制标题' : '复制图表标题'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VisualizationCard({ advice }: { advice: VisualizationAdvice }) {
  const [expanded, setExpanded] = useState(false);
  const CategoryIcon = categoryIcons[advice.category];

  return (
    <div className="card-base p-5 animate-fade-in-up">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn('p-2.5 rounded-xl shrink-0', categoryColorMap[advice.category])}>
            <CategoryIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={cn(
                'chip !text-[10px]',
                getPriorityColorClass(advice.priority) + ' text-white'
              )}>
                {getPriorityLabel(advice.priority)}
              </span>
              <span className="text-xs text-neutral-500">{advice.categoryLabel}</span>
            </div>
            <h4 className="font-display font-semibold text-neutral-800 text-sm mb-1">
              {advice.conclusion}
            </h4>
          </div>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-500 hover:text-brand-700 hover:bg-neutral-50 transition-colors mb-3"
      >
        <span className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />
          推荐图表方案（{advice.recommendations.length}种）
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {expanded && (
        <div className="space-y-3 animate-fade-in-up">
          {advice.recommendations.map((rec, idx) => (
            <ChartRecommendationCard key={idx} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function VisualizationAdvisor({ advices }: { advices: VisualizationAdvice[] }) {
  const [filterCategory, setFilterCategory] = useState<AnalysisCategory | 'all'>('all');

  const categories = [
    { id: 'all' as const, label: '全部', icon: Target },
    { id: 'trend' as const, label: '趋势变化', icon: TrendingUp },
    { id: 'structure' as const, label: '结构占比', icon: PieChart },
    { id: 'comparison' as const, label: '同业对比', icon: Award },
  ];

  const filteredAdvices = filterCategory === 'all'
    ? advices
    : advices.filter((a) => a.category === filterCategory);

  const highPriorityCount = advices.filter((a) => a.priority === 'high').length;

  if (advices.length === 0) return null;

  return (
    <div className="card-base p-5 border-l-4 border-l-accent-500 animate-fade-in-up">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent-100 text-accent-700 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-neutral-800">
              可视化图表建议
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              根据分析结论自动推荐适配的图表类型，包含标题、坐标轴标注和设计规范，可直接用于汇报
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-0.5">
            优先推荐
          </div>
          <div className="font-mono text-lg font-bold text-accent-600">
            {highPriorityCount} 项
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = filterCategory === cat.id;
          const count = cat.id === 'all'
            ? advices.length
            : advices.filter((a) => a.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                isActive
                  ? 'bg-brand-gradient text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
              <span className={cn(
                'px-1.5 py-0.5 rounded text-[10px] font-semibold',
                isActive ? 'bg-white/20 text-white' : 'bg-white text-neutral-500'
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAdvices.map((advice) => (
          <VisualizationCard key={advice.id} advice={advice} />
        ))}
      </div>
    </div>
  );
}
