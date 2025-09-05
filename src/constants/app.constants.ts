// Application Constants
export const APP_CONFIG = {
  name: 'Medical Clinic Management System',
  version: '1.0.0',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ar'],
  defaultPageSize: 10,
  maxPageSize: 100,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  apiTimeout: 30000, // 30 seconds
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  auth: 'clinic_auth',
  patients: 'clinic_patients',
  appointments: 'clinic_appointments',
  invoices: 'clinic_invoices',
  prescriptions: 'clinic_prescriptions',
  users: 'clinic_users',
  language: 'clinic_language',
  theme: 'clinic_theme',
} as const;

// User Roles
export const USER_ROLES = {
  manager: 'manager',
  doctor: 'doctor',
  secretary: 'secretary',
} as const;

// Invoice Status
export const INVOICE_STATUS = {
  paid: 'paid',
  unpaid: 'unpaid',
  partiallyPaid: 'partially-paid',
} as const;

// Appointment Status
export const APPOINTMENT_STATUS = {
  scheduled: 'scheduled',
  confirmed: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
  noShow: 'no-show',
} as const;

// Prescription Status
export const PRESCRIPTION_STATUS = {
  active: 'active',
  completed: 'completed',
  cancelled: 'cancelled',
  expired: 'expired',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid phone number'
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
  },
  nationalId: {
    pattern: /^\d{10}$/,
    message: 'National ID must be 10 digits'
  }
} as const;

// Date Formats
export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  input: 'yyyy-MM-dd',
  time: 'HH:mm',
  datetime: 'MMM dd, yyyy HH:mm',
  iso: 'yyyy-MM-ddTHH:mm:ss.SSSZ'
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    me: '/api/v1/auth/me',
    refresh: '/api/v1/auth/refresh',
  },
  patients: {
    list: '/api/v1/patients',
    create: '/api/v1/patients',
    update: '/api/v1/patients/:id',
    delete: '/api/v1/patients/:id',
    search: '/api/v1/patients/search',
  },
  appointments: {
    list: '/api/v1/appointments',
    create: '/api/v1/appointments',
    update: '/api/v1/appointments/:id',
    delete: '/api/v1/appointments/:id',
  },
  invoices: {
    list: '/api/v1/billing',
    create: '/api/v1/billing',
    update: '/api/v1/billing/:id',
    delete: '/api/v1/billing/:id',
  },
  prescriptions: {
    list: '/api/v1/prescriptions',
    create: '/api/v1/prescriptions',
    update: '/api/v1/prescriptions/:id',
    delete: '/api/v1/prescriptions/:id',
  },
  users: {
    list: '/api/v1/admin/users',
    create: '/api/v1/admin/users',
    update: '/api/v1/admin/users/:id',
    delete: '/api/v1/admin/users/:id',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to perform this action.',
  forbidden: 'Access denied.',
  notFound: 'The requested resource was not found.',
  serverError: 'Server error. Please try again later.',
  validation: 'Please check your input and try again.',
  unknown: 'An unexpected error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  created: 'Record created successfully.',
  updated: 'Record updated successfully.',
  deleted: 'Record deleted successfully.',
  saved: 'Changes saved successfully.',
  loggedIn: 'Login successful.',
  loggedOut: 'Logout successful.',
} as const;

// UI Constants
export const UI_CONSTANTS = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  paginationSizes: [10, 25, 50, 100],
  defaultPaginationSize: 10,
  searchDebounceTime: 300, // milliseconds
  autoSaveInterval: 30000, // 30 seconds
} as const;
