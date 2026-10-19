
const VALID_GENDERS = ['Male', 'Female', 'Other'];

export function validatePatientForm(formData = {}) {
  const errors = {};

  const name =
    typeof formData.name === 'string' ? formData.name.trim() : '';

  const ageText = String(formData.age ?? '').trim();
  const age = Number(ageText);

  if (!name) {
    errors.name = 'Patient name is required.';
  }

  if (!ageText) {
    errors.age = 'Age is required.';
  } else if (
    !Number.isFinite(age) ||
    !Number.isInteger(age) ||
    age < 0 ||
    age > 150
  ) {
    errors.age = 'Enter a whole-number age between 0 and 150.';
  }

  if (!VALID_GENDERS.includes(formData.gender)) {
    errors.gender = 'Please select a valid gender.';
  }

  return errors;
}
