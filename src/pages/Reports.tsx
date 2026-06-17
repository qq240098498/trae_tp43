import { useState, useMemo } from 'react';
import { FileText, Download, Printer, List, ChevronRight, BookOpen } from 'lucide-react';
import { useFinancialStore } from '@/store/useFinancialStore';
import { generateReport, type ReportSection } from '@/utils/interpreter/reportGenerator';
import { cn } from '@/lib/utils';

export default function Reports() {
  const { data, ratios, anomalies, openSourcePanel } = useFinancialStore();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showAppendix, setShowAppendix] = useState(false);

  const report = useMemo(
    () => generateReport(data, ratios, anomalies),
    [data, ratios, anomalies]
  );

  const handleExport = () => {
    let text = `${report.title}\n`;
    text += `公司：${report.companyName}\n`;
    text += `期间：${report.periods.join('、')}\n`;
    text += `生成时间：${report.generatedAt}\n\n`;
    text += '='.repeat(60) + '\n\n';

    for (const section of report.sections) {
      text += `${section.title}\n`;
      text += '-'.repeat(40) + '\n';
      for (const p of section.paragraphs) {
        text += p + '\n\n';
      }
      if (section.footnotes) {
        for (const fn of section.footnotes) {
          text += `[${fn.id}] ${fn.text}\n`;
        }
        text += '\n';
      }
    }

    text += '\n' + '='.repeat(60) + '\n';
    text += `${report.appendix.title}\n`;
    text += '-'.repeat(40) + '\n\n';
    for (const p of report.appendix.paragraphs) {
      text += p + '\n';
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.companyName}-${report.periods[report.periods.length - 1]}-财务分析报告.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="section-title">财务分析报告</h2>
            <p className="section-subtitle !mb-0">
              结构化分析报告，涵盖总评、报表概览、四大能力维度、异常检测与完整数据溯源附录。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="btn-secondary">
              <Printer className="w-4 h-4" />
              打印
            </button>
            <button onClick={handleExport} className="btn-primary">
              <Download className="w-4 h-4" />
              导出报告
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 animate-fade-in-up stagger-1">
          <div className="card-base p-4 sticky top-20">
            <div className="flex items-center gap-2 mb-3">
              <List className="w-4 h-4 text-brand-600" />
              <span className="font-display font-semibold text-brand-700">报告目录</span>
            </div>
            <nav className="space-y-0.5">
              {report.sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSection(s.id);
                    document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    activeSection === s.id
                      ? 'bg-brand-50 text-brand-700 font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-brand-700'
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </div>
                </button>
              ))}
              <button
                onClick={() => {
                  setShowAppendix(true);
                  setActiveSection('appendix');
                  document.getElementById('appendix')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1.5',
                  activeSection === 'appendix'
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-brand-700'
                )}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>{report.appendix.title}</span>
              </button>
            </nav>

            <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2 text-xs text-neutral-500">
              <div className="flex justify-between">
                <span>公司：</span>
                <span className="text-neutral-700 font-medium">{report.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span>期间：</span>
                <span className="text-neutral-700 font-medium">
                  {report.periods[report.periods.length - 1]}
                </span>
              </div>
              <div className="flex justify-between">
                <span>生成时间：</span>
                <span className="text-neutral-700 font-medium">{report.generatedAt}</span>
              </div>
              <div className="flex justify-between">
                <span>综合评分：</span>
                <span className="text-brand-700 font-bold text-sm">{report.score.total} 分</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-4 print:col-span-4">
          {report.sections.map((section, idx) => (
            <ReportSectionBlock
              key={section.id}
              section={section}
              index={idx}
              onRatioClick={(ratioName) => {
                const ratio = ratios.find((r) => r.name === ratioName);
                if (ratio?.calculation) {
                  openSourcePanel({
                    title: ratio.name,
                    formula: ratio.formula,
                    steps: ratio.calculation.steps,
                    numerator: ratio.calculation.numerator,
                    denominator: ratio.calculation.denominator,
                  });
                }
              }}
            />
          ))}

          <div id="appendix" className="card-base p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold text-brand-700 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {report.appendix.title}
              </h3>
              <button
                onClick={() => setShowAppendix(!showAppendix)}
                className="btn-ghost text-sm"
              >
                {showAppendix ? '收起' : '展开'}
              </button>
            </div>

            {showAppendix ? (
              <div className="prose prose-sm max-w-none">
                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 font-mono text-xs leading-relaxed text-neutral-700 whitespace-pre-wrap max-h-[700px] overflow-y-auto scrollbar-thin">
                  {report.appendix.paragraphs.join('\n')}
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                附录收录所有核心财务比率的完整公式、分子分母数据来源与分步计算过程，共 {ratios.length} 项指标，可点击上方「展开」查看。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportSectionBlock({
  section,
  index,
  onRatioClick,
}: {
  section: ReportSection;
  index: number;
  onRatioClick: (name: string) => void;
}) {
  return (
    <div
      id={section.id}
      className="card-base p-6 animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <h3 className="font-display text-xl font-semibold text-brand-700 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        {section.title}
      </h3>
      <div className="space-y-3">
        {section.paragraphs.map((p, i) => {
          const hasRatioRef = p.includes('「') && p.includes('」');
          return (
            <p
              key={i}
              className={cn(
                'text-sm leading-7 text-neutral-700',
                p.startsWith('※') && 'text-warn-700 bg-warn-50/50 p-3 rounded-lg border border-warn-100',
                p.startsWith('1.') || p.startsWith('2.') || p.startsWith('3.') || p.startsWith('4.') || p.startsWith('5.')
                  ? 'pl-4'
                  : ''
              )}
            >
              {hasRatioRef ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: p.replace(
                      /「([^」]+)」/g,
                      '<span class="inline-block cursor-pointer text-brand-600 hover:text-brand-800 underline decoration-dotted underline-offset-2 font-medium" onclick="window.dispatchEvent(new CustomEvent(\'ratio-click\',{detail:\'$1\'}))">「$1」</span>'
                    ),
                  }}
                  ref={(el) => {
                    if (el) {
                      el.onclick = (e) => {
                        const target = e.target as HTMLElement;
                        if (target.tagName === 'SPAN' && target.textContent?.startsWith('「')) {
                          const name = target.textContent.replace(/^「|」$/g, '');
                          onRatioClick(name);
                        }
                      };
                    }
                  }}
                />
              ) : (
                p
              )}
            </p>
          );
        })}
      </div>
      {section.footnotes && section.footnotes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-100 space-y-1">
          {section.footnotes.map((fn) => (
            <p key={fn.id} className="text-xs text-neutral-500">
              [{fn.id}] {fn.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
