# 🏥 Medical Clinic Management System - Backend

## 📋 Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Authentication & Security](#authentication--security)
- [Middleware](#middleware)
- [Models](#models)
- [Controllers](#controllers)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Testing](#testing)

## 🎯 Overview

The backend is a Node.js/Express REST API that provides comprehensive medical clinic management functionality. It handles user authentication, patient management, appointment scheduling, and administrative operations.

### Key Features
- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 👥 **User Management** - Complete user CRUD operations with role-based access
- 🏥 **Patient Management** - Patient records, medical history, and documents
- 📅 **Appointment System** - Scheduling, rescheduling, and cancellation
- 👨‍⚕️ **Doctor Management** - Doctor profiles, specializations, and schedules
- 📊 **Analytics** - Dashboard statistics and reporting
- 🔒 **Security** - Input validation, rate limiting, and data protection
- 📝 **API Documentation** - Swagger/OpenAPI documentation

## 🛠 Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: MongoDB 6+
- **ODM**: Mongoose 7+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Environment**: dotenv
- **CORS**: cors
- **Security**: helmet, express-rate-limit

## 📁 Project Structure

```
backend/
├── src/
│   ├── api/                 # API route definitions
│   │   ├── v1/             # API version 1
│   │   │   ├── auth.js     # Authentication routes
│   │   │   ├── users.js    # User management routes
│   │   │   ├── patients.js # Patient routes
│   │   │   ├── appointments.js # Appointment routes
│   │   │   └── doctors.js  # Doctor routes
│   ├── config/             # Configuration files
│   │   ├── database.js     # Database configuration
│   │   ├── jwt.js         # JWT configuration
│   │   └── swagger.js     # API documentation config
│   ├── controllers/        # Route controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── patientController.js
│   │   ├── appointmentController.js
│   │   └── doctorController.js
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js        # Authentication middleware
│   │   ├── adminSecurity.js # Admin security middleware
│   │   ├── validation.js  # Input validation
│   │   └── errorHandler.js # Error handling
│   ├── models/            # Mongoose models
│   │   ├── User.js        # User schema
│   │   ├── Patient.js     # Patient schema
│   │   ├── Appointment.js # Appointment schema
│   │   └── Doctor.js      # Doctor schema
│   ├── database/          # Database utilities
│   │   ├── connection.js  # Database connection
│   │   └── seeders/       # Database seeders
│   │       └── defaultUsers.js # Default user data
│   ├── utils/             # Utility functions
│   │   ├── logger.js      # Logging utilities
│   │   ├── validators.js  # Validation helpers
│   │   └── helpers.js     # General helpers
│   └── server.js          # Main server file
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variables template
└── README.md            # Backend-specific documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm 9+

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

6. **Access the API**
   - API Base URL: `http://localhost:3000/api/v1`
   - Swagger Documentation: `http://localhost:3000/api-docs`

## 🗄 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['manager', 'doctor', 'secretary']),
  phone: String,
  nationalId: String,
  avatar: String,
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Patient Model
```javascript
{
  _id: ObjectId,
  personalInfo: {
    firstName: String (required),
    lastName: String (required),
    dateOfBirth: Date (required),
    gender: String (enum: ['male', 'female', 'other']),
    phone: String,
    email: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  medicalInfo: {
    bloodType: String,
    allergies: [String],
    medications: [String],
    medicalHistory: [String],
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      groupNumber: String
    }
  },
  assignedDoctor: ObjectId (ref: 'User'),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment Model
```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: 'Patient', required),
  doctor: ObjectId (ref: 'User', required),
  date: Date (required),
  time: String (required),
  duration: Number (default: 30), // minutes
  type: String (enum: ['consultation', 'follow-up', 'emergency']),
  status: String (enum: ['scheduled', 'confirmed', 'completed', 'cancelled']),
  notes: String,
  diagnosis: String,
  prescription: [String],
  followUpRequired: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Doctor Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  specialization: String (required),
  licenseNumber: String (required, unique),
  experience: Number, // years
  education: [String],
  certifications: [String],
  workingHours: {
    monday: { start: String, end: String, available: Boolean },
    tuesday: { start: String, end: String, available: Boolean },
    wednesday: { start: String, end: String, available: Boolean },
    thursday: { start: String, end: String, available: Boolean },
    friday: { start: String, end: String, available: Boolean },
    saturday: { start: String, end: String, available: Boolean },
    sunday: { start: String, end: String, available: Boolean }
  },
  consultationFee: Number,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication Endpoints

#### POST `/api/v1/auth/login`
Login user and return JWT token.

**Request Body:**
```json
{
  "email": "admin@clinic.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Admin User",
      "email": "admin@clinic.com",
      "role": "manager"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST `/api/v1/auth/logout`
Logout user (invalidate token).

#### POST `/api/v1/auth/refresh`
Refresh JWT token.

### User Management Endpoints

#### GET `/api/v1/users`
Get all users (admin only).

#### GET `/api/v1/users/:id`
Get user by ID.

#### POST `/api/v1/users`
Create new user (admin only).

#### PUT `/api/v1/users/:id`
Update user (admin only).

#### DELETE `/api/v1/users/:id`
Delete user (admin only).

### Patient Management Endpoints

#### GET `/api/v1/patients`
Get all patients with pagination and filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `doctor`: Filter by assigned doctor

#### GET `/api/v1/patients/:id`
Get patient by ID with full details.

#### POST `/api/v1/patients`
Create new patient.

#### PUT `/api/v1/patients/:id`
Update patient information.

#### DELETE `/api/v1/patients/:id`
Delete patient (soft delete).

### Appointment Endpoints

#### GET `/api/v1/appointments`
Get appointments with filtering.

**Query Parameters:**
- `date`: Filter by date
- `doctor`: Filter by doctor
- `patient`: Filter by patient
- `status`: Filter by status

#### GET `/api/v1/appointments/:id`
Get appointment details.

#### POST `/api/v1/appointments`
Create new appointment.

#### PUT `/api/v1/appointments/:id`
Update appointment.

#### DELETE `/api/v1/appointments/:id`
Cancel appointment.

### Doctor Endpoints

#### GET `/api/v1/doctors`
Get all doctors with specializations.

#### GET `/api/v1/doctors/:id`
Get doctor details.

#### POST `/api/v1/doctors`
Create doctor profile.

#### PUT `/api/v1/doctors/:id`
Update doctor information.

## 🔐 Authentication & Security

### JWT Implementation
```javascript
// JWT Configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  issuer: 'medical-clinic-api',
  audience: 'medical-clinic-client'
};
```

### Password Security
```javascript
// Password hashing with bcrypt
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Password verification
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Security Middleware
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API request limiting
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Mongoose ODM protection

### Role-Based Access Control
```javascript
// Admin security middleware
const adminSecurity = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};
```

## 🔧 Middleware

### Authentication Middleware
```javascript
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};
```

### Validation Middleware
```javascript
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};
```

### Error Handling Middleware
```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
};
```

## 📊 Models

### User Model Example
```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['manager', 'doctor', 'secretary'],
    default: 'secretary'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.name}`;
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('User', userSchema);
```

## 🎮 Controllers

### Auth Controller Example
```javascript
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
```

## ⚙️ Configuration

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/medical_clinic
MONGODB_TEST_URI=mongodb://localhost:27017/medical_clinic_test

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:4200

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Configuration
```javascript
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
```

## 💻 Development

### Development Commands
```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### API Testing
```bash
# Using curl
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinic.com","password":"admin123"}'

# Using Postman
# Import the API collection from /docs/postman/
```

### Database Seeding
```bash
# Seed default users
npm run seed

# Clear database
npm run seed:clear
```

## 🚀 Deployment

### Production Build
```bash
# Install production dependencies only
npm ci --only=production

# Start with PM2
pm2 start ecosystem.config.js
```

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
MONGODB_URI=mongodb://production-db:27017/medical_clinic
JWT_SECRET=production_jwt_secret_key
PORT=3000
```

## 🧪 Testing

### Test Structure
```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── fixtures/          # Test data
└── helpers/           # Test utilities
```

### Test Commands
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/auth.test.js

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Example Test
```javascript
describe('Auth Controller', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const userData = {
        email: 'admin@clinic.com',
        password: 'admin123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(userData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });
  });
});
```

## 📊 Monitoring & Logging

### Winston Logging
```javascript
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

## 🔧 Troubleshooting

### Common Issues

#### 1. **Database Connection Error**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection string
echo $MONGODB_URI
```

#### 2. **JWT Token Issues**
```bash
# Verify JWT secret
echo $JWT_SECRET

# Check token expiration
# Decode token at jwt.io
```

#### 3. **Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Specific debug namespace
DEBUG=app:auth npm run dev
```

## 📚 API Documentation

### Swagger/OpenAPI
- **URL**: `http://localhost:3000/api-docs`
- **Interactive**: Try API endpoints directly
- **Schema**: Complete request/response schemas
- **Authentication**: JWT token testing

### Postman Collection
- **Location**: `/docs/postman/`
- **Environment**: Development and production configs
- **Tests**: Automated API tests

## 🤝 Contributing

1. Follow Node.js best practices
2. Write comprehensive tests
3. Update API documentation
4. Use meaningful commit messages
5. Ensure security best practices

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team
