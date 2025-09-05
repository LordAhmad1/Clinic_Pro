export interface Invoice {
  id: string;
  patientId: string;
  appointmentId: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'partially-paid';
  issueDate: string;
  dueDate: string;
  services: InvoiceService[];
  patient?: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface InvoiceService {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}