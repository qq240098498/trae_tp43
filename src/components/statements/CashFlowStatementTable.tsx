import React, { useState } from 'react';
import { Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { CashFlowStatement } from '@/types/financial';
import { useFinancialStore } from '@/store/useFinancialStore';
import { formatNumber, formatPercentChange, changeRate } from '@/utils/format';
import { cn } from '@/lib/utils';

interface RowConfig {
  key: keyof CashFlowStatement | string;
  label: string;
  category: 'operating' | 'investing' | 'financing' | 'summary';
  isTotal?: boolean;
  isCategoryHeader?: boolean;
  indent?: number;
  isOutflowLike?: boolean;
  fieldKey?: keyof CashFlowStatement;
}

const rowConfigs: RowConfig[] = [
  { key: 'operating-header', label: '一、经营活动产生的现金流量', category: 'operating', isCategoryHeader: true },
  { key: 'operatingCashInflow', label: '经营活动现金流入小计', category: 'operating', fieldKey: 'operatingCashInflow', indent: 1 },
  { key: 'operatingCashOutflow', label: '经营活动现金流出小计', category: 'operating', fieldKey: 'operatingCashOutflow', indent: 1, isOutflowLike: true },
  { key: 'operatingNetCashFlow', label: '经营活动产生的现金流量净额', category: 'operating', fieldKey: 'operatingNetCashFlow', indent: 1, isTotal: true },

  { key: 'investing-header', label: '二、投资活动产生的现金流量', category: 'investing', isCategoryHeader: true },
  { key: 'investingCashInflow', label: '投资活动现金流入小计', category: 'investing', fieldKey: 'investingCashInflow', indent: 1 },
  { key: 'investingCashOutflow', label: '投资活动现金流出小计', category: 'investing', fieldKey: 'investingCashOutflow', indent: 1, isOutflowLike: true },
  { key: 'investingNetCashFlow', label: '投资活动产生的现金流量净额', category: 'investing', fieldKey: 'investingNetCashFlow', indent: 1, isTotal: true },

  { key: 'financing-header', label: '三、筹资活动产生的现金流量', category: 'financing', isCategoryHeader: true },
  { key: 'financingCashInflow', label: '筹资活动现金流入小计', category: 'financing', fieldKey: 'financingCashInflow', indent: 1 },
  { key: 'financingCashOutflow', label: '筹资活动现金流出小计', category: 'financing', fieldKey: 'financingCashOutflow', indent: 1, isOutflowLike: true },
  { key: 'financingNetCashFlow', label: '筹资活动产生的现金流量净额', category: 'financing', fieldKey: 'financingNetCashFlow', indent: 1, isTotal: true },

  { key: 'summary-header', label: '四、现金及现金等价物净增加额', category: 'summary', isCategoryHeader: true },
  { key: 'netIncreaseInCash', label: '现金及现金等价物净增加额', category: 'summary', fieldKey: 'netIncreaseInCash', indent: 1, isTotal: true },
  { key: 'beginningCashBalance', label: '期初现金及现金等价物余额', category: 'summary', fieldKey: 'beginningCashBalance', indent: 1 },
  { key: 'endingCashBalance', label: '期末现金及现金等价物余额', category: 'summary', fieldKey: 'endingCashBalance', indent: 1, isTotal: true },
];

function getChangeColorClass(rate: number | null, isOutflowLike: boolean): string {
  if (rate === null) return 'text-neutral-400';
  if (rate === 0) return 'text-neutral-500';
  if (isOutflowLike) {
    return rate > 0 ? 'text-danger-600' : 'text-accent-700';
  }
  return rate > 0 ? 'text-accent-700' : 'text-danger-600';
}

export default function CashFlowStatementTable() {
  const { data, openSourcePanel } = useFinancialStore();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const cashFlowStatements = [...data.cashFlowStatements].sort((a, b) =>
    a.period.localeCompare(b.period)
  );

  const handleInfoClick = (row: RowConfig, cf: CashFlowStatement) => {
    if (!row.fieldKey) return;
    const value = cf[row.fieldKey];
    openSourcePanel({
      title: `${row.label} - ${cf.period}`,
      formula: row.label,
      steps: [
        `期间: ${cf.period}`,
        `公司: ${cf.companyName}`,
        `货币: ${cf.currency}`,
        `单位: ${cf.unit}`,
        `数值: ${formatNumber(value as number)}`,
      ],
      numerator: {
        label: row.label,
        value: value as number,
        source: `现金流量表 - ${cf.period}`,
      },
    });
  };

  const renderCategoryHeader = (label: string) => (
    <tr className="bg-brand-50/50">
      <td
        colSpan={cashFlowStatements.length + 2}
        className="px-4 py-2.5 font-display text-base font-semibold text-brand-700 border-b border-brand-100"
      >
        {label}
      </td>
    </tr>
  );

  return (
    <div className="card-base overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="sticky left-0 bg-neutral-50 z-10 px-4 py-3 text-left font-semibold text-neutral-700 min-w-[260px]">
                项目
              </th>
              {cashFlowStatements.map((cf) => (
                <th
                  key={cf.period}
                  className="px-4 py-3 text-right font-semibold text-neutral-700 min-w-[140px] whitespace-nowrap"
                >
                  {cf.period}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-semibold text-neutral-700 min-w-[120px] whitespace-nowrap">
                变动率
              </th>
            </tr>
          </thead>
          <tbody>
            {rowConfigs.map((row) => {
              if (row.isCategoryHeader) {
                return renderCategoryHeader(row.label);
              }

              return (
                <tr
                  key={row.key}
                  onMouseEnter={() => setHoveredRow(row.key)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={cn(
                    'group transition-colors border-b border-neutral-100 last:border-b-0',
                    row.isTotal ? 'bg-brand-50 font-semibold' : 'hover:bg-brand-50/40'
                  )}
                >
                  <td
                    className={cn(
                      'sticky left-0 z-10 px-4 py-3 text-neutral-800 flex items-center gap-2',
                      row.isTotal ? 'bg-brand-50' : 'bg-white group-hover:bg-brand-50/40'
                    )}
                  >
                    <span style={{ paddingLeft: `${(row.indent || 0) * 20}px` }}>
                      {row.label}
                    </span>
                  </td>
                  {cashFlowStatements.map((cf) => {
                    const value = row.fieldKey ? (cf[row.fieldKey] as number) : null;
                    const isNegative = value !== null && value < 0;
                    return (
                      <td
                        key={cf.period}
                        className={cn(
                          'px-4 py-3 text-right font-mono tabular-nums relative',
                          isNegative ? 'text-danger-600' : 'text-neutral-700',
                          row.isTotal ? 'text-neutral-800' : ''
                        )}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>{formatNumber(value)}</span>
                          {hoveredRow === row.key && row.fieldKey && (
                            <button
                              onClick={() => handleInfoClick(row, cf)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-brand-100 text-neutral-400 hover:text-brand-600"
                              title="查看详情"
                            >
                              <Info size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right">
                    {cashFlowStatements.length >= 2 ? (() => {
                      const lastIdx = cashFlowStatements.length - 1;
                      const current = row.fieldKey
                        ? (cashFlowStatements[lastIdx][row.fieldKey] as number)
                        : null;
                      const previous = row.fieldKey
                        ? (cashFlowStatements[lastIdx - 1][row.fieldKey] as number)
                        : null;
                      const rate = current !== null && previous !== null
                        ? changeRate(current, previous)
                        : null;
                      const colorClass = getChangeColorClass(rate, !!row.isOutflowLike);
                      return (
                        <div className={cn(
                          'flex items-center justify-end gap-1 font-mono tabular-nums text-xs',
                          colorClass
                        )}>
                          {rate !== null && rate !== 0 && (
                            (row.isOutflowLike ? rate < 0 : rate > 0) ? (
                              <ArrowUpRight size={12} className="shrink-0" />
                            ) : (
                              <ArrowDownRight size={12} className="shrink-0" />
                            )
                          )}
                          <span>{formatPercentChange(rate)}</span>
                        </div>
                      );
                    })() : (
                      <span className="text-neutral-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {cashFlowStatements.length > 0 && (
        <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500">
          单位：{cashFlowStatements[0].unit} | 公司：{cashFlowStatements[0].companyName}
        </div>
      )}
    </div>
  );
}
