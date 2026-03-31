import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMockData } from '../hooks/useMockData';
import { Table } from '../components/UI/Table';
import { User, AuditLog } from '../types';
import { Pencil, X, Download, Users, Building2, FileText, Trash2, Check, LayoutDashboard, Activity, Eye, EyeOff, AlertCircle } from 'lucide-react';

type AdminTab = 'dashboard' | 'users' | 'hospitals' | 'audit';

type UserWithMeta = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  hospital_id: string;
  joined_at: string;
  last_updated: string;
  active: boolean;
};

export function AdminPanelPage() {
  const { user } = useAuth();
  const { hospitals, users, updateUser, addUser, addHospital, updateHospital, deleteHospital, auditLogs, referrals } = useMockData();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Audit log filters
  const [auditActionFilter, setAuditActionFilter] = useState('All Actions');
  const [auditStartDate, setAuditStartDate] = useState('');
  const [auditEndDate, setAuditEndDate] = useState('');

  // Filter audit logs based on selected action
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (auditActionFilter !== 'All Actions' && log.action !== auditActionFilter) {
        return false;
      }
      // Add date filtering if needed
      if (auditStartDate) {
        const logDate = new Date(log.timestamp);
        const startDate = new Date(auditStartDate);
        if (logDate < startDate) return false;
      }
      if (auditEndDate) {
        const logDate = new Date(log.timestamp);
        const endDate = new Date(auditEndDate);
        endDate.setHours(23, 59, 59, 999);
        if (logDate > endDate) return false;
      }
      return true;
    });
  }, [auditLogs, auditActionFilter, auditStartDate, auditEndDate]);

  const hospitalName = hospitals.find((h) => h.id === user?.hospital_id)?.name ?? '';

  // Users management state
  const hospitalUsers = useMemo(
    () => users.filter((u) => u.hospital_id === user?.hospital_id),
    [users, user?.hospital_id]
  );

  const [activeMap, setActiveMap] = useState<Record<string, boolean>>(() =>
    hospitalUsers.reduce((acc, u) => {
      acc[u.id] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Create user modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFullName, setCreateFullName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<User['role']>('clinician');
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Create hospital modal state
  const [showCreateHospitalModal, setShowCreateHospitalModal] = useState(false);
  const [createHospitalName, setCreateHospitalName] = useState('');
  const [createHospitalLocation, setCreateHospitalLocation] = useState('');

  // Hospital active status state
  const [hospitalActiveMap, setHospitalActiveMap] = useState<Record<string, boolean>>(() =>
    hospitals.reduce((acc, h) => {
      acc[h.id] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Hospital metadata state (joined_at, last_updated)
  const [hospitalMetadata, setHospitalMetadata] = useState<Record<string, { joined_at: string; last_updated: string }>>(() => {
    const metadata: Record<string, { joined_at: string; last_updated: string }> = {};
    hospitals.forEach((h, idx) => {
      metadata[h.id] = {
        joined_at: new Date(2026, 0, 15 + idx * 5).toISOString(),
        last_updated: new Date(2026, 2, 10 + idx).toISOString(),
      };
    });
    return metadata;
  });

  // Hospital search and filter state
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [hospitalSortBy, setHospitalSortBy] = useState<'joined' | 'updated' | 'status'>('joined');
  const [statusSortToggle, setStatusSortToggle] = useState<'active' | 'inactive'>('active');
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [tempDateRange, setTempDateRange] = useState({ startDate: '', endDate: '' });
  const [appliedDateRange, setAppliedDateRange] = useState({ startDate: '', endDate: '' });
  const [showHospitalSortMenuOpen, setShowHospitalSortMenuOpen] = useState(false);
  const [showHospitalSortPopup, setShowHospitalSortPopup] = useState(false);
  const [hospitalPopupType, setHospitalPopupType] = useState<'status' | null>(null);

  // User search and filter state
  const [userSearch, setUserSearch] = useState('');
  const [userSortBy, setUserSortBy] = useState<'joined' | 'updated' | 'status' | 'role'>('joined');
  const [userStatusSortToggle, setUserStatusSortToggle] = useState<'active' | 'inactive'>('active');
  const [userRoleSortFilter, setUserRoleSortFilter] = useState<'admin' | 'clinician' | 'registrar' | null>(null);
  const [showUserDatePickerModal, setShowUserDatePickerModal] = useState(false);
  const [tempUserDateRange, setTempUserDateRange] = useState({ startDate: '', endDate: '' });
  const [appliedUserDateRange, setAppliedUserDateRange] = useState({ startDate: '', endDate: '' });
  const [showUserSortMenuOpen, setShowUserSortMenuOpen] = useState(false);
  const [showUserSortPopup, setShowUserSortPopup] = useState(false);
  const [userPopupType, setUserPopupType] = useState<'status' | 'role' | null>(null);

  // User metadata state (joined_at, last_updated)
  const [userMetadata, setUserMetadata] = useState<Record<string, { joined_at: string; last_updated: string }>>(() => {
    const metadata: Record<string, { joined_at: string; last_updated: string }> = {};
    hospitalUsers.forEach((u, idx) => {
      metadata[u.id] = {
        joined_at: new Date(2026, 2, 4 + idx).toISOString(),
        last_updated: new Date(2026, 2, 10 + idx).toISOString(),
      };
    });
    return metadata;
  });

  // Edit hospital state
  const [editingHospitalId, setEditingHospitalId] = useState<string | null>(null);
  const [showEditHospitalModal, setShowEditHospitalModal] = useState(false);
  const [editHospitalName, setEditHospitalName] = useState('');
  const [editHospitalLocation, setEditHospitalLocation] = useState('');

  // Calculate referral counts and filtered hospitals
  const hospitalData = useMemo(() => {
    return hospitals.map((h) => {
      const received = referrals.filter((r) => r.receiving_hospital_id === h.id).length;
      const sent = referrals.filter((r) => r.requesting_hospital_id === h.id).length;
      const total = received + sent;
      return {
        ...h,
        referral_count: total,
        received_count: received,
        sent_count: sent,
        joined_at: hospitalMetadata[h.id]?.joined_at || new Date().toISOString(),
        last_updated: hospitalMetadata[h.id]?.last_updated || new Date().toISOString(),
      };
    });
  }, [hospitals, referrals, hospitalMetadata]);

  const filteredHospitals = useMemo(() => {
    const normalized = hospitalSearch.trim().toLowerCase();

    let filtered = hospitalData.filter((h) => {
      // Search filter
      if (normalized) {
        const matchesSearch = (
          h.name.toLowerCase().includes(normalized) ||
          h.location.toLowerCase().includes(normalized) ||
          h.id.toLowerCase().includes(normalized)
        );
        if (!matchesSearch) return false;
      }

      // Apply date range filter based on current sort option
      if (hospitalSortBy === 'joined' && (appliedDateRange.startDate || appliedDateRange.endDate)) {
        const joinedDate = new Date(h.joined_at);
        if (appliedDateRange.startDate) {
          const startDate = new Date(appliedDateRange.startDate);
          if (joinedDate < startDate) return false;
        }
        if (appliedDateRange.endDate) {
          const endDate = new Date(appliedDateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (joinedDate > endDate) return false;
        }
      }

      if (hospitalSortBy === 'updated' && (appliedDateRange.startDate || appliedDateRange.endDate)) {
        const updatedDate = new Date(h.last_updated);
        if (appliedDateRange.startDate) {
          const startDate = new Date(appliedDateRange.startDate);
          if (updatedDate < startDate) return false;
        }
        if (appliedDateRange.endDate) {
          const endDate = new Date(appliedDateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (updatedDate > endDate) return false;
        }
      }

      return true;
    });

    // Sort based on selected option
    const sorted = [...filtered].sort((a, b) => {
      if (hospitalSortBy === 'status') {
        // Status sort with toggle: Active first, then by Last Updated (newest first)
        const statusOrder = statusSortToggle === 'active' ? 'active' : 'inactive';
        const aIsActive = hospitalActiveMap[a.id];
        const bIsActive = hospitalActiveMap[b.id];

        // Separate active/inactive
        const aMatches = statusOrder === 'active' ? aIsActive : !aIsActive;
        const bMatches = statusOrder === 'active' ? bIsActive : !bIsActive;

        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;

        // Within same status, sort by last updated (newest first)
        return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
      }

      if (hospitalSortBy === 'joined') {
        return new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime();
      }

      if (hospitalSortBy === 'updated') {
        return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
      }

      return 0;
    });

    return sorted;
  }, [hospitalData, hospitalSearch, hospitalSortBy, statusSortToggle, hospitalActiveMap, appliedDateRange]);

  const userRows = useMemo<UserWithMeta[]>(() => {
    return hospitalUsers.map((u, idx) => ({
      ...u,
      joined_at: userMetadata[u.id]?.joined_at || new Date(2026, 2, 4 + idx).toISOString(),
      last_updated: userMetadata[u.id]?.last_updated || new Date(2026, 2, 10 + idx).toISOString(),
      active: activeMap[u.id] ?? true,
    }));
  }, [hospitalUsers, activeMap, userMetadata]);

  const filteredAndSortedUsers = useMemo(() => {
    const normalized = userSearch.trim().toLowerCase();

    let filtered = userRows.filter((u) => {
      // Search filter
      if (normalized) {
        const matchesSearch = (
          u.full_name.toLowerCase().includes(normalized) ||
          u.email.toLowerCase().includes(normalized) ||
          u.role.toLowerCase().includes(normalized)
        );
        if (!matchesSearch) return false;
      }

      // Apply role filter if selected
      if (userRoleSortFilter && u.role !== userRoleSortFilter) {
        return false;
      }

      // Apply date range filter based on current sort option
      if (userSortBy === 'joined' && (appliedUserDateRange.startDate || appliedUserDateRange.endDate)) {
        const joinedDate = new Date(u.joined_at);
        if (appliedUserDateRange.startDate) {
          const startDate = new Date(appliedUserDateRange.startDate);
          if (joinedDate < startDate) return false;
        }
        if (appliedUserDateRange.endDate) {
          const endDate = new Date(appliedUserDateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (joinedDate > endDate) return false;
        }
      }

      if (userSortBy === 'updated' && (appliedUserDateRange.startDate || appliedUserDateRange.endDate)) {
        const updatedDate = new Date(u.last_updated);
        if (appliedUserDateRange.startDate) {
          const startDate = new Date(appliedUserDateRange.startDate);
          if (updatedDate < startDate) return false;
        }
        if (appliedUserDateRange.endDate) {
          const endDate = new Date(appliedUserDateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (updatedDate > endDate) return false;
        }
      }

      return true;
    });

    // Sort based on selected option
    const sorted = [...filtered].sort((a, b) => {
      if (userSortBy === 'status') {
        // Status sort with toggle: Active first, then by Last Updated (newest first)
        const statusOrder = userStatusSortToggle === 'active' ? 'active' : 'inactive';
        const aIsActive = activeMap[a.id];
        const bIsActive = activeMap[b.id];

        // Separate active/inactive
        const aMatches = statusOrder === 'active' ? aIsActive : !aIsActive;
        const bMatches = statusOrder === 'active' ? bIsActive : !bIsActive;

        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;

        // Within same status, sort by last updated (newest first)
        return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
      }

      if (userSortBy === 'role') {
        return a.role.localeCompare(b.role);
      }

      if (userSortBy === 'joined') {
        return new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime();
      }

      if (userSortBy === 'updated') {
        return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
      }

      return 0;
    });

    return sorted;
  }, [userRows, userSearch, userSortBy, userStatusSortToggle, userRoleSortFilter, activeMap, appliedUserDateRange]);

  const editingUser = useMemo(
    () => hospitalUsers.find((u) => u.id === editingUserId) ?? null,
    [hospitalUsers, editingUserId]
  );

  const [editFullName, setEditFullName] = useState('');
  const [editRole, setEditRole] = useState<User['role']>('clinician');
  const [editActive, setEditActive] = useState(true);
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Check if editing user is an admin - admins cannot change role of other admins
  const isEditingAdmin = editingUser?.role === 'admin';
  const canChangeRole = !isEditingAdmin;

  // Delete user modal state
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const userToDelete = useMemo(
    () => hospitalUsers.find((u) => u.id === deleteUserId) ?? null,
    [hospitalUsers, deleteUserId]
  );

  async function handleDeleteUser() {
    if (!userToDelete) return;
    
    try {
      setDeletingUser(true);
      const response = await apiClient.users.delete(userToDelete.id);
      
      if (response.success) {
        // Refresh users list by calling the API or removing from local state
        alert('User deleted successfully');
        setShowDeleteConfirm(false);
        setDeleteUserId(null);
        // The user list will auto-refresh via the useMockData hook or you can manually update it
        // For now, we'll just close the modals
      } else {
        alert(response.message || 'Failed to delete user');
      }
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(err.message || 'Failed to delete user');
    } finally {
      setDeletingUser(false);
    }
  }

  React.useEffect(() => {
    if (editingUser) {
      setEditFullName(editingUser.full_name);
      setEditRole(editingUser.role);
      setEditActive(activeMap[editingUser.id] ?? true);
      setEditPassword('');
      setShowEditModal(true);
    }
  }, [editingUser, activeMap]);

  const editingHospital = useMemo(
    () => hospitals.find((h) => h.id === editingHospitalId) ?? null,
    [hospitals, editingHospitalId]
  );

  React.useEffect(() => {
    if (editingHospital) {
      setEditHospitalName(editingHospital.name);
      setEditHospitalLocation(editingHospital.location);
      setShowEditHospitalModal(true);
    }
  }, [editingHospital]);

  const toggleActive = (id: string) => {
    setActiveMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleHospitalActive = (id: string) => {
    setHospitalActiveMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveUser = () => {
    if (editingUser) {
      updateUser(editingUser.id, {
        full_name: editFullName,
        role: editRole,
        ...(editPassword.trim() && { password: editPassword }),
      });
      setActiveMap((prev) => ({ ...prev, [editingUser.id]: editActive }));
      
      // Update last_updated timestamp
      setUserMetadata((prev) => ({
        ...prev,
        [editingUser.id]: {
          ...prev[editingUser.id],
          last_updated: new Date().toISOString(),
        },
      }));
      
      setShowEditModal(false);
      setEditingUserId(null);
    }
  };

  const tabButtonClass = (tab: AdminTab) =>
    `inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition ${
      activeTab === tab
        ? 'border border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
    }`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Admin Panel</h1>
        <p className="text-sm text-slate-500">
          {hospitalName}    Manage users, hospitals, audit logs, and monitor activity
        </p>
      </header>

      <div className="flex flex-wrap gap-2 text-sm">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={tabButtonClass('dashboard')}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={tabButtonClass('users')}
        >
          <Users className="h-4 w-4" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('hospitals')}
          className={tabButtonClass('hospitals')}
        >
          <Building2 className="h-4 w-4" />
          Hospitals
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={tabButtonClass('audit')}
        >
          <Activity className="h-4 w-4" />
          Audit Logs
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{hospitalUsers.length}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Hospitals</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{hospitals.length}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-700">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Audit Logs</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{auditLogs.length}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Quick links</h2>
          <p className="mt-2 text-sm text-slate-500">Jump into a section to manage users or hospitals.</p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              onClick={() => setActiveTab('users')}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">Users</p>
                <p className="mt-1 text-xs text-slate-500">Manage system users and roles.</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <span className="text-lg font-bold">U</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('hospitals')}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">Hospitals</p>
                <p className="mt-1 text-xs text-slate-500">Manage hospital profiles and locations.</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <span className="text-lg font-bold">H</span>
              </span>
            </button>
          </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">User Management</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 flex items-center gap-2"
              >
                <span>+</span>
                Create User
              </button>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex w-full max-w-md items-center gap-2">
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="w-full max-w-xs relative">
                <button
                  onClick={() => setShowUserSortMenuOpen(!showUserSortMenuOpen)}
                  className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <span>
                    {userSortBy === 'joined' && 'Sort: Date Joined'}
                    {userSortBy === 'updated' && 'Sort: Last Updated'}
                    {userSortBy === 'status' && 'Sort: Status'}
                    {userSortBy === 'role' && 'Sort: Role'}
                  </span>
                  <Check className="h-4 w-4 text-blue-600" />
                </button>

                {/* User Sort Menu */}
                {showUserSortMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-30"
                      onClick={() => setShowUserSortMenuOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-50 animate-in fade-in zoom-in duration-200">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            setUserSortBy('joined');
                            setShowUserSortMenuOpen(false);
                            setTempUserDateRange(appliedUserDateRange);
                            setShowUserDatePickerModal(true);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            userSortBy === 'joined'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          By Date Joined
                        </button>
                        <button
                          onClick={() => {
                            setUserSortBy('updated');
                            setShowUserSortMenuOpen(false);
                            setTempUserDateRange(appliedUserDateRange);
                            setShowUserDatePickerModal(true);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            userSortBy === 'updated'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          By Last Updated
                        </button>
                        <button
                          onClick={() => {
                            setUserSortBy('status');
                            setShowUserSortMenuOpen(false);
                            setUserPopupType('status');
                            setShowUserSortPopup(true);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            userSortBy === 'status'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          By Status
                        </button>
                        <button
                          onClick={() => {
                            setUserSortBy('role');
                            setShowUserSortMenuOpen(false);
                            setUserPopupType('role');
                            setShowUserSortPopup(true);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            userSortBy === 'role'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          By Role
                        </button>
                      </div>
                    </div>
                  </>
                )}
                
                {/* User Status Detail Popover */}
                {showUserSortPopup && userPopupType === 'status' && (
                  <>
                    <div 
                      className="fixed inset-0 z-30"
                      onClick={() => setShowUserSortPopup(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-50 animate-in fade-in zoom-in duration-200">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            setUserStatusSortToggle('active');
                            setShowUserSortPopup(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            userStatusSortToggle === 'active'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Active
                        </button>
                        <button
                          onClick={() => {
                            setUserStatusSortToggle('inactive');
                            setShowUserSortPopup(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            userStatusSortToggle === 'inactive'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Inactive
                        </button>
                      </div>
                    </div>
                  </>
                )}
                
                {/* User Role Detail Popover */}
                {showUserSortPopup && userPopupType === 'role' && (
                  <>
                    <div 
                      className="fixed inset-0 z-30"
                      onClick={() => setShowUserSortPopup(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-50 animate-in fade-in zoom-in duration-200">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            setUserRoleSortFilter('admin');
                            setShowUserSortPopup(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            userRoleSortFilter === 'admin'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Admin
                        </button>
                        <button
                          onClick={() => {
                            setUserRoleSortFilter('clinician');
                            setShowUserSortPopup(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            userRoleSortFilter === 'clinician'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Clinician
                        </button>
                        <button
                          onClick={() => {
                            setUserRoleSortFilter('registrar');
                            setShowUserSortPopup(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            userRoleSortFilter === 'registrar'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Hospital Staff
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Table
              data={filteredAndSortedUsers}
              rowKey={(row) => row.id}
              columns={[
                { header: 'Name', accessor: 'full_name' },
                { header: 'Email', accessor: 'email' },
                {
                  header: 'Role',
                  accessor: (row: UserWithMeta) => (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
                    </span>
                  ),
                },
                {
                  header: 'Status',
                  accessor: (row: UserWithMeta) => (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      {(activeMap[row.id] ?? true) ? 'Active' : 'Inactive'}
                    </span>
                  ),
                },
                {
                  header: 'Joined',
                  accessor: (row: UserWithMeta) => (
                    <span className="text-sm text-slate-700">
                      {new Date(row.joined_at).toLocaleDateString('en-GB')}
                    </span>
                  ),
                },
                {
                  header: 'Last Updated',
                  accessor: (row: UserWithMeta) => (
                    <span className="text-sm text-slate-700">
                      {new Date(row.last_updated).toLocaleDateString('en-GB')}
                    </span>
                  ),
                },
                {
                  header: 'Actions',
                  accessor: (row: UserWithMeta) => (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setEditingUserId(row.id)}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-2 transition"
                        title="Edit user"
                      >
                        <Pencil className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => toggleActive(row.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          row.active ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                        title={row.active ? 'Deactivate user' : 'Activate user'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            row.active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteUserId(row.id);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 transition"
                        title="Delete user"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ),
                },
              ]}
            />

            <div className="mt-4 text-sm text-slate-500">
              Showing {filteredAndSortedUsers.length} of {userRows.length} users
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hospitals' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Hospitals</h2>
              <p className="text-sm text-slate-500 mt-1">View hospitals that participate in the referral network.</p>
            </div>
            <button
              onClick={() => setShowCreateHospitalModal(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 flex items-center gap-2"
            >
              <span>+</span>
              Add Hospital
            </button>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full max-w-md items-center gap-2">
              <input
                value={hospitalSearch}
                onChange={(e) => setHospitalSearch(e.target.value)}
                placeholder="Search hospitals..."
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="w-full max-w-xs relative">
              <button
                onClick={() => setShowHospitalSortMenuOpen(!showHospitalSortMenuOpen)}
                className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <span>
                  {hospitalSortBy === 'joined' && 'Sort: Date Joined'}
                  {hospitalSortBy === 'updated' && 'Sort: Last Updated'}
                  {hospitalSortBy === 'status' && 'Sort: Status'}
                </span>
                <Check className="h-4 w-4 text-blue-600" />
              </button>

              {/* Hospital Sort Menu */}
              {showHospitalSortMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30"
                    onClick={() => setShowHospitalSortMenuOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-50 animate-in fade-in zoom-in duration-200">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setHospitalSortBy('joined');
                          setShowHospitalSortMenuOpen(false);
                          setTempDateRange(appliedDateRange);
                          setShowDatePickerModal(true);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                          hospitalSortBy === 'joined'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        By Date Joined
                      </button>
                      <button
                        onClick={() => {
                          setHospitalSortBy('updated');
                          setShowHospitalSortMenuOpen(false);
                          setTempDateRange(appliedDateRange);
                          setShowDatePickerModal(true);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                          hospitalSortBy === 'updated'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        By Last Updated
                      </button>
                      <button
                        onClick={() => {
                          setHospitalSortBy('status');
                          setShowHospitalSortMenuOpen(false);
                          setHospitalPopupType('status');
                          setShowHospitalSortPopup(true);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                          hospitalSortBy === 'status'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        By Status
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              {/* Hospital Status Detail Popover */}
              {showHospitalSortPopup && hospitalPopupType === 'status' && (
                <>
                  <div 
                    className="fixed inset-0 z-30"
                    onClick={() => setShowHospitalSortPopup(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-50 animate-in fade-in zoom-in duration-200">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setStatusSortToggle('active');
                          setShowHospitalSortPopup(false);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                          statusSortToggle === 'active'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Active
                      </button>
                      <button
                        onClick={() => {
                          setStatusSortToggle('inactive');
                          setShowHospitalSortPopup(false);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                          statusSortToggle === 'inactive'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Inactive
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <Table
            data={filteredHospitals}
            rowKey={(row) => row.id}
            columns={[
              { header: 'Name', accessor: 'name' },
              { header: 'Location', accessor: 'location' },
              {
                header: 'Referral Count',
                accessor: (row: any) => (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-700">
                      <span className="font-semibold">{row.referral_count}</span> total
                    </span>
                  </div>
                ),
              },
              {
                header: 'Joined',
                accessor: (row: any) => (
                  <span className="text-sm text-slate-700">
                    {new Date(row.joined_at).toLocaleDateString('en-GB')}
                  </span>
                ),
              },
              {
                header: 'Last Updated',
                accessor: (row: any) => (
                  <span className="text-sm text-slate-700">
                    {new Date(row.last_updated).toLocaleDateString('en-GB')}
                  </span>
                ),
              },
              {
                header: 'Status',
                accessor: (row) => (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {hospitalActiveMap[row.id] ? 'Active' : 'Inactive'}
                  </span>
                ),
              },
              {
                header: 'Actions',
                accessor: (row) => (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditingHospitalId(row.id)}
                      className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-2 transition"
                      title="Edit hospital"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => toggleHospitalActive(row.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        hospitalActiveMap[row.id] ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                      title={hospitalActiveMap[row.id] ? 'Deactivate' : 'Activate'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          hospitalActiveMap[row.id] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => deleteHospital(row.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 transition"
                      title="Delete hospital"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ),
              },
            ]}
          />

          <div className="text-sm text-slate-500">
            Showing {filteredHospitals.length} of {hospitalData.length} hospitals
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Audit Logs</h2>
            <button
              onClick={() => {
                // Convert audit logs to CSV
                const headers = ['Action', 'Entity Type', 'Entity ID', 'User ID', 'IP Address', 'Details', 'Timestamp'];
                const rows = auditLogs.map(log => [
                  log.action,
                  log.entity_type,
                  log.entity_id,
                  log.user_id,
                  log.ip_address,
                  JSON.stringify(log.details),
                  log.timestamp,
                ]);
                const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          <div className="flex gap-4 mb-6 flex-wrap">
            <select
              value={auditActionFilter}
              onChange={(e) => setAuditActionFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm bg-white text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option>All Actions</option>
              <option>User Updated</option>
              <option>Status Changed</option>
              <option>User Created</option>
              <option>Data Accessed</option>
            </select>

            <input
              type="date"
              value={auditStartDate}
              onChange={(e) => setAuditStartDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm bg-white text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="dd/mm/yyyy"
            />

            <input
              type="date"
              value={auditEndDate}
              onChange={(e) => setAuditEndDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm bg-white text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="dd/mm/yyyy"
            />
          </div>

          <Table
            data={filteredAuditLogs}
            rowKey={(row) => row.id}
            columns={[
              { header: 'Action', accessor: 'action' },
              { header: 'Entity Type', accessor: 'entity_type' },
              { header: 'Entity ID', accessor: 'entity_id' },
              { header: 'User ID', accessor: 'user_id' },
              { header: 'IP Address', accessor: 'ip_address' },
              {
                header: 'Details',
                accessor: (row: AuditLog) => (
                  <span className="truncate max-w-xs" title={JSON.stringify(row.details)}>
                    {JSON.stringify(row.details).substring(0, 50)}...
                  </span>
                ),
              },
              {
                header: 'Timestamp',
                accessor: (row: AuditLog) => (
                  <span className="text-sm">
                    {new Date(row.timestamp).toLocaleString('en-GB')}
                  </span>
                ),
              },
            ]}
          />

          <div className="mt-4 text-sm text-slate-500">
            Showing 1–{filteredAuditLogs.length} of {auditLogs.length}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-8 shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Create User</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowCreatePassword(false);
                }}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-900">Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={createFullName}
                  onChange={(e) => setCreateFullName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">Email *</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">Password *</label>
                <div className="relative mt-2">
                  <input
                    type={showCreatePassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                  >
                    {showCreatePassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">Role</label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as User['role'])}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="admin">Admin</option>
                  <option value="clinician">Clinician</option>
                  <option value="registrar">Registrar</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">Hospital</label>
                <div className="mt-2 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 bg-slate-50">
                  {hospitalName}
                </div>
                <p className="mt-1 text-xs text-slate-500">Users are always assigned to your hospital</p>
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowCreatePassword(false);
                  setCreateFullName('');
                  setCreateEmail('');
                  setCreatePassword('');
                  setCreateRole('clinician');
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (createFullName.trim() && createEmail.trim() && createPassword.trim()) {
                    try {
                      const newUser = await addUser({
                        full_name: createFullName,
                        email: createEmail,
                        role: createRole,
                        hospital_id: user?.hospital_id || '',
                      });
                      
                      // Update user metadata with timestamps
                      const now = new Date().toISOString();
                      setUserMetadata((prev) => ({
                        ...prev,
                        [newUser.id]: {
                          joined_at: now,
                          last_updated: now,
                        },
                      }));
                      
                      setShowCreateModal(false);
                      setShowCreatePassword(false);
                      setCreateFullName('');
                      setCreateEmail('');
                      setCreatePassword('');
                      setCreateRole('clinician');
                    } catch (err: any) {
                      alert(`Failed to create user: ${err.message}`);
                    }
                  }
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-8 shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Edit User</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUserId(null);
                  setShowEditPassword(false);
                }}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-900">Full Name *</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">Email *</label>
                <div className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 bg-slate-50">
                  {editingUser.email}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">Reset Password</label>
                <div className="relative mt-2">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    placeholder="Leave blank to keep current password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                    title={showEditPassword ? 'Hide password' : 'Show password'}
                  >
                    {showEditPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">Enter a new password to reset. Old password cannot be viewed.</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">Role</label>
                {isEditingAdmin && (
                  <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs text-amber-800">
                      <span className="font-semibold">⚠️ Cannot change role of admin users.</span> Only non-admin users can have their roles modified.
                    </p>
                  </div>
                )}
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as User['role'])}
                  disabled={isEditingAdmin}
                  className={`mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                    isEditingAdmin ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="admin">Admin</option>
                  <option value="clinician">Clinician</option>
                  <option value="registrar">Registrar</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">Hospital</label>
                <div className="mt-2 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 bg-slate-50">
                  {hospitalName}
                </div>
                <p className="mt-1 text-xs text-slate-500">Users are always assigned to your hospital</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-sm font-medium text-slate-900">Active</label>
                <button
                  onClick={() => setEditActive(!editActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    editActive ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      editActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUserId(null);
                  setShowEditPassword(false);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Hospital Modal */}
      {showCreateHospitalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-8 shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Add Hospital</h2>
              <button
                onClick={() => setShowCreateHospitalModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-900">Hospital Name *</label>
                <input
                  type="text"
                  placeholder="Enter hospital name"
                  value={createHospitalName}
                  onChange={(e) => setCreateHospitalName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">Location *</label>
                <input
                  type="text"
                  placeholder="Enter hospital location"
                  value={createHospitalLocation}
                  onChange={(e) => setCreateHospitalLocation(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateHospitalModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (createHospitalName.trim() && createHospitalLocation.trim()) {
                    const newHospital = await addHospital({
                      name: createHospitalName,
                      location: createHospitalLocation,
                    });
                    // Add metadata for new hospital
                    if (newHospital && newHospital.id) {
                      setHospitalMetadata((prev) => ({
                        ...prev,
                        [newHospital.id]: {
                          joined_at: new Date().toISOString(),
                          last_updated: new Date().toISOString(),
                        },
                      }));
                    }
                    setShowCreateHospitalModal(false);
                    setCreateHospitalName('');
                    setCreateHospitalLocation('');
                  }
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Add Hospital
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hospital Modal */}
      {showEditHospitalModal && editingHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-8 shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Edit Hospital</h2>
              <button
                onClick={() => {
                  setShowEditHospitalModal(false);
                  setEditingHospitalId(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-900">Hospital Name *</label>
                <input
                  type="text"
                  value={editHospitalName}
                  onChange={(e) => setEditHospitalName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">Location *</label>
                <input
                  type="text"
                  value={editHospitalLocation}
                  onChange={(e) => setEditHospitalLocation(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowEditHospitalModal(false);
                  setEditingHospitalId(null);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingHospital && editHospitalName.trim() && editHospitalLocation.trim()) {
                    updateHospital(editingHospital.id, {
                      name: editHospitalName,
                      location: editHospitalLocation,
                    });
                    // Update last_updated timestamp
                    setHospitalMetadata((prev) => ({
                      ...prev,
                      [editingHospital.id]: {
                        ...prev[editingHospital.id],
                        last_updated: new Date().toISOString(),
                      },
                    }));
                    setShowEditHospitalModal(false);
                    setEditingHospitalId(null);
                  }
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Picker Modal */}
      {showDatePickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-8 shadow-lg max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {hospitalSortBy === 'joined' ? 'Filter by Date Joined' : 'Filter by Last Updated'}
              </h2>
              <button
                onClick={() => {
                  setShowDatePickerModal(false);
                  setTempDateRange({ startDate: '', endDate: '' });
                }}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-900">Start Date</label>
                <input
                  type="date"
                  value={tempDateRange.startDate}
                  onChange={(e) => setTempDateRange({ ...tempDateRange, startDate: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">End Date</label>
                <input
                  type="date"
                  value={tempDateRange.endDate}
                  onChange={(e) => setTempDateRange({ ...tempDateRange, endDate: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setAppliedDateRange({ startDate: '', endDate: '' });
                  setShowDatePickerModal(false);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Clear Filters
              </button>
              <button
                onClick={() => {
                  setAppliedDateRange(tempDateRange);
                  setShowDatePickerModal(false);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Picker Modal for Users */}
      {showUserDatePickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-8 shadow-lg max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {userSortBy === 'joined' ? 'Filter by Date Joined' : 'Filter by Last Updated'}
              </h2>
              <button
                onClick={() => {
                  setShowUserDatePickerModal(false);
                  setTempUserDateRange({ startDate: '', endDate: '' });
                }}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-900">Start Date</label>
                <input
                  type="date"
                  value={tempUserDateRange.startDate}
                  onChange={(e) => setTempUserDateRange({ ...tempUserDateRange, startDate: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">End Date</label>
                <input
                  type="date"
                  value={tempUserDateRange.endDate}
                  onChange={(e) => setTempUserDateRange({ ...tempUserDateRange, endDate: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setAppliedUserDateRange({ startDate: '', endDate: '' });
                  setShowUserDatePickerModal(false);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Clear Filters
              </button>
              <button
                onClick={() => {
                  setAppliedUserDateRange(tempUserDateRange);
                  setShowUserDatePickerModal(false);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-8 shadow-lg max-w-md w-full mx-4">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900">Delete User</h2>
                <p className="mt-1 text-sm text-slate-600">
                  This action cannot be undone. The user will be permanently deleted from the system.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteUserId(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Name</span>
                <span className="text-sm font-semibold text-slate-900">{userToDelete.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Email</span>
                <span className="text-sm font-semibold text-slate-900">{userToDelete.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Role</span>
                <span className="text-sm font-semibold text-slate-900 capitalize">{userToDelete.role}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteUserId(null);
                }}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deletingUser}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {deletingUser ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
