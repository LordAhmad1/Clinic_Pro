import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { TranslationService } from '../../services/translation.service';
import { Patient } from '../../models/patient.model';
import * as QRCode from 'qrcode';

interface Prescription {
  id: string;
  date: string;
  medications: PrescriptionMedication[];
  instructions: string;
  doctorName: string;
  diagnosis: string;
  scanCount?: number;
}

interface PrescriptionMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  qrCode?: string;
  scanCount?: number;
  lastScanned?: string;
}

@Component({
  selector: 'app-patient-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-preview.component.html',
  styleUrls: ['./patient-preview.component.css']
})
export class PatientPreviewComponent implements OnInit {
  patient: Patient | null = null;
  prescriptions: Prescription[] = [];
  showPrescriptionModal = false;
  showPrescriptionHistory = false;
  showQRModal = false;
  selectedMedication: PrescriptionMedication | null = null;
  selectedPrescription: Prescription | null = null;
  qrCodeDataUrl: string = '';
  
  newPrescription: Omit<Prescription, 'id'> = {
    date: new Date().toISOString().split('T')[0],
    medications: [],
    instructions: '',
    doctorName: 'Dr. Ahmed Hassan',
    diagnosis: ''
  };

  newMedication: Omit<PrescriptionMedication, 'id'> = {
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    scanCount: 0,
    lastScanned: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadPatient();
    this.loadPrescriptions();
    this.loadQRSettings();
  }

