import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Briefcase, TrendingUp, Users } from 'lucide-react';
import { getCompanies, getProjects, getMembers, getActivities } from '../store';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  PIPELINE_STATUSES,
  type ProjectStatus,
} from '../types';

export default function Dashboard() {
  const companies = useMemo(() => getCompanies(), []);
  const projects = useMemo(() => getProjects(), []);
  const members = useMemo(() => getMembers(), []);
  const activities = useMemo(() => getActivities(), []);

  const statusCounts = useMemo(() => {
    const counts: Record<ProjectStatus, number> = {
      prospect: 0,
      proposing: 0,
      negotiating: 0,
      closed_won: 0,
      closed_lost: 0,
      deepening: 0,
    };
    projects.forEach((p) => counts[p.status]++);
    return counts;
  }, [projects]);

  const totalPipeline = useMemo(
    () =>
      projects
        .filter((p) => !['closed_won', 'closed_lost'].includes(p.status))
        .reduce((sum, p) => sum + p.amount, 0),
    [projects]
  );

  const totalWon = useMemo(
    () =>
      projects
        .filter((p) => p.status === 'closed_won' || p.status === 'deepening')
        .reduce((sum, p) => sum + p.amount, 0),
    [projects]
  );

  const recentActivities = useMemo(
    () =>
      [...activities]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [activities]
  );

  const recentProjects = useMemo(
    () =>
      [...projects]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [projects]
  );

  const companyMap = useMemo(
    () => new Map(companies.map((c) => [c.id, c])),
    [companies]
  );

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">顧客企業数</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">案件数</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">パイプライン</p>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(totalPipeline)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">成約合計</p>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(totalWon)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">パイプライン</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PIPELINE_STATUSES.map((status) => (
            <div
              key={status}
              className="text-center p-4 rounded-lg bg-gray-50 border border-gray-100"
            >
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${PROJECT_STATUS_COLORS[status]}`}
              >
                {PROJECT_STATUS_LABELS[status]}
              </span>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statusCounts[status]}</p>
              <p className="text-xs text-gray-500 mt-1">件</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent projects & activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">最近更新された案件</h3>
            <Link to="/projects" className="text-sm text-blue-600 hover:text-blue-700">
              すべて見る
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">案件がありません</p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      {companyMap.get(p.companyId)?.name ?? '不明'}
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

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の活動</h3>
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">活動履歴がありません</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((a) => {
                const project = projects.find((p) => p.id === a.projectId);
                return (
                  <div key={a.id} className="p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{a.content}</p>
                      <span className="text-xs text-gray-500">{a.date}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {project?.name ?? '不明'} | {a.createdBy}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Member workload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">メンバー別担当案件数</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {members.map((m) => {
            const count = projects.filter((p) => p.assignedTo === m.name).length;
            return (
              <Link
                key={m.id}
                to={`/members`}
                className="text-center p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900">{m.name}</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{count}</p>
                <p className="text-xs text-gray-500">件担当</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
