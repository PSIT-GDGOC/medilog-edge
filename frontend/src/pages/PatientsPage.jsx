import React, { useState } from 'react';
import { usePatients } from '../hooks/usePatients';
import { useNetwork } from '../hooks/useNetwork';
import PatientTable from '../components/patients/PatientTable';
import PatientCard from '../components/patients/PatientCard';
import PatientFormModal from '../components/patients/PatientFormModal';
import PatientDetailsModal from '../components/patients/PatientDetailsModal';
import DeleteConfirmModal from '../components/patients/DeleteConfirmModal';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Search,
  Filter,
  UserPlus,
  LayoutGrid,
  List,
  RefreshCw,
  Users
} from 'lucide-react';

export function PatientsPage() {
  const { isOnline } = useNetwork();
  const {
    patients,
    loading,
    error,
    filters,
    setFilters,
    reload,
    addPatient,
    editPatient,
    deletePatient
  } = usePatients();

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientToEdit, setPatientToEdit] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleBloodGroupChange = (e) => {
    setFilters((prev) => ({ ...prev, bloodGroup: e.target.value }));
  };

  const handleGenderChange = (e) => {
    setFilters((prev) => ({ ...prev, gender: e.target.value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Patient Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage, search, and update patient clinical records offline and online
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={reload}
            icon={RefreshCw}
            title="Refresh local records"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Register Patient
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by name, ID (MED-...), phone, notes..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Filter dropdowns & View switcher */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Blood group */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <select
              value={filters.bloodGroup}
              onChange={handleBloodGroupChange}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          {/* Gender filter */}
          <select
            value={filters.gender}
            onChange={handleGenderChange}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-teal-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-teal-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Patient Content */}
      {loading ? (
        <LoadingSpinner message="Searching patient records..." />
      ) : error ? (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl text-center">
          {error}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            filters.search || filters.bloodGroup !== 'All' || filters.gender !== 'All'
              ? 'No matching patients found'
              : 'No patients registered yet'
          }
          description={
            filters.search || filters.bloodGroup !== 'All' || filters.gender !== 'All'
              ? 'Try adjusting your search keywords or filter options.'
              : 'Add your first patient to begin maintaining offline-first health records.'
          }
          actionLabel="Register Patient"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : viewMode === 'table' ? (
        <PatientTable
          patients={patients}
          onView={(p) => setSelectedPatient(p)}
          onEdit={(p) => setPatientToEdit(p)}
          onDelete={(p) => setPatientToDelete(p)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p) => (
            <PatientCard
              key={p.patientId || p._id}
              patient={p}
              onView={(patient) => setSelectedPatient(patient)}
              onEdit={(patient) => setPatientToEdit(patient)}
              onDelete={(patient) => setPatientToDelete(patient)}
            />
          ))}
        </div>
      )}

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

export default PatientsPage;
