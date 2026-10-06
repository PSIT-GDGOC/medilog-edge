import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { User, Phone, MapPin, Calendar, Clock, HeartPulse, Edit3, Trash2 } from 'lucide-react';
import { formatDateTime, getBloodGroupBadgeClass } from '../../utils/formatters';

export function PatientDetailsModal({
  isOpen,
  onClose,
  patient,
  onEdit,
  onDelete
}) {
  if (!patient) return null;

  const isLocalPending = patient.isSynced === false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Patient Clinical Record"
      subtitle={`Identifier: ${patient.patientId}`}
    >
      <div className="space-y-5">
        {/* Top summary banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/70 border border-slate-800 rounded-xl gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100">{patient.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {patient.age} years old • {patient.gender}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getBloodGroupBadgeClass(
                patient.bloodGroup
              )}`}
            >
              Blood Group: {patient.bloodGroup || 'Unknown'}
            </span>
            {isLocalPending ? (
              <Badge variant="warning" dot size="md">
                Pending Sync
              </Badge>
            ) : (
              <Badge variant="success" dot size="md">
                Synced
              </Badge>
            )}
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card-panel p-3.5 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              Contact Phone
            </span>
            <p className="text-sm text-slate-200 font-medium">
              {patient.phone || <span className="text-slate-500 font-normal italic">Not recorded</span>}
            </p>
          </div>

          <div className="card-panel p-3.5 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              Residential Address
            </span>
            <p className="text-sm text-slate-200 font-medium">
              {patient.address || <span className="text-slate-500 font-normal italic">Not recorded</span>}
            </p>
          </div>

          <div className="card-panel p-3.5 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Created At
            </span>
            <p className="text-xs text-slate-300 font-mono">
              {formatDateTime(patient.createdAt)}
            </p>
          </div>

          <div className="card-panel p-3.5 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Last Updated
            </span>
            <p className="text-xs text-slate-300 font-mono">
              {formatDateTime(patient.updatedAt)}
            </p>
          </div>
        </div>

        {/* Clinical notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-teal-400" />
            Clinical Notes & Observations
          </label>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 whitespace-pre-wrap min-h-[90px]">
            {patient.notes ? (
              patient.notes
            ) : (
              <span className="text-slate-500 italic text-xs">
                No clinical notes recorded for this patient.
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => {
              onClose();
              onDelete(patient);
            }}
          >
            Delete Record
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Edit3}
              onClick={() => {
                onClose();
                onEdit(patient);
              }}
            >
              Edit Record
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default PatientDetailsModal;
