import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import { getCompany, getProjectsByCompany, deleteCompany } from '../store';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '../types';

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const company = useMemo(() => getCompany(id!), [id]);
  const projects = useMemo(() => getProjectsByCompany(id!), [id]);

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">企業が見つかりません</p>
        <Link to="/companies" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
          一覧に戻る
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`「${company.name}」を削除しますか？関連する案件もすべて削除されます。`)) {
      deleteCompany(company.id);
      navigate('/companies');
    }
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/companies" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
          <p className="text-sm text-gray-500">{company.industry}</p>
        </div>
        <Link
          to={`/companies/${id}/edit`}
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

      {/* Company info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">企業情報</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">担当者</dt>
            <dd className="text-sm font-medium text-gray-900 mt-1">{company.contactPerson || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">メール</dt>
            <dd className="text-sm font-medium text-gray-900 mt-1">{company.contactEmail || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">電話番号</dt>
            <dd className="text-sm font-medium text-gray-900 mt-1">{company.contactPhone || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">住所</dt>
            <dd className="text-sm font-medium text-gray-900 mt-1">{company.address || '-'}</dd>
          </div>
          {company.notes && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-gray-500">備考</dt>
              <dd className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{company.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Related projects */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">関連案件 ({projects.length}件)</h3>
          <Link
            to={`/projects/new?companyId=${id}`}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            案件追加
          </Link>
        </div>
        {projects.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">関連する案件がありません</p>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    担当: {p.assignedTo} | {formatAmount(p.amount)}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${PROJECT_STATUS_COLORS[p.status]}`}
                >
                  {PROJECT_STATUS_LABELS[p.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
