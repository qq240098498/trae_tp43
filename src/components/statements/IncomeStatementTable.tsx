import React, { useState } from 'react';
import { Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { IncomeStatement } from '@/types/financial';
import { useFinancialStore } from '@/store/useFinancialStore';
import { formatNumber, formatPercentChange, changeRate } from '@/utils/format';
import { cn } from '@/lib/utils';

interface RowConfig {
  key: keyof IncomeStatement | string;
  label: string;
  category: 'revenue' | 'cost' | 'profit';
  isTotal?: boolean;
  isCategoryHeader?: boolean;
  indent?: number;
  isExpenseLike?: boolean;
  fieldKey?: keyof IncomeStatement;
}

const rowConfigs: RowConfig[] = [
  { key: 'revenue-header', label: '一、营业收入', category: 'revenue', isCategoryHeader: true },
  { key: 'revenue', label: '营业收入', category: 'revenue', fieldKey: 'revenue', indent: 1 },

  { key: 'cost-header', label: '二、成本与费用', category: 'cost', isCategoryHeader: true },
  { key: 'costOfRevenue', label: '营业成本', category: 'cost', fieldKey: 'costOfRevenue', indent: 1, isExpenseLike: true },
  { key: 'grossProfit', label: '毛利润', category: 'cost', fieldKey: 'grossProfit', indent: 1, isTotal: true },
  { key: 'sellingExpenses', label: '销售费用', category: 'cost', fieldKey: 'sellingExpenses', indent: 1, isExpenseLike: true },
  { key: 'adminExpenses', label: '管理费用', category: 'cost', fieldKey: 'adminExpenses', indent: 1, isExpenseLike: true },
  { key: 'financialExpenses', label: '财务费用', category: 'cost', fieldKey: 'financialExpenses', indent: 1, isExpenseLike: true },
  { key: 'rndExpenses', label: '研发费用', category: 'cost', fieldKey: 'rndExpenses', indent: 1, isExpenseLike: true },

  { key: 'profit-header', label: '三、利润', category: 'profit', isCategoryHeader: true },
  { key: 'operatingProfit', label: '营业利润', category: 'profit', fieldKey: 'operatingProfit', indent: 1, isTotal: true },
  { key: 'nonOperatingIncome', label: '营业外收入', category: 'profit', fieldKey: 'nonOperatingIncome', indent: 1 },
  { key: 'nonOperatingExpenses', label: '营业外支出', category: 'profit', fieldKey: 'nonOperatingExpenses', indent: 1, isExpenseLike: true },
  { key: 'totalProfit', label: '利润总额', category: 'profit', fieldKey: 'totalProfit', indent: 1, isTotal: true },
  { key: 'incomeTaxExpense', label: '所得税费用', category: 'profit', fieldKey: 'incomeTaxExpense', indent: 1, isExpenseLike: true },
  { key: 'netProfit', label: '净利润', category: 'profit', fieldKey: 'netProfit', indent: 1, isTotal: true },
  { key: 'netProfitToParent', label: '归属于母公司股东的净利润', category: 'profit', fieldKey: 'netProfitToParent', isTotal: true },
];

function getChangeColorClass(rate: number | null, isExpenseLike: boolean): string {
  if (rate === null) return 'text-neutral-400';
  if (rate === 0) return 'text-neutral-500';
  if (isExpenseLike) {
    return rate > 0 ? 'text-accent-700' : 'text-danger-600';
  }
  return rate > 0 ? 'text-danger-600' : 'text-accent-700';
}

export default function IncomeStatementTable() {
  const { data, openSourcePanel } = useFinancialStore();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const incomeStatements = [...data.incomeStatements].sort((a, b) =>
    a.period.localeCompare(b.period)
  );

  const handleInfoClick = (row: RowConfig, stmt: IncomeStatement) => {
    if (!row.fieldKey) return;
    const value = stmt[row.fieldKey];
    openSourcePanel({
      title: `${row.label} - ${stmt.period}`,
      formula: row.label,
      steps: [
        `期间: ${stmt.period}`,
        `公司: ${stmt.companyName}`,
        `货币: ${stmt.currency}`,
        `单位: ${stmt.unit}`,
        `数值: ${formatNumber(value as number)}`,
      ],
      numerator: {
        label: row.label,
        value: value as number,
        source: `利润表 - ${stmt.period}`,
      },
    });
  };

  const renderCategoryHeader = (label: string) => (
    <tr className="bg-brand-50/50">
      <td
        colSpan={incomeStatements.length + 2}
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
              <th className="sticky left-0 bg-neutral-50 z-10 px-4 py-3 text-left font-semibold text-neutral-700 min-w-[220px]">
                项目
              </th>
              {incomeStatements.map((stmt) => (
                <th
                  key={stmt.period}
                  className="px-4 py-3 text-right font-semibold text-neutral-700 min-w-[140px] whitespace-nowrap"
                >
                  {stmt.period}
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
                  {incomeStatements.map((stmt) => {
                    const value = row.fieldKey ? (stmt[row.fieldKey] as number) : null;
                    const isNegative = value !== null && value < 0;
                    return (
                      <td
                        key={stmt.period}
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
                              onClick={() => handleInfoClick(row, stmt)}
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
                    {incomeStatements.length >= 2 ? (() => {
                      const lastIdx = incomeStatements.length - 1;
                      const current = row.fieldKey
                        ? (incomeStatements[lastIdx][row.fieldKey] as number)
                        : null;
                      const previous = row.fieldKey
                        ? (incomeStatements[lastIdx - 1][row.fieldKey] as number)
                        : null;
                      const rate = current !== null && previous !== null
                        ? changeRate(current, previous)
                        : null;
                      const colorClass = getChangeColorClass(rate, !!row.isExpenseLike);
                      return (
                        <div className={cn(
                          'flex items-center justify-end gap-1 font-mono tabular-nums text-xs',
                          colorClass
                        )}>
                          {rate !== null && rate !== 0 && (
                            (row.isExpenseLike ? rate > 0 : rate < 0) ? (
                              <ArrowDownRight size={12} className="shrink-0" />
                            ) : (
                              <ArrowUpRight size={12} className="shrink-0" />
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
      {incomeStatements.length > 0 && (
        <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500">
          单位：{incomeStatements[0].unit} | 公司：{incomeStatements[0].companyName}
        </div>
      )}
    </div>
  );
}
