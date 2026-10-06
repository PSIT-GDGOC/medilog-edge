const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  batchSync
} = require('../controllers/patientController');
const { protect } = require('../middleware/auth');

// All patient endpoints require authentication
router.use(protect);

router.route('/')
  .get(getPatients)
  .post(createPatient);

router.post('/batch-sync', batchSync);

router.route('/:id')
  .get(getPatientById)
  .put(updatePatient)
  .delete(deletePatient);

module.exports = router;
