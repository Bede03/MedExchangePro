import React from 'react';

export interface TableColumn<Row> {
  header: string;
  accessor: string | ((row: Row) => React.ReactNode);
  width?: string;
  className?: string;
}

interface TableProps<Row> {
  columns: TableColumn<Row>[];
  data: Row[];
  rowKey: (row: Row) => string;
  emptyMessage?: string;
}

export function Table<Row>({ columns, data, rowKey, emptyMessage = 'No records found.' }: TableProps<Row>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                  col.width ?? ''
                } ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-slate-50">
                {columns.map((col) => {
                  const content = typeof col.accessor === 'function' ? col.accessor(row) : (row as any)[col.accessor];
                  return (
                    <td key={col.header} className={`px-4 py-3 text-sm text-slate-700 ${col.className ?? ''}`}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
