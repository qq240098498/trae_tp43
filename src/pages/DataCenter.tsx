import { useState, useRef } from 'react';
import {
  Database,
  Upload,
  Download,
  RotateCcw,
  Check,
  AlertCircle,
  FileJson,
  FileSpreadsheet,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { useFinancialStore } from '@/store/useFinancialStore';
import { cn } from '@/lib/utils';

export default function DataCenter() {
  const { data, validation, exportToJSON, importFromJSON, resetToMock } = useFinancialStore();
  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setJsonText(text);
      const success = importFromJSON(text);
      setImportStatus(success ? 'success' : 'error');
      setTimeout(() => setImportStatus('idle'), 3000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportText = () => {
    const success = importFromJSON(jsonText);
    setImportStatus(success ? 'success' : 'error');
    setTimeout(() => setImportStatus('idle'), 3000);
  };

  const handleExportJSON = () => {
    const json = exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = async () => {
    await navigator.clipboard.writeText(exportToJSON());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('确定要重置为示例数据吗？当前数据将丢失。')) {
      resetToMock();
    }
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h2 className="section-title">数据中心</h2>
        <p className="section-subtitle">
          导入、导出或重置财务报表数据。所有数据保存在浏览器本地存储中。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up stagger-1">
        <div className="card-base p-5">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-neutral-700">数据状态</span>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">资产负债表</span>
              <span className="font-mono text-neutral-800">{data.balanceSheets.length} 期</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">利润表</span>
              <span className="font-mono text-neutral-800">{data.incomeStatements.length} 期</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">现金流量表</span>
              <span className="font-mono text-neutral-800">{data.cashFlowStatements.length} 期</span>
            </div>
          </div>
        </div>

        <div className="card-base p-5">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-accent-600" />
            <span className="text-sm font-medium text-neutral-700">数据校验</span>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">校验结果</span>
              <span className={cn('chip', validation.valid ? 'chip-excellent' : 'chip-danger')}>
                {validation.valid ? '通过' : '存在错误'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">错误数</span>
              <span className="font-mono text-neutral-800">{validation.errors.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">警告数</span>
              <span className="font-mono text-neutral-800">{validation.warnings.length}</span>
            </div>
          </div>
        </div>

        <div className="card-base p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="w-4 h-4 text-warn-600" />
            <span className="text-sm font-medium text-neutral-700">快捷操作</span>
          </div>
          <div className="space-y-2">
            <button onClick={handleExportJSON} className="btn-secondary w-full justify-center text-sm py-2">
              <Download className="w-4 h-4" />
              导出 JSON
            </button>
            <button onClick={handleReset} className="btn-ghost w-full justify-center text-sm py-2">
              <RotateCcw className="w-4 h-4" />
              重置为示例数据
            </button>
          </div>
        </div>
      </div>

      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="card-base p-5 animate-fade-in-up stagger-2">
          <h3 className="font-display text-lg font-semibold text-brand-700 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warn-600" />
            数据校验详情
          </h3>
          {validation.errors.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-danger-600 uppercase tracking-wider mb-1.5">
                错误（{validation.errors.length}）
              </div>
              <ul className="space-y-1">
                {validation.errors.map((e, i) => (
                  <li key={i} className="text-sm text-danger-700 bg-danger-50 px-3 py-2 rounded-lg">
                    • {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div>
              <div className="text-xs font-medium text-warn-600 uppercase tracking-wider mb-1.5">
                警告（{validation.warnings.length}）
              </div>
              <ul className="space-y-1">
                {validation.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-warn-700 bg-warn-50 px-3 py-2 rounded-lg">
                    • {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base p-5 animate-fade-in-up stagger-3">
          <h3 className="font-display text-lg font-semibold text-brand-700 mb-3 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            导入数据
          </h3>
          <p className="text-sm text-neutral-500 mb-4">
            支持上传 JSON 文件，或直接粘贴 JSON 数据。数据格式需包含 balanceSheets、incomeStatements、cashFlowStatements 三个数组。
          </p>

          <div className="space-y-3">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
                id="json-upload"
              />
              <label
                htmlFor="json-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border-2 border-dashed border-neutral-300 text-neutral-500 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/30 cursor-pointer transition-colors"
              >
                <FileJson className="w-5 h-5" />
                点击选择 JSON 文件
              </label>
            </div>

            <div className="relative">
              <div className="text-xs text-neutral-400 text-center py-1">
                ——— 或粘贴 JSON ———
              </div>
            </div>

            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='{"balanceSheets": [...], "incomeStatements": [...], "cashFlowStatements": [...]}'
              className="w-full h-40 px-3 py-2 text-xs font-mono rounded-lg border border-neutral-200 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 resize-none scrollbar-thin"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={handleImportText}
                disabled={!jsonText.trim()}
                className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importStatus === 'success' ? (
                  <>
                    <Check className="w-4 h-4" /> 导入成功
                  </>
                ) : importStatus === 'error' ? (
                  <>
                    <AlertCircle className="w-4 h-4" /> 导入失败
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> 导入数据
                  </>
                )}
              </button>
              {jsonText && (
                <button
                  onClick={() => setJsonText('')}
                  className="btn-ghost"
                >
                  清空
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card-base p-5 animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg font-semibold text-brand-700 flex items-center gap-2">
              <Download className="w-5 h-5" />
              当前数据 JSON
            </h3>
            <button
              onClick={handleCopyJSON}
              className="btn-ghost text-sm py-1.5 px-3"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-4 h-4 text-accent-600" /> 已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> 复制
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-neutral-500 mb-4">
            以下为当前所有财务数据的 JSON 表示，可用于备份或迁移到其他设备。
          </p>
          <pre className="h-64 overflow-auto scrollbar-thin p-4 rounded-lg bg-neutral-900 text-neutral-200 text-xs font-mono leading-relaxed">
            {exportToJSON()}
          </pre>
        </div>
      </div>

      <div className="card-base p-5 animate-fade-in-up stagger-5">
        <h3 className="font-display text-lg font-semibold text-brand-700 mb-3">数据格式说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-brand-50/50 border border-brand-100">
            <div className="font-medium text-brand-700 mb-2">BalanceSheet 资产负债表</div>
            <ul className="text-xs text-neutral-600 space-y-1">
              <li>• period / companyName</li>
              <li>• 资产：cash, accountsReceivable, inventory, totalAssets 等</li>
              <li>• 负债：shortTermBorrowings, accountsPayable, totalLiabilities</li>
              <li>• 权益：paidInCapital, retainedEarnings, totalEquity</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-accent-50/50 border border-accent-100">
            <div className="font-medium text-accent-700 mb-2">IncomeStatement 利润表</div>
            <ul className="text-xs text-neutral-600 space-y-1">
              <li>• revenue 营业收入</li>
              <li>• costOfRevenue / grossProfit</li>
              <li>• 期间费用：selling, admin, financial, rnd</li>
              <li>• operatingProfit / totalProfit / netProfit</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-warn-50/50 border border-warn-100">
            <div className="font-medium text-warn-700 mb-2">CashFlowStatement 现金流量表</div>
            <ul className="text-xs text-neutral-600 space-y-1">
              <li>• 经营活动：inflow / outflow / net</li>
              <li>• 投资活动：inflow / outflow / net</li>
              <li>• 筹资活动：inflow / outflow / net</li>
              <li>• netIncreaseInCash / endingCashBalance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
