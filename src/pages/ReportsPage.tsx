import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  Download,
  Filter,
  ChevronDown,
  Building,
  ClipboardList,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useMockData } from '../hooks/useMockData';
import { Transfer } from '../types';
import { getDepartmentsForHospital } from '../data/departments';
import { StatCard } from '../components/UI/StatCard';
import ExcelJS from 'exceljs';
import { StatusBadge } from '../components/UI/StatusBadge';
import { apiClient } from '../services/api';

type DateRange = 'all' | '7days' | '30days' | '90days' | 'custom';
type StatusFilter =
  | 'all'
  | 'pending'
  | 'approved'
  | 'completed'
  | 'rejected'
  | 'in_transit'
  | 'cancelled';

// Chart color definitions
const STATUS_COLORS: Record<string, string> = {
  pending: '#EAB308',
  approved: '#3B82F6',
  completed: '#10B981',
  rejected: '#EF4444',
  in_transit: '#8B5CF6',
  cancelled: '#F97316',
  unknown: '#94A3B8',
};

const DEPARTMENT_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
];

export function ReportsPage() {
  const { user } = useAuth();
  const { patients, referrals, hospitals, users, auditLogs, transfers } = useMockData();
  const [activeReportTab, setActiveReportTab] = useState<'referrals' | 'transfers'>('referrals');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isDepartmentMenuOpen, setIsDepartmentMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);

  // Refresh callback for fallback: refreshes user and hospitals list
  const handleRefreshForDepartments = async () => {
    try {
      // Refresh the current user from the server (updates hospital_id if needed)
      await apiClient.auth.verify();
      // Refresh hospitals list
      await apiClient.hospitals.list();
    } catch (error) {
      console.error('Failed to refresh user/hospitals:', error);
    }
  };

  // Fetch departments for current hospital, with local fallback
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!user?.hospital_id) {
        setDepartmentsLoading(false);
        return;
      }

      const currentHospitalName = hospitals.find((h) => h.id === user.hospital_id)?.name;
      const localDeptNames = getDepartmentsForHospital(user.hospital_id, currentHospitalName)
        .map((dept) => dept.name)
        .sort();

      const fallbackToLocalDepartments = () => {
        setDepartments(localDeptNames);
        setDepartmentsError(null);
      };

      try {
        setDepartmentsLoading(true);
        const response = await apiClient.hospitals.getExternalDepartments(user.hospital_id);

        if (response.success && Array.isArray(response.data?.departments) && response.data.departments.length > 0) {
          const deptNames = response.data.departments.map((dept: any) =>
            typeof dept === 'string' ? dept : dept.departmentName || dept.category || dept.name
          );

          if (deptNames.length < localDeptNames.length) {
            fallbackToLocalDepartments();
          } else {
            setDepartments(deptNames);
            setDepartmentsError(null);
          }
        } else {
          fallbackToLocalDepartments();
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        fallbackToLocalDepartments();
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchDepartments();
  }, [user?.hospital_id, hospitals]);

  const hospitalMap = useMemo(() => {
    const map = new Map<string, string>();
    hospitals.forEach((h) => map.set(h.id, h.name));
    return map;
  }, [hospitals]);

  const isAdmin = user?.role === 'admin';
  const hospitalName = hospitals.find((h) => h.id === user?.hospital_id)?.name || 'Your Hospital';

  const totalUsers = users.length;
  const totalAuditEvents = auditLogs.length;

  const allHospitalDepartments = useMemo(() => {
    return Array.from(
      new Set(
        referrals
          .map((ref) => ref.department)
          .filter(Boolean) as string[]
      )
    ).sort();
  }, [referrals]);

  const userRoleBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((u) => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });
    return Object.entries(counts);
  }, [users]);

  const clinicianCount = userRoleBreakdown.find(([role]) => role === 'clinician')?.[1] ?? 0;
  const adminCount = userRoleBreakdown.find(([role]) => role === 'admin')?.[1] ?? 0;

  const auditActionBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    auditLogs.forEach((log) => {
      counts[log.action] = (counts[log.action] || 0) + 1;
    });
    return Object.entries(counts);
  }, [auditLogs]);

  const recentAuditLogs = useMemo(() => {
    return [...auditLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);
  }, [auditLogs]);

  // Filter referrals by hospital
  const hospitalReferrals = useMemo(() => {
    if (!user) return [];
    return referrals.filter(
      (ref) =>
        ref.requesting_hospital_id === user.hospital_id ||
        ref.receiving_hospital_id === user.hospital_id
    );
  }, [referrals, user]);

  // Apply additional filters
  const filteredReferrals = useMemo(() => {
    let result = [...hospitalReferrals];

    // Date range filter
    if (dateRange !== 'all') {
      if (dateRange === 'custom') {
        const startDate = customStartDate ? new Date(customStartDate) : null;
        const endDate = customEndDate ? new Date(customEndDate) : null;

        if (startDate) {
          startDate.setHours(0, 0, 0, 0);
        }

        if (endDate) {
          endDate.setHours(23, 59, 59, 999);
        }

        result = result.filter((ref) => {
          const createdAt = new Date(ref.created_at);
          if (startDate && createdAt < startDate) return false;
          if (endDate && createdAt > endDate) return false;
          return true;
        });
      } else {
        const now = new Date();
        let daysBack = 7;
        if (dateRange === '30days') daysBack = 30;
        if (dateRange === '90days') daysBack = 90;

        const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        result = result.filter((ref) => new Date(ref.created_at) >= cutoffDate);
      }
    }

    // Department filter
    if (departmentFilter.length > 0) {
      result = result.filter((ref) => departmentFilter.includes(ref.department ?? ''));
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((ref) => ref.status === statusFilter);
    }

    return result;
  }, [hospitalReferrals, dateRange, customStartDate, customEndDate, departmentFilter, statusFilter]);

  const hospitalTransfers = useMemo(() => {
    if (!user) return [];
    return transfers.filter(
      (transfer) =>
        transfer.fromHospitalId === user.hospital_id || transfer.toHospitalId === user.hospital_id
    );
  }, [transfers, user]);

  const allTransferDepartments = useMemo(() => {
    const departmentNames = new Set<string>();

    departments.forEach((dept) => {
      if (dept?.trim()) departmentNames.add(dept.trim());
    });

    hospitalTransfers.forEach((transfer) => {
      const receivingService = transfer.receivingService || '';

      receivingService
        .split(',')
        .map((dept) => dept.trim())
        .filter(Boolean)
        .forEach((dept) => departmentNames.add(dept));
    });

    return Array.from(departmentNames).sort((a, b) => a.localeCompare(b));
  }, [departments, hospitalTransfers]);

  const filteredTransfers = useMemo(() => {
    let result = [...hospitalTransfers];

    if (dateRange !== 'all') {
      if (dateRange === 'custom') {
        const startDate = customStartDate ? new Date(customStartDate) : null;
        const endDate = customEndDate ? new Date(customEndDate) : null;

        if (startDate) {
          startDate.setHours(0, 0, 0, 0);
        }

        if (endDate) {
          endDate.setHours(23, 59, 59, 999);
        }

        result = result.filter((transfer) => {
          const createdAt = new Date(transfer.createdAt || '');
          if (startDate && createdAt < startDate) return false;
          if (endDate && createdAt > endDate) return false;
          return true;
        });
      } else {
        const now = new Date();
        let daysBack = 7;
        if (dateRange === '30days') daysBack = 30;
        if (dateRange === '90days') daysBack = 90;

        const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        result = result.filter((transfer) => new Date(transfer.createdAt || '') >= cutoffDate);
      }
    }

    if (departmentFilter.length > 0) {
      result = result.filter((transfer) => {
        const services = (transfer.receivingService || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

        return services.some((service) => departmentFilter.includes(service));
      });
    }

    if (statusFilter !== 'all') {
      result = result.filter((transfer) => transfer.status === statusFilter);
    }

    return result;
  }, [hospitalTransfers, dateRange, customStartDate, customEndDate, departmentFilter, statusFilter]);

  const transferStatusReport = useMemo(() => {
    const statusCounts: Record<string, number> = {
      pending: 0,
      approved: 0,
      in_transit: 0,
      completed: 0,
      cancelled: 0,
    };

    filteredTransfers.forEach((transfer: Transfer) => {
      statusCounts[transfer.status] = (statusCounts[transfer.status] || 0) + 1;
    });

    return statusCounts;
  }, [filteredTransfers]);

  const transferTypeReport = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    filteredTransfers.forEach((transfer: Transfer) => {
      const transferType = transfer.transferType || 'Unknown';
      typeCounts[transferType] = (typeCounts[transferType] || 0) + 1;
    });

    return Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  }, [filteredTransfers]);

  const transferDepartmentReport = useMemo(() => {
    const departmentCounts: Record<string, number> = {};

    filteredTransfers.forEach((transfer: Transfer) => {
      const services = (transfer.receivingService || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      if (services.length === 0) {
        departmentCounts['Unknown'] = (departmentCounts['Unknown'] || 0) + 1;
        return;
      }

      services.forEach((service) => {
        departmentCounts[service] = (departmentCounts[service] || 0) + 1;
      });
    });

    return Object.entries(departmentCounts).sort((a, b) => b[1] - a[1]);
  }, [filteredTransfers]);

  const transferHospitalReport = useMemo(() => {
    const hospitalCounts: Record<string, number> = {};

    filteredTransfers.forEach((transfer: Transfer) => {
      const isReceivingHere = transfer.toHospitalId === user?.hospital_id;
      const targetHospitalId = isReceivingHere ? transfer.fromHospitalId : transfer.toHospitalId;
      const hospital =
        isReceivingHere
          ? transfer.fromHospital?.name || hospitalMap.get(targetHospitalId) || 'Unknown'
          : transfer.toHospital?.name || hospitalMap.get(targetHospitalId) || 'Unknown';

      hospitalCounts[hospital] = (hospitalCounts[hospital] || 0) + 1;
    });

    return Object.entries(hospitalCounts).sort((a, b) => b[1] - a[1]);
  }, [filteredTransfers, hospitalMap, user?.hospital_id]);

  const transferTrendData = useMemo(() => {
    const dateMap = new Map<string, number>();

    filteredTransfers.forEach((transfer: Transfer) => {
      const date = new Date(transfer.createdAt || '').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    return Array.from(dateMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, count]) => ({ date, transfers: count }));
  }, [filteredTransfers]);

  const transferStats = useMemo(() => {
    const pending = filteredTransfers.filter((t: Transfer) => t.status === 'pending').length;
    const inTransit = filteredTransfers.filter((t: Transfer) => t.status === 'in_transit').length;
    const completed = filteredTransfers.filter((t: Transfer) => t.status === 'completed').length;
    const cancelled = filteredTransfers.filter((t: Transfer) => t.status === 'cancelled').length;

    return {
      total: filteredTransfers.length,
      pending,
      inTransit,
      completed,
      cancelled,
    };
  }, [filteredTransfers]);

  const recentTransfers = useMemo(() => {
    return [...filteredTransfers]
      .sort((a: Transfer, b: Transfer) => {
        const aTime = Date.parse(a.createdAt || '') || 0;
        const bTime = Date.parse(b.createdAt || '') || 0;
        if (aTime || bTime) {
          return bTime - aTime;
        }
        return (b.transferNumber || 0) - (a.transferNumber || 0);
      })
      .slice(0, 5);
  }, [filteredTransfers]);

  const filterDepartments = activeReportTab === 'referrals' ? departments : allTransferDepartments;
  const statusOptions: StatusFilter[] = activeReportTab === 'referrals'
    ? ['all', 'pending', 'approved', 'completed', 'rejected']
    : ['all', 'pending', 'approved', 'in_transit', 'completed', 'cancelled'];

  const statusLabel = (option: StatusFilter) =>
    option === 'all'
      ? 'All Statuses'
      : option.replace(/_/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());

  // Statistics
  const stats = useMemo(() => {
    const hospitalPatients = patients.filter((p) => p.hospital_id === user?.hospital_id);
    const pending = filteredReferrals.filter((r) => r.status === 'pending').length;
    const completed = filteredReferrals.filter((r) => r.status === 'completed').length;

    return {
      patients: hospitalPatients.length,
      referrals: filteredReferrals.length,
      pending,
      completed,
    };
  }, [patients, filteredReferrals, user?.hospital_id]);

  // Referral status report
  const statusReport = useMemo(() => {
    const statuses: Record<string, number> = {
      pending: 0,
      approved: 0,
      completed: 0,
      rejected: 0,
    };

    filteredReferrals.forEach((ref) => {
      statuses[ref.status]++;
    });

    return statuses;
  }, [filteredReferrals]);

  // Department report
  const departmentReport = useMemo(() => {
    const dept: Record<string, number> = {};
    departments.forEach((d) => (dept[d] = 0));

    filteredReferrals.forEach((ref) => {
      if (ref.department && dept.hasOwnProperty(ref.department)) {
        dept[ref.department]++;
      }
    });

    return Object.entries(dept)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [filteredReferrals, departments]);

  // Hospital report
  const hospitalReport = useMemo(() => {
    const hosp: Record<string, number> = {};

    filteredReferrals.forEach((ref) => {
      const targetHospId =
        ref.receiving_hospital_id === user?.hospital_id
          ? ref.requesting_hospital_id
          : ref.receiving_hospital_id;

      const hospName = hospitalMap.get(targetHospId) || 'Unknown';
      hosp[hospName] = (hosp[hospName] || 0) + 1;
    });

    return Object.entries(hosp).sort((a, b) => b[1] - a[1]);
  }, [filteredReferrals, user?.hospital_id, hospitalMap]);

  // Recent referrals
  const recentReferrals = useMemo(() => {
    return filteredReferrals
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [filteredReferrals]);

  const escapeCsvValue = (value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined) return '""';
    const escaped = String(value).replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const buildPdfHtml = () => {
    const reportTitle = isAdmin
      ? 'MedExchange Admin Report'
      : activeReportTab === 'transfers'
        ? 'MedExchange Transfer Report'
        : 'MedExchange Referral Report';

    const reportSubtitle = isAdmin
      ? `${hospitalName} administration summary and referral analytics.`
      : activeReportTab === 'transfers'
        ? `${hospitalName} transfer analytics and hospital performance summary.`
        : `${hospitalName} referral analytics and hospital performance summary.`;
    const dateText = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });

    const statusRows = Object.entries(statusReport)
      .map(([status, count]) => `<tr><td>${status.charAt(0).toUpperCase() + status.slice(1)}</td><td>${count}</td></tr>`)
      .join('');

    const departmentRows = departmentReport
      .map(([dept, count]) => `<tr><td>${dept}</td><td>${count}</td></tr>`)
      .join('');

    const hospitalRows = hospitalReport
      .map(([hospitalNameItem, count]) => `<tr><td>${hospitalNameItem}</td><td>${count}</td></tr>`)
      .join('');

    const summaryCardsHtml = isAdmin
      ? `
            <div class="summary-grid">
              <div class="summary-card"><strong>Total Users</strong><span>${totalUsers}</span></div>
              <div class="summary-card"><strong>Total Hospitals</strong><span>${hospitals.length}</span></div>
              <div class="summary-card"><strong>Total Departments</strong><span>${allHospitalDepartments.length}</span></div>
              <div class="summary-card"><strong>Total Audit Events</strong><span>${totalAuditEvents}</span></div>
            </div>
          `
      : activeReportTab === 'transfers'
        ? `
            <div class="summary-grid">
              <div class="summary-card"><strong>Total Transfers</strong><span>${transferStats.total}</span></div>
              <div class="summary-card"><strong>Pending Transfers</strong><span>${transferStats.pending}</span></div>
              <div class="summary-card"><strong>In Transit</strong><span>${transferStats.inTransit}</span></div>
              <div class="summary-card"><strong>Completed Transfers</strong><span>${transferStats.completed}</span></div>
            </div>
          `
        : `
            <div class="summary-grid">
              <div class="summary-card"><strong>Total Referrals</strong><span>${stats.referrals}</span></div>
              <div class="summary-card"><strong>Total Patients</strong><span>${stats.patients}</span></div>
              <div class="summary-card"><strong>Pending Referrals</strong><span>${stats.pending}</span></div>
              <div class="summary-card"><strong>Completed Referrals</strong><span>${stats.completed}</span></div>
            </div>
          `;

    const usersRowsHtml = users
      .map((userItem) => `
        <tr>
          <td>${userItem.full_name}</td>
          <td>${userItem.email}</td>
          <td>${userItem.role}</td>
          <td>${hospitalMap.get(userItem.hospital_id) || 'Unknown'}</td>
        </tr>`)
      .join('');

    const transferRows = recentTransfers
      .map((transfer) => {
        const statusLabel = transfer.status.replace(/_/g, ' ');
        const fromHospital = transfer.fromHospital?.name || hospitalMap.get(transfer.fromHospitalId) || 'Unknown';
        const toHospital = transfer.toHospital?.name || hospitalMap.get(transfer.toHospitalId) || 'Unknown';
        return `
          <tr>
            <td>${formatDate(transfer.createdAt || '')}</td>
            <td>${transfer.patientName || '—'}</td>
            <td>${fromHospital}</td>
            <td>${toHospital}</td>
            <td>${transfer.transferType || '—'}</td>
            <td>${statusLabel}</td>
          </tr>`;
      })
      .join('');

    const referralRows = recentReferrals
      .map(
        (ref) => {
          const status = ref.status.toLowerCase().replace(/\s+/g, '-');
          const priority = ref.priority.toLowerCase().replace(/\s+/g, '-');
          return `
          <tr>
            <td>${formatDate(ref.created_at)}</td>
            <td>${ref.patient_name}</td>
            <td>${hospitalMap.get(ref.requesting_hospital_id) || ref.requesting_hospital_id}</td>
            <td>${hospitalMap.get(ref.receiving_hospital_id) || ref.receiving_hospital_id}</td>
            <td>${ref.department}</td>
            <td><span class="badge badge-status-${status}">${ref.status}</span></td>
            <td><span class="badge badge-priority-${priority}">${ref.priority}</span></td>
          </tr>`;
        }
      )
      .join('');

    const hospitalsRowsHtml = hospitals
      .map((hospital) => `
        <tr>
          <td>${hospital.name}</td>
          <td>${hospital.location || '—'}</td>
        </tr>`)
      .join('');

    const auditActionRows = auditActionBreakdown
      .map(([action, count]) => `
        <tr>
          <td>${action}</td>
          <td>${count}</td>
        </tr>`)
      .join('');

    const adminExtraHtml = isAdmin
      ? `
            <div class="section">
              <div class="section-header">
                <h2 class="section-title">User Overview</h2>
                <p class="section-subtitle">System users across all hospitals in the network.</p>
              </div>
              <div class="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Hospital</th>
                    </tr>
                  </thead>
                  <tbody>${usersRowsHtml}</tbody>
                </table>
              </div>
            </div>

            <div class="section">
              <div class="section-header">
                <h2 class="section-title">Hospital Network</h2>
                <p class="section-subtitle">Hospitals included in the current admin view.</p>
              </div>
              <div class="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Hospital</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>${hospitalsRowsHtml}</tbody>
                </table>
              </div>
            </div>

            <div class="section">
              <div class="section-header">
                <h2 class="section-title">Audit Activity</h2>
                <p class="section-subtitle">Recent system actions grouped by type.</p>
              </div>
              <div class="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>${auditActionRows}</tbody>
                </table>
              </div>
            </div>
          `
      : '';

    const transferDepartmentRows = transferDepartmentReport
      .map(([department, count]) => `
        <tr>
          <td>${department}</td>
          <td>${count}</td>
        </tr>`)
      .join('');

    const transferHospitalRows = transferHospitalReport
      .map(([hospital, count]) => `
        <tr>
          <td>${hospital}</td>
          <td>${count}</td>
        </tr>`)
      .join('');

    const transferSectionHtml = `
            <div class="section">
              <div class="section-header">
                <h2 class="section-title">Transfer Status</h2>
                <p class="section-subtitle">Current transfer outcomes at a glance.</p>
              </div>
              <div class="table-card">
                <table>
                  <thead>
                    <tr><th>Status</th><th>Count</th></tr>
                  </thead>
                  <tbody>${Object.entries(transferStatusReport)
                    .map(([status, count]) => `
                      <tr>
                        <td>${status.replace(/_/g, ' ')}</td>
                        <td>${count}</td>
                      </tr>`)
                    .join('')}</tbody>
                </table>
              </div>
            </div>

            <div class="section">
              <div class="section-header">
                <h2 class="section-title">Transfers by Department</h2>
                <p class="section-subtitle">How transfers are distributed across receiving departments.</p>
              </div>
              <div class="table-card">
                <table>
                  <thead>
                    <tr><th>Department</th><th>Count</th></tr>
                  </thead>
                  <tbody>${transferDepartmentRows}</tbody>
                </table>
              </div>
            </div>

            <div class="section">
              <div class="section-header">
                <h2 class="section-title">Transfers by Receiving Hospital</h2>
                <p class="section-subtitle">A breakdown of transfer destinations and originating hospitals.</p>
              </div>
              <div class="table-card">
                <table>
                  <thead>
                    <tr><th>Hospital</th><th>Count</th></tr>
                  </thead>
                  <tbody>${transferHospitalRows}</tbody>
                </table>
              </div>
            </div>

            <div class="section">
              <div class="section-header">
                <h2 class="section-title">Recent Transfers</h2>
                <p class="section-subtitle">Latest transfer activity and destination details.</p>
              </div>
              <div class="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Patient</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>${transferRows}</tbody>
                </table>
              </div>
            </div>
          `;

    const referralSectionHtml = isAdmin
      ? ''
      : activeReportTab === 'transfers'
        ? transferSectionHtml
        : `
            <div class="section">
              <div class="section-header">
                <h2 class="section-title">Referral Status</h2>
                <p class="section-subtitle">Current referral outcomes at a glance.</p>
              </div>
              <div class="table-card">
                <table>
                  <thead>
                    <tr><th>Status</th><th>Count</th></tr>
                  </thead>
                  <tbody>${statusRows}</tbody>
                </table>
              </div>
            </div>

            <div class="section">
              <div class="section-header">
                <h2 class="section-title">Referrals by Department</h2>
                <p class="section-subtitle">How referrals are distributed across departments.</p>
              </div>
              <div class="table-card">
                <table>
                  <thead>
                    <tr><th>Department</th><th>Count</th></tr>
                  </thead>
                  <tbody>${departmentRows}</tbody>
                </table>
              </div>
            </div>

            <div class="section">
              <div class="section-header">
                <h2 class="section-title">Referrals by Hospital</h2>
                <p class="section-subtitle">A breakdown of referring and receiving hospitals.</p>
              </div>
              <div class="table-card">
                <table>
                  <thead>
                    <tr><th>Hospital</th><th>Count</th></tr>
                  </thead>
                  <tbody>${hospitalRows}</tbody>
                </table>
              </div>
            </div>

            <div class="section">
              <div class="section-header">
                <h2 class="section-title">Recent Referrals</h2>
                <p class="section-subtitle">Latest referral activity, including priority and status.</p>
              </div>
              <div class="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Patient</th>
                      <th>Requesting Hospital</th>
                      <th>Receiving Hospital</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>${referralRows}</tbody>
                </table>
              </div>
            </div>
          `;

    return `
      <html>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; color: #0f172a; background: #f1f5f9; }
            .page { width: 100%; max-width: 960px; margin: 0 auto; padding: 36px 32px 42px; background: #ffffff; }
            .header { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 18px; align-items: flex-start; margin-bottom: 32px; }
            .brand { display: flex; flex-direction: column; gap: 8px; }
            .brand-title { font-size: 2rem; font-weight: 700; margin: 0; letter-spacing: -0.03em; }
            .brand-subtitle { margin: 0; color: #475569; font-size: 0.98rem; line-height: 1.6; }
            .meta { min-width: 220px; text-align: right; }
            .meta p { margin: 0; color: #475569; font-size: 0.95rem; line-height: 1.6; }
            .meta .label { display: block; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 32px; }
            .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; padding: 20px 22px; box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06); }
            .summary-card strong { display: block; color: #0f172a; font-size: 0.95rem; margin-bottom: 10px; }
            .summary-card span { display: block; font-size: 1.8rem; font-weight: 700; color: #111827; }
            .section { margin-bottom: 30px; }
            .section-header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px; }
            .section-title { font-size: 1.1rem; font-weight: 700; margin: 0; color: #0f172a; }
            .section-subtitle { margin: 0; color: #64748b; font-size: 0.94rem; }
            .table-card { overflow: hidden; border-radius: 18px; border: 1px solid #e2e8f0; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05); }
            table { width: 100%; border-collapse: collapse; background: #ffffff; }
            thead th { padding: 14px 18px; text-align: left; font-weight: 700; font-size: 0.95rem; color: #0f172a; border-bottom: 1px solid #e2e8f0; background: #f8fafc; text-transform: uppercase; letter-spacing: 0.02em; }
            tbody tr:nth-child(odd) { background: #f8fafc; }
            tbody td { padding: 14px 18px; color: #334155; font-size: 0.92rem; border-bottom: 1px solid #e2e8f0; }
            .badge { display: inline-flex; align-items: center; justify-content: center; padding: 6px 10px; border-radius: 999px; font-size: 0.82rem; font-weight: 700; text-transform: capitalize; }
            .badge-status-pending { background: #fef3c7; color: #92400e; }
            .badge-status-approved { background: #d1fae5; color: #166534; }
            .badge-status-completed { background: #dbeafe; color: #1e40af; }
            .badge-status-rejected { background: #fee2e2; color: #991b1b; }
            .badge-status-other { background: #e2e8f0; color: #334155; }
            .badge-priority-high { background: #fee2e2; color: #b91c1c; }
            .badge-priority-medium { background: #ffedd5; color: #c2410c; }
            .badge-priority-low { background: #d1fae5; color: #166534; }
            .badge-priority-other { background: #e2e8f0; color: #334155; }
            .footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 16px; align-items: center; margin-top: 36px; color: #64748b; font-size: 0.9rem; }
            .footer .note { max-width: 65%; }
            .divider { height: 1px; background: #e2e8f0; margin: 22px 0; border: none; }
            @media print {
              body { background: #ffffff; }
              .page { box-shadow: none; margin: 0; padding: 24px; }
              .summary-grid, .table-card { page-break-inside: avoid; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <div class="brand">
                <h1 class="brand-title">${reportTitle}</h1>
                <p class="brand-subtitle">${reportSubtitle}</p>
              </div>
              <div class="meta">
                <p class="label">Generated</p>
                <p>${dateText}</p>
                <p class="label" style="margin-top: 18px;">Hospital</p>
                <p>${hospitalName}</p>
                <p class="label" style="margin-top: 18px;">Scope</p>
                <p>${isAdmin ? 'Admin management data only' : activeReportTab === 'transfers' ? `${filteredTransfers.length} transfers included` : `${filteredReferrals.length} referrals included`}</p>
              </div>
            </div>

            ${summaryCardsHtml}
            ${adminExtraHtml}
            ${referralSectionHtml}

            <div class="divider"></div>
            <div class="footer">
              <p class="note">MedExchange generated report. Data shown here matches the active filters in the application.</p>
              <p>Page 1</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleExportPDF = () => {
    const html = buildPdfHtml();
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      return alert('Unable to open the print window. Please allow popups for this site.');
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExportXLSX = async () => {
    const isAdminExport = isAdmin;
    const isTransferExport = !isAdmin && activeReportTab === 'transfers';
    const isReferralExport = !isAdmin && activeReportTab === 'referrals';
    const reportTitle = isAdminExport
      ? 'MedExchange Admin Report'
      : isTransferExport
        ? 'MedExchange Transfer Report'
        : 'MedExchange Referral Report';
    const dateText = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MedExchange';
    workbook.created = new Date();

    if (isAdminExport) {
      const overviewSheet = workbook.addWorksheet('Admin Overview');
      const titleRow = overviewSheet.addRow([reportTitle]);
      titleRow.font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF0F172A' } };
      titleRow.alignment = { vertical: 'middle', horizontal: 'left' };
      overviewSheet.mergeCells('A1:D1');
      overviewSheet.getRow(1).height = 28;

      const metadata = [
        ['Generated', dateText],
        ['Scope', 'Admin management data only'],
        ['Total Hospitals', hospitals.length.toString()],
        ['Total Departments', allHospitalDepartments.length.toString()],
        ['Total Users', totalUsers.toString()],
        ['Clinicians', clinicianCount.toString()],
        ['Admins', adminCount.toString()],
        ['Audit Events', totalAuditEvents.toString()],
      ];

      metadata.forEach((row) => overviewSheet.addRow(row));
      overviewSheet.addRow([]);
      overviewSheet.columns = [
        { key: 'label', width: 24 },
        { key: 'value', width: 32 },
        { key: 'extra1', width: 20 },
        { key: 'extra2', width: 20 },
      ];

      overviewSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 1 && rowNumber <= metadata.length + 1) {
          row.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
          row.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });

      const usersSheet = workbook.addWorksheet('Users');
      usersSheet.addTable({
        name: 'UsersTable',
        ref: 'A1',
        headerRow: true,
        totalsRow: false,
        style: { theme: 'TableStyleMedium2', showRowStripes: true },
        columns: [
          { name: 'Name', filterButton: true },
          { name: 'Email', filterButton: true },
          { name: 'Role', filterButton: true },
          { name: 'Hospital', filterButton: true },
        ],
        rows: users.map((userItem) => [
          userItem.full_name,
          userItem.email,
          userItem.role,
          hospitalMap.get(userItem.hospital_id) || 'Unknown',
        ]),
      });
      usersSheet.columns = [
        { key: 'name', width: 28 },
        { key: 'email', width: 32 },
        { key: 'role', width: 18 },
        { key: 'hospital', width: 28 },
      ];

      const hospitalsSheet = workbook.addWorksheet('Hospitals');
      hospitalsSheet.addTable({
        name: 'HospitalsTable',
        ref: 'A1',
        headerRow: true,
        totalsRow: false,
        style: { theme: 'TableStyleMedium2', showRowStripes: true },
        columns: [
          { name: 'Hospital', filterButton: true },
          { name: 'Location', filterButton: true },
        ],
        rows: hospitals.map((hospital) => [hospital.name, hospital.location || '—']),
      });
      hospitalsSheet.columns = [
        { key: 'hospital', width: 30 },
        { key: 'location', width: 30 },
      ];

      const auditSheet = workbook.addWorksheet('Audit Activity');
      auditSheet.addTable({
        name: 'AuditTable',
        ref: 'A1',
        headerRow: true,
        totalsRow: false,
        style: { theme: 'TableStyleMedium2', showRowStripes: true },
        columns: [
          { name: 'Action', filterButton: true },
          { name: 'Count', filterButton: true },
        ],
        rows: auditActionBreakdown.map(([action, count]) => [action, count.toString()]),
      });
      auditSheet.columns = [
        { key: 'action', width: 32 },
        { key: 'count', width: 16 },
      ];
    } else if (isTransferExport) {
      const statusFilterLabel = statusFilter === 'all' ? 'All statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
      const departmentFilterLabel = departmentFilter.length === 0 ? 'All departments' : departmentFilter.join('; ');
      const reportScope = `${filteredTransfers.length} transfers included`;

      const headers = [
        'Date',
        'Patient Name',
        'Patient National ID',
        'From Hospital',
        'To Hospital',
        'Transfer Type',
        'Receiving Department',
        'Status',
        'Reason',
      ];

      const rows = filteredTransfers.map((transfer) => [
        formatDate(transfer.createdAt || ''),
        transfer.patientName || '—',
        transfer.patientNationalId || '—',
        transfer.fromHospital?.name || hospitalMap.get(transfer.fromHospitalId) || 'Unknown',
        transfer.toHospital?.name || hospitalMap.get(transfer.toHospitalId) || 'Unknown',
        transfer.transferType || '—',
        transfer.receivingService || '—',
        transfer.status.replace(/_/g, ' '),
        transfer.reasonForTransfer || '—',
      ]);

      const sheet = workbook.addWorksheet('Transfer Report');
      const titleRow = sheet.addRow([reportTitle]);
      titleRow.font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF0F172A' } };
      titleRow.alignment = { vertical: 'middle', horizontal: 'left' };
      sheet.mergeCells('A1:I1');
      sheet.getRow(1).height = 28;

      const metadata = [
        ['Generated', dateText],
        ['Hospital', hospitalName],
        ['Report scope', reportScope],
        ['Status filter', statusFilterLabel],
        ['Department filter', departmentFilterLabel],
        ['Total Transfers', transferStats.total.toString()],
        ['Pending Transfers', transferStats.pending.toString()],
        ['In Transit', transferStats.inTransit.toString()],
        ['Completed Transfers', transferStats.completed.toString()],
      ];

      metadata.forEach((row) => sheet.addRow(row));
      sheet.addRow([]);
      const metadataRows = Array.from({ length: metadata.length }, (_, index) => index + 2);
      metadataRows.forEach((rowIndex) => {
        const row = sheet.getRow(rowIndex);
        row.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
        row.alignment = { vertical: 'middle', horizontal: 'left' };
      });

      const tableStartRow = metadata.length + 4;
      sheet.addTable({
        name: 'TransfersTable',
        ref: `A${tableStartRow}`,
        headerRow: true,
        totalsRow: false,
        style: { theme: 'TableStyleMedium2', showRowStripes: true },
        columns: headers.map((header) => ({ name: header, filterButton: true })),
        rows,
      });

      sheet.columns = [
        { key: 'date', width: 16, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
        { key: 'patientName', width: 24, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
        { key: 'patientNationalId', width: 22, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
        { key: 'fromHospital', width: 28, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
        { key: 'toHospital', width: 28, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
        { key: 'transferType', width: 18, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
        { key: 'receivingDepartment', width: 24, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
        { key: 'status', width: 16, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
        { key: 'reason', width: 34, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
      ];

      sheet.getRow(tableStartRow).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
      sheet.getRow(tableStartRow).alignment = { vertical: 'middle', horizontal: 'left' };
      sheet.views = [{ state: 'frozen', ySplit: tableStartRow }];
    } else {
      const statusFilterLabel = statusFilter === 'all' ? 'All statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
      const departmentFilterLabel = departmentFilter.length === 0 ? 'All departments' : departmentFilter.join('; ');

      const headers = [
        'Date',
        'Patient Name',
        'Patient ID',
        'Reason',
        'Department',
        'Status',
        'Priority',
        'Requesting Hospital',
        'Receiving Hospital',
      ];

      const rows = filteredReferrals.map((ref) => [
        formatDate(ref.created_at),
        ref.patient_name,
        ref.patient_id,
        ref.reason,
        ref.department,
        ref.status,
        ref.priority,
        hospitalMap.get(ref.requesting_hospital_id) || ref.requesting_hospital_id,
        hospitalMap.get(ref.receiving_hospital_id) || ref.receiving_hospital_id,
      ]);

      const sheet = workbook.addWorksheet('Referral Report');
      const titleRow = sheet.addRow([reportTitle]);
      titleRow.font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF0F172A' } };
      titleRow.alignment = { vertical: 'middle', horizontal: 'left' };
      sheet.mergeCells('A1:I1');
      sheet.getRow(1).height = 28;

      const metadata = [
        ['Generated', dateText],
        ['Hospital', hospitalName],
        ['Report scope', `${filteredReferrals.length} referrals included`],
        ['Status filter', statusFilterLabel],
        ['Department filter', departmentFilterLabel],
        ['Total Patients', stats.patients.toString()],
        ['Total Referrals', stats.referrals.toString()],
        ['Pending Referrals', stats.pending.toString()],
        ['Completed Referrals', stats.completed.toString()],
      ];

      metadata.forEach((row) => sheet.addRow(row));
      sheet.addRow([]);
      const metadataRows = Array.from({ length: metadata.length }, (_, index) => index + 2);
      metadataRows.forEach((rowIndex) => {
        const row = sheet.getRow(rowIndex);
        row.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
        row.alignment = { vertical: 'middle', horizontal: 'left' };
      });

      const tableStartRow = metadata.length + 4;
      sheet.addTable({
        name: 'ReferralsTable',
        ref: `A${tableStartRow}`,
        headerRow: true,
        totalsRow: false,
        style: { theme: 'TableStyleMedium2', showRowStripes: true },
        columns: headers.map((header) => ({ name: header, filterButton: true })),
        rows,
      });

      sheet.columns = [
        { key: 'date', width: 16, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
        { key: 'patientName', width: 24, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
        { key: 'patientId', width: 22, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
        { key: 'reason', width: 34, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
        { key: 'department', width: 24, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
        { key: 'status', width: 16, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
        { key: 'priority', width: 14, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
        { key: 'requestingHospital', width: 26, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
        { key: 'receivingHospital', width: 26, style: { alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } } },
      ];

      sheet.getRow(tableStartRow).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
      sheet.getRow(tableStartRow).alignment = { vertical: 'middle', horizontal: 'left' };
      sheet.views = [{ state: 'frozen', ySplit: tableStartRow }];
    }

    const workbookOutput = await workbook.xlsx.writeBuffer();
    const blob = new Blob([workbookOutput], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStamp = new Date().toISOString().slice(0, 10);
    const fileName = isAdminExport
      ? `medexchange-admin-report-${dateStamp}.xlsx`
      : isTransferExport
        ? `medexchange-transfer-report-${dateStamp}.xlsx`
        : `medexchange-referral-report-${dateStamp}.xlsx`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Chart data - Pie chart for status distribution
  const pieChartData = useMemo(() => {
    return Object.entries(statusReport).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      status,
    }));
  }, [statusReport]);

  // Chart data - Bar chart for departments
  const barChartData = useMemo(() => {
    return departmentReport.map(([dept, count]) => ({
      name: dept,
      referrals: count,
    }));
  }, [departmentReport]);

  // Chart data - Line chart for trends over time
  const lineChartData = useMemo(() => {
    const dateMap = new Map<string, number>();

    filteredReferrals.forEach((ref) => {
      const date = new Date(ref.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    // Sort by date and return
    return Array.from(dateMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, count]) => ({
        date,
        referrals: count,
      }));
  }, [filteredReferrals]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
            <p className="text-sm text-slate-500">
              {isAdmin
                ? 'System management reports for users, hospitals, departments, and audit activity.'
                : 'Referral and patient analytics for your hospital'}
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            {user && (
              <>
                <button
                  onClick={handleExportPDF}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  Export PDF
                </button>
                <button
                  onClick={handleExportXLSX}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                >
                  <FileText size={16} />
                  Export XLSX
                </button>
              </>
            )}
          </div>
        </div>

        {!isAdmin && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveReportTab('referrals')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeReportTab === 'referrals'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Referrals
            </button>
            <button
              onClick={() => setActiveReportTab('transfers')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeReportTab === 'transfers'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Transfers
            </button>
          </div>
        )}

        {!isAdmin && (activeReportTab === 'referrals' || activeReportTab === 'transfers') ? (
          <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={18} className="text-slate-600" />
              <h3 className="font-semibold text-slate-900">Filters</h3>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {/* Date Range Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsDateMenuOpen(!isDateMenuOpen);
                  setIsDepartmentMenuOpen(false);
                  setIsStatusMenuOpen(false);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 flex items-center justify-between hover:border-slate-400 transition-colors"
              >
                <span>
                  {dateRange === 'all'
                    ? 'All Time'
                    : dateRange === '7days'
                      ? 'Last 7 Days'
                      : dateRange === '30days'
                        ? 'Last 30 Days'
                        : dateRange === '90days'
                          ? 'Last 90 Days'
                          : customStartDate || customEndDate
                            ? `${customStartDate || 'Any'} → ${customEndDate || 'Any'}`
                            : 'Custom Range'}
                </span>
                <ChevronDown size={16} className={`transition-transform ${isDateMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDateMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
                  {['all', '7days', '30days', '90days', 'custom'].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setDateRange(option as DateRange);
                        if (option !== 'custom') {
                          setCustomStartDate('');
                          setCustomEndDate('');
                        }
                        setIsDateMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option === 'all'
                        ? 'All Time'
                        : option === '7days'
                          ? 'Last 7 Days'
                          : option === '30days'
                            ? 'Last 30 Days'
                            : option === '90days'
                              ? 'Last 90 Days'
                              : 'Custom Range'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Department Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsDepartmentMenuOpen(!isDepartmentMenuOpen);
                  setIsDateMenuOpen(false);
                  setIsStatusMenuOpen(false);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 flex items-center justify-between hover:border-slate-400 transition-colors"
              >
                <span>
                  {departmentFilter.length === 0 
                    ? 'All Departments' 
                    : departmentFilter.length === 1
                      ? departmentFilter[0]
                      : `${departmentFilter.length} departments selected`}
                </span>
                <ChevronDown size={16} className={`transition-transform ${isDepartmentMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDepartmentMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setDepartmentFilter([]);
                      setIsDepartmentMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 first:rounded-t-lg border-b border-slate-200"
                  >
                    All Departments
                  </button>
                  {activeReportTab === 'referrals' ? (
                    departmentsLoading ? (
                      <div className="px-4 py-2 text-sm text-slate-500">Loading departments...</div>
                    ) : departmentsError ? (
                      <div className="px-4 py-2 text-sm text-red-500">{departmentsError}</div>
                    ) : departments.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-slate-500">No departments available</div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {departments.map((dept) => (
                          <label
                            key={dept}
                            className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={departmentFilter.includes(dept)}
                              onChange={() => {
                                setDepartmentFilter((prev) =>
                                  prev.includes(dept)
                                    ? prev.filter((d) => d !== dept)
                                    : [...prev, dept]
                                );
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{dept}</span>
                          </label>
                        ))}
                      </div>
                    )
                  ) : filterDepartments.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-slate-500">No transfer departments available</div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {filterDepartments.map((dept) => (
                        <label
                          key={dept}
                          className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={departmentFilter.includes(dept)}
                            onChange={() => {
                              setDepartmentFilter((prev) =>
                                prev.includes(dept)
                                  ? prev.filter((d) => d !== dept)
                                  : [...prev, dept]
                              );
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{dept}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsStatusMenuOpen(!isStatusMenuOpen);
                  setIsDateMenuOpen(false);
                  setIsDepartmentMenuOpen(false);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 flex items-center justify-between hover:border-slate-400 transition-colors"
              >
                <span>{statusLabel(statusFilter)}</span>
                <ChevronDown size={16} className={`transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatusMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
                  {statusOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setStatusFilter(option);
                        setIsStatusMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {statusLabel(option)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {dateRange === 'custom' && (
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          )}
        </div>
        ) : null}

        <div className="max-h-[calc(100vh-18rem)] overflow-y-auto space-y-6">
          {/* Summary Statistics Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isAdmin ? (
            <>
              <StatCard
                title="Total Users"
                value={users.length}
                icon={<Users size={20} />}
                color="blue"
              />
              <StatCard
                title="Total Hospitals"
                value={hospitals.length}
                icon={<Building size={20} />}
                color="indigo"
              />
              <StatCard
                title="Departments"
                value={allHospitalDepartments.length}
                icon={<ClipboardList size={20} />}
                color="yellow"
              />
              <StatCard
                title="Audit Events"
                value={auditLogs.length}
                icon={<FileText size={20} />}
                color="green"
              />
            </>
          ) : activeReportTab === 'referrals' ? (
            <>
              <StatCard
                title="Total Patients"
                value={stats.patients}
                icon={<Users size={20} />}
                color="blue"
              />
              <StatCard
                title="Total Referrals"
                value={stats.referrals}
                icon={<FileText size={20} />}
                color="indigo"
              />
              <StatCard
                title="Pending Referrals"
                value={stats.pending}
                icon={<Clock size={20} />}
                color="yellow"
              />
              <StatCard
                title="Completed Referrals"
                value={stats.completed}
                icon={<CheckCircle size={20} />}
                color="green"
              />
            </>
          ) : (
            <>
              <StatCard
                title="Total Transfers"
                value={transferStats.total}
                icon={<Building size={20} />}
                color="blue"
              />
              <StatCard
                title="Pending Transfers"
                value={transferStats.pending}
                icon={<Clock size={20} />}
                color="yellow"
              />
              <StatCard
                title="In Transit"
                value={transferStats.inTransit}
                icon={<FileText size={20} />}
                color="indigo"
              />
              <StatCard
                title="Completed Transfers"
                value={transferStats.completed}
                icon={<CheckCircle size={20} />}
                color="green"
              />
            </>
          )}
        </div>

        {isAdmin ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Hospital</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((userItem) => (
                        <tr key={userItem.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-700 font-medium">{userItem.full_name}</td>
                          <td className="py-3 px-4 text-slate-600">{userItem.email}</td>
                          <td className="py-3 px-4 text-slate-600">{userItem.role}</td>
                          <td className="py-3 px-4 text-slate-600">{hospitalMap.get(userItem.hospital_id) || 'Unknown'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-slate-500">
                          No users available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Hospitals</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Hospital</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospitals.length > 0 ? (
                      hospitals.map((hospital) => (
                        <tr key={hospital.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-700 font-medium">{hospital.name}</td>
                          <td className="py-3 px-4 text-slate-600">{hospital.location || '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="text-center py-4 text-slate-500">
                          No hospitals available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Departments</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Department</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Referral Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allHospitalDepartments.length > 0 ? (
                      allHospitalDepartments.map((department) => {
                        const count = referrals.filter((ref) => ref.department === department).length;
                        return (
                          <tr key={department} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-700">{department}</td>
                            <td className="text-right py-3 px-4 font-semibold text-slate-900">{count}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={2} className="text-center py-4 text-slate-500">
                          No departments available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200 lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Audit Logs</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Action</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Entity</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Hospital</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAuditLogs.length > 0 ? (
                      recentAuditLogs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-700">{log.action}</td>
                          <td className="py-3 px-4 text-slate-600">{log.entity_type}</td>
                          <td className="py-3 px-4 text-slate-600">{log.user_id}</td>
                          <td className="py-3 px-4 text-slate-600">{hospitalMap.get(log.hospital_id) || 'Unknown'}</td>
                          <td className="py-3 px-4 text-slate-600">{formatDate(log.timestamp)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-slate-500">
                          No audit entries found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeReportTab === 'referrals' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Referral Status Distribution Pie Chart */}
            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Referral Status Distribution</h2>
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-80 items-center justify-center text-slate-500">
                  No data available
                </div>
              )}
            </div>

            {/* Referrals by Department Bar Chart */}
            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Referrals by Department</h2>
              {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="referrals" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-80 items-center justify-center text-slate-500">
                  No data available
                </div>
              )}
            </div>

            {/* Referral Trends Line Chart */}
            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200 lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Referral Trends</h2>
              {lineChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="referrals"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-80 items-center justify-center text-slate-500">
                  No data available
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Transfer Status Distribution</h2>
                {Object.values(transferStatusReport).some((count) => count > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(transferStatusReport)
                          .filter(([, count]) => count > 0)
                          .map(([status, value]) => ({ status, value }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, value }) => `${status.replace(/_/g, ' ')}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(transferStatusReport)
                          .filter(([, count]) => count > 0)
                          .map(([status], index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[status] ?? STATUS_COLORS.unknown} />
                          ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-80 items-center justify-center text-slate-500">
                    No data available
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Transfers by Department</h2>
                {transferDepartmentReport.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={transferDepartmentReport.map(([name, transfers]) => ({ name, transfers }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="transfers" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-80 items-center justify-center text-slate-500">
                    No data available
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Transfer Trends</h2>
              {transferTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={transferTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="transfers"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-80 items-center justify-center text-slate-500">
                  No data available
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Transfer Status Report</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(transferStatusReport).map(([status, count]) => (
                        <tr key={status} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : status === 'completed'
                                  ? 'bg-sky-100 text-sky-800'
                                  : status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : status === 'in_transit'
                                  ? 'bg-violet-100 text-violet-800'
                                  : status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="text-right py-3 px-4 font-semibold text-slate-900">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Transfers by Department</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Department</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Total Transfers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transferDepartmentReport.length > 0 ? (
                        transferDepartmentReport.map(([department, count]) => (
                          <tr key={department} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-700">{department}</td>
                            <td className="text-right py-3 px-4 font-semibold text-slate-900">{count}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="text-center py-4 text-slate-500">
                            No transfers found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200 lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Transfers by Receiving Hospital</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Hospital</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Total Transfers Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transferHospitalReport.length > 0 ? (
                      transferHospitalReport.map(([hospital, count]) => (
                        <tr key={hospital} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-700">{hospital}</td>
                          <td className="text-right py-3 px-4 font-semibold text-slate-900">{count}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="text-center py-4 text-slate-500">
                          No transfers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent Transfers</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Patient</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">From</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">To</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransfers.length > 0 ? (
                      recentTransfers.map((transfer) => (
                        <tr key={transfer.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-700 font-medium">{transfer.patientName || '—'}</td>
                          <td className="py-3 px-4 text-slate-600">{transfer.fromHospital?.name || hospitalMap.get(transfer.fromHospitalId) || 'Unknown'}</td>
                          <td className="py-3 px-4 text-slate-600">{transfer.toHospital?.name || hospitalMap.get(transfer.toHospitalId) || 'Unknown'}</td>
                          <td className="py-3 px-4 text-slate-600">{transfer.transferType || '—'}</td>
                          <td className="text-center py-3 px-4">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                transfer.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : transfer.status === 'completed'
                                  ? 'bg-sky-100 text-sky-800'
                                  : transfer.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : transfer.status === 'in_transit'
                                  ? 'bg-violet-100 text-violet-800'
                                  : transfer.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {transfer.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {transfer.createdAt ? formatDate(transfer.createdAt) : '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-slate-500">
                          No transfers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!isAdmin && activeReportTab === 'referrals' && (
          <>
            {/* Reports Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Referral Status Report */}
              <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Referral Status Report</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Total Referrals</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(statusReport).map(([status, count]) => (
                        <tr key={status} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <StatusBadge status={status as any} />
                          </td>
                          <td className="text-right py-3 px-4 font-semibold text-slate-900">
                            {count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Department Report */}
              <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Referrals by Department</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Department</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Total Referrals</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentReport.length > 0 ? (
                        departmentReport.map(([dept, count]) => (
                          <tr key={dept} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-700">{dept}</td>
                            <td className="text-right py-3 px-4 font-semibold text-slate-900">
                              {count}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="text-center py-4 text-slate-500">
                            No referrals found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hospital Report */}
              <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200 lg:col-span-2">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Referrals by Receiving Hospital</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Hospital</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Total Referrals Received</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hospitalReport.length > 0 ? (
                        hospitalReport.map(([hospital, count]) => (
                          <tr key={hospital} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-700">{hospital}</td>
                            <td className="text-right py-3 px-4 font-semibold text-slate-900">
                              {count}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="text-center py-4 text-slate-500">
                            No referrals found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Referrals Report */}
            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent Referrals</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Patient Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Receiving Hospital</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReferrals.length > 0 ? (
                      recentReferrals.map((ref) => (
                        <tr key={ref.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-700 font-medium">{ref.patient_name}</td>
                          <td className="py-3 px-4 text-slate-600">{ref.department || '—'}</td>
                          <td className="py-3 px-4 text-slate-600">
                            {hospitalMap.get(ref.receiving_hospital_id) || 'Unknown'}
                          </td>
                          <td className="text-center py-3 px-4">
                            <StatusBadge status={ref.status} />
                          </td>
                          <td className="py-3 px-4 text-slate-600">{formatDate(ref.created_at)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-slate-500">
                          No referrals found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        </div>
    </div>
  );
}