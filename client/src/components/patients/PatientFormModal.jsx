import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { User, Phone, MapPin, FileText, Activity } from 'lucide-react';
import { useNetwork } from '../../hooks/useNetwork';

export function PatientFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEdit = false
}) {
  const { isOnline } = useNetwork();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: '',
    bloodGroup: 'Unknown',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        age: initialData.age !== undefined ? String(initialData.age) : '',
        gender: initialData.gender || 'Male',
        phone: initialData.phone || '',
        address: initialData.address || '',
        bloodGroup: initialData.bloodGroup || 'Unknown',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        address: '',
        bloodGroup: 'Unknown',
        notes: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Patient name is required.';
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required.';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 0 || Number(formData.age) > 150) {
      newErrors.age = 'Enter a valid age (0 - 150).';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'Failed to save patient record.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Patient Record' : 'Register New Patient'}
      subtitle={
        isEdit
          ? `Updating details for ${initialData?.patientId || 'patient'}`
          : isOnline
          ? 'Enter clinical details below'
          : 'Offline mode active: record will be saved to IndexedDB'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg">
            {errors.form}
          </div>
        )}

        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="e.g. Ramesh Kumar"
          icon={User}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Age"
            name="age"
            type="number"
            min="0"
            max="150"
            value={formData.age}
            onChange={handleChange}
            error={errors.age}
            placeholder="e.g. 42"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Gender <span className="text-rose-400">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +91 9876543210"
            icon={Phone}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Blood Group</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            >
              <option value="Unknown">Unknown</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        <Input
          label="Residential / Village Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="e.g. Ward 4, Rampur Village"
          icon={MapPin}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">
            Clinical Notes & Observations
          </label>
          <textarea
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter clinical observations, chief complaints, known allergies, or prescription history..."
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={submitting}>
            {isEdit ? 'Save Changes' : 'Register Patient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default PatientFormModal;
