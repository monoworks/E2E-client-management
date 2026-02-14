import { useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Plus, MessageSquare, Phone, Mail, FileText, MoreHorizontal } from 'lucide-react';
import {
  getProject,
  getCompany,
  getActivitiesByProject,
  deleteProject,
  saveActivity,
  deleteActivity,
  getMembers,
} from '../store';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  ACTIVITY_TYPE_LABELS,
  type ActivityType,
} from '../types';

const ACTIVITY_ICONS: Record<ActivityType, typeof MessageSquare> = {
  meeting: MessageSquare,
  call: Phone,
  email: Mail,
  proposal: FileText,
  other: MoreHorizontal,
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const project = useMemo(() => getProject(id!), [id, refreshKey]);
  const company = useMemo(
    () => (project ? getCompany(project.companyId) : undefined),
    [project]
  );
  const activities = useMemo(() => getActivitiesByProject(id!), [id, refreshKey]);
  const members = useMemo(() => getMembers(), []);

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState({
    type: 'meeting' as ActivityType,
    date: new Date().toISOString().slice(0, 10),
    content: '',
    createdBy: members[0]?.name ?? '',
  });

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">案件が見つかりません</p>
        <Link to="/projects" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
          一覧に戻る
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`「${project.name}」を削除しますか？`)) {
      deleteProject(project.id);
      navigate('/projects');
    }
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.content.trim()) return;
    saveActivity({ ...activityForm, projectId: project.id });
    setActivityForm({
      type: 'meeting',
      date: new Date().toISOString().slice(0, 10),
      content: '',
      createdBy: members[0]?.name ?? '',
    });
    setShowActivityForm(false);
    refresh();
  };

  const handleDeleteActivity = (activityId: string) => {
    if (window.confirm('この活動を削除しますか？')) {
      deleteActivity(activityId);
      refresh();
    }
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Link to="/projects" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
          <p className="text-sm text-gray-500">
            {company ? (
              <Link to={`/companies/${company.id}`} className="text-blue-600 hover:text-blue-700">
                {company.name}
              </Link>
            ) : (
              '不明な企業'
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/projects/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            編集
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            削除
          </button>
        </div>
      </div>

      {/* Project info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">案件情報</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <dt className="text-sm text-gray-500">ステータス</dt>
            <dd className="mt-1">
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${PROJECT_STATUS_COLORS[project.status]}`}
              >
                {PROJECT_STATUS_LABELS[project.status]}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">金額</dt>
            <dd className="text-sm font-medium text-gray-900 mt-1">{formatAmount(project.amount)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">担当者</dt>
            <dd className="text-sm font-medium text-gray-900 mt-1">{project.assignedTo}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">開始日</dt>
            <dd className="text-sm font-medium text-gray-900 mt-1">{project.startDate || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">成約予定日</dt>
            <dd className="text-sm font-medium text-gray-900 mt-1">{project.expectedCloseDate || '-'}</dd>
          </div>
        </dl>
        {project.description && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <dt className="text-sm text-gray-500">説明</dt>
            <dd className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{project.description}</dd>
          </div>
        )}
        {project.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <dt className="text-sm text-gray-500">備考</dt>
            <dd className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{project.notes}</dd>
          </div>
        )}
      </div>

      {/* Activities */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">活動履歴 ({activities.length}件)</h3>
          <button
            onClick={() => setShowActivityForm(!showActivityForm)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            活動を追加
          </button>
        </div>

        {showActivityForm && (
          <form onSubmit={handleAddActivity} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">種類</label>
                <select
                  value={activityForm.type}
                  onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value as ActivityType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {Object.entries(ACTIVITY_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">日付</label>
                <input
                  type="date"
                  value={activityForm.date}
                  onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">記録者</label>
                <select
                  value={activityForm.createdBy}
                  onChange={(e) => setActivityForm({ ...activityForm, createdBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">内容</label>
              <textarea
                value={activityForm.content}
                onChange={(e) => setActivityForm({ ...activityForm, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
                required
                placeholder="活動の内容を記入してください..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowActivityForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                追加
              </button>
            </div>
          </form>
        )}

        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">活動履歴がありません</p>
        ) : (
          <div className="space-y-3">
            {activities.map((a) => {
              const Icon = ACTIVITY_ICONS[a.type];
              return (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-100"
                >
                  <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500">
                        {ACTIVITY_TYPE_LABELS[a.type]}
                      </span>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-500">{a.date}</span>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-500">{a.createdBy}</span>
                    </div>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{a.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteActivity(a.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
