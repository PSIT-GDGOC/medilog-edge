const PATIENT_CSV_COLUMNS = [
  ['Patient ID', 'patientId'],
  ['Name', 'name'],
  ['Age', 'age'],
  ['Gender', 'gender'],
  ['Phone', 'phone'],
  ['Address', 'address'],
  ['Blood Group', 'bloodGroup'],
  ['Created At', 'createdAt'],
  ['Updated At', 'updatedAt']
];

/**
 * Convert untrusted values into safe CSV cells for spreadsheet software.
 * Quoting alone does not prevent formula execution in common spreadsheet apps.
 */
function csvCell(value) {
  let text = value == null ? '' : String(value);

  // Prefix formula-like values (including ones preceded by whitespace/control
  // characters) so spreadsheet applications treat the cell as text.
  if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

/**
 * Build a CSV containing only approved reporting fields. Clinical notes and
 * internal database/sync metadata are intentionally excluded.
 * An empty or invalid dataset still returns a valid header-only CSV.
 */
export function patientsToCsv(patients = []) {
  const records = Array.isArray(patients) ? patients : [];
  const rows = [PATIENT_CSV_COLUMNS.map(([header]) => csvCell(header)).join(',')];

  for (const patient of records) {
    rows.push(
      PATIENT_CSV_COLUMNS
        .map(([, key]) => csvCell(patient?.[key]))
        .join(',')
    );
  }

  return rows.join('\r\n');
}

export { PATIENT_CSV_COLUMNS };
