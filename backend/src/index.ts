import express, { Express } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { loggingMiddleware } from './middleware/logging.js';
import { errorHandler } from './middleware/error.js';
import { authMiddleware } from './middleware/auth.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import patientRoutes from './routes/patient.routes.js';
import referralRoutes from './routes/referral.routes.js';
import patientRecordsRoutes from './routes/patient-records.routes.js';
import hospitalRoutes from './routes/hospital.routes.js';
import auditRoutes from './routes/audit.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import externalMysqlRoutes from './routes/external-mysql.routes.js';
import kfhOracleRoutes from './routes/kfh-oracle.routes.js';

const app: Express = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middlewares
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint to verify Oracle queries
app.get('/test-oracle/:patientId', async (req, res) => {
  try {
    const { kfhOracleService } = await import('./services/kfh-oracle.service.js');
    const patientId = parseInt(req.params.patientId);
    
    const patient = await kfhOracleService.getPatientById(patientId);
    if (!patient) {
      return res.json({ success: false, message: 'Patient not found' });
    }
    
    const encounters = await kfhOracleService.getEncountersByPatientId(patientId);
    const diagnoses = await kfhOracleService.getDiagnosesByPatientId(patientId);
    const prescriptions = await kfhOracleService.getPrescriptionsByPatientId(patientId);
    const labResults = await kfhOracleService.getLabResultsByPatientId(patientId);
    
    res.json({
      success: true,
      patient: { patient_id: patient.patient_id, first_name: patient.first_name, last_name: patient.last_name },
      counts: {
        encounters: encounters.length,
        diagnoses: diagnoses.length,
        prescriptions: prescriptions.length,
        labResults: labResults.length
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/patient-records', patientRecordsRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/external-mysql', externalMysqlRoutes);
app.use('/api/kfh-oracle', kfhOracleRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  🏥 MedExchange Backend Server Running    ║
║  Port: ${PORT}                          
║  CORS: ${CORS_ORIGIN}
║  Environment: ${process.env.NODE_ENV || 'development'}
╚════════════════════════════════════════════╝
  `);
});

// Handle server errors
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
    console.error('Solution: Kill the process using this port or use a different port.');
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
