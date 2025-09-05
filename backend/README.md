# Medical Clinic Management System - Backend API

A professional, enterprise-grade backend API for medical clinic management built with Node.js, Express.js, and MongoDB.

## 🚀 Features

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Role-based access control (Manager, Doctor, Secretary, Nurse)
- Two-factor authentication (TOTP)
- Password reset with email verification
- Account lockout protection
- Rate limiting and security headers
- Input validation and sanitization

### 👥 User Management
- Complete user profiles with medical credentials
- Professional information (specializations, licenses, experience)
- Work schedules and availability
- Profile pictures and preferences
- Session management

### 🏥 Patient Management
- Comprehensive patient records
- Medical history and conditions
- Allergies and medications tracking
- Insurance information
- Emergency contacts
- Family history

### 📅 Appointment System
- Appointment scheduling and management
- Doctor availability tracking
- Patient appointment history
- Reminder notifications

### 💰 Billing & Payments
- Invoice generation and management
- Payment tracking
- Insurance claims
- Financial reporting

### 📊 Reports & Analytics
- Patient statistics
- Revenue analysis
- Appointment analytics
- Performance metrics

### 🔔 Notifications
- Email notifications
- SMS alerts (Twilio integration)
- Push notifications
- Appointment reminders

### 📁 File Management
- Patient photo uploads
- Document storage
- Cloudinary integration
- File validation and processing

## 🏗️ Architecture

```
backend/
├── src/
│   ├── api/v1/           # API versioning
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── database/         # Database migrations & seeders
│   ├── jobs/            # Background jobs & scheduling
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── validators/      # Input validation schemas
│   ├── websockets/      # Real-time communication
│   └── server.js        # Main application file
├── logs/                # Application logs
├── uploads/             # File uploads
├── tests/               # Test files
├── docs/                # API documentation
└── package.json
```

## 🛠️ Technology Stack

### Core
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB

### Security
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation

### File Handling
- **Multer** - File uploads
- **Sharp** - Image processing
- **Cloudinary** - Cloud storage

### Communication
- **Nodemailer** - Email sending
- **Twilio** - SMS notifications
- **Socket.io** - Real-time communication

### Monitoring & Logging
- **Winston** - Logging
- **Morgan** - HTTP request logging
- **Bull** - Job queues

### Development
- **Nodemon** - Development server
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB >= 5.0
- Redis (optional, for caching)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medical-clinic-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # Start MongoDB
   mongod
   
   # Run migrations (if any)
   npm run migrate
   
   # Seed initial data
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200

# Database
MONGODB_URI=mongodb://localhost:27017/medical_clinic

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# File Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/register` | User registration |
| POST | `/api/v1/auth/logout` | User logout |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |
| GET | `/api/v1/auth/me` | Get current user profile |
| PUT | `/api/v1/auth/profile` | Update user profile |

### Patient Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/patients` | Get all patients |
| POST | `/api/v1/patients` | Create new patient |
| GET | `/api/v1/patients/:id` | Get patient by ID |
| PUT | `/api/v1/patients/:id` | Update patient |
| DELETE | `/api/v1/patients/:id` | Delete patient |
| GET | `/api/v1/patients/search` | Search patients |

### Doctor Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/doctors` | Get all doctors |
| POST | `/api/v1/doctors` | Create new doctor |
| GET | `/api/v1/doctors/:id` | Get doctor by ID |
| PUT | `/api/v1/doctors/:id` | Update doctor |
| DELETE | `/api/v1/doctors/:id` | Delete doctor |

### Appointment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/appointments` | Get all appointments |
| POST | `/api/v1/appointments` | Create new appointment |
| GET | `/api/v1/appointments/:id` | Get appointment by ID |
| PUT | `/api/v1/appointments/:id` | Update appointment |
| DELETE | `/api/v1/appointments/:id` | Cancel appointment |

## 🔒 Security Features

### Authentication
- JWT tokens with refresh mechanism
- Password hashing with bcrypt
- Account lockout after failed attempts
- Two-factor authentication support

### Authorization
- Role-based access control
- Permission-based authorization
- Route-level security middleware

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### File Security
- File type validation
- File size limits
- Secure file storage
- Image processing and optimization

## 📊 Monitoring & Logging

### Logging
- Structured logging with Winston
- Multiple log levels (error, warn, info, debug)
- File rotation and compression
- Request/response logging

### Health Checks
- Database connectivity
- External service status
- Application metrics
- Performance monitoring

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

### Production Deployment

1. Set environment variables for production
2. Install dependencies: `npm ci --only=production`
3. Build the application: `npm run build`
4. Start the server: `npm start`

## 📈 Performance Optimization

- Database indexing for faster queries
- Connection pooling
- Response compression
- Caching strategies
- File upload optimization
- Background job processing

## 🔧 Development

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- Pre-commit hooks
- Code review process

### Git Workflow
- Feature branch workflow
- Pull request reviews
- Automated testing
- Deployment automation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added two-factor authentication
- **v1.2.0** - Enhanced reporting and analytics
- **v1.3.0** - Real-time notifications and WebSocket support

---

**Built with ❤️ for the medical community**
