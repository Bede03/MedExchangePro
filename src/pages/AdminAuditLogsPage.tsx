import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMockData } from '../hooks/useMockData';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  ipAddress?: string;
  status: string;
  timestamp: string;
  details?: any;
}

export function AdminAuditLogsPage() {
  const { user } = useAuth();
  const { hospitals } = useMockData();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAction, setSelectedAction] = useState('All Actions');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [pageSize] = useState(10);

  const hospitalName = hospitals.find((h) => h.id === user?.hospital_id)?.name ?? '';

  // Fetch distinct actions
  useEffect(() => {
    const fetchActions = async () => {
      try {
        const response = await fetch('/api/audit/admin/actions', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch actions');

        const data = await response.json();
        setActions(data.data || []);
      } catch (err) {
        console.error('Error fetching actions:', err);
        setError('Failed to load actions');
      }
    };

    fetchActions();
  }, []);

  // Fetch audit logs with pagination
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const skip = (currentPage - 1) * pageSize;
        const params = new URLSearchParams({
          limit: pageSize.toString(),
          skip: skip.toString(),
        });

        if (selectedAction && selectedAction !== 'All Actions') {
          params.append('action', selectedAction);
        }

        if (startDate) {
          params.append('startDate', new Date(startDate).toISOString());
        }

        if (endDate) {
          params.append('endDate', new Date(endDate).toISOString());
        }

        const response = await fetch(`/api/audit/admin/paginated?${params}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch audit logs');

        const data = await response.json();
        setLogs(data.data || []);
        setTotalLogs(data.total || 0);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        setError('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [currentPage, selectedAction, startDate, endDate, pageSize]);

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAction(e.target.value);
    handleFilterChange();
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    handleFilterChange();
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    handleFilterChange();
  };

  const totalPages = Math.ceil(totalLogs / pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Admin Panel</h1>
        <p className="text-sm text-slate-500">
          {hospitalName} — Manage users, hospitals, audit logs, and monitor activity
        </p>
      </header>

      <div className="flex flex-wrap gap-2 text-sm">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `rounded-lg px-4 py-2 font-semibold ${
              isActive
                ? 'border border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `rounded-lg px-4 py-2 font-semibold ${
              isActive
                ? 'border border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`
          }
        >
          Users
        </NavLink>
        <NavLink
          to="/admin/hospitals"
          className={({ isActive }) =>
            `rounded-lg px-4 py-2 font-semibold ${
              isActive
                ? 'border border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`
          }
        >
          Hospitals
        </NavLink>
        <NavLink
          to="/admin/audit"
          className={({ isActive }) =>
            `rounded-lg px-4 py-2 font-semibold ${
              isActive
                ? 'border border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`
          }
        >
          Audit Logs
        </NavLink>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Audit Logs</h2>
        <p className="mt-1 text-sm text-slate-500">
          Total logs: <span className="font-semibold">{totalLogs}</span>
        </p>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Filter by Action</label>
            <select
              value={selectedAction}
              onChange={handleActionChange}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option>All Actions</option>
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">&nbsp;</label>
            <button
              onClick={() => {
                setSelectedAction('All Actions');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="mt-1 w-full rounded-lg bg-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Loading/Error State */}
        {loading && <p className="mt-6 text-center text-slate-500">Loading audit logs...</p>}
        {error && <p className="mt-6 text-center text-red-500">{error}</p>}

        {/* Logs Table */}
        {!loading && !error && logs.length === 0 && (
          <p className="mt-6 text-center text-slate-500">No audit logs found.</p>
        )}

        {!loading && logs.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Entity Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-sm text-slate-900">
                      <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="text-slate-900 font-medium">{log.user.fullName}</div>
                      <div className="text-slate-500 text-xs">{log.user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{log.entityType}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                          log.status === 'success'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{log.ipAddress || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {formatDate(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalLogs)} of {totalLogs} logs
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      currentPage === page
                        ? 'bg-indigo-500 text-white'
                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
