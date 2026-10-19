
import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePatientForm } from '../src/components/patients/patientValidation.js';

const validPatient = {
  name: 'Ramesh Kumar',
  age: '42',
  gender: 'Male'
};

test('accepts valid patient information', () => {
  assert.deepEqual(validatePatientForm(validPatient), {});
});

test('rejects an empty or whitespace-only patient name', () => {
  for (const name of ['', '   ']) {
    const errors = validatePatientForm({ ...validPatient, name });

    assert.equal(errors.name, 'Patient name is required.');
  }
});

test('requires an age', () => {
  const errors = validatePatientForm({ ...validPatient, age: '' });

  assert.equal(errors.age, 'Age is required.');
});

test('rejects invalid ages', () => {
  for (const age of ['-1', '151', '12.5', 'abc']) {
    const errors = validatePatientForm({ ...validPatient, age });

    assert.ok(errors.age, `Expected age "${age}" to be rejected`);
  }
});

test('accepts ages at the boundaries 0 and 150', () => {
  for (const age of ['0', '150']) {
    const errors = validatePatientForm({ ...validPatient, age });

    assert.equal(errors.age, undefined);
  }
});

test('rejects a missing or invalid gender', () => {
  for (const gender of ['', 'Invalid']) {
    const errors = validatePatientForm({ ...validPatient, gender });

    assert.equal(errors.gender, 'Please select a valid gender.');
  }
});
