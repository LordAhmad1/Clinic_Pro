🏥 Medical Clinic Management System - Backend
📋 Table of Contents
Overview
Technology Stack
Project Structure
Getting Started
Database Schema
API Endpoints
Authentication & Security
Middleware
Models
Controllers
Configuration
Development
Deployment
Testing
🎯 Overview
The backend is a Node.js/Express REST API that provides comprehensive medical clinic management functionality. It handles user authentication, patient management, appointment scheduling, and administrative operations.

Key Features
🔐 JWT Authentication - Secure user authentication and authorization
👥 User Management - Complete user CRUD operations with role-based access
🏥 Patient Management - Patient records, medical history, and documents
📅 Appointment System - Scheduling, rescheduling, and cancellation
👨‍⚕️ Doctor Management - Doctor profiles, specializations, and schedules
📊 Analytics - Dashboard statistics and reporting
🔒 Security - Input validation, rate limiting, and data protection
📝 API Documentation - Swagger/OpenAPI documentation
🛠 Technology Stack
Runtime: Node.js 18+
Framework: Express.js 4.x
Database: MongoDB 6+
ODM: Mongoose 7+
Authentication: JWT (jsonwebtoken)
Password Hashing: bcryptjs
Validation: Joi
Documentation: Swagger/OpenAPI
Logging: Winston
Environment: dotenv
CORS: cors
Security: helmet, express-rate-limit
📁 Project Structure
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
🚀 Getting Started
Prerequisites
Node.js 18+
MongoDB 6+
npm 9+
Installation
Navigate to backend directory

cd backend
Install dependencies

npm install
Environment setup

cp .env.example .env
# Edit .env with your configuration
Start MongoDB

# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
Start the server

npm start
# or for development
npm run dev
Access the API

API Base URL: http://localhost:3000/api/v1
Swagger Documentation: http://localhost:3000/api-docs
🗄 Database Schema
User Model
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
Patient Model
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
Appointment Model
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
Doctor Model
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
🔌 API Endpoints
Authentication Endpoints
POST /api/v1/auth/login
Login user and return JWT token.

Request Body:

{
  "email": "admin@clinic.com",
  "password": "admin123"
}
Response:

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
POST /api/v1/auth/logout
Logout user (invalidate token).

POST /api/v1/auth/refresh
Refresh JWT token.

User Management Endpoints
GET /api/v1/users
Get all users (admin only).

GET /api/v1/users/:id
Get user by ID.

POST /api/v1/users
Create new user (admin only).

PUT /api/v1/users/:id
Update user (admin only).

DELETE /api/v1/users/:id
Delete user (admin only).

Patient Management Endpoints
GET /api/v1/patients
Get all patients with pagination and filtering.

Query Parameters:

page: Page number (default: 1)
limit: Items per page (default: 10)
search: Search term
doctor: Filter by assigned doctor
GET /api/v1/patients/:id
Get patient by ID with full details.

POST /api/v1/patients
Create new patient.

PUT /api/v1/patients/:id
Update patient information.

DELETE /api/v1/patients/:id
Delete patient (soft delete).

Appointment Endpoints
GET /api/v1/appointments
Get appointments with filtering.

Query Parameters:

date: Filter by date
doctor: Filter by doctor
patient: Filter by patient
status: Filter by status
GET /api/v1/appointments/:id
Get appointment details.

POST /api/v1/appointments
Create new appointment.

PUT /api/v1/appointments/:id
Update appointment.

DELETE /api/v1/appointments/:id
Cancel appointment.

Doctor Endpoints
GET /api/v1/doctors
Get all doctors with specializations.

GET /api/v1/doctors/:id
Get doctor details.

POST /api/v1/doctors
Create doctor profile.

PUT /api/v1/doctors/:id
Update doctor information.

🔐 Authentication & Security
JWT Implementation
// JWT Configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  issuer: 'medical-clinic-api',
  audience: 'medical-clinic-client'
};
Password Security
// Password hashing with bcrypt
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Password verification
const isValid = await bcrypt.compare(password, hashedPassword);
Security Middleware
Helmet: Security headers
CORS: Cross-origin resource sharing
Rate Limiting: API request limiting
Input Validation: Joi schema validation
SQL Injection Protection: Mongoose ODM protection
Role-Based Access Control
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
🔧 Middleware
Authentication Middleware
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
Validation Middleware
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
Error Handling Middleware
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
📊 Models
User Model Example
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
🎮 Controllers
Auth Controller Example
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
⚙️ Configuration
Environment Variables
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
Database Configuration
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
💻 Development
Development Commands
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
API Testing
# Using curl
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinic.com","password":"admin123"}'

# Using Postman
# Import the API collection from /docs/postman/
Database Seeding
# Seed default users
npm run seed

