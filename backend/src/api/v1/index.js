/**
 * API v1 Routes Index
 * Combines all v1 API routes
 */

const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth');
const patientRoutes = require('./patients');
const doctorRoutes = require('./doctors');
const appointmentRoutes = require('./appointments');
const billingRoutes = require('./billing');
const adminRoutes = require('./admin');
const reportRoutes = require('./reports');
const prescriptionRoutes = require('./prescriptions');

// Mount routes
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/billing', billingRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);
router.use('/prescriptions', prescriptionRoutes);

module.exports = router;
