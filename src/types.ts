export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export type CompanyType = 'transports' | 'traders';

export interface Consignment {
  id: string;
  company: CompanyType;
  consignment_no: string;
  date: string;
  from_location: string;
  to_location: string;
  customer_name: string;
  customer_phone: string;
  customer_gst?: string;
  consignee_name: string;
  consignee_phone: string;
  consignee_gst?: string;
  goods_description: string;
  articles_count?: string;
  weight: string;
  charged_weight?: string;
  value_of_goods?: string;
  invoice_no_date?: string;
  delivery_at?: string;
  freight_amount: number;
  advance_paid: number;
  balance_amount: number;
  handling_charges?: number;
  halting_charges?: number;
  gc_charges?: number;
  sgst?: number;
  cgst?: number;
  payment_status: 'Pending' | 'Paid' | 'Partial';
  driver_name: string;
  vehicle_number: string;
  vehicle_type: string;
  driver_payment_status: 'Pending' | 'Paid';
  commission: number;
  payment_ref: string;
  createdAt?: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  dl_number: string;
  rc_number: string;
  vehicle_number: string;
  vehicle_type: string;
  address: string;
  createdAt?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  gst_no: string;
  address: string;
  location_link: string;
  createdAt?: number;
}

export interface FutureBooking {
  id: string;
  company: CompanyType;
  expected_date: string;
  customer_name: string;
  phone: string;
  from_location: string;
  to_location: string;
  goods_description: string;
  estimated_freight: number;
  notes: string;
  status: 'Pending' | 'Converted' | 'Cancelled';
  createdAt?: number;
}

export const COMPANY_INFO = {
  transports: {
    name: 'SREE DAMODAR TRANSPORTS',
    shortName: 'SDT',
    address: 'H.O. : 4th Main Road, New Tharagupet, Bangalore - 560 002',
    phone1: '9880525597',
    phone2: '8618422012',
    gstin: '',
    bankName: 'CANARA BANK',
    bankBranch: 'Chamarajpet Branch',
    accountNumber: '040 410 1000 40 55',
    ifsc: 'CNRB 00 00 405',
  },
  traders: {
    name: 'SREE DAMODAR TRADERS',
    shortName: 'SDT',
    address: 'H.O. : 4th Main Road, New Tharagupet, Bangalore - 560 002',
    phone1: '8618422012',
    phone2: '',
    gstin: '29CHFPA3746M1Z2',
    bankName: 'HDFC BANK',
    bankBranch: 'Vijayanagar Branch',
    accountNumber: '50200092213582',
    ifsc: 'HDFC0001757',
    route: 'BANGALORE - MANGALORE',
    service: 'DAILY PARCELS SERVICE',
  },
};

export const BANK_DETAILS = {
  bankName:      "CANARA BANK",
  accountNumber: "040 410 1000 40 55",
  ifsc:          "CNRB 00 00 405",
  branch:        "Chamarajpet Branch",
  accountHolder: "SREE DAMODAR TRANSPORTS"
};
