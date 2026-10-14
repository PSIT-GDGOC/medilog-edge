const Patient = require('../models/Patient');
const { generatePatientId } = require('../utils/generateId');

// @desc    Get all patients (with optional search query)
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res, next) => {
  try {
    const { q, bloodGroup, gender } = req.query;
    let query = {};

    if (q) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { patientId: searchRegex },
        { phone: searchRegex },
        { address: searchRegex },
        { notes: searchRegex }
      ];
    }

    if (bloodGroup && bloodGroup !== 'All') {
      query.bloodGroup = bloodGroup;
    }

    if (gender && gender !== 'All') {
      query.gender = gender;
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single patient by MongoDB ID or patientId
// @route   GET /api/patients/:id
// @access  Private
const getPatientById = async (req, res, next) => {
  try {
    const idParam = req.params.id;

    // Check by _id if valid ObjectId, otherwise by patientId or clientTempId
    let patient;
    if (idParam.match(/^[0-9a-fA-F]{24}$/)) {
      patient = await Patient.findById(idParam);
    }
    if (!patient) {
      patient = await Patient.findOne({
        $or: [{ patientId: idParam }, { clientTempId: idParam }]
      });
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: patient
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new patient record
// @route   POST /api/patients
// @access  Private
const createPatient = async (req, res, next) => {
  try {
    const {
      patientId,
      name,
      age,
      gender,
      phone,
      address,
      bloodGroup,
      notes,
      clientTempId
    } = req.body;

    if (!name || age === undefined || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required fields: name, age, and gender.'
      });
    }

    // Deduplication check: if clientTempId was passed and already exists, return existing record
    if (clientTempId) {
      const existingTemp = await Patient.findOne({ clientTempId });
      if (existingTemp) {
        return res.status(200).json({
          success: true,
          message: 'Patient already synchronized.',
          data: existingTemp
        });
      }
    }

    // Determine patientId: use provided patientId or generate unique one
    let assignedPatientId = patientId && patientId.trim() ? patientId.trim() : generatePatientId();

    // Check collision on assignedPatientId
    let idCollision = await Patient.findOne({ patientId: assignedPatientId });
    while (idCollision) {
      assignedPatientId = generatePatientId();
      idCollision = await Patient.findOne({ patientId: assignedPatientId });
    }

    const patient = await Patient.create({
      patientId: assignedPatientId,
      name: name.trim(),
      age: Number(age),
      gender,
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      bloodGroup: bloodGroup || 'Unknown',
      notes: notes ? notes.trim() : '',
      clientTempId: clientTempId || null,
      createdBy: req.user ? req.user._id : null
    });

    return res.status(201).json({
      success: true,
      message: 'Patient record created successfully.',
      data: patient
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update an existing patient record
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    let query = {};

    if (idParam.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = idParam;
    } else {
      query = { $or: [{ patientId: idParam }, { clientTempId: idParam }] };
    }

    const patient = await Patient.findOne(query);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found.'
      });
    }

    const fieldsToUpdate = ['name', 'age', 'gender', 'phone', 'address', 'bloodGroup', 'notes'];
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        patient[field] = req.body[field];
      }
    });

    const updatedPatient = await patient.save();

    return res.status(200).json({
      success: true,
      message: 'Patient record updated successfully.',
      data: updatedPatient
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a patient record
// @route   DELETE /api/patients/:id
// @access  Private
const deletePatient = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    let query = {};

    if (idParam.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = idParam;
    } else {
      query = { $or: [{ patientId: idParam }, { clientTempId: idParam }] };
    }

    const patient = await Patient.findOneAndDelete(query);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Patient record deleted successfully.',
      data: { id: patient._id, patientId: patient.patientId }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Batch synchronize offline queue operations
// @route   POST /api/patients/batch-sync
// @access  Private
const batchSync = async (req, res, next) => {
  try {
    const { operations } = req.body;

    if (!Array.isArray(operations) || operations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Operations array is required for batch sync.'
      });
    }

    const results = [];

    for (const op of operations) {
      const { id, operation, payload, patientId, clientTempId } = op;

      try {
        if (operation === 'CREATE') {
          // Check deduplication
          let existing = null;
          if (clientTempId) {
            existing = await Patient.findOne({ clientTempId });
          }
          if (!existing && payload.patientId) {
            existing = await Patient.findOne({ patientId: payload.patientId });
          }

          if (existing) {
            results.push({
              queueId: id,
              status: 'success',
              operation: 'CREATE',
              action: 'already_exists',
              data: existing
            });
            continue;
          }

          let assignedPatientId = payload.patientId && payload.patientId.trim() ? payload.patientId.trim() : generatePatientId();
          const newPatient = await Patient.create({
            patientId: assignedPatientId,
            name: payload.name,
            age: Number(payload.age),
            gender: payload.gender,
            phone: payload.phone || '',
            address: payload.address || '',
            bloodGroup: payload.bloodGroup || 'Unknown',
            notes: payload.notes || '',
            clientTempId: clientTempId || id,
            createdBy: req.user ? req.user._id : null
          });

          results.push({
            queueId: id,
            status: 'success',
            operation: 'CREATE',
            action: 'created',
            data: newPatient
          });
        } else if (operation === 'UPDATE') {
          const targetId = patientId || payload._id || payload.patientId;
          let query = {};
          if (targetId && targetId.match(/^[0-9a-fA-F]{24}$/)) {
            query._id = targetId;
          } else {
            query = { $or: [{ patientId: targetId }, { clientTempId: clientTempId || targetId }] };
          }

          const patient = await Patient.findOne(query);
          if (patient) {
            const fields = ['name', 'age', 'gender', 'phone', 'address', 'bloodGroup', 'notes'];
            fields.forEach((f) => {
              if (payload[f] !== undefined) patient[f] = payload[f];
            });
            const saved = await patient.save();
            results.push({
              queueId: id,
              status: 'success',
              operation: 'UPDATE',
              data: saved
            });
          } else {
            results.push({
              queueId: id,
              status: 'failed',
              operation: 'UPDATE',
              error: 'Patient record not found on server.'
            });
          }
        } else if (operation === 'DELETE') {
          const targetId = patientId || payload.id || payload.patientId;
          let query = {};
          if (targetId && targetId.match(/^[0-9a-fA-F]{24}$/)) {
            query._id = targetId;
          } else {
            query = { $or: [{ patientId: targetId }, { clientTempId: clientTempId || targetId }] };
          }

          const deleted = await Patient.findOneAndDelete(query);
          results.push({
            queueId: id,
            status: 'success',
            operation: 'DELETE',
            data: deleted ? { patientId: deleted.patientId } : { patientId: targetId }
          });
        }
      } catch (opErr) {
        results.push({
          queueId: id,
          status: 'failed',
          operation,
          error: opErr.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Batch synchronization completed.',
      results
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  batchSync
};
