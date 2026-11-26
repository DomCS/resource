
export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  additionalNames: string;
  customerType: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  notes: string;
  latitude?: number;
  longitude?: number;
};

export type Employee = {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
};

export type Shift = {
  id: string;
  employeeId: string;
  clockIn: string;       // ISO timestamp
  clockOut?: string;     // Missing means currently clocked in
};

export type JobStatus =
  | 'Scheduled'
  | 'In progress'
  | 'On hold'
  | 'Completed';

export type JobPart = {
  id: string;
  name: string;
  quantity: number;
  unitCost: string;
};

export type Job = {
  id: string;
  title: string;
  status: JobStatus;
  customerId: string;
  customerName: string;
  description: string;
  propertyAddress: string;
  scheduledDate: string;
  parts: JobPart[];
  photos: string[];
};

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minimum: number;
  unit: string;
  location: string;
  unitCost: string;
};

export type AppData = {
  customers: Customer[];
  employees: Employee[];
  jobs: Job[];
  shifts: Shift[];
  inventory: InventoryItem[];
};

export const emptyData: AppData = {
  customers: [],
  employees: [],
  jobs: [],
  shifts: [],
  inventory: [],
};



export const uid = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
