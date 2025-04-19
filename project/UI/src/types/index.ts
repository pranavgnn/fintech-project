export interface Offer {
  id?: number;
  offerType: string;
  description: string;
  validTill: string;
  createdAt?: string;
  customers?: Customer[];
}

export interface Customer {
  id?: number;
  name: string;
  pass: string;
  contactDetails: ContactDetails;
  kyc: KYC;
  accounts?: Account[];
  offers?: Offer[];
}

export interface ContactDetails {
  id?: number;
  email: string;
  phoneNo: string;
}

export interface Address {
  id?: number;
  line1: string;
  line2: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
}

export interface KYC {
  id?: number;
  dob: string;
  address: Address;
  adhaar: string;
  pan: string;
}

export interface Account {
  id?: number;
  number: string;
  balance: number;
  type: string;
  customer?: Customer;
}
