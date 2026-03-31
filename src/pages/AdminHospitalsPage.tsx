import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMockData } from '../hooks/useMockData';
import { Table } from '../components/UI/Table';

export function AdminHospitalsPage() {
  const navigate = useNavigate();
  const { hospitals } = useMockData();

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/admin')}
        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Hospitals</h1>
        <p className="text-sm text-slate-500">View hospitals that participate in the referral network.</p>
      </header>

      <Table
        data={hospitals}
        rowKey={(row) => row.id}
        columns={[
          { header: 'Name', accessor: 'name' },
          { header: 'Location', accessor: 'location' },
        ]}
      />
    </div>
  );
}
