import { Outlet } from 'react-router-dom';
import Header from './Header';
import SourcePanel from '@/components/common/SourcePanel';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16 pb-8">
        <div className="container py-6">
          <Outlet />
        </div>
      </main>

      <footer className="py-4 text-center">
        <p className="text-xs text-neutral-400">
          © 2025 智析财报 Analyzer · 专业财务报表智能分析系统
        </p>
      </footer>

      <SourcePanel />
    </div>
  );
}
