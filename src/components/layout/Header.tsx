import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileBarChart, TrendingUp, AlertTriangle, FileText, Database, Download, RotateCcw } from 'lucide-react';
import { useFinancialStore } from '@/store/useFinancialStore';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: '首页仪表盘', icon: LayoutDashboard },
  { to: '/statements', label: '三大报表', icon: FileBarChart },
  { to: '/ratios', label: '比率分析', icon: TrendingUp },
  { to: '/anomalies', label: '异常分析', icon: AlertTriangle },
  { to: '/reports', label: '分析报告', icon: FileText },
  { to: '/data', label: '数据中心', icon: Database },
];

export default function Header() {
  const { exportToJSON, resetToMock } = useFinancialStore();

  const handleExport = () => {
    const json = exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm('确定要重置为示例数据吗？当前修改将丢失。')) {
      resetToMock();
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-16',
        'bg-white/80 backdrop-blur-md',
        'border-b border-neutral-200/60',
        'shadow-sm'
      )}
    >
      <div className="container h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-gradient shadow-soft">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold text-brand-700">智析财报</span>
            <span className="text-[10px] font-medium text-neutral-400 tracking-widest uppercase">Analyzer</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'nav-link flex items-center gap-1.5',
                  isActive && 'active'
                )
              }
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="btn-ghost"
            title="导出数据"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">导出</span>
          </button>
          <button
            onClick={handleReset}
            className="btn-ghost"
            title="重置数据"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">重置</span>
          </button>
        </div>
      </div>
    </header>
  );
}
