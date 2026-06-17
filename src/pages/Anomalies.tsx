import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Filter,
  ChevronDown,
  ChevronUp,
  Info,
  CircleAlert,
  CircleX,
  ArrowRightLeft,
} from 'lucide-react';
import { useFinancialStore } from '@/store/useFinancialStore';
import { formatNumber, formatPercentChange, formatPercent } from '@/utils/format';
import { getAnomalyCounts } from '@/utils/financial/anomaly';
import { cn } from '@/lib/utils';
import type { AnomalySeverity, StatementType } from '@/types/financial';

const severityTextMap: Record<AnomalySeverity, string> = {
  critical: '严重',
  warning: '警告',
  notice: '关注',
};

const severityColorMap: Record<AnomalySeverity, string> = {
  critical: 'chip-critical',
  warning: 'chip-warning',
  notice: 'chip-notice',
};

const severityBgMap: Record<AnomalySeverity, string> = {
  critical: 'bg-danger-50/60 border-danger-200',
  warning: 'bg-warn-50/60 border-warn-200',
  notice: 'bg-neutral-50 border-neutral-200',
};

const statementTextMap: Record<StatementType, string> = {
  balance: '资产负债表',
  income: '利润表',
  cashflow: '现金流量表',
  ratio: '财务比率',
};

