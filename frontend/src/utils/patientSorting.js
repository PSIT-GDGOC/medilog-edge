const SORT_OPTIONS = [
  'created',
  'updated',
  'name-asc',
  'name-desc',
  'age-asc',
  'age-desc'
];

function getTimestamp(value) {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function sortPatients(patients = [], sortBy = 'created') {
  const records = Array.isArray(patients) ? [...patients] : [];
  const option = SORT_OPTIONS.includes(sortBy) ? sortBy : 'created';

  switch (option) {
    case 'updated':
      return records.sort(
        (a, b) => getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt)
      );

    case 'name-asc':
      return records.sort((a, b) =>
        String(a.name ?? '').localeCompare(String(b.name ?? ''), undefined, {
          sensitivity: 'base'
        })
      );

    case 'name-desc':
      return records.sort((a, b) =>
        String(b.name ?? '').localeCompare(String(a.name ?? ''), undefined, {
          sensitivity: 'base'
        })
      );

    case 'age-asc':
      return records.sort((a, b) => {
        const ageA = Number(a.age);
        const ageB = Number(b.age);
        const validA = a.age !== null && a.age !== '' && Number.isFinite(ageA);
        const validB = b.age !== null && b.age !== '' && Number.isFinite(ageB);

        if (!validA && !validB) return 0;
        if (!validA) return 1;
        if (!validB) return -1;
        return ageA - ageB;
      });

    case 'age-desc':
      return records.sort((a, b) => {
        const ageA = Number(a.age);
        const ageB = Number(b.age);
        const validA = a.age !== null && a.age !== '' && Number.isFinite(ageA);
        const validB = b.age !== null && b.age !== '' && Number.isFinite(ageB);

        if (!validA && !validB) return 0;
        if (!validA) return 1;
        if (!validB) return -1;
        return ageB - ageA;
      });

    case 'created':
    default:
      return records.sort(
        (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
      );
  }
}
