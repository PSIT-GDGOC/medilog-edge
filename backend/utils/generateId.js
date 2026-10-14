/**
 * Generates a clean human-readable Patient ID.
 * Format: MED-YYYY-XXXX (e.g. MED-2026-4891)
 */
const generatePatientId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MED-${year}-${random}`;
};

module.exports = { generatePatientId };
