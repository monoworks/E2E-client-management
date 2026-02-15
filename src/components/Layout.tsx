import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  Download,
  Upload,
  Menu,
  X,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { exportCSV, exportAllData } from '../store';
import CSVImportModal from './CSVImportModal';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'ダッシュボード' },
  { to: '/companies', icon: Building2, label: '顧客企業' },
  { to: '/projects', icon: Briefcase, label: '案件管理' },
  { to: '/members', icon: Users, label: 'メンバー' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const importedRef = useRef(false);

  const handleImported = () => {
    importedRef.current = true;
  };

  const handleImportClose = () => {
    setImportModalOpen(false);
    if (importedRef.current) {
      importedRef.current = false;
      window.location.reload();
    }
  };

  const handleExportCSV = () => {
    const csv = exportCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `案件データ_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `全データ_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">案件管理</h1>
          <p className="text-sm text-gray-500 mt-1">コンサルティング</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-1">
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors w-full"
          >
            <Upload className="w-5 h-5" />
            CSV取込
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors w-full"
          >
            <Download className="w-5 h-5" />
            CSV出力
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors w-full"
          >
            <Download className="w-5 h-5" />
            JSON出力
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)}>
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-lg font-bold text-gray-900">案件管理</h1>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
      {/* CSV Import Modal */}
      {importModalOpen && (
        <CSVImportModal
          onClose={handleImportClose}
          onImported={handleImported}
        />
      )}
    </div>
  );
}
