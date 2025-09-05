/**
 * Swagger Configuration
 * API documentation setup
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Medical Clinic Management System API',
      version: '1.0.0',
      description: 'A professional medical clinic management system API with comprehensive features for patient management, appointments, billing, and more.',
      contact: {
        name: 'Medical Clinic Team',
        email: 'support@medicalclinic.com',
        url: 'https://medicalclinic.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.medicalclinic.com/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            role: { type: 'string', enum: ['manager', 'doctor', 'secretary', 'nurse'], example: 'doctor' },
            isActive: { type: 'boolean', example: true },
            isVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Patient: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
            name: { type: 'string', example: 'Jane Smith' },
            nationalId: { type: 'string', example: '1234567890' },
            email: { type: 'string', format: 'email', example: 'jane.smith@example.com' },
            phone: { type: 'string', example: '+1234567890' },
            dateOfBirth: { type: 'string', format: 'date', example: '1990-01-01' },
            gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'female' },
            bloodType: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], example: 'A+' },
            status: { type: 'string', enum: ['active', 'inactive', 'deceased'], example: 'active' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                zipCode: { type: 'string', example: '10001' },
                country: { type: 'string', example: 'USA' }
              }
            },
            emergencyContact: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'John Smith' },
                phone: { type: 'string', example: '+1234567891' },
                relationship: { type: 'string', example: 'Spouse' }
              }
            },
            medicalHistory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  condition: { type: 'string', example: 'Diabetes' },
                  diagnosedDate: { type: 'string', format: 'date', example: '2020-01-15' },
                  status: { type: 'string', example: 'active' },
                  notes: { type: 'string', example: 'Type 2 diabetes, controlled with medication' }
                }
              }
            },
            medications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Metformin' },
                  dosage: { type: 'string', example: '500mg twice daily' },
                  prescribedDate: { type: 'string', format: 'date', example: '2020-01-15' },
                  status: { type: 'string', example: 'active' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            password: { type: 'string', example: 'password123' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                tokens: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    expiresIn: { type: 'string', example: '7d' }
                  }
                }
              }
            }
          }
        },
        Appointment: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d5ec49f8c7a40015a7b3b1' },
            patient: { type: 'string', example: '507f1f77bcf86cd799439012' },
            doctor: { type: 'string', example: '507f1f77bcf86cd799439011' },
            appointmentDate: { type: 'string', format: 'date', example: '2024-08-20' },
            appointmentTime: { type: 'string', example: '10:00' },
            duration: { type: 'number', example: 30 },
            type: { type: 'string', enum: ['consultation', 'follow-up', 'emergency', 'routine', 'specialist'], example: 'consultation' },
            status: { type: 'string', enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'], example: 'scheduled' },
            reason: { type: 'string', example: 'Routine check-up' },
            notes: { type: 'string', example: 'Patient reported mild headache.' },
            diagnosis: { type: 'string', example: 'Common cold' },
            prescription: { type: 'string', example: 'Paracetamol 500mg' },
            followUpRequired: { type: 'boolean', example: true },
            followUpDate: { type: 'string', format: 'date', example: '2024-08-27' },
            cost: { type: 'number', example: 50.00 },
            paymentStatus: { type: 'string', enum: ['pending', 'paid', 'partial', 'waived'], example: 'pending' },
            createdBy: { type: 'string', example: '507f1f77bcf86cd799439010' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Billing: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d5ec49f8c7a40015a7b3b2' },
            invoiceNumber: { type: 'string', example: 'INV-202408-0001' },
            patient: { type: 'string', example: '507f1f77bcf86cd799439012' },
            appointment: { type: 'string', example: '60d5ec49f8c7a40015a7b3b1' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string', example: 'Consultation fee' },
                  quantity: { type: 'number', example: 1 },
                  unitPrice: { type: 'number', example: 100.00 },
                  total: { type: 'number', example: 100.00 }
                }
              }
            },
            subtotal: { type: 'number', example: 100.00 },
            tax: { type: 'number', example: 10.00 },
            discount: { type: 'number', example: 0 },
            total: { type: 'number', example: 110.00 },
            status: { type: 'string', enum: ['pending', 'paid', 'partial', 'overdue', 'cancelled'], example: 'pending' },
            paymentMethod: { type: 'string', enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'insurance', 'other'], example: 'cash' },
            dueDate: { type: 'string', format: 'date', example: '2024-08-30' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Error message' },
                statusCode: { type: 'number', example: 400 },
                type: { type: 'string', example: 'ValidationError' }
              }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    'src/api/v1/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