export default function Anomalies() {
  const { anomalies, openSourcePanel, ratios } = useFinancialStore();
  const [severityFilter, setSeverityFilter] = useState<AnomalySeverity | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<StatementType | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const counts = getAnomalyCounts(anomalies);

  const filteredAnomalies = useMemo(() => {
    return anomalies.filter((a) => {
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
      if (typeFilter !== 'all' && a.statementType !== typeFilter) return false;
      return true;
    });
  }, [anomalies, severityFilter, typeFilter]);

  const handleClick = (a: (typeof anomalies)[number]) => {
    if (a.statementType === 'ratio') {
      const ratio = ratios.find((r) => r.id === a.fieldKey);
      if (ratio?.calculation) {
        openSourcePanel({
          title: `${a.indicatorName} 异常波动`,
          formula: ratio.formula,
          steps: [
            `指标名称：${a.indicatorName}`,
            `变动率 = (本期值 - 上期值) / 上期值`,
            `本期值: ${formatNumber(a.currentValue)}`,
            `上期值: ${formatNumber(a.previousValue)}`,
            `变动金额: ${formatNumber(a.changeAmount)}`,
            `变动率: ${formatPercent(a.changeRate)}`,
            `检测阈值: ±${(a.threshold * 100).toFixed(0)}%`,
            ...ratio.calculation.steps,
          ],
          numerator: ratio.calculation.numerator,
          denominator: ratio.calculation.denominator,
        });
      }
    } else {
      openSourcePanel({
        title: `${a.indicatorName} 异常波动`,
        formula: '变动率 = (本期值 - 上期值) / 上期值',
        steps: [
          `指标名称：${a.indicatorName}`,
          `数据来源：${a.sourceTrace}`,
          `${a.previousPeriod}: ${formatNumber(a.previousValue)}`,
          `${a.currentPeriod}: ${formatNumber(a.currentValue)}`,
          `变动金额：${formatNumber(a.changeAmount)}`,
          `变动率：${formatPercent(a.changeRate)}`,
          `检测阈值：±${(a.threshold * 100).toFixed(0)}%`,
          `可能原因（仅供参考）：`,
          ...a.possibleReasons.map((r) => `  • ${r}`),
        ],
        numerator: {
          label: `本期 - ${a.indicatorName}`,
          value: a.currentValue,
          source: `${statementTextMap[a.statementType]} - ${a.currentPeriod}`,
        },
        denominator: {
          label: `上期 - ${a.indicatorName}`,
          value: a.previousValue,
          source: `${statementTextMap[a.statementType]} - ${a.previousPeriod}`,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h2 className="section-title">异常波动分析</h2>
        <p className="section-subtitle">
          自动检测关键财务指标的异常波动，按严重程度分级标注。所有异常均提供可能原因参考，并可追溯数据来源。
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up stagger-1">
        <div className="card-base p-4">
          <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">异常总数</div>
          <div className="font-display text-2xl font-bold text-neutral-800">{counts.total}</div>
        </div>
        <div className="card-base p-4 border-l-4 border-l-danger-400">
          <div className="flex items-center gap-1.5 text-xs text-danger-600 uppercase tracking-wide mb-1">
            <CircleX className="w-3.5 h-3.5" /> 严重
          </div>
          <div className="font-display text-2xl font-bold text-danger-700">{counts.critical}</div>
        </div>
        <div className="card-base p-4 border-l-4 border-l-warn-400">
          <div className="flex items-center gap-1.5 text-xs text-warn-600 uppercase tracking-wide mb-1">
            <CircleAlert className="w-3.5 h-3.5" /> 警告
          </div>
          <div className="font-display text-2xl font-bold text-warn-700">{counts.warning}</div>
        </div>
        <div className="card-base p-4 border-l-4 border-l-neutral-400">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 uppercase tracking-wide mb-1">
            <Info className="w-3.5 h-3.5" /> 关注
          </div>
          <div className="font-display text-2xl font-bold text-neutral-700">{counts.notice}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 animate-fade-in-up stagger-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500" />
          <span className="text-sm text-neutral-600">筛选：</span>
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as AnomalySeverity | 'all')}
          className="px-3 py-2 text-sm rounded-lg bg-white border border-neutral-200 text-neutral-700 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        >
          <option value="all">全部严重程度</option>
          <option value="critical">严重</option>
          <option value="warning">警告</option>
          <option value="notice">关注</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as StatementType | 'all')}
          className="px-3 py-2 text-sm rounded-lg bg-white border border-neutral-200 text-neutral-700 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        >
          <option value="all">全部报表类型</option>
          <option value="balance">资产负债表</option>
          <option value="income">利润表</option>
          <option value="cashflow">现金流量表</option>
          <option value="ratio">财务比率</option>
        </select>

        <div className="text-sm text-neutral-500 ml-auto">
          显示 {filteredAnomalies.length} / {anomalies.length} 项
        </div>
      </div>

      <div className="space-y-3">
        {filteredAnomalies.length === 0 ? (
          <div className="card-base p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">没有符合筛选条件的异常记录</p>
          </div>
        ) : (
          filteredAnomalies.map((a, idx) => {
            const isExpanded = expandedId === a.id;
            return (
              <div
                key={a.id}
                className={cn(
                  'card-base overflow-hidden animate-fade-in-up',
                  severityBgMap[a.severity]
                )}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div
                  className="p-4 cursor-pointer hover:bg-white/60 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : a.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={cn('chip shrink-0', severityColorMap[a.severity])}>
                        {severityTextMap[a.severity]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-semibold text-neutral-800">
                            {a.indicatorName}
                          </h4>
                          <span className="chip chip-normal !text-[10px]">
                            {statementTextMap[a.statementType]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-neutral-600">
                          <span className="font-mono">{formatNumber(a.previousValue)}</span>
                          <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="font-mono">{formatNumber(a.currentValue)}</span>
                          <span className="text-neutral-400">|</span>
                          <span className="text-xs text-neutral-500">
                            {a.previousPeriod} → {a.currentPeriod}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        className={cn(
                          'text-right',
                          a.changeRate > 0 ? 'text-danger-600' : 'text-accent-700'
                        )}
                      >
                        <div className="font-mono text-lg font-bold">
                          {formatPercentChange(a.changeRate)}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/60 animate-fade-in-up">
                    <div className="pt-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-white/80">
                          <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                            变动明细
                          </div>
                          <div className="space-y-1 text-sm text-neutral-700">
                            <div className="flex justify-between">
                              <span className="text-neutral-500">变动金额：</span>
                              <span className="font-mono">{formatNumber(a.changeAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-500">检测阈值：</span>
                              <span className="font-mono">
                                ±{(a.threshold * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-white/80">
                          <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                            数据溯源
                          </div>
                          <p className="text-xs text-neutral-600 font-mono break-all">
                            {a.sourceTrace}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-warn-50/50 border border-warn-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-warn-600 uppercase tracking-wider mb-2">
                          <AlertTriangle className="w-3 h-3" />
                          可能原因参考（非结论）
                        </div>
                        <ul className="space-y-1">
                          {a.possibleReasons.map((r, i) => (
                            <li key={i} className="text-sm text-neutral-700 flex gap-2">
                              <span className="text-warn-500 mt-0.5">•</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClick(a);
                        }}
                        className="btn-secondary w-full justify-center"
                      >
                        <Info className="w-4 h-4" />
                        查看完整计算过程与数据来源
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
