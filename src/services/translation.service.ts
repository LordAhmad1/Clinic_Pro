import { Injectable } from '@angular/core';

export interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage: 'en' | 'ar' = 'en';

  private translations: Translations = {
    // Dashboard
    'dashboard': {
      en: 'Dashboard',
      ar: 'لوحة التحكم'
    },
    'goodMorning': {
      en: 'Good Morning',
      ar: 'صباح الخير'
    },
    'goodAfternoon': {
      en: 'Good Afternoon',
      ar: 'مساء الخير'
    },
    'goodEvening': {
      en: 'Good Evening',
      ar: 'مساء الخير'
    },
    'copyright': {
      en: '© 2024 All rights reserved. Developed by Ahmad',
      ar: '© 2024 جميع الحقوق محفوظة. تم التطوير بواسطة أحمد'
    },
    'totalPatients': {
      en: 'Total Patients',
      ar: 'إجمالي المرضى'
    },
    'clickToUploadPatientPhoto': {
      en: 'clickToUploadPatientPhoto',
      ar: ' اضغط هنا لرفع صورة '
    },
    'totalDoctors': {
      en: 'Total Doctors',
      ar: 'إجمالي الأطباء'
    },
    'totalAppointments': {
      en: 'Total Appointments',
      ar: 'إجمالي المواعيد'
    },
    'totalRevenue': {
      en: 'Total Revenue',
      ar: 'إجمالي الإيرادات'
    },
    'upcomingAppointments': {
      en: 'Upcoming Appointments',
      ar: 'المواعيد القادمة'
    },
    'noUpcomingAppointments': {
      en: 'No upcoming appointments',
      ar: 'لا توجد مواعيد قادمة'
    },
    'viewAll': {
      en: 'View All',
      ar: 'عرض الكل'
    },
    'addNew': {
      en: 'Add New',
      ar: 'إضافة جديد'
    },
    'recentPatients': {
      en: 'Recent Patients',
      ar: 'المرضى الجدد'
    },
    'recentActivity': {
      en: 'Recent Activity',
      ar: 'النشاط الأخير'
    },

    // Navigation
    'patients': {
      en: 'Patients',
      ar: 'المرضى'
    },
    
    'doctors': {
      en: 'Doctors',
      ar: 'الأطباء'
    },
    'appointments': {
      en: 'Appointments',
      ar: 'المواعيد'
    },
    'billing': {
      en: 'Billing',
      ar: 'الفواتير'
    },
    'reports': {
      en: 'Reports',
      ar: 'التقارير'
    },
    'admin': {
      en: 'Admin',
      ar: 'الإدارة'
    },
    'logout': {
      en: 'Logout',
      ar: 'تسجيل الخروج'
    },

    // Common Actions
    'add': {
      en: 'Add',
      ar: 'إضافة'
    },
    'edit': {
      en: 'Edit',
      ar: 'تعديل'
    },
    'delete': {
      en: 'Delete',
      ar: 'حذف'
    },
    'view': {
      en: 'View',
      ar: 'عرض'
    },
    'viewPatient': {
      en: 'View Patient',
      ar: 'عرض المريض'
    },
    'viewDetails': {
      en: 'View Details',
      ar: 'عرض التفاصيل'
    },
    'save': {
      en: 'Save',
      ar: 'حفظ'
    },
    'cancel': {
      en: 'Cancel',
      ar: 'إلغاء'
    },
    'close': {
      en: 'Close',
      ar: 'إغلاق'
    },
    'search': {
      en: 'Search',
      ar: 'بحث'
    },
    'filter': {
      en: 'Filter',
      ar: 'تصفية'
    },
    'complete': {
      en: 'Complete',
      ar: 'إكمال'
    },
    'back': {
      en: 'Back',
      ar: 'رجوع'
    },
    'next': {
      en: 'Next',
      ar: 'التالي'
    },
    'previous': {
      en: 'Previous',
      ar: 'السابق'
    },

    // Patient Management
    'patientsManagement': {
      en: 'Patients Management',
      ar: 'إدارة المرضى'
    },
    'managePatientRecords': {
      en: 'Manage patient records and information',
      ar: 'إدارة سجلات المرضى والمعلومات'
    },
    'searchPatientsPlaceholder': {
      en: 'Search by name, phone, or national ID...',
      ar: 'البحث بالاسم أو الهاتف أو رقم الملف...'
    },
    'patientDetails': {
      en: 'Patient Details',
      ar: 'تفاصيل المريض'
    },
    'patientInformation': {
      en: 'Patient Information',
      ar: 'معلومات المريض'
    },
    'patientId': {
      en: 'Patient ID',
      ar: 'رقم المريض'
    },
    'fileNumber': {
      en: 'File Number',
      ar: 'رقم الملف'
    },
    'name': {
      en: 'Name',
      ar: 'الاسم'
    },
    'phone': {
      en: 'Phone',
      ar: 'الهاتف'
    },
    'email': {
      en: 'Email',
      ar: 'البريد الإلكتروني'
    },
    'address': {
      en: 'Address',
      ar: 'العنوان'
    },
    'dateOfBirth': {
      en: 'Date of Birth',
      ar: 'تاريخ الميلاد'
    },
    'age': {
      en: 'Age',
      ar: 'العمر'
    },
    'years': {
      en: 'years',
      ar: 'سنوات'
    },
    'gender': {
      en: 'Gender',
      ar: 'الجنس'
    },
    'male': {
      en: 'Male',
      ar: 'ذكر'
    },
    'female': {
      en: 'Female',
      ar: 'أنثى'
    },
    'bloodType': {
      en: 'Blood Type',
      ar: 'فصيلة الدم'
    },
    'nationalId': {
      en: 'National ID',
      ar: 'رقم وطني'
    },
    'occupation': {
      en: 'Occupation',
      ar: 'المهنة'
    },
    'maritalStatus': {
      en: 'Marital Status',
      ar: 'الحالة الاجتماعية'
    },
    'single': {
      en: 'Single',
      ar: 'أعزب'
    },
    'married': {
      en: 'Married',
      ar: 'متزوج'
    },
    'divorced': {
      en: 'Divorced',
      ar: 'مطلق'
    },
    'widowed': {
      en: 'Widowed',
      ar: 'أرمل'
    },
    'insuranceProvider': {
      en: 'Insurance Provider',
      ar: 'شركة التأمين'
    },
    'insuranceNumber': {
      en: 'Insurance Number',
      ar: 'رقم التأمين'
    },
    'selectOption': {
      en: 'Select Option',
      ar: 'اختر خيار'
    },
    'allergies': {
      en: 'Allergies',
      ar: 'الحساسية'
    },
    'emergencyContact': {
      en: 'Emergency Contact',
      ar: 'جهة الاتصال في الطوارئ'
    },
    'relationship': {
      en: 'Relationship',
      ar: 'العلاقة'
    },
    'addPatient': {
      en: 'Add Patient',
      ar: 'إضافة مريض'
    },
    'editPatient': {
      en: 'Edit Patient',
      ar: 'تعديل المريض'
    },
    'updatePatient': {
      en: 'Update Patient',
      ar: 'تحديث المريض'
    },
    'patientPhoto': {
      en: 'Patient Photo',
      ar: 'صورة المريض'
    },
    'uploadPhoto': {
      en: 'Upload Photo',
      ar: 'رفع صورة'
    },
    'removePhoto': {
      en: 'Remove Photo',
      ar: 'إزالة الصورة'
    },
    'noPatientsFound': {
      en: 'No patients found',
      ar: 'لم يتم العثور على مرضى'
    },
    'tryAdjustingSearch': {
      en: 'Try adjusting your search criteria',
      ar: 'حاول تعديل معايير البحث'
    },

    // Doctor Management
    'doctorDetails': {
      en: 'Doctor Details',
      ar: 'تفاصيل الطبيب'
    },
    'doctorInformation': {
      en: 'Doctor Information',
      ar: 'معلومات الطبيب'
    },
    'specialization': {
      en: 'Specialization',
      ar: 'التخصص'
    },
    'specializations': {
      en: 'Specializations',
      ar: 'التخصصات'
    },
    'addDoctor': {
      en: 'Add Doctor',
      ar: 'إضافة طبيب'
    },
    'editDoctor': {
      en: 'Edit Doctor',
      ar: 'تعديل الطبيب'
    },
    'doctorPhoto': {
      en: 'Doctor Photo',
      ar: 'صورة الطبيب'
    },

    // Appointment Management
    'appointmentDetails': {
      en: 'Appointment Details',
      ar: 'تفاصيل الموعد'
    },
    'appointmentInformation': {
      en: 'Appointment Information',
      ar: 'معلومات الموعد'
    },
    'date': {
      en: 'Date',
      ar: 'التاريخ'
    },
    'time': {
      en: 'Time',
      ar: 'الوقت'
    },
    'status': {
      en: 'Status',
      ar: 'الحالة'
    },
    'scheduled': {
      en: 'Scheduled',
      ar: 'مجدول'
    },
    'completed': {
      en: 'Completed',
      ar: 'مكتمل'
    },
    'cancelled': {
      en: 'Cancelled',
      ar: 'ملغي'
    },
    'pending': {
      en: 'Pending',
      ar: 'في الانتظار'
    },
    'notes': {
      en: 'Notes',
      ar: 'ملاحظات'
    },
    'addAppointment': {
      en: 'Add Appointment',
      ar: 'إضافة موعد'
    },
    'editAppointment': {
      en: 'Edit Appointment',
      ar: 'تعديل الموعد'
    },
    'confirmComplete': {
      en: 'Confirm Complete',
      ar: 'تأكيد الإكمال'
    },
    'completeAppointment': {
      en: 'Complete Appointment',
      ar: 'إكمال الموعد'
    },

    // Billing Management
    'invoice': {
      en: 'Invoice',
      ar: 'فاتورة'
    },
    'invoices': {
      en: 'Invoices',
      ar: 'فواتير'
    },
    'invoiceNumber': {
      en: 'Invoice Number',
      ar: 'رقم الفاتورة'
    },
    'amount': {
      en: 'Amount',
      ar: 'المبلغ'
    },
    'dueDate': {
      en: 'Due Date',
      ar: 'تاريخ الاستحقاق'
    },
    'issueDate': {
      en: 'Issue Date',
      ar: 'تاريخ الإصدار'
    },
    'paymentStatus': {
      en: 'Payment Status',
      ar: 'حالة الدفع'
    },
    'paid': {
      en: 'Paid',
      ar: 'مدفوع'
    },
    'unpaid': {
      en: 'Unpaid',
      ar: 'غير مدفوع'
    },
    'partial': {
      en: 'Partial',
      ar: 'جزئي'
    },
    'createInvoice': {
      en: 'Create Invoice',
      ar: 'إنشاء فاتورة'
    },
    'createNewInvoice': {
      en: 'Create New Invoice',
      ar: 'إنشاء فاتورة جديدة'
    },
    'editInvoice': {
      en: 'Edit Invoice',
      ar: 'تعديل الفاتورة'
    },
    'pendingAmount': {
      en: 'Pending Amount',
      ar: 'المبلغ المعلق'
    },

    // Reports
    'reportsAnalytics': {
      en: 'Reports & Analytics',
      ar: 'التقارير والتحليلات'
    },
    'comprehensiveOverview': {
      en: 'Comprehensive overview of clinic performance',
      ar: 'نظرة شاملة على أداء العيادة'
    },
    'monthlyPatients': {
      en: 'Monthly Patients',
      ar: 'المرضى الشهريون'
    },
    'monthlyAppointments': {
      en: 'Monthly Appointments',
      ar: 'المواعيد الشهرية'
    },
    'monthlyRevenue': {
      en: 'Monthly Revenue',
      ar: 'الإيرادات الشهرية'
    },
    'todayAppointments': {
      en: 'Today\'s Appointments',
      ar: 'مواعيد اليوم'
    },
    'todayRevenue': {
      en: 'Today\'s Revenue',
      ar: 'إيرادات اليوم'
    },
    'appointmentStatus': {
      en: 'Appointment Status',
      ar: 'حالة المواعيد'
    },
    'topPerformingDoctors': {
      en: 'Top Performing Doctors',
      ar: 'أفضل الأطباء أداءً'
    },

    // Admin Panel
    'adminPanel': {
      en: 'Admin Panel',
      ar: 'لوحة الإدارة'
    },
    'accessDenied': {
      en: 'Access Denied',
      ar: 'تم رفض الوصول'
    },
    'adminAccessRequired': {
      en: 'Admin access required to view this page',
      ar: 'مطلوب صلاحيات إدارية لعرض هذه الصفحة'
    },
    'userManagement': {
      en: 'User Management',
      ar: 'إدارة المستخدمين'
    },
    'addSpecialization': {
      en: 'Add Specialization',
      ar: 'إضافة تخصص'
    },
    'editSpecialization': {
      en: 'Edit Specialization',
      ar: 'تعديل التخصص'
    },
    'specializationName': {
      en: 'Specialization Name',
      ar: 'اسم التخصص'
    },
    'description': {
      en: 'Description',
      ar: 'الوصف'
    },
    'addUser': {
      en: 'Add User',
      ar: 'إضافة مستخدم'
    },
    'editUser': {
      en: 'Edit User',
      ar: 'تعديل المستخدم'
    },
    'username': {
      en: 'Username',
      ar: 'اسم المستخدم'
    },
    'password': {
      en: 'Password',
      ar: 'كلمة المرور'
    },
    'ENTER_EMAIL': {
      en: 'Enter your email',
      ar: 'أدخل بريدك الإلكتروني'
    },
    'ENTER_PASSWORD': {
      en: 'Enter your password',
      ar: 'أدخل كلمة المرور'
    },
    'INVALID_EMAIL_OR_PASSWORD': {
      en: 'Invalid email or password',
      ar: 'بريد إلكتروني أو كلمة مرور غير صحيحة'
    },
    'SIGN_IN': {
      en: 'Sign In',
      ar: 'تسجيل الدخول'
    },
    'SIGNING_IN': {
      en: 'Signing in...',
      ar: 'جاري تسجيل الدخول...'
    },
    'role': {
      en: 'Role',
      ar: 'الدور'
    },
    'manager': {
      en: 'Manager',
      ar: 'مدير'
    },
    'doctor': {
      en: 'Doctor',
      ar: 'طبيب'
    },
    'secretary': {
      en: 'Secretary',
      ar: 'سكرتير'
    },
    'userPhoto': {
      en: 'User Photo',
      ar: 'صورة المستخدم'
    },

    // Prescriptions
    'prescriptions': {
      en: 'Prescriptions',
      ar: 'الوصفات الطبية'
    },
    'prescription': {
      en: 'Prescription',
      ar: 'وصفة طبية'
    },
    'writePrescription': {
      en: 'Write Prescription',
      ar: 'كتابة وصفة طبية'
    },
    'diagnosis': {
      en: 'Diagnosis',
      ar: 'التشخيص'
    },
    'prescribedBy': {
      en: 'Prescribed by',
      ar: 'وصف بواسطة'
    },
    'medications': {
      en: 'Medications',
      ar: 'الأدوية'
    },
    'medication': {
      en: 'Medication',
      ar: 'دواء'
    },
    'dosage': {
      en: 'Dosage',
      ar: 'الجرعة'
    },
    'frequency': {
      en: 'Frequency',
      ar: 'التكرار'
    },
    'duration': {
      en: 'Duration',
      ar: 'المدة'
    },
    'instructions': {
      en: 'Instructions',
      ar: 'التعليمات'
    },
    'generalInstructions': {
      en: 'General Instructions',
      ar: 'تعليمات عامة'
    },
    'addNewMedication': {
      en: 'Add New Medication',
      ar: 'إضافة دواء جديد'
    },
    'medicationName': {
      en: 'Medication Name',
      ar: 'اسم الدواء'
    },
    'specialInstructions': {
      en: 'Special Instructions',
      ar: 'تعليمات خاصة'
    },
    'addMedication': {
      en: 'Add Medication',
      ar: 'إضافة دواء'
    },
    'savePrescription': {
      en: 'Save Prescription',
      ar: 'حفظ الوصفة الطبية'
    },
    'noPrescriptions': {
      en: 'No prescriptions found',
      ar: 'لم يتم العثور على وصفات طبية'
    },
    'clickToAdd': {
      en: 'Click "Write Prescription" to add a new prescription',
      ar: 'انقر على "كتابة وصفة طبية" لإضافة وصفة جديدة'
    },
    'prescriptionsCount': {
      en: 'prescriptions',
      ar: 'وصفات طبية'
    },

    // Common Messages
    'notProvided': {
      en: 'Not provided',
      ar: 'غير متوفر'
    },
    'notSpecified': {
      en: 'Not specified',
      ar: 'غير محدد'
    },
    'noneKnown': {
      en: 'None known',
      ar: 'لا توجد حساسية معروفة'
    },
    'required': {
      en: 'Required',
      ar: 'مطلوب'
    },
    'additionalInstructions': {
      en: 'Additional instructions for the patient...',
      ar: 'تعليمات إضافية للمريض...'
    },
    'exampleDosage': {
      en: 'e.g., 500mg',
      ar: 'مثال: 500 ملغ'
    },
    'exampleFrequency': {
      en: 'e.g., Twice daily',
      ar: 'مثال: مرتين يومياً'
    },
    'exampleDuration': {
      en: 'e.g., 7 days',
      ar: 'مثال: 7 أيام'
    },
    'exampleInstructions': {
      en: 'e.g., Take with food',
      ar: 'مثال: تناول مع الطعام'
    },
    'confirmDelete': {
      en: 'Are you sure you want to delete this item?',
      ar: 'هل أنت متأكد من حذف هذا العنصر؟'
    },

    'success': {
      en: 'Success',
      ar: 'نجح'
    },
    'error': {
      en: 'Error',
      ar: 'خطأ'
    },
    'warning': {
      en: 'Warning',
      ar: 'تحذير'
    },
    'info': {
      en: 'Information',
      ar: 'معلومات'
    },

    // Language
    'language': {
      en: 'Language',
      ar: 'اللغة'
    },
    'english': {
      en: 'English',
      ar: 'الإنجليزية'
    },
    'arabic': {
      en: 'Arabic',
      ar: 'العربية'
    },
    'welcomeBack': {
      en: 'Welcome back',
      ar: 'مرحباً بعودتك'
    },
    'completedToday': {
      en: 'Completed Today',
      ar: 'مكتمل اليوم'
    },
    
    'pendingToday': {
      en: 'Pending Today',
      ar: 'في الانتظار اليوم'
    },
    'noRecentPatients': {
      en: 'No recent patients found',
      ar: 'لم يتم العثور على مرضى جدد'
    },
    'doctorsManagement': {
      en: 'Doctors Management',
      ar: 'إدارة الأطباء'
    },
    'manageDoctorsSpecializations': {
      en: 'Manage doctors and their specializations',
      ar: 'إدارة الأطباء وتخصصاتهم'
    },
    'searchDoctorsPlaceholder': {
      en: 'Search by name, specialization, email, or ID...',
      ar: 'البحث بالاسم أو التخصص أو البريد الإلكتروني أو الرقم التعريفي...'
    },
    'appointmentsManagement': {
      en: 'Appointments Management',
      ar: 'إدارة المواعيد'
    },
    'scheduleManageAppointments': {
      en: 'Schedule and manage patient appointments',
      ar: 'جدولة وإدارة مواعيد المرضى'
    },
    'newAppointment': {
      en: 'New Appointment',
      ar: 'موعد جديد'
    },
    'searchAppointmentsPlaceholder': {
      en: 'Search by patient, doctor, or appointment ID...',
      ar: 'البحث بالمريض أو الطبيب أو رقم الموعد...'
    },
    'total': {
      en: 'Total',
      ar: 'المجموع'
    },
    'dateTime': {
      en: 'Date & Time',
      ar: 'التاريخ والوقت'
    },
    'patient': {
      en: 'Patient',
      ar: 'المريض'
    },
    'type': {
      en: 'Type',
      ar: 'النوع'
    },

    // Additional keys for billing, reports, and admin
    'billingManagement': {
      en: 'Billing Management',
      ar: 'إدارة الفواتير'
    },
    'manageInvoicesPayments': {
      en: 'Manage invoices and payments',
      ar: 'إدارة الفواتير والمدفوعات'
    },
    'totalInvoices': {
      en: 'Total Invoices',
      ar: 'إجمالي الفواتير'
    },
    'searchByPatientInvoice': {
      en: 'Search by patient name, invoice ID, or patient ID...',
      ar: 'البحث باسم المريض أو رقم الفاتورة أو رقم المريض...'
    },
    'allStatus': {
      en: 'All Status',
      ar: 'جميع الحالات'
    },
    'partiallyPaid': {
      en: 'Partially Paid',
      ar: 'مدفوع جزئياً'
    },
    'debug': {
      en: 'Debug',
      ar: 'تصحيح'
    },
    'thisMonth': {
      en: 'this month',
      ar: 'هذا الشهر'
    },
    'today': {
      en: 'today',
      ar: 'اليوم'
    },
    'activeDoctors': {
      en: 'Active Doctors',
      ar: 'الأطباء النشطون'
    },
    'allSpecializations': {
      en: 'All Specializations',
      ar: 'جميع التخصصات'
    },
    'appointmentStatusBreakdown': {
      en: 'Appointment Status Breakdown',
      ar: 'توزيع حالة المواعيد'
    },
    'paymentStatusBreakdown': {
      en: 'Payment Status Breakdown',
      ar: 'توزيع حالة الدفع'
    },
    'revenue': {
      en: 'Revenue',
      ar: 'الإيرادات'
    },
    'rating': {
      en: 'Rating',
      ar: 'التقييم'
    },
    'noRecentActivity': {
      en: 'No recent activity',
      ar: 'لا يوجد نشاط حديث'
    },
    'thisMonthSummary': {
      en: 'This Month Summary',
      ar: 'ملخص هذا الشهر'
    },
    'newPatients': {
      en: 'New Patients',
      ar: 'مرضى جدد'
    },
    'backToDashboard': {
      en: 'Back to Dashboard',
      ar: 'العودة إلى لوحة التحكم'
    },
    'medicalSpecializations': {
      en: 'Medical Specializations',
      ar: 'التخصصات الطبية'
    },
    'id': {
      en: 'ID',
      ar: 'الرقم'
    },
    'createdDate': {
      en: 'Created Date',
      ar: 'تاريخ الإنشاء'
    },
    'noSpecializationsFound': {
      en: 'No specializations found',
      ar: 'لم يتم العثور على تخصصات'
    },
    'addFirstSpecialization': {
      en: 'Add your first specialization',
      ar: 'أضف تخصصك الأول'
    },
    'userManagementTitle': {
      en: 'User Management',
      ar: 'إدارة المستخدمين'
    },
    'inactive': {
      en: 'Inactive',
      ar: 'غير نشط'
    },
    'deactivateUser': {
      en: 'Deactivate User',
      ar: 'إلغاء تفعيل المستخدم'
    },
    'activateUser': {
      en: 'Activate User',
      ar: 'تفعيل المستخدم'
    },
    'noUsersFound': {
      en: 'No users found',
      ar: 'لم يتم العثور على مستخدمين'
    },
    'addFirstUser': {
      en: 'Add your first user',
      ar: 'أضف مستخدمك الأول'
    },
    'addNewSpecialization': {
      en: 'Add New Specialization',
      ar: 'إضافة تخصص جديد'
    },
    'specializationNamePlaceholder': {
      en: 'Enter specialization name',
      ar: 'أدخل اسم التخصص'
    },
    'descriptionPlaceholder': {
      en: 'Enter description',
      ar: 'أدخل الوصف'
    },
    'addSpecializationButton': {
      en: 'Add Specialization',
      ar: 'إضافة التخصص'
    },
    'editSpecializationModal': {
      en: 'Edit Specialization',
      ar: 'تعديل التخصص'
    },
    'updateSpecialization': {
      en: 'Update Specialization',
      ar: 'تحديث التخصص'
    },
    'addNewUser': {
      en: 'Add New User',
      ar: 'إضافة مستخدم جديد'
    },
    'clickToUploadUserPhoto': {
      en: 'Click to upload user photo',
      ar: 'انقر لرفع صورة المستخدم'
    },
    'fullNamePlaceholder': {
      en: 'Enter full name',
      ar: 'أدخل الاسم الكامل'
    },
    'emailPlaceholder': {
      en: 'Enter email address',
      ar: 'أدخل عنوان البريد الإلكتروني'
    },
    'passwordPlaceholder': {
      en: 'Enter password',
      ar: 'أدخل كلمة المرور'
    },
    'roleDoctor': {
      en: 'Doctor',
      ar: 'طبيب'
    },
    'roleSecretary': {
      en: 'Secretary',
      ar: 'سكرتير'
    },
    'roleManager': {
      en: 'Manager',
      ar: 'مدير'
    },
    'specializationPlaceholder': {
      en: 'Select specialization',
      ar: 'اختر التخصص'
    },
    'phonePlaceholder': {
      en: 'Enter phone number',
      ar: 'أدخل رقم الهاتف'
    },
    'startTime': {
      en: 'Start Time',
      ar: 'وقت البدء'
    },
    'endTime': {
      en: 'End Time',
      ar: 'وقت الانتهاء'
    },
    'workingDays': {
      en: 'Working Days',
      ar: 'أيام العمل'
    },
    'sunday': {
      en: 'Sunday',
      ar: 'الأحد'
    },
    'monday': {
      en: 'Monday',
      ar: 'الاثنين'
    },
    'tuesday': {
      en: 'Tuesday',
      ar: 'الثلاثاء'
    },
    'wednesday': {
      en: 'Wednesday',
      ar: 'الأربعاء'
    },
    'thursday': {
      en: 'Thursday',
      ar: 'الخميس'
    },
    'friday': {
      en: 'Friday',
      ar: 'الجمعة'
    },
    'saturday': {
      en: 'Saturday',
      ar: 'السبت'
    },
    'addUserButton': {
      en: 'Add User',
      ar: 'إضافة المستخدم'
    },
    'editUserModal': {
      en: 'Edit User',
      ar: 'تعديل المستخدم'
    },
    'clickToChangeUserPhoto': {
      en: 'Click to change user photo',
      ar: 'انقر لتغيير صورة المستخدم'
    },
    'updateUser': {
      en: 'Update User',
      ar: 'تحديث المستخدم'
    },
    'onlyManagersAccess': {
      en: 'Only managers can access this page',
      ar: 'فقط المديرون يمكنهم الوصول إلى هذه الصفحة'
    },
    
    // Additional missing keys for admin, reports, and billing
    'noDescription': {
      en: 'No description',
      ar: 'لا يوجد وصف'
    },
    'deleteSpecialization': {
      en: 'Delete Specialization',
      ar: 'حذف التخصص'
    },
    'created': {
      en: 'Created',
      ar: 'تاريخ الإنشاء'
    },
    'active': {
      en: 'Active',
      ar: 'نشط'
    },
    'deleteUser': {
      en: 'Delete User',
      ar: 'حذف المستخدم'
    },
    'fullName': {
      en: 'Full Name',
      ar: 'الاسم الكامل'
    },

    'markAsPaid': {
      en: 'Mark as Paid',
      ar: 'تحديد كمدفوع'
    },
    'noInvoicesFound': {
      en: 'No invoices found',
      ar: 'لم يتم العثور على فواتير'
    },
    'selectPatient': {
      en: 'Select Patient',
      ar: 'اختر المريض'
    },
    'services': {
      en: 'Services',
      ar: 'الخدمات'
    },
    'serviceDescription': {
      en: 'Service description',
      ar: 'وصف الخدمة'
    },
    'quantity': {
      en: 'Qty',
      ar: 'الكمية'
    },
    'unitPrice': {
      en: 'Unit Price',
      ar: 'سعر الوحدة'
    },
    'addService': {
      en: 'Add Service',
      ar: 'إضافة خدمة'
    },
    'action': {
      en: 'Action',
      ar: 'الإجراء'
    },
    'totalAmount': {
      en: 'Total Amount',
      ar: 'المبلغ الإجمالي'
    },
    'invoiceInformation': {
      en: 'Invoice Information',
      ar: 'معلومات الفاتورة'
    },
    // Additional missing keys for forms
    'statusAndType': {
      en: 'Status & Type',
      ar: 'الحالة والنوع'
    },
    'markComplete': {
      en: 'Mark Complete',
      ar: 'تحديد كمكتمل'
    },
    'scheduleAppointment': {
      en: 'Schedule Appointment',
      ar: 'جدولة الموعد'
    },
    'additionalNotes': {
      en: 'Additional notes...',
      ar: 'ملاحظات إضافية...'
    },
    'addServicePlaceholder': {
      en: 'Service description',
      ar: 'وصف الخدمة'
    },
    'quantityPlaceholder': {
      en: 'Qty',
      ar: 'الكمية'
    },
    'unitPricePlaceholder': {
      en: 'Unit Price',
      ar: 'سعر الوحدة'
    },
    'removeService': {
      en: 'Remove Service',
      ar: 'إزالة الخدمة'
    },
    'noAppointmentsFound': {
      en: 'No appointments found',
      ar: 'لم يتم العثور على مواعيد'
    },
    'tryAdjustingSearchOrDate': {
      en: 'Try adjusting your search criteria or date filter',
      ar: 'حاول تعديل معايير البحث أو فلتر التاريخ'
    },
    'phoneNumber': {
      en: 'Phone Number',
      ar: 'رقم الهاتف'
    },
    'contactName': {
      en: 'Contact Name',
      ar: 'اسم جهة الاتصال'
    },
    'contactPhone': {
      en: 'Contact Phone',
      ar: 'هاتف جهة الاتصال'
    },
    'minutes': {
      en: 'minutes',
      ar: 'دقائق'
    },
    'scheduleNewAppointment': {
      en: 'Schedule New Appointment',
      ar: 'جدولة موعد جديد'
    },
    'addNewDoctor': {
      en: 'Add New Doctor',
      ar: 'إضافة طبيب جديد'
    },
    'clickToUploadDoctorPhoto': {
      en: 'Click to upload doctor photo',
      ar: 'انقر لرفع صورة الطبيب'
    },
    'clickToChangeDoctorPhoto': {
      en: 'Click to change doctor photo',
      ar: 'انقر لتغيير صورة الطبيب'
    },
    'saveDoctor': {
      en: 'Save Doctor',
      ar: 'حفظ الطبيب'
    },
    'updateDoctor': {
      en: 'Update Doctor',
      ar: 'تحديث الطبيب'
    },
    'noDoctorsFound': {
      en: 'No doctors found',
      ar: 'لم يتم العثور على أطباء'
    },
    'noShow': {
      en: 'No Show',
      ar: 'لم يحضر'
    },
    'ROUTINE_CHECKUP': {
      en: 'Routine Checkup',
      ar: 'فحص روتيني'
    },
    'CONSULTATION': {
      en: 'Consultation',
      ar: 'استشارة'
    },
    'FOLLOW_UP': {
      en: 'Follow-up',
      ar: 'متابعة'
    },
    'EMERGENCY': {
      en: 'Emergency',
      ar: 'طوارئ'
    },
    'MIN': {
      en: 'min',
      ar: 'دقيقة'
    },
    'NATIONAL_ID': {
      en: 'NATIONAL_ID',
      ar: 'رقم الهوية '
    },
    'photo': {
      en: 'photo',
      ar: ' صورة '
    },
    'Actions': {
      en: 'Actions',
      ar: 'الاجراءات'
    },
    'DOCTOR': {
      en: 'DOCTOR',
      ar: 'دكتور'
    },
    'workingHours': {
      en: 'Working Hours',
      ar: 'ساعات العمل'
    },
    'selectSpecialization': {
      en: 'Select Specialization',
      ar: 'اختر التخصص'
    },
    'Sunday': {
      en: 'Sunday',
      ar: 'الأحد'
    },
    'Monday': {
      en: 'Monday',
      ar: 'الاثنين'
    },
    'Thursday': {
      en: 'Thursday',
      ar: 'الخميس'
    },
    'Friday': {
      en: 'Friday',
      ar: 'الجمعة'
    },
    'Saturday': {
      en: 'Saturday',
      ar: 'السبت'
    },
    'Tuesday': {
      en: 'Tuesday',
      ar: 'الثلاثاء'
    },
    'Wednesday': {
      en: 'Wednesday',
      ar: 'الأربعاء'
    },
    'ADD_NEW_DOCTOR': {
      en: 'Add New Doctor',
      ar: 'إضافة طبيب جديد'
    },
    'SAVE_DOCTOR': {
      en: 'Save Doctor',
      ar: 'حفظ الطبيب'
    },
    'UPDATE_DOCTOR': {
      en: 'Update Doctor',
      ar: 'تحديث الطبيب'
    },
    'EDIT_DOCTOR': {
      en: 'Edit Doctor',
      ar: 'تعديل الطبيب'
    },
    'DOCTOR_DETAILS': {
      en: 'Doctor Details',
      ar: 'تفاصيل الطبيب'
    },
    'CLICK_TO_UPLOAD_DOCTOR_PHOTO': {
      en: 'Click to upload doctor photo',
      ar: 'انقر لرفع صورة الطبيب'
    },
    'CANCEL': {
      en: 'Cancel',
      ar: 'إلغاء'
    },
    'CLOSE': {
      en: 'Close',
      ar: 'إغلاق'
    },
    'SAVE_PATIENT': {
      en: 'SAVE_PATIENT',
      ar: 'حفظ المريض'
    },
    'newPassword': {
      en: 'New Password',
      ar: 'كلمة المرور الجديدة'
    },
    'leaveEmptyToKeepCurrent': {
      en: 'Leave empty to keep current password',
      ar: 'اترك فارغاً للاحتفاظ بكلمة المرور الحالية'
    },
    'passwordChangeNote': {
      en: 'Password change note',
      ar: 'ملاحظة تغيير كلمة المرور'
    },
    'togglePasswordVisibility': {
      en: 'Toggle password visibility',
      ar: 'تبديل عرض كلمة المرور'
    },
    'CLINIC_MANAGEMENT': {
      en: 'Clinic Management',
      ar: 'إدارة العيادة'
    },
    'SIGN_IN_TO_ACCOUNT': {
      en: 'Sign in to your account',
      ar: 'تسجيل الدخول إلى حسابك'
    },
    'LANGUAGE': {
      en: 'English',
      ar: 'العربية'
    },
    'SWITCH_LANGUAGE': {
      en: 'Switch Language',
      ar: 'تغيير اللغة'
    },
    'EMAIL': {
      en: 'Email',
      ar: 'البريد الإلكتروني'
    },
    'PASSWORD': {
      en: 'Password',
      ar: 'كلمة المرور'
    },
    'CONFIRM_PASSWORD': {
      en: 'Confirm Password',
      ar: 'تأكيد كلمة المرور'
    },
    'CONFIRM_PASSWORD_NOTE': {
      en: 'Confirm password',
      ar: 'تأكيد كلمة المرور'
    },
    'actions': {
      en: 'Actions',
      ar: 'الإجراءات'
    },
    'prescriptionQR': {
      en: 'Prescription QR',
      ar: 'QR الوصفة الطبية'
    },
    'prescriptionQRCode': {
      en: 'Prescription QR Code',
      ar: 'رمز QR الوصفة الطبية'
    },
    'print': {
      en: 'Print',
      ar: 'طباعة'
    },
    'download': {
      en: 'Download',
      ar: 'تحميل'
    },
    'generated': {
      en: 'Generated',
      ar: 'تم الإنتاج'
    },
    'scanCount': {
      en: 'Scan Count',
      ar: 'عدد المسح'
    },
    'viewPatientInfo': {
      en: 'View Patient Info',
      ar: 'عرض معلومات المريض'
    },
    'viewPrescriptionInfo': {
      en: 'View Prescription Info',
      ar: 'عرض معلومات الوصفة الطبية'
    },
    'englishQR': {
      en: 'English QR',
      ar: 'رمز QR بالإنجليزية'
    },
    'arabicQR': {
      en: 'Arabic QR',
      ar: 'رمز QR بالعربية'
    },
    'generateEnglishQR': {
      en: 'Generate English QR Code',
      ar: 'إنشاء رمز QR بالإنجليزية'
    },
    'generateArabicQR': {
      en: 'Generate Arabic QR Code',
      ar: 'إنشاء رمز QR بالعربية'
    },
    'scanLimitReached': {
      en: 'QR Code scan limit reached (2 scans used)',
      ar: 'تم الوصول إلى حد مسح رمز QR (تم استخدام مسحين)'
    }
  }

  constructor() {
    this.loadLanguagePreference();
  }

  loadLanguagePreference(): void {
    const savedLanguage = localStorage.getItem('clinic_language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      this.currentLanguage = savedLanguage;
    }
  }

  switchLanguage(): void {
    this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
    localStorage.setItem('clinic_language', this.currentLanguage);
  }

  getCurrentLanguage(): 'en' | 'ar' {
    return this.currentLanguage;
  }

  translate(key: string): string {
    return this.translations[key]?.[this.currentLanguage] || key;
  }

  getDirection(): string {
    return this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }

  getGenderText(gender: string): string {
    if (gender === 'male') return this.translate('male');
    if (gender === 'female') return this.translate('female');
    return this.translate('notSpecified');
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return this.translate('scheduled');
      case 'completed':
        return this.translate('completed');
      case 'cancelled':
        return this.translate('cancelled');
      case 'pending':
        return this.translate('pending');
      default:
        return status;
    }
  }

  getPaymentStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid':
        return this.translate('paid');
      case 'unpaid':
        return this.translate('unpaid');
      case 'partial':
        return this.translate('partial');
      default:
        return status;
    }
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return this.translate('goodMorning');
    } else if (hour < 18) {
      return this.translate('goodAfternoon');
    } else {
      return this.translate('goodEvening');
    }
  }
} 