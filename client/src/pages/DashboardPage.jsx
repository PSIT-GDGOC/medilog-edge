import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePatients } from '../hooks/usePatients';
import { useNetwork } from '../hooks/useNetwork';
import { useAuth } from '../hooks/useAuth';
import PatientFormModal from '../components/patients/PatientFormModal';
import PatientDetailsModal from '../components/patients/PatientDetailsModal';
import DeleteConfirmModal from '../components/patients/DeleteConfirmModal';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Users,
  UserPlus,
  RefreshCw,
  Wifi,
  WifiOff,
  ArrowRight,
  HeartPulse,
  Database,
  CheckCircle2,
  AlertCircle,
  Eye
} from 'lucide-react';
import { formatDate, getBloodGroupBadgeClass } from '../utils/formatters';

export function DashboardPage() {
  const { user } = useAuth();
  const { patients, loading, addPatient, editPatient, deletePatient } = usePatients();
  const { isOnline, isSyncing, pendingCount, triggerSync, lastSyncTime } = useNetwork();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientToEdit, setPatientToEdit] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Genuinely calculated metrics from actual patient records
  const totalPatients = patients.length;
  const syncedPatientsCount = patients.filter((p) => p.isSynced !== false).length;
  const unsyncedPatientsCount = patients.filter((p) => p.isSynced === false).length;
  const recentPatients = patients.slice(0, 5);

  // Blood group breakdown calculated from actual records
  const bloodGroupCounts = patients.reduce((acc, p) => {
    const bg = p.bloodGroup || 'Unknown';
    acc[bg] = (acc[bg] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 card-panel bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-100">
              Welcome, {user?.name || 'Healthcare Worker'}
            </h1>
            <Badge variant="info" size="sm">
              {user?.role || 'Field Station'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            {user?.center || 'Primary Healthcare Post'} • Offline-First Field Terminal Active
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Register Patient
          </Button>
          <Link to="/patients">
            <Button variant="secondary" icon={ArrowRight}>
              Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* Practical Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="card-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Records
            </span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{totalPatients}</div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Database className="w-3 h-3 text-slate-500" />
            Persisted in local IndexedDB
          </p>
        </div>

        {/* Sync Status */}
        <div className="card-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Pending Sync
            </span>
            <RefreshCw
              className={`w-4 h-4 ${
                isSyncing ? 'animate-spin text-teal-400' : 'text-amber-400'
              }`}
            />
          </div>
          <div className="text-2xl font-bold text-slate-100">{pendingCount}</div>
          <p className="text-[11px] text-slate-400">
            {pendingCount === 0
              ? 'All records synchronized'
              : `${pendingCount} operation(s) queued for sync`}
          </p>
        </div>

        {/* Central Sync Health */}
        <div className="card-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Server Synced
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{syncedPatientsCount}</div>
          <p className="text-[11px] text-slate-400">
            {unsyncedPatientsCount > 0
              ? `${unsyncedPatientsCount} created/modified offline`
              : 'Consistent with MongoDB'}
          </p>
        </div>

        {/* Network & Engine */}
        <div className="card-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Connectivity
            </span>
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <p className="text-[11px] text-slate-400">
            {isOnline ? 'Direct REST API & Sync Active' : 'Operating on local IndexedDB'}
          </p>
        </div>
      </div>

      {/* Main Content Grid: Recent Patients & Field Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patients Table (2 cols) */}
        <div className="lg:col-span-2 card-panel p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Recent Patient Encounters
              </h2>
              <p className="text-xs text-slate-400">
                Latest patients added or updated in this field station
              </p>
            </div>
            <Link
              to="/patients"
              className="text-xs font-medium text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              View all ({totalPatients})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading recent patient records..." />
          ) : recentPatients.length === 0 ? (
            <EmptyState
              title="No patients recorded yet"
              description="Register your first patient using the button below or start field triage."
              actionLabel="Register Patient"
              onAction={() => setIsAddModalOpen(true)}
            />
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentPatients.map((patient) => {
                const isLocalPending = patient.isSynced === false;
                return (
                  <div
                    key={patient.patientId || patient._id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-850/40 px-2 rounded-lg transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-teal-400 font-medium">
                          {patient.patientId}
                        </span>
                        <span className="text-sm font-medium text-slate-100 truncate">
                          {patient.name}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${getBloodGroupBadgeClass(
                            patient.bloodGroup
                          )}`}
                        >
                          {patient.bloodGroup || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {patient.age} yrs • {patient.gender}{' '}
                        {patient.address ? `• ${patient.address}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isLocalPending ? (
                        <Badge variant="warning" dot size="sm">
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="success" dot size="sm">
                          Synced
                        </Badge>
                      )}
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Practical Field Breakdown (1 col) */}
        <div className="card-panel p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-100">
              Blood Group Distribution
            </h2>
            <p className="text-xs text-slate-400">
              Calculated from active patient registry
            </p>
          </div>

          {totalPatients === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              No clinical records to analyze.
            </p>
          ) : (
            <div className="space-y-2.5">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((bg) => {
                const count = bloodGroupCounts[bg] || 0;
                if (count === 0 && bg === 'Unknown') return null;
                const percentage = totalPatients > 0 ? Math.round((count / totalPatients) * 100) : 0;

                return (
                  <div key={bg} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">{bg}</span>
                      <span className="text-slate-400">
                        {count} patient{count === 1 ? '' : 's'} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-teal-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick sync action card */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Field Station Sync Status
            </span>
            <p className="text-[11px] text-slate-400">
              {lastSyncTime
                ? `Last synced at ${new Date(lastSyncTime).toLocaleTimeString()}`
                : 'No sync cycle completed this session'}
            </p>
            {isOnline ? (
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-2"
                onClick={triggerSync}
                isLoading={isSyncing}
                icon={RefreshCw}
              >
                {isSyncing ? 'Synchronizing...' : 'Force Sync Check'}
              </Button>
            ) : (
              <div className="text-[11px] text-amber-400/90 bg-amber-950/40 p-2 rounded-lg border border-amber-800/40">
                Offline: Operations are queued safely in IndexedDB.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PatientFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (formData) => {
          await addPatient(formData);
        }}
      />

      {patientToEdit && (
        <PatientFormModal
          isOpen={!!patientToEdit}
          initialData={patientToEdit}
          isEdit={true}
          onClose={() => setPatientToEdit(null)}
          onSubmit={async (updates) => {
            await editPatient(patientToEdit.patientId || patientToEdit._id, updates);
            setPatientToEdit(null);
          }}
        />
      )}

      {selectedPatient && (
        <PatientDetailsModal
          isOpen={!!selectedPatient}
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onEdit={(patient) => {
            setSelectedPatient(null);
            setPatientToEdit(patient);
          }}
          onDelete={(patient) => {
            setSelectedPatient(null);
            setPatientToDelete(patient);
          }}
        />
      )}

      {patientToDelete && (
        <DeleteConfirmModal
          isOpen={!!patientToDelete}
          patient={patientToDelete}
          onClose={() => setPatientToDelete(null)}
          onConfirm={async (patientId) => {
            await deletePatient(patientId);
            setPatientToDelete(null);
          }}
        />
      )}
    </div>
  );
}

export default DashboardPage;
