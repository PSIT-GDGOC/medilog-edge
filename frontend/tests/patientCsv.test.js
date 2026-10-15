import test from 'node:test';
import assert from 'node:assert/strict';
import { patientsToCsv, PATIENT_CSV_COLUMNS } from '../src/utils/patientCsv.js';

test('exports a stable header row and the permitted patient fields', () => {
  const csv = patientsToCsv([]);
  assert.equal(csv.split('\r\n').length, 1);
  assert.deepEqual(
    csv.split('\r\n')[0].split(',').map((cell) => cell.slice(1, -1)),
    PATIENT_CSV_COLUMNS.map(([header]) => header)
  );
  assert.doesNotMatch(csv, /Notes|createdBy|clientTempId|__v/);
});

test('handles an empty or invalid dataset without throwing', () => {
  assert.equal(patientsToCsv([]), patientsToCsv(null));
  assert.equal(patientsToCsv(undefined), patientsToCsv({}));
});

test('quotes commas, quotes, and line breaks correctly', () => {
  const csv = patientsToCsv([{
    patientId: 'MED-2026-1234',
    name: 'Asha "Ash" Singh',
    address: 'House 2, Main Road\nNear clinic',
    age: 32,
    gender: 'Female',
    phone: '+91 9876543210',
    bloodGroup: 'O+',
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z',
    notes: 'Sensitive clinical notes must not be exported',
    createdBy: 'internal-user-id',
    clientTempId: 'sync-only-id'
  }]);

  assert.match(csv, /"Asha ""Ash"" Singh"/);
  assert.match(csv, /"House 2, Main Road\nNear clinic"/);
  assert.doesNotMatch(csv, /Sensitive clinical notes|internal-user-id|sync-only-id/);
});

test('neutralizes spreadsheet formula-like values', () => {
  const csv = patientsToCsv([{
    patientId: '=HYPERLINK("https://bad.example")',
    name: '  @SUM(1,2)',
    age: 28,
    gender: 'Other',
    phone: '+123456',
    address: '-1 Main Street',
    bloodGroup: 'A+',
    createdAt: '',
    updatedAt: ''
  }]);

  assert.match(csv, /"'=HYPERLINK\(""https:\/\/bad\.example""\)"/);
  assert.match(csv, /"'  @SUM\(1,2\)"/);
  assert.match(csv, /"'\+123456"/);
  assert.match(csv, /"'-1 Main Street"/);
});
