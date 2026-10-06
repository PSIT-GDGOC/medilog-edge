import React from 'react';
import Badge from '../common/Badge';
import { Eye, Edit3, Trash2, Phone, MapPin, CheckCircle, Clock } from 'lucide-react';
import { formatDate, getBloodGroupBadgeClass } from '../../utils/formatters';

export function PatientTable({
  patients,
  onView,
  onEdit,
  onDelete
}) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            <th className="py-3.5 px-4">Patient ID</th>
            <th className="py-3.5 px-4">Name</th>
            <th className="py-3.5 px-4">Demographics</th>
            <th className="py-3.5 px-4">Blood Group</th>
            <th className="py-3.5 px-4">Contact & Location</th>
            <th className="py-3.5 px-4">Sync Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80 text-sm">
          {patients.map((patient) => {
            const isLocalPending = patient.isSynced === false;

            return (
              <tr
                key={patient.patientId || patient._id}
                className="hover:bg-slate-850/50 transition-colors group"
              >
                <td className="py-3 px-4 font-mono text-xs text-teal-400 font-medium">
                  {patient.patientId}
                </td>
                <td className="py-3 px-4 font-medium text-slate-100">
                  <div className="flex flex-col">
                    <span>{patient.name}</span>
                    {patient.notes && (
                      <span className="text-xs text-slate-400 line-clamp-1 max-w-xs font-normal">
                        {patient.notes}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-300 text-xs">
                  {patient.age} yrs • {patient.gender}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getBloodGroupBadgeClass(
                      patient.bloodGroup
                    )}`}
                  >
                    {patient.bloodGroup || 'Unknown'}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs text-slate-300">
                  <div className="flex flex-col gap-0.5">
                    {patient.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {patient.phone}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">No phone</span>
                    )}
                    {patient.address && (
                      <span className="flex items-center gap-1 text-slate-400 line-clamp-1 max-w-[180px]">
                        <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        {patient.address}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {isLocalPending ? (
                    <Badge variant="warning" dot size="sm">
                      Pending Sync
                    </Badge>
                  ) : (
                    <Badge variant="success" dot size="sm">
                      Synced
                    </Badge>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => onView(patient)}
                      title="View Details"
                      className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(patient)}
                      title="Edit Patient"
                      className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(patient)}
                      title="Delete Patient"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PatientTable;
