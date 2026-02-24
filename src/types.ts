export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export interface Consignment {
  id: string;
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

export const BANK_DETAILS = {
  bankName:      "CANARA BANK",
  accountNumber: "040 410 1000 40 55",
  ifsc:          "CNRB 00 00 405",
  branch:        "Chamarajpet Branch",
  accountHolder: "SREE DAMODAR TRANSPORTS"
};
