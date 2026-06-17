import React, { useState } from 'react';
import { Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { BalanceSheet } from '@/types/financial';
import { useFinancialStore } from '@/store/useFinancialStore';
import { formatNumber, formatPercentChange, changeRate } from '@/utils/format';
import { cn } from '@/lib/utils';

interface RowConfig {
  key: keyof BalanceSheet | string;
  label: string;
  category: 'assets' | 'liabilities' | 'equity';
  isTotal?: boolean;
  isCategoryHeader?: boolean;
  indent?: number;
  isExpenseLike?: boolean;
  fieldKey?: keyof BalanceSheet;
}

const rowConfigs: RowConfig[] = [
  { key: 'assets-header', label: '资产', category: 'assets', isCategoryHeader: true },
  { key: 'cash', label: '货币资金', category: 'assets', fieldKey: 'cash', indent: 1 },
  { key: 'accountsReceivable', label: '应收账款', category: 'assets', fieldKey: 'accountsReceivable', indent: 1 },
  { key: 'inventory', label: '存货', category: 'assets', fieldKey: 'inventory', indent: 1 },
  { key: 'otherCurrentAssets', label: '其他流动资产', category: 'assets', fieldKey: 'otherCurrentAssets', indent: 1 },
  { key: 'totalCurrentAssets', label: '流动资产合计', category: 'assets', fieldKey: 'totalCurrentAssets', indent: 1, isTotal: true },
  { key: 'fixedAssetsNet', label: '固定资产净额', category: 'assets', fieldKey: 'fixedAssetsNet', indent: 1 },
  { key: 'intangibleAssets', label: '无形资产', category: 'assets', fieldKey: 'intangibleAssets', indent: 1 },
  { key: 'otherNonCurrentAssets', label: '其他非流动资产', category: 'assets', fieldKey: 'otherNonCurrentAssets', indent: 1 },
  { key: 'totalNonCurrentAssets', label: '非流动资产合计', category: 'assets', fieldKey: 'totalNonCurrentAssets', indent: 1, isTotal: true },
  { key: 'totalAssets', label: '资产总计', category: 'assets', fieldKey: 'totalAssets', isTotal: true },

  { key: 'liabilities-header', label: '负债', category: 'liabilities', isCategoryHeader: true },
  { key: 'shortTermBorrowings', label: '短期借款', category: 'liabilities', fieldKey: 'shortTermBorrowings', indent: 1, isExpenseLike: true },
  { key: 'accountsPayable', label: '应付账款', category: 'liabilities', fieldKey: 'accountsPayable', indent: 1, isExpenseLike: true },
  { key: 'otherCurrentLiabilities', label: '其他流动负债', category: 'liabilities', fieldKey: 'otherCurrentLiabilities', indent: 1, isExpenseLike: true },
  { key: 'totalCurrentLiabilities', label: '流动负债合计', category: 'liabilities', fieldKey: 'totalCurrentLiabilities', indent: 1, isTotal: true, isExpenseLike: true },
  { key: 'longTermBorrowings', label: '长期借款', category: 'liabilities', fieldKey: 'longTermBorrowings', indent: 1, isExpenseLike: true },
  { key: 'otherNonCurrentLiabilities', label: '其他非流动负债', category: 'liabilities', fieldKey: 'otherNonCurrentLiabilities', indent: 1, isExpenseLike: true },
  { key: 'totalNonCurrentLiabilities', label: '非流动负债合计', category: 'liabilities', fieldKey: 'totalNonCurrentLiabilities', indent: 1, isTotal: true, isExpenseLike: true },
  { key: 'totalLiabilities', label: '负债合计', category: 'liabilities', fieldKey: 'totalLiabilities', isTotal: true, isExpenseLike: true },

  { key: 'equity-header', label: '所有者权益', category: 'equity', isCategoryHeader: true },
  { key: 'paidInCapital', label: '实收资本', category: 'equity', fieldKey: 'paidInCapital', indent: 1 },
  { key: 'retainedEarnings', label: '留存收益', category: 'equity', fieldKey: 'retainedEarnings', indent: 1 },
  { key: 'otherEquity', label: '其他权益', category: 'equity', fieldKey: 'otherEquity', indent: 1 },
  { key: 'totalEquity', label: '所有者权益合计', category: 'equity', fieldKey: 'totalEquity', indent: 1, isTotal: true },
  { key: 'totalLiabilitiesAndEquity', label: '负债和所有者权益总计', category: 'equity', fieldKey: 'totalLiabilitiesAndEquity', isTotal: true },
];

function getChangeColorClass(rate: number | null, isExpenseLike: boolean): string {
  if (rate === null) return 'text-neutral-400';
  if (rate === 0) return 'text-neutral-500';
  if (isExpenseLike) {
    return rate > 0 ? 'text-danger-600' : 'text-accent-700';
  }
  return rate > 0 ? 'text-danger-600' : 'text-accent-700';
}

export default function BalanceSheetTable() {
  const { data, openSourcePanel } = useFinancialStore();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const balanceSheets = [...data.balanceSheets].sort((a, b) =>
    a.period.localeCompare(b.period)
  );

  const handleInfoClick = (row: RowConfig, bs: BalanceSheet) => {
    if (!row.fieldKey) return;
    const value = bs[row.fieldKey];
    openSourcePanel({
      title: `${row.label} - ${bs.period}`,
      formula: row.label,
      steps: [
        `期间: ${bs.period}`,
        `公司: ${bs.companyName}`,
        `货币: ${bs.currency}`,
        `单位: ${bs.unit}`,
        `数值: ${formatNumber(value as number)}`,
      ],
      numerator: {
        label: row.label,
        value: value as number,
        source: `资产负债表 - ${bs.period}`,
      },
    });
  };

  const renderCategoryHeader = (label: string) => (
    <tr className="bg-brand-50/50">
      <td
        colSpan={balanceSheets.length + 2}
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
              <th className="sticky left-0 bg-neutral-50 z-10 px-4 py-3 text-left font-semibold text-neutral-700 min-w-[200px]">
                项目
              </th>
              {balanceSheets.map((bs) => (
                <th
                  key={bs.period}
                  className="px-4 py-3 text-right font-semibold text-neutral-700 min-w-[140px] whitespace-nowrap"
                >
                  {bs.period}
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
                  {balanceSheets.map((bs) => {
                    const value = row.fieldKey ? (bs[row.fieldKey] as number) : null;
                    const isNegative = value !== null && value < 0;
                    return (
                      <td
                        key={bs.period}
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
                              onClick={() => handleInfoClick(row, bs)}
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
                    {balanceSheets.length >= 2 ? (() => {
                      const lastIdx = balanceSheets.length - 1;
                      const current = row.fieldKey
                        ? (balanceSheets[lastIdx][row.fieldKey] as number)
                        : null;
                      const previous = row.fieldKey
                        ? (balanceSheets[lastIdx - 1][row.fieldKey] as number)
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
                            (row.isExpenseLike ? rate < 0 : rate > 0) ? (
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
      {balanceSheets.length > 0 && (
        <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500">
          单位：{balanceSheets[0].unit} | 公司：{balanceSheets[0].companyName}
        </div>
      )}
    </div>
  );
}
