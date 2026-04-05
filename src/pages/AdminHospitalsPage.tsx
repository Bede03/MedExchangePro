import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useMockData } from '../hooks/useMockData';
import { Table } from '../components/UI/Table';
import { getHospitalCapabilitiesSummary } from '../data/departments';

export function AdminHospitalsPage() {
  const navigate = useNavigate();
  const { hospitals } = useMockData();
  const [expandedHospital, setExpandedHospital] = React.useState<string | null>(null);

  const hospitalCapabilities = useMemo(() => {
    return hospitals.map(h => getHospitalCapabilitiesSummary(h.id, h.name));
  }, [hospitals]);

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
        <p className="text-sm text-slate-500">View hospitals and their medical department capabilities.</p>
      </header>

      <div className="space-y-4">
        {hospitalCapabilities.map((hospital) => (
          <div key={hospital.hospitalId} className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <button
              onClick={() => setExpandedHospital(expandedHospital === hospital.hospitalId ? null : hospital.hospitalId)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="text-left">
                <h2 className="text-lg font-semibold text-slate-900">{hospital.hospitalName}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-medium">{hospital.totalDepartments}</span> departments 
                  ({hospital.sharedDepartments} shared, {hospital.uniqueDepartments} unique)
                </p>
              </div>
              <ChevronDown 
                className={`h-5 w-5 text-slate-400 transition-transform ${expandedHospital === hospital.hospitalId ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedHospital === hospital.hospitalId && (
              <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Shared Departments ({hospital.sharedDepartments})</h3>
                    <div className="space-y-2">
                      {hospital.departments.filter(d => !hospital.uniqueDepts.includes(d.name)).map(dept => (
                        <div key={dept.id} className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                          <span className="text-slate-700">{dept.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {hospital.uniqueDepartments > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Unique Departments ({hospital.uniqueDepartments})</h3>
                      <div className="space-y-2">
                        {hospital.uniqueDepts.map(deptName => (
                          <div key={deptName} className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span className="text-slate-700">{deptName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Legend:</strong> Green dots indicate departments shared with other hospitals. Blue dots indicate hospital-specific specialties.
        </p>
      </div>
    </div>
  );
}
