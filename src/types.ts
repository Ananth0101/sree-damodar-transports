export interface Consignment {
  id: number;
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
  created_at?: string;
}

export interface Driver {
  id: number;
  name: string;
  phone: string;
  dl_number: string;
  rc_number: string;
  vehicle_number: string;
  vehicle_type: string;
  address: string;
  created_at?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  gst_no: string;
  address: string;
  location_link: string;
  created_at?: string;
}

export interface FutureBooking {
  id: number;
  expected_date: string;
  customer_name: string;
  phone: string;
  from_location: string;
  to_location: string;
  goods_description: string;
  estimated_freight: number;
  notes: string;
  status: 'Pending' | 'Converted' | 'Cancelled';
  created_at?: string;
}

export const BANK_DETAILS = {
  bankName: "CANARA BANK",
  accountNumber: "040 410 1000 40 55",
  ifsc: "CNRB 00 00 405",
  branch: "Chamarajpet Branch",
  accountHolder: "SREE DAMODAR TRANSPORTS"
};

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