  loadPatient(): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId) {
      this.patientService.getPatients().subscribe(patients => {
        this.patient = patients.find(p => p.id === patientId) || null;
        if (!this.patient) {
          console.error('Patient not found');
          this.router.navigate(['/patients']);
        }
      });
    }
  }

  loadPrescriptions(): void {
    const storedPrescriptions = localStorage.getItem(`patient_prescriptions_${this.route.snapshot.paramMap.get('id')}`);
    if (storedPrescriptions) {
      this.prescriptions = JSON.parse(storedPrescriptions);
    }
  }

  savePrescriptions(): void {
    localStorage.setItem(`patient_prescriptions_${this.patient?.id}`, JSON.stringify(this.prescriptions));
  }

  openPrescriptionModal(): void {
    this.newPrescription = {
      date: new Date().toISOString().split('T')[0],
      medications: [],
      instructions: '',
      doctorName: 'Dr. Ahmed Hassan',
      diagnosis: ''
    };
    this.showPrescriptionModal = true;
  }

  closePrescriptionModal(): void {
    this.showPrescriptionModal = false;
  }

  addMedication(): void {
    
    if (this.newMedication.name && this.newMedication.dosage) {
      // Check if this medication already exists in current prescription and has been scanned 2 times
      const existingMedicationInCurrent = this.newPrescription.medications.find(
        med => med.name === this.newMedication.name && med.dosage === this.newMedication.dosage
      );
      
      if (this.qrSettings.enableScanLimit && existingMedicationInCurrent && (existingMedicationInCurrent.scanCount || 0) >= this.qrSettings.maxScanCount) {
        alert(this.translationService.translate('medicationScanLimitReachedCurrent'));
        return;
      }
      
      // Check if this medication exists in any existing prescription and has been scanned maxScanCount times
      const existingMedicationInHistory = this.prescriptions.flatMap(p => p.medications).find(
        med => med.name === this.newMedication.name && med.dosage === this.newMedication.dosage
      );
      
      if (this.qrSettings.enableScanLimit && existingMedicationInHistory && (existingMedicationInHistory.scanCount || 0) >= this.qrSettings.maxScanCount) {
        alert(this.translationService.translate('medicationScanLimitReachedHistory'));
        return;
      }
      
      const medication: PrescriptionMedication = {
        id: Date.now().toString(),
        ...this.newMedication,
        scanCount: 0,
        lastScanned: ''
      };
      
      this.newPrescription.medications.push(medication);

      this.newMedication = {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        scanCount: 0,
        lastScanned: ''
      };
    } else {
      
    }
  }

  removeMedication(index: number): void {
    this.newPrescription.medications.splice(index, 1);
  }

  savePrescription(): void {
    
    if (this.newPrescription.diagnosis && this.newPrescription.medications.length > 0) {
      const prescription: Prescription = {
        id: Date.now().toString(),
        ...this.newPrescription
      };

      this.prescriptions.unshift(prescription);
      
      this.savePrescriptions();
      this.closePrescriptionModal();
    } else {
      
    }
  }

  deletePrescription(prescriptionId: string): void {
    if (confirm(this.translationService.translate('confirmDelete'))) {
      this.prescriptions = this.prescriptions.filter(p => p.id !== prescriptionId);
      this.savePrescriptions();
    }
  }

  // QR Code functionality
  generateQRCode(medication: PrescriptionMedication, language: 'en' | 'ar' = 'en'): void {

    // Check if medication has reached scan limit
    const currentScanCount = medication.scanCount || 0;
    if (this.qrSettings.enableScanLimit && currentScanCount >= this.qrSettings.maxScanCount) {
      alert(this.translationService.translate('scanLimitReached'));
      return;
    }
    
    this.selectedMedication = medication;
    
    // Find the prescription that contains this medication
    const prescription = this.prescriptions.find(p => p.medications.some(m => m.id === medication.id));
    if (!prescription) {
      alert(this.translationService.translate('prescriptionNotFound'));
      return;
    }
    
    // Get up to maxMedications from the prescription
    const medicationsToInclude = prescription.medications.slice(0, this.qrSettings.maxMedications);
    
    // Create text format based on language
    let qrData: string;
    
    if (language === 'ar') {
      // Arabic format

             const patientName = String(this.patient?.name || 'مريض غير معروف');
       const doctorName = String(prescription.doctorName || 'طبيب غير معروف');
       const diagnosis = String(prescription.diagnosis || 'غير محدد');
       const instructions = String(prescription.instructions || 'لا توجد تعليمات خاصة');
       
       // Format date for Arabic
       const currentLang = this.translationService.getCurrentLanguage();
       const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
       const formattedDate = new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : undefined, dateOptions);
       
       qrData = `معلومات الوصفة الطبية:
المريض: ${patientName}
الطبيب: ${doctorName}
التشخيص: ${diagnosis}
التاريخ: ${formattedDate}
التعليمات العامة: ${instructions}

الأدوية (${medicationsToInclude.length}):`;
      
      medicationsToInclude.forEach((med, index) => {
        const medicationName = String(med.name || 'دواء غير معروف');
        const medicationDosage = String(med.dosage || 'غير محدد');
        const medicationFrequency = String(med.frequency || 'غير محدد');
        const medicationDuration = String(med.duration || 'غير محدد');
        const medicationInstructions = String(med.instructions || 'لا توجد تعليمات خاصة');
        
        qrData += `

${index + 1}. ${medicationName}
   الجرعة: ${medicationDosage}
   التكرار: ${medicationFrequency}
   المدة: ${medicationDuration}
   التعليمات: ${medicationInstructions}`;
      });
      
             qrData += `

 عدد المسح: ${currentScanCount + 1}/${this.qrSettings.maxScanCount}`;

    } else {
      // English format

             const patientName = String(this.patient?.name || 'Unknown Patient');
       const doctorName = String(prescription.doctorName || 'Unknown Doctor');
       const diagnosis = String(prescription.diagnosis || 'Not specified');
       const instructions = String(prescription.instructions || 'No special instructions');
       
       // Format date for English
       const currentLang = this.translationService.getCurrentLanguage();
       const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
       const formattedDate = new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : undefined, dateOptions);
       
       qrData = `PRESCRIPTION INFO:
Patient: ${patientName}
Doctor: ${doctorName}
Diagnosis: ${diagnosis}
Date: ${formattedDate}
General Instructions: ${instructions}

Medications (${medicationsToInclude.length}):`;
      
      medicationsToInclude.forEach((med, index) => {
        const medicationName = String(med.name || 'Unknown Medication');
        const medicationDosage = String(med.dosage || 'Not specified');
        const medicationFrequency = String(med.frequency || 'Not specified');
        const medicationDuration = String(med.duration || 'Not specified');
        const medicationInstructions = String(med.instructions || 'No special instructions');
        
        qrData += `

${index + 1}. ${medicationName}
   Dosage: ${medicationDosage}
   Frequency: ${medicationFrequency}
   Duration: ${medicationDuration}
   Instructions: ${medicationInstructions}`;
      });
      
             qrData += `

 Scan: ${currentScanCount + 1}/${this.qrSettings.maxScanCount}`;

    }

    // Generate QR code
    
    QRCode.toDataURL(qrData, {
      width: this.qrSettings.qrCodeWidth,
      margin: this.qrSettings.qrCodeMargin,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then(url => {
      
      this.qrCodeDataUrl = url;
      this.showQRModal = true;
    }).catch(err => {
      console.error('Error generating QR code:', err);
      alert(this.translationService.translate('qrCodeGenerationError'));
    });
  }

  closeQRModal(): void {
    this.showQRModal = false;
    this.selectedMedication = null;
    this.qrCodeDataUrl = '';
  }

  // Generate QR code for entire prescription
  generatePrescriptionQRCode(prescription: Prescription, language: 'en' | 'ar' = 'en'): void {

    // Check if prescription has reached scan limit
    const currentScanCount = prescription.scanCount || 0;
    if (this.qrSettings.enableScanLimit && currentScanCount >= this.qrSettings.maxScanCount) {
      alert(this.translationService.translate('scanLimitReached'));
      return;
    }
    
    // Get up to maxMedications from the prescription
    const medicationsToInclude = prescription.medications.slice(0, this.qrSettings.maxMedications);
    
    // Create text format based on language
    let qrData: string;
    
    if (language === 'ar') {
      // Arabic format

      const patientName = String(this.patient?.name || 'مريض غير معروف');
      const doctorName = String(prescription.doctorName || 'طبيب غير معروف');
      const diagnosis = String(prescription.diagnosis || 'غير محدد');
      const instructions = String(prescription.instructions || 'لا توجد تعليمات خاصة');
      
      // Format date for Arabic
      const currentLang = this.translationService.getCurrentLanguage();
      const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
      const formattedDate = new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : undefined, dateOptions);
      
      qrData = `معلومات الوصفة الطبية:
المريض: ${patientName}
الطبيب: ${doctorName}
التشخيص: ${diagnosis}
التاريخ: ${formattedDate}
التعليمات العامة: ${instructions}

الأدوية (${medicationsToInclude.length}):`;
      
      medicationsToInclude.forEach((med, index) => {
        
        const medicationName = String(med.name || 'دواء غير معروف');
        const medicationDosage = String(med.dosage || 'غير محدد');
        const medicationFrequency = String(med.frequency || 'غير محدد');
        const medicationDuration = String(med.duration || 'غير محدد');
        const medicationInstructions = String(med.instructions || 'لا توجد تعليمات خاصة');

        qrData += `

${index + 1}. ${medicationName}
   الجرعة: ${medicationDosage}
   التكرار: ${medicationFrequency}
   المدة: ${medicationDuration}
   التعليمات: ${medicationInstructions}`;
      });
      
      qrData += `

 عدد المسح: ${currentScanCount + 1}/${this.qrSettings.maxScanCount}`;

    } else {
      // English format

      const patientName = String(this.patient?.name || 'Unknown Patient');
      const doctorName = String(prescription.doctorName || 'Unknown Doctor');
      const diagnosis = String(prescription.diagnosis || 'Not specified');
      const instructions = String(prescription.instructions || 'No special instructions');
      
      // Format date for English
      const currentLang = this.translationService.getCurrentLanguage();
      const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
      const formattedDate = new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : undefined, dateOptions);
      
      qrData = `PRESCRIPTION INFO:
Patient: ${patientName}
Doctor: ${doctorName}
Diagnosis: ${diagnosis}
Date: ${formattedDate}
General Instructions: ${instructions}

Medications (${medicationsToInclude.length}):`;
      
      medicationsToInclude.forEach((med, index) => {
        
        const medicationName = String(med.name || 'Unknown Medication');
        const medicationDosage = String(med.dosage || 'Not specified');
        const medicationFrequency = String(med.frequency || 'Not specified');
        const medicationDuration = String(med.duration || 'Not specified');
        const medicationInstructions = String(med.instructions || 'No special instructions');

        qrData += `

${index + 1}. ${medicationName}
   Dosage: ${medicationDosage}
   Frequency: ${medicationFrequency}
   Duration: ${medicationDuration}
   Instructions: ${medicationInstructions}`;
      });
      
      qrData += `

 Scan: ${currentScanCount + 1}/${this.qrSettings.maxScanCount}`;

    }

    // Generate QR code
    
    QRCode.toDataURL(qrData, {
      width: this.qrSettings.qrCodeWidth,
      margin: this.qrSettings.qrCodeMargin,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then(url => {
      
      this.qrCodeDataUrl = url;
      this.showQRModal = true;
      
      // Store the prescription for scan count tracking
      this.selectedPrescription = prescription;
    }).catch(err => {
      console.error('Error generating QR code:', err);
      alert(this.translationService.translate('qrCodeGenerationError'));
    });
  }

  incrementScanCount(medication: PrescriptionMedication): void {
    // Find the medication in all prescriptions and update scan count
    this.prescriptions.forEach(prescription => {
      prescription.medications.forEach(med => {
        if (med.id === medication.id) {
          med.scanCount = (med.scanCount || 0) + 1;
          med.lastScanned = new Date().toISOString();
          
        }
      });
    });
    
    // Save updated prescriptions
    this.savePrescriptions();
  }

  incrementPrescriptionScanCount(prescription: Prescription): void {
    // Update prescription scan count
    prescription.scanCount = (prescription.scanCount || 0) + 1;

    // Save updated prescriptions
    this.savePrescriptions();
  }

  downloadQRCode(): void {
    if (this.qrCodeDataUrl) {
      if (this.selectedMedication) {
        // Increment medication scan count
        this.incrementScanCount(this.selectedMedication);
        
        const link = document.createElement('a');
        link.download = `medication_${this.selectedMedication.name.replace(/\s+/g, '_')}_qr.png`;
        link.href = this.qrCodeDataUrl;
        link.click();
      } else if (this.selectedPrescription) {
        // Increment prescription scan count
        this.incrementPrescriptionScanCount(this.selectedPrescription);
        
        const link = document.createElement('a');
        link.download = `prescription_${this.selectedPrescription.id}_qr.png`;
        link.href = this.qrCodeDataUrl;
        link.click();
      }
    }
  }

  printQRCode(): void {
    if (this.qrCodeDataUrl) {
      if (this.selectedMedication) {
        // Increment medication scan count
        this.incrementScanCount(this.selectedMedication);
        
        // Find the prescription that contains this medication
        const prescription = this.prescriptions.find(p => p.medications.some(m => m.id === this.selectedMedication!.id));
      
              const printWindow = window.open('', '_blank');
        if (printWindow) {
          // Get current language for date formatting
          const currentLang = this.translationService.getCurrentLanguage();
          const dateOptions: Intl.DateTimeFormatOptions | undefined = currentLang === 'ar' ? { year: 'numeric', month: '2-digit', day: '2-digit' } : undefined;
          const formattedDate = new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : undefined, dateOptions);
          
          printWindow.document.write(`
            <html>
              <head>
                <title>${this.translationService.translate('medicationQRCode')} - ${this.selectedMedication.name}</title>
                <style>
                  body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                  .qr-container { margin: 20px 0; }
                  .medication-info { margin: 20px 0; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto; }
                  .medication-info h3 { color: #333; }
                  .medication-info p { margin: 5px 0; }
                  .label { font-weight: bold; color: #666; }
                  img { max-width: 300px; height: auto; }
                  @media print {
                    body { margin: 0; padding: 10px; }
                    .no-print { display: none; }
                  }
                </style>
              </head>
              <body>
                <h2>${this.translationService.translate('medicationQRCode')}</h2>
                <div class="medication-info">
                  <h3>${this.selectedMedication.name}</h3>
                  <p><span class="label">${this.translationService.translate('dosage')}:</span> ${this.selectedMedication.dosage}</p>
                  <p><span class="label">${this.translationService.translate('frequency')}:</span> ${this.selectedMedication.frequency}</p>
                  <p><span class="label">${this.translationService.translate('duration')}:</span> ${this.selectedMedication.duration}</p>
                  <p><span class="label">${this.translationService.translate('instructions')}:</span> ${this.selectedMedication.instructions}</p>
                  <p><span class="label">${this.translationService.translate('patient')}:</span> ${this.patient?.name || ''}</p>
                  <p><span class="label">${this.translationService.translate('generated')}:</span> ${formattedDate}</p>
                  <p><span class="label">${this.translationService.translate('scanCount')}:</span> ${(this.selectedMedication.scanCount || 0) + 1}/${this.qrSettings.maxScanCount}</p>
                </div>
                <div class="qr-container">
                  <img src="${this.qrCodeDataUrl}" alt="${this.translationService.translate('medicationQRCode')}">
                </div>
                <div class="no-print">
                  <p>${this.translationService.translate('scanQRCodeMessage')}</p>
                  <button onclick="window.print()">${this.translationService.translate('print')}</button>
                  <button onclick="window.close()">${this.translationService.translate('close')}</button>
                </div>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      } else if (this.selectedPrescription) {
        // Increment prescription scan count
        this.incrementPrescriptionScanCount(this.selectedPrescription);
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          // Get current language for date formatting
          const currentLang = this.translationService.getCurrentLanguage();
          const dateOptions: Intl.DateTimeFormatOptions | undefined = currentLang === 'ar' ? { year: 'numeric', month: '2-digit', day: '2-digit' } : undefined;
          const formattedDate = new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : undefined, dateOptions);
          
          printWindow.document.write(`
            <html>
              <head>
                <title>${this.translationService.translate('prescriptionQRCode')} - ${this.selectedPrescription.id}</title>
                <style>
                  body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                  .qr-container { margin: 20px 0; }
                  .prescription-info { margin: 20px 0; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto; }
                  .prescription-info h3 { color: #333; }
                  .prescription-info p { margin: 5px 0; }
                  .label { font-weight: bold; color: #666; }
                  img { max-width: 300px; height: auto; }
                  @media print {
                    body { margin: 0; padding: 10px; }
                    .no-print { display: none; }
                  }
                </style>
              </head>
              <body>
                <h2>${this.translationService.translate('prescriptionQRCode')}</h2>
                <div class="prescription-info">
                  <h3>${this.translationService.translate('prescription')} #${this.selectedPrescription.id}</h3>
                  <p><span class="label">${this.translationService.translate('patient')}:</span> ${this.patient?.name || ''}</p>
                  <p><span class="label">${this.translationService.translate('doctor')}:</span> ${this.selectedPrescription.doctorName}</p>
                  <p><span class="label">${this.translationService.translate('diagnosis')}:</span> ${this.selectedPrescription.diagnosis}</p>
                  <p><span class="label">${this.translationService.translate('generated')}:</span> ${formattedDate}</p>
                  <p><span class="label">${this.translationService.translate('scanCount')}:</span> ${(this.selectedPrescription.scanCount || 0) + 1}/${this.qrSettings.maxScanCount}</p>
                  
                  <h4 style="margin-top: 20px; color: #000;">${this.translationService.translate('medications')} (${this.selectedPrescription.medications.length}):</h4>
                  ${this.selectedPrescription.medications.map((med, index) => `
                    <div style="margin: 15px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                      <h5 style="margin: 0 0 8px 0; color: #000;">${index + 1}. ${med.name}</h5>
                      <p style="margin: 3px 0;"><span class="label">${this.translationService.translate('dosage')}:</span> ${med.dosage}</p>
                      <p style="margin: 3px 0;"><span class="label">${this.translationService.translate('frequency')}:</span> ${med.frequency}</p>
                      <p style="margin: 3px 0;"><span class="label">${this.translationService.translate('duration')}:</span> ${med.duration}</p>
                      ${med.instructions ? `<p style="margin: 3px 0;"><span class="label">${this.translationService.translate('instructions')}:</span> ${med.instructions}</p>` : ''}
                    </div>
                  `).join('')}
                  
                  ${this.selectedPrescription.instructions ? `
                    <div style="margin-top: 20px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                      <h5 style="margin: 0 0 8px 0; color: #000;">${this.translationService.translate('generalInstructions')}:</h5>
                      <p style="margin: 0; color: #000;">${this.selectedPrescription.instructions}</p>
                    </div>
                  ` : ''}
                </div>
                <div class="qr-container">
                  <img src="${this.qrCodeDataUrl}" alt="${this.translationService.translate('prescriptionQRCode')}">
                </div>
                <div class="no-print">
                  <p>${this.translationService.translate('scanQRCodeMessage')}</p>
                  <button onclick="window.print()">${this.translationService.translate('print')}</button>
                  <button onclick="window.close()">${this.translationService.translate('close')}</button>
                </div>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
    }
  }

  getPatientAge(): number {
    if (!this.patient?.dateOfBirth) return 0;
    const birthDate = new Date(this.patient.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  getPatientPhoto(): string {
    if (this.patient?.photo && this.patient.photo.startsWith('data:image')) {
      return this.patient.photo;
    }
    return '';
  }

  getPatientInitials(): string {
    if (!this.patient?.name) return '?';
    return this.patient.name.charAt(0).toUpperCase();
  }

  goBack(): void {
    this.router.navigate(['/patients']);
  }

  // QR Settings
  qrSettings = {
    maxMedications: 6,
    maxScanCount: 6,
    qrCodeWidth: 300,
    qrCodeMargin: 2,
    enableScanLimit: true,
    enableDownload: true,
    enablePrint: true,
    defaultLanguage: 'en'
  };

  loadQRSettings(): void {
    const savedSettings = localStorage.getItem('qr_settings');
    if (savedSettings) {
      this.qrSettings = { ...this.qrSettings, ...JSON.parse(savedSettings) };
    }
  }
} 