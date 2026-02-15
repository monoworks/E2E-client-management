import { useState, useRef } from 'react';
import { Upload, X, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import {
  importCompaniesCSV,
  importProjectsCSV,
  getCompanyCSVTemplate,
  getProjectCSVTemplate,
} from '../store';
import type { ImportResult } from '../store';

type ImportType = 'companies' | 'projects';

interface CSVImportModalProps {
  onClose: () => void;
  onImported: () => void;
}

export default function CSVImportModal({ onClose, onImported }: CSVImportModalProps) {
  const [importType, setImportType] = useState<ImportType>('companies');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = (type: ImportType) => {
    const csv = type === 'companies' ? getCompanyCSVTemplate() : getProjectCSVTemplate();
    const label = type === 'companies' ? '顧客企業テンプレート' : '案件テンプレート';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${label}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const importResult =
        importType === 'companies' ? importCompaniesCSV(text) : importProjectsCSV(text);
      setResult(importResult);
      if (importResult.success > 0) {
        onImported();
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleReset = () => {
    setResult(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">CSVインポート</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Import type selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              インポートの種類
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => { setImportType('companies'); handleReset(); }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors ${
                  importType === 'companies'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                顧客企業
              </button>
              <button
                onClick={() => { setImportType('projects'); handleReset(); }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors ${
                  importType === 'projects'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                案件
              </button>
            </div>
          </div>

          {/* Template download */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">テンプレート</h3>
            <p className="text-xs text-gray-500 mb-3">
              テンプレートをダウンロードして、データを入力してからインポートしてください。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadTemplate('companies')}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                顧客企業テンプレート
              </button>
              <button
                onClick={() => handleDownloadTemplate('projects')}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                案件テンプレート
              </button>
            </div>
          </div>

          {/* Expected headers info */}
          <div className="text-xs text-gray-500">
            <p className="font-medium text-gray-600 mb-1">
              {importType === 'companies' ? '顧客企業CSV' : '案件CSV'}の必須・任意項目:
            </p>
            {importType === 'companies' ? (
              <p>
                <span className="text-red-500 font-medium">企業名（必須）</span>、業種、担当者名、メールアドレス、電話番号、住所、備考
              </p>
            ) : (
              <p>
                <span className="text-red-500 font-medium">案件名（必須）</span>、
                <span className="text-red-500 font-medium">顧客企業（必須）</span>、
                ステータス（見込/提案中/交渉中/成約/失注/深耕中）、金額、担当者、開始日、成約予定日、説明、備考
              </p>
            )}
          </div>

          {/* File upload area */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
            >
              {fileName ? (
                <>
                  <FileText className="w-10 h-10 text-blue-500" />
                  <span className="text-sm text-gray-700 font-medium">{fileName}</span>
                  <span className="text-xs text-gray-500">クリックしてファイルを変更</span>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    クリックしてCSVファイルを選択
                  </span>
                  <span className="text-xs text-gray-400">UTF-8 / Shift_JIS対応</span>
                </>
              )}
            </label>
          </div>

          {/* Import result */}
          {result && (
            <div className="space-y-3">
              {result.success > 0 && (
                <div className="flex items-start gap-2 bg-green-50 text-green-700 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    {result.success}件のデータを正常にインポートしました。
                  </p>
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="flex items-start gap-2 text-yellow-700 mb-2">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">
                      {result.errors.length}件の警告があります
                    </p>
                  </div>
                  <ul className="text-xs text-yellow-600 space-y-1 ml-7">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