# Clear database
npm run seed:clear
🚀 Deployment
Production Build
# Install production dependencies only
npm ci --only=production

# Start with PM2
pm2 start ecosystem.config.js
Docker Deployment
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
Environment Setup
# Production environment variables
NODE_ENV=production
MONGODB_URI=mongodb://production-db:27017/medical_clinic
JWT_SECRET=production_jwt_secret_key
PORT=3000
🧪 Testing
Test Structure
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── fixtures/          # Test data
└── helpers/           # Test utilities
Test Commands
# Run all tests
npm test

# Run specific test file
npm test -- tests/auth.test.js

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
Example Test
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
📊 Monitoring & Logging
Winston Logging
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
Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
🔧 Troubleshooting
Common Issues
1. Database Connection Error
# Check MongoDB status
sudo systemctl status mongod

# Check connection string
echo $MONGODB_URI
2. JWT Token Issues
# Verify JWT secret
echo $JWT_SECRET

# Check token expiration
# Decode token at jwt.io
3. Port Already in Use
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
Debug Mode
# Enable debug logging
DEBUG=* npm run dev

# Specific debug namespace
DEBUG=app:auth npm run dev
📚 API Documentation
Swagger/OpenAPI
URL: http://localhost:3000/api-docs
Interactive: Try API endpoints directly
Schema: Complete request/response schemas
Authentication: JWT token testing
Postman Collection
Location: /docs/postman/
Environment: Development and production configs
Tests: Automated API tests
🤝 Contributing
Follow Node.js best practices
Write comprehensive tests
Update API documentation
Use meaningful commit messages
Ensure security best practices
Last Updated: December 2024
Version: 1.0.0
Maintainer: Development Team
🏥 Medical Clinic Management System - Frontend
📋 Table of Contents
Overview
Technology Stack
Project Structure
Getting Started
Authentication System
Components
Services
Guards
Routing
Styling
Development
Build & Deployment
🎯 Overview
The frontend is an Angular-based web application for managing a medical clinic. It provides a comprehensive interface for managing patients, appointments, doctors, and administrative tasks.

Key Features
🔐 Authentication & Authorization - Role-based access control
👥 User Management - Admin panel for managing users
🏥 Patient Management - Complete patient records and history
📅 Appointment Scheduling - Calendar-based appointment system
👨‍⚕️ Doctor Management - Doctor profiles and specializations
📊 Dashboard - Analytics and overview
📱 Responsive Design - Mobile-friendly interface
🛠 Technology Stack
Framework: Angular 17+
Language: TypeScript
Styling: CSS3, Bootstrap 5
State Management: RxJS Observables
HTTP Client: Angular HttpClient
Routing: Angular Router
Authentication: JWT-based (simplified for demo)
Build Tool: Angular CLI
Package Manager: npm
📁 Project Structure
src/
├── app/
│   ├── components/           # Angular components
│   │   ├── admin/           # Admin panel components
│   │   ├── auth/            # Authentication components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── layout/          # Layout components (header, sidebar)
│   │   ├── patients/        # Patient management
│   │   ├── appointments/    # Appointment management
│   │   └── doctors/         # Doctor management
│   ├── services/            # Angular services
│   │   ├── auth.service.ts  # Authentication service
│   │   ├── patient.service.ts
│   │   ├── appointment.service.ts
│   │   └── doctor.service.ts
│   ├── guards/              # Route guards
│   │   ├── auth.guard.ts    # Authentication guard
│   │   └── admin.guard.ts   # Admin role guard
│   ├── models/              # TypeScript interfaces
│   ├── app.routes.ts        # Application routing
│   └── app.component.ts     # Root component
├── assets/                  # Static assets
├── environments/            # Environment configurations
└── styles/                  # Global styles
🚀 Getting Started
Prerequisites
Node.js 18+
npm 9+
Angular CLI 17+
Installation
Clone the repository

git clone <repository-url>
cd ahmadada
Install dependencies

npm install
Start development server

ng serve
# or use the provided batch file
start-app.bat
Access the application

Open browser to http://localhost:4200
Login with: admin@clinic.com / admin123
🔐 Authentication System
Current Implementation
The authentication system uses a simplified in-memory approach for demo purposes:

