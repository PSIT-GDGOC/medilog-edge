import test from 'node:test';
import assert from 'node:assert/strict';
import { sortPatients } from '../src/utils/patientSorting.js';

const patients = [
  {
    patientId: 'MED-003',
    name: 'Zara',
    age: 40,
    createdAt: '2026-10-18T10:00:00Z',
    updatedAt: '2026-10-19T10:00:00Z'
  },
  {
    patientId: 'MED-001',
    name: 'Ananya',
    age: 25,
    createdAt: '2026-10-16T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z'
  },
  {
    patientId: 'MED-002',
    name: 'Meera',
    age: 32,
    createdAt: '2026-10-17T10:00:00Z',
    updatedAt: '2026-10-17T10:00:00Z'
  }
];

test('sorts patients by recently added by default', () => {
  assert.deepEqual(
    sortPatients(patients).map((patient) => patient.patientId),
    ['MED-003', 'MED-002', 'MED-001']
  );
});

test('sorts patients by recently updated', () => {
  assert.deepEqual(
    sortPatients(patients, 'updated').map((patient) => patient.patientId),
    ['MED-001', 'MED-003', 'MED-002']
  );
});

test('sorts patient names in both directions', () => {
  assert.deepEqual(
    sortPatients(patients, 'name-asc').map((patient) => patient.name),
    ['Ananya', 'Meera', 'Zara']
  );

  assert.deepEqual(
    sortPatients(patients, 'name-desc').map((patient) => patient.name),
    ['Zara', 'Meera', 'Ananya']
  );
});

test('sorts patient ages in both directions', () => {
  assert.deepEqual(
    sortPatients(patients, 'age-asc').map((patient) => patient.age),
    [25, 32, 40]
  );

  assert.deepEqual(
    sortPatients(patients, 'age-desc').map((patient) => patient.age),
    [40, 32, 25]
  );
});

test('does not mutate the original patient array', () => {
  const original = [...patients];

  sortPatients(patients, 'name-asc');

  assert.deepEqual(patients, original);
});

test('handles missing names, ages, and dates safely', () => {
  const incompletePatients = [
    { patientId: 'MED-005' },
    { patientId: 'MED-004', name: 'Asha', age: 30 }
  ];

  assert.doesNotThrow(() => sortPatients(incompletePatients, 'name-asc'));
  assert.doesNotThrow(() => sortPatients(incompletePatients, 'age-asc'));
  assert.doesNotThrow(() => sortPatients(incompletePatients, 'updated'));
});
