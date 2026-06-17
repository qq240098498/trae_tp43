import { useState } from 'react';
import { FileBarChart, PieChart, Wallet } from 'lucide-react';
import BalanceSheetTable from '@/components/statements/BalanceSheetTable';
import IncomeStatementTable from '@/components/statements/IncomeStatementTable';
import CashFlowStatementTable from '@/components/statements/CashFlowStatementTable';
import { cn } from '@/lib/utils';

type TabType = 'balance' | 'income' | 'cashflow';

const tabs = [
  { key: 'balance' as TabType, label: '资产负债表', icon: PieChart, desc: '企业财务状况快照' },
  { key: 'income' as TabType, label: '利润表', icon: FileBarChart, desc: '经营成果与盈利能力' },
  { key: 'cashflow' as TabType, label: '现金流量表', icon: Wallet, desc: '现金流入流出明细' },
];

export default function Statements() {
  const [activeTab, setActiveTab] = useState<TabType>('balance');

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h2 className="section-title">三大财务报表</h2>
        <p className="section-subtitle">
          结构化展示资产负债表、利润表与现金流量表，支持多期数据并排对比，异常指标高亮标注。
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up stagger-1">
        {tabs.map(({ key, label, icon: Icon, desc }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex-1 text-left px-5 py-4 rounded-xl border transition-all duration-200',
              activeTab === key
                ? 'bg-brand-gradient text-white border-transparent shadow-soft'
                : 'bg-white border-neutral-200 hover:border-brand-200 hover:bg-brand-50/50'
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0',
                  activeTab === key ? 'text-white' : 'text-brand-600'
                )}
              />
              <div>
                <div
                  className={cn(
                    'font-display font-semibold text-base',
                    activeTab === key ? 'text-white' : 'text-neutral-800'
                  )}
                >
                  {label}
                </div>
                <div
                  className={cn(
                    'text-xs mt-0.5',
                    activeTab === key ? 'text-white/80' : 'text-neutral-500'
                  )}
                >
                  {desc}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="animate-fade-in-up stagger-2">
        {activeTab === 'balance' && <BalanceSheetTable />}
        {activeTab === 'income' && <IncomeStatementTable />}
        {activeTab === 'cashflow' && <CashFlowStatementTable />}
      </div>
    </div>
  );
}