// Default admin user
{
  email: 'admin@clinic.com',
  password: 'admin123',
  role: 'manager'
}
Authentication Flow
Login: User enters credentials
Validation: Credentials checked against hardcoded user
Session: User data stored in localStorage
Guards: Route protection based on authentication status
Logout: Session cleared from localStorage
User Roles
Manager: Full admin access to all features
Doctor: Access to patients and appointments
Secretary: Basic operational access
🧩 Components
Core Components
1. LoginComponent (src/components/auth/login/)
Handles user authentication
Form validation
Error handling
Redirects to dashboard on success
2. DashboardComponent (src/components/dashboard/)
Main landing page after login
Overview statistics
Quick access to main features
Role-based content display
3. AdminComponent (src/components/admin/)
User management interface
Specialization management
System administration
Restricted to manager role only
4. Layout Components
HeaderComponent: Navigation bar with user info
SidebarComponent: Role-based navigation menu
FooterComponent: Application footer
Feature Components
Patient Management
PatientListComponent: Display all patients
PatientFormComponent: Add/edit patient information
PatientDetailComponent: View patient details and history
Appointment Management
AppointmentCalendarComponent: Calendar view of appointments
AppointmentFormComponent: Schedule new appointments
AppointmentListComponent: List view of appointments
Doctor Management
DoctorListComponent: Display all doctors
DoctorFormComponent: Add/edit doctor profiles
DoctorDetailComponent: View doctor details
🔧 Services
AuthService (src/services/auth.service.ts)
export class AuthService {
  // Authentication methods
  login(credentials: LoginCredentials): Observable<User>
  logout(): void
  isAuthenticated(): boolean
  
  // User management
  getCurrentUser(): User | null
  hasRole(role: User['role']): boolean
  
  // Role checks
  isManager(): boolean
  isDoctor(): boolean
  isSecretary(): boolean
}
Data Services
PatientService: Patient CRUD operations
AppointmentService: Appointment management
DoctorService: Doctor profile management
🛡 Guards
AuthGuard (src/guards/auth.guard.ts)
Protects routes requiring authentication
Redirects to login if not authenticated
Used on all protected routes
AdminGuard (src/guards/admin.guard.ts)
Protects admin-only routes
Checks for manager role
Redirects to dashboard if not authorized
canActivate(): boolean {
  const currentUser = this.authService.currentUserValue;
  const isAuthenticated = this.authService.isAuthenticated();
  const isManager = currentUser?.role === 'manager';
  
  if (isAuthenticated && isManager) {
    return true;
  } else {
    this.router.navigate(['/dashboard']);
    return false;
  }
}
🛣 Routing
Route Configuration (src/app.routes.ts)
const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
Protected Routes
/dashboard - Requires authentication
/admin - Requires authentication + manager role
/patients - Requires authentication
/appointments - Requires authentication
/doctors - Requires authentication
🎨 Styling
CSS Architecture
Global Styles: src/styles.css
Component Styles: Component-scoped CSS
Bootstrap 5: Responsive framework
Custom CSS: Clinic-specific styling
Design System
Color Scheme: Medical blue theme
Typography: Clean, readable fonts
Layout: Responsive grid system
Components: Consistent UI patterns
Responsive Design
Mobile-first approach
Breakpoints: 576px, 768px, 992px, 1200px
Touch-friendly interface
Optimized for tablets and phones
💻 Development
Development Commands
# Start development server
ng serve

# Build for production
ng build --prod

# Run tests
ng test

# Lint code
ng lint

# Generate component
ng generate component component-name

# Generate service
ng generate service service-name
Code Standards
TypeScript: Strict mode enabled
ESLint: Code quality enforcement
Prettier: Code formatting
Angular Style Guide: Official conventions
File Naming
Components: kebab-case (patient-list.component.ts)
Services: kebab-case (auth.service.ts)
Interfaces: PascalCase (User.ts)
Constants: UPPER_SNAKE_CASE
🏗 Build & Deployment
Development Build
ng build
# Output: dist/medical-clinic/
Production Build
ng build --prod
# Optimized build with minification
Deployment Options
1. Static Hosting
Deploy dist/ folder to any static host
Examples: Netlify, Vercel, GitHub Pages
2. Web Server
Copy dist/ contents to web server
Configure server for SPA routing
Examples: Apache, Nginx, IIS
3. Docker
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
Environment Configuration
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1'
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.clinic.com/v1'
};
🔧 Configuration
Angular Configuration (angular.json)
Build configurations
Asset paths
Environment settings
Proxy configuration for API calls
Package Configuration (package.json)
Dependencies and dev dependencies
Scripts for development and build
Angular CLI version
Node.js version requirements
🐛 Troubleshooting
Common Issues
1. Port Already in Use
# Kill existing processes
taskkill /f /im node.exe

# Use different port
ng serve --port 4201
2. Build Errors
# Clear cache
ng cache clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
3. Authentication Issues
Check localStorage for stored user data
Verify credentials: admin@clinic.com / admin123
Clear browser cache and localStorage
Debug Mode
# Enable debug logging
ng serve --verbose

# Check browser console for errors
# Use Angular DevTools extension
📚 Additional Resources
Angular Documentation
TypeScript Handbook
RxJS Documentation
Bootstrap Documentation
🤝 Contributing
Follow Angular style guide
Write meaningful commit messages
Test your changes thoroughly
Update documentation as needed
Ensure responsive design
Last Updated: December 2024
Version: 1.0.0
