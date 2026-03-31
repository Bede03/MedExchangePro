import React, { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Plus, Pencil, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMockData } from '../hooks/useMockData';
import { Table } from '../components/UI/Table';
import { User } from '../types';

type UserWithMeta = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  hospital_id: string;
  joined_at: string;
  active: boolean;
};

export function AdminUsersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hospitals, users, updateUser } = useMockData();

  const hospitalName = useMemo(
    () => hospitals.find((h) => h.id === user?.hospital_id)?.name ?? '',
    [hospitals, user?.hospital_id]
  );

  const hospitalUsers = useMemo(
    () => users.filter((u) => u.hospital_id === user?.hospital_id),
    [users, user?.hospital_id]
  );

  const [activeMap, setActiveMap] = useState<Record<string, boolean>>(() =>
    hospitalUsers.reduce((acc, u, idx) => {
      acc[u.id] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const userRows = useMemo<UserWithMeta[]>(() => {
    return hospitalUsers.map((u, idx) => ({
      ...u,
      joined_at: new Date(2026, 2, 4 + idx).toISOString(),
      active: activeMap[u.id] ?? true,
    }));
  }, [hospitalUsers, activeMap]);

  const editingUser = useMemo(
    () => hospitalUsers.find((u) => u.id === editingUserId) ?? null,
    [hospitalUsers, editingUserId]
  );

  const [editFullName, setEditFullName] = useState('');
  const [editRole, setEditRole] = useState<User['role']>('clinician');
  const [editActive, setEditActive] = useState(true);

  React.useEffect(() => {
    if (editingUser) {
      setEditFullName(editingUser.full_name);
      setEditRole(editingUser.role);
      setEditActive(activeMap[editingUser.id] ?? true);
    }
  }, [editingUser, activeMap]);

  const toggleActive = (id: string) => {
    setActiveMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Admin Panel</h1>
        <p className="text-sm text-slate-500">
          {hospitalName} — Manage users, audit logs, and monitor activity
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

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">User Management</h2>
            <p className="mt-1 text-sm text-slate-500">Manage users and access across the platform.</p>
          </div>
          <NavLink
            to="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Create User
          </NavLink>
        </div>

        <div className="mt-6">
          <Table
            data={userRows}
            rowKey={(row) => row.id}
            columns={[
              {
                header: 'Name',
                accessor: (row) => <span className="font-medium">{row.full_name}</span>,
              },
              { header: 'Email', accessor: 'email' },
              {
                header: 'Role',
                accessor: (row) => (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {row.role}
                  </span>
                ),
              },
              {
                header: 'Status',
                accessor: (row) => (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      row.active ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {row.active ? 'Active' : 'Inactive'}
                  </span>
                ),
              },
              {
                header: 'Joined',
                accessor: (row) => new Date(row.joined_at).toLocaleDateString('en-GB'),
              },
              {
                header: 'Actions',
                accessor: (row) => (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingUserId(row.id)}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={row.active}
                        onChange={() => toggleActive(row.id)}
                      />
                      <span className="h-5 w-10 rounded-full bg-slate-200 transition peer-checked:bg-indigo-600" />
                      <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                    </label>
                  </div>
                ),
                className: 'text-right',
              },
            ]}
          />
        </div>
      </div>

      {editingUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-10">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Edit User</h2>
                <p className="mt-1 text-sm text-slate-500">Update user details for your hospital.</p>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600"
                onClick={() => setEditingUserId(null)}
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="editFullName">
                  Full Name
                </label>
                <input
                  id="editFullName"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="editEmail">
                  Email
                </label>
                <input
                  id="editEmail"
                  value={editingUser.email}
                  disabled
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="editRole">
                  Role
                </label>
                <select
                  id="editRole"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="admin">Admin</option>
                  <option value="clinician">Clinician</option>
                  <option value="hospital_staff">Hospital Staff</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="editHospital">
                  Hospital
                </label>
                <input
                  id="editHospital"
                  value={hospitalName}
                  disabled
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-500"
                />
                <p className="mt-1 text-xs text-slate-500">Users are always assigned to your hospital.</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Active</p>
                  <p className="text-xs text-slate-500">Toggle to enable/disable the user.</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                  />
                  <span className="h-5 w-10 rounded-full bg-slate-200 transition peer-checked:bg-indigo-600" />
                  <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUserId(null)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateUser(editingUser.id, { full_name: editFullName, role: editRole });
                    setActiveMap((prev) => ({ ...prev, [editingUser.id]: editActive }));
                    setEditingUserId(null);
                  }}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
