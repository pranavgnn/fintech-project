export interface LoginRequest {
  email: string;
  password: string;
}

export interface AddressRequest {
  line1: string;
  line2?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface KYCRequest {
  dateOfBirth: string;
  aadhaarNumber: string;
  panNumber: string;
  address: AddressRequest;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  kyc: KYCRequest;
}

export interface JwtAuthResponse {
  accessToken: string;
  tokenType: string;
}
