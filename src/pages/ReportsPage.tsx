import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  Download,
  Printer,
  Filter,
  ChevronDown,
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
import { StatCard } from '../components/UI/StatCard';
import { StatusBadge } from '../components/UI/StatusBadge';
import { apiClient } from '../services/api';

type DateRange = 'all' | '7days' | '30days' | '90days';
type StatusFilter = 'all' | 'pending' | 'approved' | 'completed' | 'rejected';

// Chart color definitions
const STATUS_COLORS: Record<string, string> = {
  pending: '#EAB308',
  approved: '#3B82F6',
  completed: '#10B981',
  rejected: '#EF4444',
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
  const { patients, referrals, hospitals } = useMockData();
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isDepartmentMenuOpen, setIsDepartmentMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);

  // Fetch departments for current hospital
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!user?.hospital_id) {
        setDepartmentsLoading(false);
        return;
      }

      try {
        setDepartmentsLoading(true);
        const response = await apiClient.hospitals.getDepartments(user.hospital_id);
        
        if (response.success && response.data?.departments) {
          // Extract just the department names
          const deptNames = response.data.departments.map((dept: any) => 
            typeof dept === 'string' ? dept : dept.category || dept.departmentName
          );
          setDepartments(deptNames);
          setDepartmentsError(null);
        } else {
          setDepartments([]);
          setDepartmentsError('No departments found');
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        setDepartments([]);
        setDepartmentsError('Failed to load departments');
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchDepartments();
  }, [user?.hospital_id]);

  const hospitalMap = useMemo(() => {
    const map = new Map<string, string>();
    hospitals.forEach((h) => map.set(h.id, h.name));
    return map;
  }, [hospitals]);

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
      const now = new Date();
      let daysBack = 7;
      if (dateRange === '30days') daysBack = 30;
      if (dateRange === '90days') daysBack = 90;

      const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      result = result.filter((ref) => new Date(ref.created_at) >= cutoffDate);
    }

    // Department filter
    if (departmentFilter !== 'all') {
      result = result.filter((ref) => ref.department === departmentFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((ref) => ref.status === statusFilter);
    }

    return result;
  }, [hospitalReferrals, dateRange, departmentFilter, statusFilter]);

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
    const reportTitle = 'MedExchange Report';
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
      .map(([hospitalName, count]) => `<tr><td>${hospitalName}</td><td>${count}</td></tr>`)
      .join('');

    const referralRows = recentReferrals
      .map(
        (ref) => `
          <tr>
            <td>${formatDate(ref.created_at)}</td>
            <td>${ref.patient_name}</td>
            <td>${hospitalMap.get(ref.requesting_hospital_id) || ref.requesting_hospital_id}</td>
            <td>${hospitalMap.get(ref.receiving_hospital_id) || ref.receiving_hospital_id}</td>
            <td>${ref.department}</td>
            <td>${ref.status}</td>
            <td>${ref.priority}</td>
          </tr>`
      )
      .join('');

    return `
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Inter, system-ui, sans-serif; margin: 24px; color: #0f172a; }
            h1, h2, h3 { margin: 0 0 12px 0; }
            .summary { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
            .summary-box { flex: 1 1 180px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; background: #f8fafc; }
            .summary-box span { display: block; margin-top: 8px; font-size: 1.25rem; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
            th { background: #e2e8f0; }
            .section { margin-bottom: 24px; }
            .small { color: #475569; font-size: 0.95rem; }
          </style>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          <p class="small">Generated on ${dateText}</p>
          <div class="summary">
            <div class="summary-box"><strong>Total Patients</strong><span>${stats.patients}</span></div>
            <div class="summary-box"><strong>Total Referrals</strong><span>${stats.referrals}</span></div>
            <div class="summary-box"><strong>Pending Referrals</strong><span>${stats.pending}</span></div>
            <div class="summary-box"><strong>Completed Referrals</strong><span>${stats.completed}</span></div>
          </div>

          <div class="section">
            <h2>Referral Status</h2>
            <table><thead><tr><th>Status</th><th>Count</th></tr></thead><tbody>${statusRows}</tbody></table>
          </div>

          <div class="section">
            <h2>Referrals by Department</h2>
            <table><thead><tr><th>Department</th><th>Count</th></tr></thead><tbody>${departmentRows}</tbody></table>
          </div>

          <div class="section">
            <h2>Referrals by Hospital</h2>
            <table><thead><tr><th>Hospital</th><th>Count</th></tr></thead><tbody>${hospitalRows}</tbody></table>
          </div>

          <div class="section">
            <h2>Recent Referrals</h2>
            <table><thead><tr><th>Date</th><th>Patient</th><th>Requesting Hospital</th><th>Receiving Hospital</th><th>Department</th><th>Status</th><th>Priority</th></tr></thead><tbody>${referralRows}</tbody></table>
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

  const handleExportCSV = () => {
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

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `medexchange-report-${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
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
              Referral and patient analytics for your hospital
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Export PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <FileText size={16} />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        {/* Filter Section */}
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
                        : 'Last 90 Days'}
                </span>
                <ChevronDown size={16} className={`transition-transform ${isDateMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDateMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
                  {['all', '7days', '30days', '90days'].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setDateRange(option as DateRange);
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
                            : 'Last 90 Days'}
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
                  {departmentFilter === 'all' ? 'All Departments' : departmentFilter}
                </span>
                <ChevronDown size={16} className={`transition-transform ${isDepartmentMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDepartmentMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => {
                      setDepartmentFilter('all');
                      setIsDepartmentMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 first:rounded-t-lg"
                  >
                    All Departments
                  </button>
                  {departmentsLoading ? (
                    <div className="px-4 py-2 text-sm text-slate-500">Loading departments...</div>
                  ) : departmentsError ? (
                    <div className="px-4 py-2 text-sm text-red-500">{departmentsError}</div>
                  ) : departments.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-slate-500">No departments available</div>
                  ) : (
                    departments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => {
                          setDepartmentFilter(dept);
                          setIsDepartmentMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100"
                      >
                        {dept}
                      </button>
                    ))
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
                <span>
                  {statusFilter === 'all'
                    ? 'All Statuses'
                    : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </span>
                <ChevronDown size={16} className={`transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatusMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
                  {['all', 'pending', 'approved', 'completed', 'rejected'].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setStatusFilter(option as StatusFilter);
                        setIsStatusMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option === 'all'
                        ? 'All Statuses'
                        : option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        </div>

        {/* Charts Section */}
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
    </div>
  );
}