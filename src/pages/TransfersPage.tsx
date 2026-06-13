import React, { useMemo, useState, useEffect } from 'react';
import { Eye, Search, PlusCircle, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import { Table } from '../components/UI/Table';

type SortOption = 'transfer_number' | 'patient_name' | 'hospital' | 'decision_date' | 'status';
type SortDirection = 'asc' | 'desc';
type StatusSort = 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled';
type TransferTab = 'sent' | 'received';

export function TransfersPage() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('decision_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusSort, setStatusSort] = useState<StatusSort>('pending');
  const [selectedTab, setSelectedTab] = useState<TransferTab>('sent');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isSortDetailPopupOpen, setIsSortDetailPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user) return;

    const loadTransfers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.transfers.list();
        if (response.success) {
          setTransfers(response.data);
        } else {
          setError(response.message || 'Failed to load transfers');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load transfers');
      } finally {
        setLoading(false);
      }
    };

    loadTransfers();
  }, [user]);

  const hospitalMap = useMemo(() => {
    const map = new Map<string, string>();
    transfers.forEach((transfer) => {
      if (transfer.fromHospital?.id) {
        map.set(transfer.fromHospital.id, transfer.fromHospital.name);
      }
      if (transfer.toHospital?.id) {
        map.set(transfer.toHospital.id, transfer.toHospital.name);
      }
    });
    return map;
  }, [transfers]);

  const filtered = useMemo(() => {
    if (!user) return [];

    const normalized = search.trim().toLowerCase();

    // Filter transfers for current user's hospital
    const userTransfers = transfers.filter(
      (t) => t.fromHospitalId === user.hospital_id || t.toHospitalId === user.hospital_id
    );

    const isRecipientVisibleStatus = (status: string) => ['in_transit', 'completed'].includes(status);

    const visibleTransfers = userTransfers.filter((t) => {
      if (selectedTab === 'sent') {
        return t.fromHospitalId === user.hospital_id;
      }

      return t.toHospitalId === user.hospital_id && isRecipientVisibleStatus(t.status);
    });

    let result = visibleTransfers.filter((t) => {
      if (!normalized) return true;

      const from = t.fromHospital?.name?.toLowerCase() ?? hospitalMap.get(t.fromHospitalId)?.toLowerCase() ?? '';
      const to = t.toHospital?.name?.toLowerCase() ?? hospitalMap.get(t.toHospitalId)?.toLowerCase() ?? '';
      const transferNumberLabel = t.transferNumber != null ? `trf-${t.transferNumber}` : '';

      return (
        transferNumberLabel.includes(normalized) ||
        t.transferNumber?.toString().includes(normalized) ||
        t.transferId?.toLowerCase().includes(normalized) ||
        t.patientName?.toLowerCase().includes(normalized) ||
        t.reasonForTransfer?.toLowerCase().includes(normalized) ||
        t.referringClinician?.toLowerCase().includes(normalized) ||
        from.includes(normalized) ||
        to.includes(normalized)
      );
    });

    // Apply sorting
    const sorted = [...result].sort((a, b) => {
      if (sortBy === 'transfer_number') {
        const numA = a.transferNumber ?? 0;
        const numB = b.transferNumber ?? 0;
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      if (sortBy === 'patient_name') {
        const comparison = a.patientName?.localeCompare(b.patientName ?? '') ?? 0;
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (sortBy === 'hospital') {
        const hospitalA = a.fromHospital?.name ?? hospitalMap.get(a.fromHospitalId) ?? '';
        const hospitalB = b.fromHospital?.name ?? hospitalMap.get(b.fromHospitalId) ?? '';
        const comparison = hospitalA.localeCompare(hospitalB);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (sortBy === 'decision_date') {
        const dateA = new Date(a.decisionDate).getTime();
        const dateB = new Date(b.decisionDate).getTime();
        const comparison = dateA - dateB;
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (sortBy === 'status') {
        const statusOrder = ['pending', 'approved', 'in_transit', 'completed', 'cancelled'];
        const orderA = statusOrder.indexOf(a.status as any);
        const orderB = statusOrder.indexOf(b.status as any);

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
  }, [transfers, search, hospitalMap, sortBy, sortDirection, statusSort, selectedTab, user]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy, statusSort, sortDirection, selectedTab]);

  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_transit: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-slate-100 text-slate-800',
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm p-8 text-center text-slate-500">
        <p className="text-lg font-medium text-slate-900">Loading transfers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-xl border border-rose-200 bg-rose-50 shadow-sm p-8 text-center text-rose-700">
        <p className="text-lg font-medium">Unable to load transfers</p>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }

  const sortLabel =
    sortBy === 'decision_date'
      ? 'Date'
      : sortBy === 'transfer_number'
      ? 'Transfer Id'
      : sortBy === 'patient_name'
      ? 'Patient'
      : sortBy === 'hospital'
      ? 'From'
      : 'Status';

  const formatStatusLabel = (status: string) =>
    status === 'in_transit'
      ? 'In Transit'
      : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Transfers</h1>
          <p className="text-sm text-slate-500">Track patients being transferred between hospitals.</p>
        </div>

        <Link
          to="/transfers/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <PlusCircle className="h-4 w-4" />
          New Transfer
        </Link>
      </header>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedTab('sent')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              selectedTab === 'sent'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Sent
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('received')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              selectedTab === 'received'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Received
          </button>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full max-w-md">
            <label htmlFor="transfer-search" className="sr-only">Search transfers</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="transfer-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transfers..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition whitespace-nowrap"
            >
              <span>Sort: {sortLabel}</span>
              <Check className="h-4 w-4" />
            </button>

            {isSortMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsSortMenuOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg z-40 animate-in fade-in zoom-in duration-200">
                  <div className="p-2 space-y-1">
                    {(['transfer_number', 'patient_name', 'hospital', 'decision_date', 'status'] as const).map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setIsSortMenuOpen(false);
                          setIsSortDetailPopupOpen(true);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                          sortBy === option ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {option === 'transfer_number'
                          ? 'Transfer Id'
                          : option === 'patient_name'
                          ? 'Patient'
                          : option === 'hospital'
                          ? 'From Hospital'
                          : option === 'decision_date'
                          ? 'Decision Date'
                          : 'Status'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {isSortDetailPopupOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsSortDetailPopupOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg z-40 animate-in fade-in zoom-in duration-200">
                  <div className="p-2 space-y-1">
                    {(sortBy === 'transfer_number' || sortBy === 'patient_name' || sortBy === 'hospital') && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSortDirection('asc');
                            setIsSortDetailPopupOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            sortDirection === 'asc' ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          A → Z
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSortDirection('desc');
                            setIsSortDetailPopupOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            sortDirection === 'desc' ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Z → A
                        </button>
                      </>
                    )}

                    {sortBy === 'decision_date' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSortDirection('asc');
                            setIsSortDetailPopupOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            sortDirection === 'asc' ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Oldest first
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSortDirection('desc');
                            setIsSortDetailPopupOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                            sortDirection === 'desc' ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Newest first
                        </button>
                      </>
                    )}

                    {sortBy === 'status' && (
                      <>
                        {(['pending', 'approved', 'in_transit', 'completed', 'cancelled'] as const).map((statusOption) => (
                          <button
                            key={statusOption}
                            type="button"
                            onClick={() => {
                              setStatusSort(statusOption);
                              setIsSortDetailPopupOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition ${
                              statusSort === statusOption ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {statusOption === 'in_transit' ? 'In Transit' : statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
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
      </div>

      {filtered.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-8 text-center text-slate-500">
            <p className="text-lg font-medium text-slate-900">No transfers found</p>
            <p className="mt-2 text-sm">Create a new transfer to get started.</p>
          </div>
        </div>
      ) : (
        <Table
          data={paginatedData}
          rowKey={(row) => row.id}
          columns={[
            {
              header: 'Transfer Id',
              accessor: (row) => (
                <span className="font-semibold text-indigo-600">
                  {row.transferNumber != null ? `TRF-${row.transferNumber}` : row.transferId}
                </span>
              ),
            },
            {
              header: 'Patient',
              accessor: (row) => <span className="font-medium text-slate-900">{row.patientName}</span>,
            },
            {
              header: 'Type',
              accessor: (row) => (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    row.transferType === 'Emergency'
                      ? 'bg-rose-100 text-rose-800'
                      : row.transferType === 'Non-Emergency'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {row.transferType}
                </span>
              ),
            },
            {
              header: 'From',
              accessor: (row) => row.fromHospital?.name ?? hospitalMap.get(row.fromHospitalId) ?? 'Unknown',
            },
            {
              header: 'To',
              accessor: (row) => row.toHospital?.name ?? hospitalMap.get(row.toHospitalId) ?? 'Unknown',
            },
            {
              header: 'Clinician',
              accessor: (row) => row.referringClinician,
            },
            {
              header: 'Decision Date',
              accessor: (row) => new Date(row.decisionDate).toLocaleDateString('en-GB'),
            },
            {
              header: 'Status',
              accessor: (row) => (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[row.status as keyof typeof statusStyles] ?? ''}`}
                >
                  {formatStatusLabel(row.status)}
                </span>
              ),
            },
            {
              header: 'Actions',
              accessor: (row) => (
                <Link
                  to={`/transfers/${row.id}`}
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
    </div>
  );
}
