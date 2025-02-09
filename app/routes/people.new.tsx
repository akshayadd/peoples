import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Trash2 } from 'lucide-react';
import { useState } from "react";
import { keyof } from "valibot";
import { AddressDetail, EmailDetail, PhoneNumberDetail, UserFormData } from "~/types/people";

const emptyEmailObject: EmailDetail = {
  email: '',
  is_primary: false
}

const emptyPhoneNumObject: PhoneNumberDetail = {
  mobile_number: '',
  is_primary: false
}

const emptyAddressObject: AddressDetail = {
  street: '',
  city: '',
  state: '',
  country: '',
  landmark: '',
  postal_code: '',
  is_primary: false
}

const emptyUser: UserFormData = {
  first_name: '',
  last_name: '',
  date_of_birth: new Date(),
  emails: [emptyEmailObject],
  phones: [emptyPhoneNumObject],
  addresses: [emptyAddressObject],
  emails_attributes: [emptyEmailObject],
  addresses_attributes: [emptyAddressObject],
  phone_numbers_attributes: [emptyPhoneNumObject],
};


function parseNestedFormData(formData: FormData): UserFormData {
  const result: Partial<UserFormData> = {
    emails: [],
    phones: [],
    addresses: [],
  };

  formData.forEach((value, key) => {
    const keys = key.replace(/\]/g, "").split(/\[|\./); // Normalize keys (e.g., emails[0].email → ['emails', '0', 'email'])
    let lastKey = keys.pop()!; // Last key (property name)
    let parentKey = keys[0] as keyof UserFormData; // The top-level key (emails, phones, addresses)
    let index = keys.length > 1 ? Number(keys[1]) : null; // Extract array index if exists

    if (index !== null && !isNaN(index)) {
      // Ensure the array exists
      if (!result[parentKey]) result[parentKey] = [];
      if (!result[parentKey][index]) result[parentKey][index] = {};
      result[parentKey][index][lastKey] = lastKey === "is_primary" ? value === "on" : value; // Convert "on" to boolean
    } else {
      result[lastKey as keyof UserFormData] = value;
    }
  });

  result.emails_attributes = result.emails || [];
  result.addresses_attributes = result.addresses || [];
  result.phone_numbers_attributes = result.phones || [];

  delete result.emails;
  delete result.addresses;
  delete result.phones;

  return result as UserFormData;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const structuredData = parseNestedFormData(formData);

  const response = await fetch('http://localhost:3000/peoples', {
    method: 'POST',
    body: JSON.stringify(structuredData),
    headers: {
      'content-type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  if (response.ok) {
    return redirect("/people");
  }
};

export default function NewUser() {
  const [formData, setFormData] = useState<UserFormData>(emptyUser);

  const addContact = (type: keyof UserFormData) => {
    const obj = type === 'emails' ? emptyEmailObject : type === 'phones' ? emptyPhoneNumObject : emptyAddressObject
    setFormData({
      ...formData,
      [type]: [...formData[type] as 'emails' | 'phones' | 'addresses', obj],
    });
  };

  // const addEmail = () => {
  //   setFormData({
  //     ...formData,
  //     ['emails']: [...formData['emails'], emptyEmailObject],
  //   })
  // }

  // const addPhoneNumbers = () => {
  //   setFormData({
  //     ...formData,
  //     'phones': [...formData['phones'], emptyPhoneNumObject],
  //   })
  // }

  // const addAddresses = () => {
  //   setFormData({
  //     ...formData,
  //     'addresses': [...formData['addresses'], emptyAddressObject],
  //   })
  // }

  const updateContact = (type: 'emails' | 'phones' | 'addresses', index: number, field: keyof EmailDetail | keyof PhoneNumberDetail | keyof AddressDetail, value: string | boolean | Date) => {
    const details = [...formData[type]];
    details[index] = { ...details[index], [field]: value };

    if (field === 'is_primary' && value === true) {
      details.forEach((contact, i) => {
        if (i !== index) contact.is_primary = false;
      });
    }

    setFormData({ ...formData, [type]: details });
  };

  const removeContact = (type: 'emails' | 'phones' | 'addresses', index: number) => {
    const details = formData[type].filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: details });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New User</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <Form method="post" className="space-y-6">
            <div className="flex">
              <div className="flex-1 mr-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name='first_name'
                  value={formData.first_name}
                  required
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name='last_name'
                  value={formData.last_name}
                  required
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.currentTarget.value })}
                className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                required
              />
            </div>

            <div key={'emails'} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 capitalize">Emails</h3>
                <button
                  type="button"
                  onClick={() => addContact('emails')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Add {'emails'.slice(0, -1)}
                </button>
              </div>
              {formData['emails'].map((contact, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name={`emails[${index}].email`}
                      value={contact.email}
                      required
                      onChange={(e) => updateContact('emails', index, 'email', e.target.value)}
                      className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                    />
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name={`emails[${index}].is_primary`}
                      checked={contact.is_primary}
                      onChange={(e) => updateContact('emails', index, 'is_primary', e.target.checked)}
                      className="mt-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Primary</span>
                  </label>
                  {formData['emails'].length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact('emails', index)}
                      className="text-red-600 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div key='phones' className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 capitalize">Phones</h3>
                <button
                  type="button"
                  onClick={() => addContact('phones')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Add {'phones'.slice(0, -1)}
                </button>
              </div>
              {formData['phones'].map((contact, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Number
                    </label>
                    <input
                      type="text"
                      name={`phones[${index}].mobile_number`}
                      value={contact.mobile_number}
                      required
                      onChange={(e) => updateContact('phones', index, 'mobile_number', e.target.value)}
                      className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                    />
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name={`phones[${index}].is_primary`}
                      checked={contact.is_primary}
                      onChange={(e) => updateContact('phones', index, 'is_primary', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Primary</span>
                  </label>
                  {formData['phones'].length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact('phones', index)}
                      className="text-red-600 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div key='addresses' className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 capitalize">Addresses</h3>
                <button
                  type="button"
                  onClick={() => addContact('addresses')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Add {'addresses'.slice(0, -1)}
                </button>
              </div>
              {formData['addresses'].map((contact, index) => (
                <div key={index}>
                  <div className="flex items-center space-x-4 space-y-2">
                    <div className="flex-1">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Street
                      </label>
                      <input
                        type="text"
                        name={`addresses[${index}].street`}
                        value={contact.street}
                        required
                        onChange={(e) => updateContact('addresses', index, 'street', e.target.value)}
                        className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        name={`addresses[${index}].city`}
                        value={contact.city}
                        required
                        onChange={(e) => updateContact('addresses', index, 'city', e.target.value)}
                        className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        State
                      </label>
                      <input
                        type="text"
                        name={`addresses[${index}].state`}
                        value={contact.state}
                        required
                        onChange={(e) => updateContact('addresses', index, 'state', e.target.value)}
                        className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 space-y-2">
                    <div className="flex-1">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <input
                        type="text"
                        name={`addresses[${index}].country`}
                        value={contact.country}
                        required
                        onChange={(e) => updateContact('addresses', index, 'country', e.target.value)}
                        className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name={`addresses[${index}].postal_code`}
                        value={contact.postal_code}
                        required
                        onChange={(e) => updateContact('addresses', index, 'postal_code', e.target.value)}
                        className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Landmark
                      </label>
                      <input
                        type="text"
                        name={`addresses[${index}].landmark`}
                        value={contact.landmark}
                        required
                        onChange={(e) => updateContact('addresses', index, 'landmark', e.target.value)}
                        className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name={`addresses[${index}].is_primary`}
                        checked={contact.is_primary}
                        onChange={(e) => updateContact('addresses', index, 'is_primary', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Primary</span>
                    </label>
                    {formData['addresses'].length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContact('addresses', index)}
                        className="text-red-600 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4">
              <a
                href="/people"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </a>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Person
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}