import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Plus, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMockData } from '../hooks/useMockData';
import { Table } from '../components/UI/Table';

type SortOption = 'name' | 'hospital' | 'registered_date';
type SortDirection = 'asc' | 'desc';

export function PatientsPage() {
  const { patients, hospitals } = useMockData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isSortDetailPopupOpen, setIsSortDetailPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const hospitalMap = useMemo(() => {
    const map = new Map<string, string>();
    hospitals.forEach((h) => map.set(h.id, h.name));
    return map;
  }, [hospitals]);

  const filtered = useMemo(() => {
    if (!user) return [];

    const query = search.trim().toLowerCase();
    const hospitalPatients = patients.filter((p) => p.hospital_id === user.hospital_id);

    // Apply search filter
    let result = hospitalPatients;
    if (query) {
      result = result.filter((p) => {
        const hospital = hospitalMap.get(p.hospital_id)?.toLowerCase() ?? '';
        return (
          p.name.toLowerCase().includes(query) ||
          p.gender.toLowerCase().includes(query) ||
          p.national_id.toLowerCase().includes(query) ||
          p.dob.toLowerCase().includes(query) ||
          hospital.includes(query)
        );
      });
    }

    // Apply sorting
    const sorted = [...result].sort((a, b) => {
      if (sortBy === 'name') {
        const comparison = a.name.localeCompare(b.name);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (sortBy === 'hospital') {
        const hospitalA = hospitalMap.get(a.hospital_id) ?? '';
        const hospitalB = hospitalMap.get(b.hospital_id) ?? '';
        const comparison = hospitalA.localeCompare(hospitalB);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (sortBy === 'registered_date') {
        const dateA = new Date(a.registered_at).getTime();
        const dateB = new Date(b.registered_at).getTime();
        const comparison = dateA - dateB;
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      return 0;
    });

    return sorted;
  }, [
    patients,
    search,
    hospitalMap,
    sortBy,
    sortDirection,
    user,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when search or sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500">Manage patient records</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:w-auto sm:flex-1">
            <label className="sr-only" htmlFor="search">
              Search patients
            </label>
            <input
              id="search"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-14 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              <span>Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1).replace('_', ' ')}</span>
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
                    {(['name', 'hospital', 'registered_date'] as const).map((option) => (
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
                        {option === 'registered_date' ? 'Registration Date' : option.charAt(0).toUpperCase() + option.slice(1)}
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
                    {/* Name and Hospital sorting */}
                    {(sortBy === 'name' || sortBy === 'hospital') && (
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
                    {sortBy === 'registered_date' && (
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
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <Table
        data={paginatedData}
        rowKey={(row) => row.id}
        columns={[
          { header: 'Name', accessor: 'name' },
          { header: 'Gender', accessor: 'gender' },
          { header: 'DOB', accessor: 'dob' },
          { header: 'National ID', accessor: 'national_id' },
          {
            header: 'Hospital',
            accessor: (row) => hospitalMap.get(row.hospital_id) ?? 'Unknown',
          },
          {
            header: '',
            accessor: (row) => (
              <Link
                to={`/patients/${row.id}`}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
          <div className="text-sm text-slate-600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} patients
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
