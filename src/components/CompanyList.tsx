import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Building2 } from 'lucide-react';
import { getCompanies, getProjects } from '../store';

export default function CompanyList() {
  const [search, setSearch] = useState('');
  const companies = useMemo(() => getCompanies(), []);
  const projects = useMemo(() => getProjects(), []);

  const projectCounts = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => counts.set(p.companyId, (counts.get(p.companyId) || 0) + 1));
    return counts;
  }, [projects]);

  const filtered = useMemo(
    () =>
      companies.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.industry.toLowerCase().includes(search.toLowerCase()) ||
          c.contactPerson.toLowerCase().includes(search.toLowerCase())
      ),
    [companies, search]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">顧客企業</h2>
        <Link
          to="/companies/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          新規登録
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="企業名・業種・担当者で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {search ? '検索結果がありません' : '顧客企業が登録されていません'}
          </p>
          {!search && (
            <Link
              to="/companies/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              最初の企業を登録
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    企業名
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    業種
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    担当者
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    案件数
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/companies/${c.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.industry}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.contactPerson}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">
                      {projectCounts.get(c.id) || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
