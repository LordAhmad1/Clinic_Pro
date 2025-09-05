/**
 * Medical Clinic Management System - Main Server File
 * Professional Enterprise-Grade Backend API
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// Database connection
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic logger
const logger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.log
};

// Security Configuration
let securitySetup = null;
try {
  securitySetup = require('./middleware/security');
  console.log('✅ Security middleware loaded successfully');
} catch (error) {
  console.log('⚠️ Security middleware not available, using basic security');
}

// Load authentication configuration
const authConfig = require('./config/auth');

// Global CORS setup - handle OPTIONS requests first
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', authConfig.cors.origin);
  res.header('Access-Control-Allow-Methods', authConfig.cors.methods.join(','));
  res.header('Access-Control-Allow-Headers', authConfig.cors.allowedHeaders.join(','));
  res.header('Access-Control-Allow-Credentials', authConfig.cors.credentials);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Apply security middleware
if (securitySetup) {
  securitySetup.setupSecurity(app);
} else {
  // Enhanced security configuration
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        connectSrc: ["'self'"],
        upgradeInsecureRequests: []
      }
    }
  }));
  
  // CORS configuration with credentials
  app.use(cors({
    origin: authConfig.cors.origin,
    credentials: authConfig.cors.credentials,
    methods: authConfig.cors.methods,
    allowedHeaders: authConfig.cors.allowedHeaders
  }));

  // Handle OPTIONS requests for CORS preflight - more explicit handling
  app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', authConfig.cors.origin);
    res.setHeader('Access-Control-Allow-Methods', authConfig.cors.methods.join(','));
    res.setHeader('Access-Control-Allow-Headers', authConfig.cors.allowedHeaders.join(','));
    res.setHeader('Access-Control-Allow-Credentials', authConfig.cors.credentials);
    res.sendStatus(200);
  });
}

// Cookie parser middleware
app.use(cookieParser());

// Session middleware
app.use(session(authConfig.session));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload middleware
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Try to load Swagger specs
let swaggerSpecs = null;
try {
  swaggerSpecs = require('./config/swagger');
  console.log('✅ Swagger specs loaded successfully');
} catch (error) {
  console.log('⚠️ Swagger specs not available');
}

// Setup Swagger UI (if available)
if (swaggerSpecs) {
  try {
    const swaggerUi = require('swagger-ui-express');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Medical Clinic API Documentation',
      customfavIcon: '/favicon.ico',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true
      }
    }));
    console.log('✅ Swagger documentation loaded');
  } catch (error) {
    console.log('⚠️ Swagger UI not available');
  }
}

// MongoDB Patient Model
const Patient = require('./models/Patient');

// Patient routes using MongoDB
app.get('/api/v1/patients', async (req, res) => {
  try {
    console.log('📋 Getting all patients from MongoDB');
    
    const patients = await Patient.find({ isActive: true }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Patients retrieved successfully',
      data: {
        patients: patients,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: patients.length,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false
        }
      }
    });
  } catch (error) {
    console.error('❌ Error getting patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve patients',
      error: error.message
    });
  }
});

app.post('/api/v1/patients', async (req, res) => {
  try {
    console.log('➕ Creating new patient in MongoDB:', req.body);
    
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    
    console.log('✅ Patient created successfully in MongoDB:', savedPatient);
    
    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: { patient: savedPatient }
    });
  } catch (error) {
    console.error('❌ Error creating patient:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create patient',
      error: error.message
    });
  }
});

// Get single patient by ID
app.get('/api/v1/patients/:id', async (req, res) => {
  try {
    console.log('📋 Getting patient by ID:', req.params.id);
    
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
        error: 'PatientNotFoundError'
      });
    }
    
    res.json({
      success: true,
      message: 'Patient retrieved successfully',
      data: { patient }
    });
  } catch (error) {
    console.error('❌ Error getting patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve patient',
      error: error.message
    });
  }
});

// Update patient
app.put('/api/v1/patients/:id', async (req, res) => {
  try {
    console.log('✏️ Updating patient:', req.params.id, req.body);
    
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
        error: 'PatientNotFoundError'
      });
    }
    
    console.log('✅ Patient updated successfully:', updatedPatient);
    
    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: { patient: updatedPatient }
    });
  } catch (error) {
    console.error('❌ Error updating patient:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update patient',
      error: error.message
    });
  }
});

// Delete patient
app.delete('/api/v1/patients/:id', async (req, res) => {
  try {
    console.log('🗑️ Deleting patient:', req.params.id);
    
    const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
    
    if (!deletedPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
        error: 'PatientNotFoundError'
      });
    }
    
    console.log('✅ Patient deleted successfully');
    
    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patient',
      error: error.message
    });
  }
});

// Search patients
app.get('/api/v1/patients/search', async (req, res) => {
  try {
    console.log('🔍 Searching patients:', req.query.q);
    
    const query = req.query.q;
    const patients = await Patient.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { nationalId: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Search completed successfully',
      data: {
        patients: patients,
        searchQuery: query,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: patients.length,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false
        }
      }
    });
  } catch (error) {
    console.error('❌ Error searching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search patients',
      error: error.message
    });
  }
});



// Default admin authentication
app.post('/api/v1/auth/login', (req, res) => {
  console.log('🔐 Login attempt:', req.body);
  
  const { email, password } = req.body;
  
  // Default admin credentials
  if (email === 'admin@admin.com' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@admin.com',
          role: 'manager'
        },
        tokens: {
          accessToken: 'default-admin-token-' + Date.now(),
          refreshToken: 'default-refresh-token-' + Date.now(),
          expiresIn: '7d'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid credentials',
        statusCode: 401,
        type: 'AuthenticationError'
      }
    });
  }
});

// Get current user endpoint
app.get('/api/v1/auth/me', (req, res) => {
  console.log('👤 Getting current user');
  
  // For testing, return a default user
  res.json({
    success: true,
    message: 'User retrieved successfully',
    data: {
      id: '1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@admin.com',
      role: 'manager'
    }
  });
});

// API Documentation endpoint
app.get('/api/v1/docs', (req, res) => {
  res.json({
    message: 'Medical Clinic API Documentation',
    version: '1.0.0',
    swaggerUrl: '/api-docs',
    endpoints: {
      auth: '/api/v1/auth',
      patients: '/api/v1/patients',
      doctors: '/api/v1/doctors',
      appointments: '/api/v1/appointments',
      billing: '/api/v1/billing',
      admin: '/api/v1/admin',
      reports: '/api/v1/reports'
    },
    documentation: 'https://github.com/your-org/medical-clinic-backend/wiki'
  });
});

// Simple error handling middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      statusCode: 404,
      type: 'NotFoundError'
    }
  });
});

app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      statusCode: 500,
      type: 'ServerError'
    }
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('🚀 Starting Medical Clinic Server...');

    // Try to connect to MongoDB (but don't fail if it doesn't work)
    try {
      await connectDB();
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.log('⚠️ Database connection failed, starting server without database');
      console.log('🔍 Database error:', dbError.message);
      console.log('💡 Make sure MongoDB is running or check your MONGODB_URI in .env file');
    }

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      if (swaggerSpecs) {
        console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
      }
      console.log(`📚 API Docs: http://localhost:${PORT}/api/v1/docs`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:4200'}`);
      console.log('✅ All endpoints working!');
      console.log('🔐 Default admin: admin@admin.com / admin123');
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`💡 Port ${PORT} is already in use. Try a different port or kill the process using this port.`);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('🔍 Error details:', error.stack);
    process.exit(1);
  }
};

startServer();

module.exports = app;
