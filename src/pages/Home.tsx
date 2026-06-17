import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CircleCheck,
  CircleAlert,
  CircleX,
  Building2,
  Calendar,
  Shield,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useFinancialStore } from '@/store/useFinancialStore';
import { formatNumber, formatPercent, formatPercentChange, changeRate } from '@/utils/format';
import { cn } from '@/lib/utils';
import { getAnomalyCounts } from '@/utils/financial/anomaly';
import { getLatestPair } from '@/utils/financial/calculator';
import type { AnomalySeverity, InterpretationLevel } from '@/types/financial';

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

const severityIconMap: Record<AnomalySeverity, React.ReactNode> = {
  critical: <CircleX className="w-3.5 h-3.5" />,
  warning: <CircleAlert className="w-3.5 h-3.5" />,
  notice: <Info className="w-3.5 h-3.5" />,
};

function MiniTrendChart({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function KPICard({
  label,
  value,
  previousValue,
  unit,
  isPercent,
  isHigherBetter,
  trend,
  delay,
}: {
  label: string;
  value: number | null;
  previousValue?: number | null;
  unit?: string;
  isPercent?: boolean;
  isHigherBetter?: boolean;
  trend?: number[];
  delay?: string;
}) {
  const rate =
    value !== null && previousValue !== null && previousValue !== 0
      ? changeRate(value, previousValue)
      : null;
  const isPositive = rate !== null && rate > 0;
  const isGood = isHigherBetter !== undefined ? (isHigherBetter ? isPositive : !isPositive) : isPositive;

  const displayValue = isPercent ? formatPercent(value) : formatNumber(value);
  const displayColor = value !== null && value < 0 ? 'text-danger-600' : 'text-neutral-800';

  return (
    <div className={cn('card-base p-5 animate-fade-in-up', delay)}>
      <div className="flex items-start justify-between mb-3">
        <span className="kpi-label">{label}</span>
        {trend && trend.length > 1 && (
          <div className="w-20 h-9 -mt-1 -mr-2">
            <MiniTrendChart data={trend} color={isGood ? '#2d6a4f' : '#c92a2a'} />
          </div>
        )}
      </div>
      <div className={cn('kpi-value', displayColor)}>
        {displayValue}
        {unit && !isPercent && <span className="text-sm font-normal text-neutral-500 ml-1">{unit}</span>}
      </div>
      {rate !== null && (
        <div className={cn(
          'mt-2 flex items-center gap-1 text-xs font-medium',
          isGood ? 'text-accent-700' : 'text-danger-600'
        )}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>同比 {formatPercentChange(rate)}</span>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { data, ratios, anomalies, healthScore, validation, openSourcePanel } = useFinancialStore();

  const anomalyCounts = getAnomalyCounts(anomalies);

  const latestBS = getLatestPair(data.balanceSheets);
  const latestIS = getLatestPair(data.incomeStatements);
  const latestCF = getLatestPair(data.cashFlowStatements);

  const revenueTrend = [...data.incomeStatements]
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((s) => s.revenue);
  const profitTrend = [...data.incomeStatements]
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((s) => s.netProfit);
  const assetTrend = [...data.balanceSheets]
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((s) => s.totalAssets);
  const cashTrend = [...data.cashFlowStatements]
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((s) => s.endingCashBalance);
  const operatingCFTrend = [...data.cashFlowStatements]
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((s) => s.operatingNetCashFlow);

  const grossMarginTrend = [...data.incomeStatements]
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((s) => s.revenue ? s.grossProfit / s.revenue : 0);

  const radarData = healthScore
    ? [
        { subject: '偿债能力', A: healthScore.solvency, full: 100 },
        { subject: '盈利能力', A: healthScore.profitability, full: 100 },
        { subject: '运营效率', A: healthScore.efficiency, full: 100 },
        { subject: '成长能力', A: healthScore.growth, full: 100 },
      ]
    : [];

  const topAnomalies = anomalies.slice(0, 5);

  const periods = [...data.incomeStatements]
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((s) => s.period);

  const revenueProfitData = [...data.incomeStatements]
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((s) => ({
      period: s.period.replace('年度', ''),
      营业收入: s.revenue,
      净利润: s.netProfit,
    }));

  const company = data.balanceSheets[0];

  const handleRatioClick = (ratioId: string) => {
    const ratio = ratios.find((r) => r.id === ratioId);
    if (!ratio || !ratio.calculation) return;
    openSourcePanel({
      title: ratio.name,
      formula: ratio.formula,
      steps: ratio.calculation.steps,
      numerator: ratio.calculation.numerator,
      denominator: ratio.calculation.denominator,
    });
  };

  return (
    <div className="space-y-6">
      <div className="card-base p-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-gradient shadow-soft">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-brand-700">
                {company?.companyName ?? '—'}
              </h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  分析期间：{periods.join(' ／ ')}
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  货币：{company?.currency ?? '—'} / 单位：{company?.unit ?? '—'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {validation.valid ? (
              <span className="chip chip-excellent">
                <CircleCheck className="w-3.5 h-3.5" />
                数据校验通过
              </span>
            ) : (
              <span className="chip chip-danger">
                <AlertCircle className="w-3.5 h-3.5" />
                数据存在 {validation.errors.length} 处错误
              </span>
            )}
            {validation.warnings.length > 0 && (
              <span className="chip chip-warning">
                <AlertTriangle className="w-3.5 h-3.5" />
                {validation.warnings.length} 条警告
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-base p-6 lg:col-span-1 animate-fade-in-up stagger-1">
          <h3 className="section-title !text-xl mb-1">财务健康总评</h3>
          <p className="section-subtitle !mb-4">基于四大维度综合评分</p>

          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#e9ecef"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(healthScore?.total ?? 0) * 2.64} 264`}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e3a5f" />
                    <stop offset="100%" stopColor="#2d6a4f" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl font-bold text-brand-700">
                  {healthScore?.total ?? '—'}
                </span>
                <span className="text-xs text-neutral-500 mt-0.5">/ 100 分</span>
              </div>
            </div>

            {healthScore && (
              <span className={cn('chip text-sm px-3 py-1', levelColorMap[healthScore.level])}>
                评级：{levelTextMap[healthScore.level]}
              </span>
            )}

            <div className="w-full mt-6 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-50">
                <span className="text-neutral-500">偿债</span>
                <span className="font-semibold text-brand-700">{healthScore?.solvency}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-50">
                <span className="text-neutral-500">盈利</span>
                <span className="font-semibold text-accent-700">{healthScore?.profitability}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-50">
                <span className="text-neutral-500">运营</span>
                <span className="font-semibold text-warn-700">{healthScore?.efficiency}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-50">
                <span className="text-neutral-500">成长</span>
                <span className="font-semibold text-brand-600">{healthScore?.growth}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card-base p-6 lg:col-span-2 animate-fade-in-up stagger-2">
          <h3 className="section-title !text-xl mb-1">四维能力雷达</h3>
          <p className="section-subtitle !mb-2">四大维度综合能力分布</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#dee2e6" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#495057', fontSize: 13 }} />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#adb5bd', fontSize: 10 }}
                />
                <Radar
                  name="评分"
                  dataKey="A"
                  stroke="#1e3a5f"
                  fill="url(#radarGradient)"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e3a5f" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#2d6a4f" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up stagger-3">
        <h3 className="section-title !text-xl mb-1">核心 KPI</h3>
        <p className="section-subtitle !mb-4">关键财务指标概览</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <KPICard
            label="营业收入"
            value={latestIS.current?.revenue ?? null}
            previousValue={latestIS.previous?.revenue ?? null}
            unit="万元"
            isHigherBetter
            trend={revenueTrend}
            delay="stagger-1"
          />
          <KPICard
            label="净利润"
            value={latestIS.current?.netProfit ?? null}
            previousValue={latestIS.previous?.netProfit ?? null}
            unit="万元"
            isHigherBetter
            trend={profitTrend}
            delay="stagger-2"
          />
          <KPICard
            label="毛利率"
            value={latestIS.current?.revenue ? latestIS.current.grossProfit / latestIS.current.revenue : null}
            previousValue={latestIS.previous?.revenue ? latestIS.previous.grossProfit / latestIS.previous.revenue : null}
            isPercent
            isHigherBetter
            trend={grossMarginTrend}
            delay="stagger-3"
          />
          <KPICard
            label="资产总额"
            value={latestBS.current?.totalAssets ?? null}
            previousValue={latestBS.previous?.totalAssets ?? null}
            unit="万元"
            isHigherBetter
            trend={assetTrend}
            delay="stagger-4"
          />
          <KPICard
            label="所有者权益"
            value={latestBS.current?.totalEquity ?? null}
            previousValue={latestBS.previous?.totalEquity ?? null}
            unit="万元"
            isHigherBetter
            delay="stagger-5"
          />
          <KPICard
            label="资产负债率"
            value={latestBS.current?.totalAssets ? latestBS.current.totalLiabilities / latestBS.current.totalAssets : null}
            previousValue={latestBS.previous?.totalAssets ? latestBS.previous.totalLiabilities / latestBS.previous.totalAssets : null}
            isPercent
            isHigherBetter={false}
            delay="stagger-6"
          />
          <KPICard
            label="经营活动净现金流"
            value={latestCF.current?.operatingNetCashFlow ?? null}
            previousValue={latestCF.previous?.operatingNetCashFlow ?? null}
            unit="万元"
            isHigherBetter
            trend={operatingCFTrend}
            delay="stagger-7"
          />
          <KPICard
            label="期末现金余额"
            value={latestCF.current?.endingCashBalance ?? null}
            previousValue={latestCF.previous?.endingCashBalance ?? null}
            unit="万元"
            isHigherBetter
            trend={cashTrend}
            delay="stagger-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base p-6 animate-fade-in-up stagger-4">
          <h3 className="section-title !text-xl mb-1">营收与利润趋势</h3>
          <p className="section-subtitle !mb-4">多期营收与净利润对比</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueProfitData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                <XAxis dataKey="period" tick={{ fill: '#6c757d', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6c757d', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  formatter={(value: number) => formatNumber(value) + ' 万元'}
                />
                <Area
                  type="monotone"
                  dataKey="营业收入"
                  stroke="#1e3a5f"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="净利润"
                  stroke="#2d6a4f"
                  strokeWidth={2}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-base p-6 animate-fade-in-up stagger-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title !text-xl mb-1">异常预警</h3>
              <p className="section-subtitle !mb-0">系统自动识别的异常波动指标</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="chip chip-critical">
                <CircleX className="w-3.5 h-3.5" /> 严重 {anomalyCounts.critical}
              </span>
              <span className="chip chip-warning">
                <CircleAlert className="w-3.5 h-3.5" /> 警告 {anomalyCounts.warning}
              </span>
              <span className="chip chip-notice">
                <Info className="w-3.5 h-3.5" /> 关注 {anomalyCounts.notice}
              </span>
            </div>
          </div>

          {topAnomalies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CircleCheck className="w-12 h-12 text-accent-400 mb-3" />
              <p className="text-neutral-500">暂无异常波动，财务数据平稳</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
              {topAnomalies.map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    'group relative p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm',
                    a.severity === 'critical'
                      ? 'bg-danger-50/50 border-danger-200 hover:border-danger-300'
                      : a.severity === 'warning'
                      ? 'bg-warn-50/50 border-warn-200 hover:border-warn-300'
                      : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                  )}
                  onClick={() => {
                    if (a.statementType === 'ratio') {
                      handleRatioClick(a.fieldKey);
                    } else {
                      openSourcePanel({
                        title: `${a.indicatorName} 异常波动`,
                        formula: `变动率 = (本期值 - 上期值) / 上期值`,
                        steps: [
                          `指标名称：${a.indicatorName}`,
                          `数据来源：${a.sourceTrace}`,
                          `${a.previousPeriod}: ${formatNumber(a.previousValue)}`,
                          `${a.currentPeriod}: ${formatNumber(a.currentValue)}`,
                          `变动金额：${formatNumber(a.changeAmount)}`,
                          `变动率：${formatPercent(a.changeRate)}`,
                          `检测阈值：±${(a.threshold * 100).toFixed(0)}%`,
                          `可能原因：${a.possibleReasons.slice(0, 2).join('；')}`,
                        ],
                        numerator: {
                          label: `本期${a.indicatorName}`,
                          value: a.currentValue,
                          source: `${a.currentPeriod}`,
                        },
                        denominator: {
                          label: `上期${a.indicatorName}`,
                          value: a.previousValue,
                          source: `${a.previousPeriod}`,
                        },
                      });
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('chip !text-[10px]', severityColorMap[a.severity])}>
                          {severityIconMap[a.severity]}
                          {severityTextMap[a.severity]}
                        </span>
                        <span className="text-sm font-medium text-neutral-800 truncate">
                          {a.indicatorName}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 line-clamp-1">
                        {a.previousPeriod} {formatNumber(a.previousValue)} → {a.currentPeriod}{' '}
                        {formatNumber(a.currentValue)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={cn(
                          'text-sm font-semibold font-mono',
                          a.changeRate > 0 ? 'text-danger-600' : 'text-accent-700'
                        )}
                      >
                        {formatPercentChange(a.changeRate)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
