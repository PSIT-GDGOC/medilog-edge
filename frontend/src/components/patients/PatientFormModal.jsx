
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { User, Phone, MapPin } from 'lucide-react';
import { useNetwork } from '../../hooks/useNetwork';
import { validatePatientForm } from './patientValidation';

const createEmptyForm = () => ({
  name: '',
  age: '',
  gender: '',
  phone: '',
  address: '',
  bloodGroup: 'Unknown',
  notes: ''
});

export function PatientFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEdit = false
}) {
  const { isOnline } = useNetwork();

  const [formData, setFormData] = useState(createEmptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        age:
          initialData.age !== undefined && initialData.age !== null
            ? String(initialData.age)
            : '',
        gender: initialData.gender || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        bloodGroup: initialData.bloodGroup || 'Unknown',
        notes: initialData.notes || ''
      });
    } else {
      setFormData(createEmptyForm());
    }

    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setErrors((prev) => {
      const next = { ...prev };

      if (next[name]) {
        delete next[name];
      }

      // Remove an old submission error when the user edits the form.
      delete next.form;

      return next;
    });
  };

  const validate = () => {
    const newErrors = validatePatientForm(formData);
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear stale server errors before validating the current values.
    setErrors((prev) => {
      const next = { ...prev };
      delete next.form;
      return next;
    });

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setErrors({
        form:
          typeof err?.message === 'string' && err.message.trim()
            ? err.message
            : 'Failed to save patient record. Please try again.'
      });
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
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        {errors.form && (
          <div
            role="alert"
            className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-sm rounded-lg"
          >
            {errors.form}
          </div>
        )}

        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          aria-invalid={Boolean(errors.name)}
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
            step="1"
            value={formData.age}
            onChange={handleChange}
            error={errors.age}
            aria-invalid={Boolean(errors.age)}
            placeholder="e.g. 42"
            required
          />

          <div className="space-y-1.5">
            <label
              htmlFor="patient-gender"
              className="block text-xs font-medium text-slate-300"
            >
              Gender <span className="text-rose-400">*</span>
            </label>

            <select
              id="patient-gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              aria-invalid={Boolean(errors.gender)}
              aria-describedby={
                errors.gender ? 'patient-gender-error' : undefined
              }
              className={`w-full px-3.5 py-2 bg-slate-900 border rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 transition-colors ${
                errors.gender
                  ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
                  : 'border-slate-700 focus:ring-teal-500 focus:border-teal-500'
              }`}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            {errors.gender && (
              <p
                id="patient-gender-error"
                role="alert"
                className="text-xs text-rose-400"
              >
                {errors.gender}
              </p>
            )}
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
            <label
              htmlFor="patient-blood-group"
              className="block text-xs font-medium text-slate-300"
            >
              Blood Group
            </label>

            <select
              id="patient-blood-group"
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
          <label
            htmlFor="patient-notes"
            className="block text-xs font-medium text-slate-300"
          >
            Clinical Notes &amp; Observations
          </label>

          <textarea
            id="patient-notes"
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter clinical observations, chief complaints, known allergies, or prescription history..."
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
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
