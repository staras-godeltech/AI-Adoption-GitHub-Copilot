// Common types for the application

export interface User {
  id: string;
  email: string;
  role: 'Admin' | 'Customer' | 'Cosmetologist';
  name: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
}

export interface TimeSlot {
  id: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  timeSlotId: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Cancelled';
  createdAt: Date;
}
