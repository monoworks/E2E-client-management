import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit, Save, X, Users } from 'lucide-react';
import { getMembers, getProjects, saveMember, updateMember, deleteMember } from '../store';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '../types';

export default function MemberList() {
  const [refreshKey, setRefreshKey] = useState(0);
  const members = useMemo(() => getMembers(), [refreshKey]);
  const projects = useMemo(() => getProjects(), [refreshKey]);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: '' });
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    saveMember(form);
    setForm({ name: '', email: '', role: '' });
    setShowForm(false);
    refresh();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !form.name.trim()) return;
    updateMember(editingId, form);
    setEditingId(null);
    setForm({ name: '', email: '', role: '' });
    refresh();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`「${name}」を削除しますか？`)) {
      deleteMember(id);
      refresh();
    }
  };

  const startEdit = (member: { id: string; name: string; email: string; role: string }) => {
    setEditingId(member.id);
    setForm({ name: member.name, email: member.email, role: member.role });
    setShowForm(false);
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">メンバー</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: '', email: '', role: '' });
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          メンバー追加
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">新規メンバー追加</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="名前"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="email"
              placeholder="メール"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="役割"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              追加
            </button>
          </div>
        </form>
      )}

      {members.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">メンバーがいません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {members.map((m) => {
            const memberProjects = projects.filter((p) => p.assignedTo === m.name);
            const isEditing = editingId === m.id;
            const isExpanded = expandedMember === m.id;

            return (
              <div key={m.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {isEditing ? (
                  <form onSubmit={handleEdit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="名前"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="email"
                        placeholder="メール"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="役割"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        <Save className="w-4 h-4" />
                        更新
                      </button>
                    </div>
                  </form>
                ) : (
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedMember(isExpanded ? null : m.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">
                            {m.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{m.name}</p>
                          <p className="text-xs text-gray-500">
                            {m.role} {m.email && `| ${m.email}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {memberProjects.length}件の案件
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(m);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="編集"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(m.id, m.name);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isExpanded && !isEditing && memberProjects.length > 0 && (
                  <div className="border-t border-gray-100 px-6 py-4">
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">担当案件</h4>
                    <div className="space-y-2">
                      {memberProjects.map((p) => (
                        <Link
                          key={p.id}
                          to={`/projects/${p.id}`}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">{p.name}</p>
                            <p className="text-xs text-gray-500">{formatAmount(p.amount)}</p>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${PROJECT_STATUS_COLORS[p.status]}`}
                          >
                            {PROJECT_STATUS_LABELS[p.status]}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
