import { X, Calculator, ArrowRight, Database, Sigma, Divide } from 'lucide-react';
import { useFinancialStore } from '@/store/useFinancialStore';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';

export default function SourcePanel() {
  const { sourcePanelOpen, sourcePanelContent, closeSourcePanel } = useFinancialStore();

  if (!sourcePanelOpen || !sourcePanelContent) return null;

  const { title, formula, steps, numerator, denominator } = sourcePanelContent;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-brand-900/30 backdrop-blur-sm transition-opacity duration-200"
        onClick={closeSourcePanel}
      />

      <aside
        className={cn(
          'absolute top-0 right-0 h-full w-full max-w-[460px]',
          'bg-white shadow-2xl',
          'flex flex-col',
          'animate-slide-in-right'
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 border border-brand-200">
              <Database className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-700">{title}</h3>
              <p className="text-xs text-neutral-500">数据溯源面板</p>
            </div>
          </div>
          <button
            onClick={closeSourcePanel}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-lg',
              'text-neutral-500 hover:text-brand-700 hover:bg-brand-50',
              'transition-all duration-200'
            )}
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-6">
          <div className="card-base p-5 bg-gradient-to-br from-brand-50/50 to-white">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-semibold text-brand-700">计算公式</span>
            </div>
            <div className="font-mono text-base text-neutral-800 bg-white px-4 py-3 rounded-lg border border-brand-100">
              {formula}
            </div>
          </div>

          {(numerator || denominator) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Divide className="w-4 h-4 text-accent-600" />
                <span className="text-sm font-semibold text-brand-700">分子 / 分母来源</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {numerator && (
                  <div className="card-base p-4 border-l-4 border-l-accent-400">
                    <div className="text-[10px] font-medium text-accent-600 uppercase tracking-wider mb-1">
                      分子
                    </div>
                    <div className="text-sm font-semibold text-neutral-800 mb-1">
                      {numerator.label}
                    </div>
                    <div className="font-mono text-xl font-semibold text-accent-700 mb-2">
                      {formatNumber(numerator.value)}
                    </div>
                    <div className="text-xs text-neutral-500 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      {numerator.source}
                    </div>
                  </div>
                )}

                {denominator && (
                  <div className="card-base p-4 border-l-4 border-l-warn-400">
                    <div className="text-[10px] font-medium text-warn-600 uppercase tracking-wider mb-1">
                      分母
                    </div>
                    <div className="text-sm font-semibold text-neutral-800 mb-1">
                      {denominator.label}
                    </div>
                    <div className="font-mono text-xl font-semibold text-warn-700 mb-2">
                      {formatNumber(denominator.value)}
                    </div>
                    <div className="text-xs text-neutral-500 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      {denominator.source}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {steps && steps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Sigma className="w-4 h-4 text-brand-600" />
                <span className="text-sm font-semibold text-brand-700">分步计算步骤</span>
              </div>

              <ol className="relative space-y-0">
                {steps.map((step, index) => (
                  <li
                    key={index}
                    className="relative pl-10 pb-5 last:pb-0"
                  >
                    <div
                      className={cn(
                        'absolute left-0 top-0 flex items-center justify-center',
                        'w-7 h-7 rounded-full text-xs font-bold',
                        index === steps.length - 1
                          ? 'bg-brand-gradient text-white shadow-soft'
                          : 'bg-brand-100 text-brand-700'
                      )}
                    >
                      {index + 1}
                    </div>

                    {index < steps.length - 1 && (
                      <div className="absolute left-3.5 top-7 bottom-0 w-px bg-brand-200" />
                    )}

                    <div className="pt-0.5">
                      <div className="text-sm text-neutral-700 leading-relaxed">
                        {step}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-200/60 bg-neutral-50/50">
          <button
            onClick={closeSourcePanel}
            className="btn-secondary w-full justify-center"
          >
            <span>关闭溯源面板</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </aside>
    </div>
  );
}
