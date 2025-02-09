export interface User {
  id: string;
  first_name: string;
  last_name: string;
  name?: string;
  date_of_birth: any;
  emails: EmailDetail[];
  phones: PhoneNumberDetail[];
  addresses: AddressDetail[];
  emails_attributes?: EmailDetail[];
  addresses_attributes?: AddressDetail[];
  phone_numbers_attributes?: PhoneNumberDetail[];
  deleted?: boolean;
}

export interface ContactDetail {
  type: string;
  value: string;
  isPrimary: boolean;
}

export interface EmailDetail {
  id?: string;
  email: string;
  is_primary: boolean;
  _destroy?: any
}

export interface PhoneNumberDetail {
  id?: string;
  mobile_number: string;
  is_primary: boolean;
  _destroy?: any
}

export interface AddressDetail {
  id?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  landmark: string;
  postal_code: string;
  is_primary: boolean;
  _destroy?: any
}

export interface UserFormData {
  id?: string;
  first_name: string;
  last_name: string;
  date_of_birth: any;
  emails: EmailDetail[];
  phones: PhoneNumberDetail[];
  addresses: AddressDetail[];
  emails_attributes: EmailDetail[];
  addresses_attributes: AddressDetail[];
  phone_numbers_attributes: PhoneNumberDetail[];
}
