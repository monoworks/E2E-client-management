import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { getProject, getCompanies, getMembers, saveProject, updateProject } from '../store';
import { PROJECT_STATUS_LABELS, type ProjectStatus } from '../types';

export default function ProjectForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const existing = useMemo(() => (isEdit ? getProject(id) : undefined), [id, isEdit]);
  const companies = useMemo(() => getCompanies(), []);
  const members = useMemo(() => getMembers(), []);

  const [form, setForm] = useState({
    companyId: existing?.companyId ?? searchParams.get('companyId') ?? '',
    name: existing?.name ?? '',
    status: (existing?.status ?? 'prospect') as ProjectStatus,
    amount: existing?.amount ?? 0,
    assignedTo: existing?.assignedTo ?? members[0]?.name ?? '',
    description: existing?.description ?? '',
    startDate: existing?.startDate ?? new Date().toISOString().slice(0, 10),
    expectedCloseDate: existing?.expectedCloseDate ?? '',
    notes: existing?.notes ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.companyId) return;

    if (isEdit) {
      updateProject(id, form);
      navigate(`/projects/${id}`);
    } else {
      const project = saveProject(form);
      navigate(`/projects/${project.id}`);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link
          to={isEdit ? `/projects/${id}` : '/projects'}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? '案件を編集' : '新規案件登録'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            案件名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            placeholder="○○コンサルティング案件"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            顧客企業 <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={form.companyId}
            onChange={(e) => setForm({ ...form, companyId: e.target.value })}
            className={inputClass}
          >
            <option value="">選択してください</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {companies.length === 0 && (
            <p className="text-xs text-yellow-600 mt-1">
              先に
              <Link to="/companies/new" className="text-blue-600 underline">
                顧客企業を登録
              </Link>
              してください
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
              className={inputClass}
            >
              {Object.entries(PROJECT_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">金額（円）</label>
            <input
              type="number"
              min={0}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">担当者</label>
            <select
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              className={inputClass}
            >
              <option value="">選択してください</option>
              {members.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">成約予定日</label>
            <input
              type="date"
              value={form.expectedCloseDate}
              onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass}
            rows={3}
            placeholder="案件の概要..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className={inputClass}
            rows={2}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            {isEdit ? '更新' : '登録'}
          </button>
        </div>
      </form>
    </div>
  );
}
