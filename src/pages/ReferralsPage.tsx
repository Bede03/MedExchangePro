import React, { useMemo, useState, useEffect } from 'react';
import { Eye, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMockData } from '../hooks/useMockData';
import { StatusBadge } from '../components/UI/StatusBadge';
import { Table } from '../components/UI/Table';
import { apiClient } from '../services/api';

type SortOption = 'patient_name' | 'hospital' | 'submission_date' | 'status';
type SortDirection = 'asc' | 'desc';
type StatusSort = 'pending' | 'approved' | 'completed' | 'rejected';

export function ReferralsPage() {
  const { hospitals } = useMockData();
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('patient_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusSort, setStatusSort] = useState<StatusSort>('pending');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isSortDetailPopupOpen, setIsSortDetailPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch referrals from API
  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.referrals.list();
        if (response.success && response.data) {
          setReferrals(response.data);
        } else {
          setReferrals([]);
        }
      } catch (err) {
        console.error('Failed to fetch referrals:', err);
        setReferrals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  const hospitalMap = useMemo(() => {
    const map = new Map<string, string>();
    hospitals.forEach((h) => map.set(h.id, h.name));
    return map;
  }, [hospitals]);

  const filtered = useMemo(() => {
    if (!user || isLoading) return [];

    const normalized = search.trim().toLowerCase();

    // Map API data to frontend format
    const mappedReferrals = referrals.map((ref: any) => ({
      id: ref.id,
      referral_number: ref.referralNumber,
      patient_id: ref.patientId,
      patient_national_id: ref.patient?.nationalId,
      patient_name: ref.patient?.name || '',
      reason: ref.reason,
      status: ref.status,
      priority: ref.priority,
      requesting_hospital_id: ref.requestingHospitalId,
      receiving_hospital_id: ref.receivingHospitalId,
      created_at: ref.createdAt,
      department: ref.department,
    }));

    const allowedReferrals = mappedReferrals.filter(
      (ref) =>
        ref.requesting_hospital_id === user.hospital_id ||
        ref.receiving_hospital_id === user.hospital_id
    );

    let result = allowedReferrals.filter((ref) => {
      if (!normalized) return true;

      const from = hospitalMap.get(ref.requesting_hospital_id)?.toLowerCase() ?? '';
      const to = hospitalMap.get(ref.receiving_hospital_id)?.toLowerCase() ?? '';
      return (
        ref.id.toLowerCase().includes(normalized) ||
        ref.patient_name.toLowerCase().includes(normalized) ||
        ref.reason.toLowerCase().includes(normalized) ||
        ref.priority.toLowerCase().includes(normalized) ||
        from.includes(normalized) ||
        to.includes(normalized)
      );
    });

    // Apply sorting
    const sorted = [...result].sort((a, b) => {
      if (sortBy === 'patient_name') {
        const comparison = a.patient_name.localeCompare(b.patient_name);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (sortBy === 'hospital') {
        const hospitalA = hospitalMap.get(a.requesting_hospital_id) ?? '';
        const hospitalB = hospitalMap.get(b.requesting_hospital_id) ?? '';
        const comparison = hospitalA.localeCompare(hospitalB);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (sortBy === 'submission_date') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        const comparison = dateA - dateB;
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (sortBy === 'status') {
        const statusOrder = ['pending', 'approved', 'completed', 'rejected'];
        const orderA = statusOrder.indexOf(a.status as any);
        const orderB = statusOrder.indexOf(b.status as any);
        
        // If sorting by specific status, show that status first
        if (statusSort !== 'pending') {
          const aMatches = a.status === statusSort;
          const bMatches = b.status === statusSort;
          if (aMatches && !bMatches) return -1;
          if (!aMatches && bMatches) return 1;
        }
        
        return orderA - orderB;
      }

      return 0;
    });

    return sorted;
  }, [referrals, search, hospitalMap, sortBy, sortDirection, statusSort, user, isLoading]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Add index to each item for display
  const dataWithIndex = paginatedData.map((item, index) => ({
    ...item,
    displayIndex: (item as any).referral_number || (startIndex + index + 1),
  }));

  // Reset to first page when search or sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy, statusSort]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Referrals</h1>
          <p className="text-sm text-slate-500">Track and manage patient referrals</p>
        </div>

        <Link
          to="/referrals/new"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <span className="mr-2">+</span> Submit Referral
        </Link>
      </header>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full max-w-md items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search referrals..."
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="relative">
            <button
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition whitespace-nowrap"
            >
              <span>Sort: {sortBy === 'submission_date' ? 'Date' : sortBy === 'patient_name' ? 'Name' : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
              <Check className="h-4 w-4" />
            </button>

            {/* Main Sort Menu */}
            {isSortMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30"
                  onClick={() => setIsSortMenuOpen(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg z-40 animate-in fade-in zoom-in duration-200">
                  <div className="p-2 space-y-1">
                    {(['patient_name', 'hospital', 'submission_date', 'status'] as const).map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setIsSortMenuOpen(false);
                          setIsSortDetailPopupOpen(true);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                          sortBy === option
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {option === 'submission_date' ? 'Date' : option === 'patient_name' ? 'Patient Name' : option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Detail Sort Popup */}
            {isSortDetailPopupOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30"
                  onClick={() => setIsSortDetailPopupOpen(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg z-40 animate-in fade-in zoom-in duration-200">
                  <div className="p-2 space-y-1">
                    {/* Patient Name and Hospital sorting */}
                    {(sortBy === 'patient_name' || sortBy === 'hospital') && (
                      <>
                        <button
                          onClick={() => {
                            setSortDirection('asc');
                            setIsSortDetailPopupOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            sortDirection === 'asc'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          A → Z
                        </button>
                        <button
                          onClick={() => {
                            setSortDirection('desc');
                            setIsSortDetailPopupOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            sortDirection === 'desc'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Z → A
                        </button>
                      </>
                    )}

                    {/* Date sorting */}
                    {sortBy === 'submission_date' && (
                      <>
                        <button
                          onClick={() => {
                            setSortDirection('desc');
                            setIsSortDetailPopupOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            sortDirection === 'desc'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Newest first
                        </button>
                        <button
                          onClick={() => {
                            setSortDirection('asc');
                            setIsSortDetailPopupOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            sortDirection === 'asc'
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Oldest first
                        </button>
                      </>
                    )}

                    {/* Status sorting */}
                    {sortBy === 'status' && (
                      <>
                        {(['pending', 'approved', 'completed', 'rejected'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setStatusSort(status);
                              setIsSortDetailPopupOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                              statusSort === status
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">Loading referrals...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">No referrals found. Create your first referral to get started.</p>
        </div>
      ) : (
        <Table
        data={dataWithIndex}
        rowKey={(row) => row.id}
        columns={[
          {
            header: 'Ref #',
            accessor: (row) => <span className="font-medium text-indigo-600">REF-{String(row.displayIndex).padStart(4, '0')}</span>,
          },
          {
            header: 'Patient',
            accessor: (row) => (
              <Link
                to={`/patients/${row.patient_national_id || row.patient_id}`}
                className="font-medium text-indigo-600 hover:text-indigo-800"
              >
                {row.patient_name}
              </Link>
            ),
          },
          {
            header: 'From',
            accessor: (row) => hospitalMap.get(row.requesting_hospital_id) ?? 'Unknown',
          },
          {
            header: 'To',
            accessor: (row) => hospitalMap.get(row.receiving_hospital_id) ?? 'Unknown',
          },
          {
            header: 'Priority',
            accessor: (row) => (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  row.priority === 'Emergency'
                    ? 'bg-rose-100 text-rose-800'
                    : row.priority === 'Urgent'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {row.priority}
              </span>
            ),
          },
          { header: 'Reason', accessor: 'reason' },
          {
            header: 'Date',
            accessor: (row) => new Date(row.created_at).toLocaleDateString('en-GB'),
          },
          {
            header: 'Status',
            accessor: (row) => <StatusBadge status={row.status} />,
          },
          {
            header: 'Actions',
            accessor: (row) => (
              <Link
                to={`/referrals/${row.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Eye className="h-4 w-4" />
                View
              </Link>
            ),
            className: 'text-right',
          },
        ]}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
          <div className="text-sm text-slate-600">
            Showing referrals {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                    page === currentPage
                      ? 'bg-indigo-600 text-white'
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
              className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
