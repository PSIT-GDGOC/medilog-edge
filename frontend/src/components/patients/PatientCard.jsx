import React from 'react';
import Badge from '../common/Badge';
import { Eye, Edit3, Trash2, Phone, MapPin, Calendar } from 'lucide-react';
import { formatDate, getBloodGroupBadgeClass } from '../../utils/formatters';

export function PatientCard({ patient, onView, onEdit, onDelete }) {
  const isLocalPending = patient.isSynced === false;

  return (
    <div className="card-panel p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-mono text-xs text-teal-400 font-medium">
              {patient.patientId}
            </span>
            <h4 className="text-base font-semibold text-slate-100 mt-0.5">
              {patient.name}
            </h4>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium border ${getBloodGroupBadgeClass(
              patient.bloodGroup
            )}`}
          >
            {patient.bloodGroup || 'Unknown'}
          </span>
        </div>

        <p className="text-xs text-slate-300 mt-1">
          {patient.age} years old • {patient.gender}
        </p>

        <div className="mt-3 space-y-1 text-xs text-slate-400">
          {patient.phone ? (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{patient.phone}</span>
            </div>
          ) : null}
          {patient.address ? (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span className="truncate">{patient.address}</span>
            </div>
          ) : null}
        </div>

        {patient.notes && (
          <p className="mt-2.5 text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800 line-clamp-2">
            {patient.notes}
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <div>
          {isLocalPending ? (
            <Badge variant="warning" dot size="sm">
              Pending Sync
            </Badge>
          ) : (
            <Badge variant="success" dot size="sm">
              Synced
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(patient)}
            className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(patient)}
            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(patient)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientCard;
