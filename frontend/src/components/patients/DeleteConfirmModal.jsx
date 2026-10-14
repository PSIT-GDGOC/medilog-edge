import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertTriangle } from 'lucide-react';

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  patient
}) {
  const [deleting, setDeleting] = useState(false);

  if (!patient) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(patient.patientId || patient._id);
      onClose();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Patient Record"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-rose-200">
              Are you sure you want to delete this patient record?
            </p>
            <p className="text-rose-300/80">
              This action will remove patient <strong>{patient.name}</strong> ({patient.patientId}) from local storage and queue deletion with the central server.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deleting}>
            Delete Record
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteConfirmModal;
