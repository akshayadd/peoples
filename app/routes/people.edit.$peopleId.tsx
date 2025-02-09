import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, json, useLoaderData } from "@remix-run/react";
import { Trash2 } from 'lucide-react';
import { useState } from "react";
import { keyof } from "valibot";
import { AddressDetail, EmailDetail, PhoneNumberDetail, User, UserFormData } from "~/types/people";

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
    const keys = key.replace(/\]/g, "").split(/\[|\./);
    let lastKey = keys.pop()!;
    let parentKey = keys[0] as keyof UserFormData;
    let index = keys.length > 1 ? Number(keys[1]) : null;

    if (index !== null && !isNaN(index)) {
      // Ensure the array exists
      if (!result[parentKey]) result[parentKey] = [];
      if (!result[parentKey][index]) result[parentKey][index] = {};
      result[parentKey][index][lastKey] = lastKey === "is_primary" ? value === "on" ? true : false : value; // Convert "on" to boolean
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

export const loader: LoaderFunction = async ({ params }) => {
  const response = await fetch(`http://localhost:3000/peoples/${params.peopleId}`);
  if (!response.ok) {
    throw new Response("Not Found", { status: 404 });
  }

  const person = await response.json();

  const user: User = {
    id: person.id.toString(),
    first_name: person.first_name,
    last_name: person.last_name,
    date_of_birth: person.date_of_birth,
    emails: person.emails,
    phones: person.phone_numbers,
    addresses: person.addresses,
    emails_attributes: person.emails,
    addresses_attributes: person.addresses,
    phone_numbers_attributes: person.phone_numbers,
  };

  return json({ user });
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const structuredData = parseNestedFormData(formData);

  const response = await fetch(`http://localhost:3000/peoples/${params.peopleId}`, {
    method: 'PUT',
    body: JSON.stringify(structuredData),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  if (response.ok) {
    return redirect("/people");
  }
};

export default function EditPerson() {
  const { user } = useLoaderData<{ user: User }>();
  const [formData, setFormData] = useState<User>(user);

  const addContact = (type: keyof UserFormData) => {
    const obj = type === 'emails' ? emptyEmailObject : type === 'phones' ? emptyPhoneNumObject : emptyAddressObject
    setFormData({
      ...formData,
      [type]: [...formData[type] as 'emails' | 'phones' | 'addresses', obj],
    });
  };

  const updatePrimaryContact = (type: 'emails' | 'phones' | 'addresses', index: number, value: boolean) => {
    const details = [...formData[type]];

    details[index] = { ...details[index], is_primary: value };
    if (value === true) {
      details.forEach((contact, i) => {
        if (i !== index) {
          return contact['is_primary'] = false;
        }
      });
    }

    setFormData({ ...formData, [type]: details });
  }

  const updateContact = (type: 'emails' | 'phones' | 'addresses', index: number, field: keyof EmailDetail | keyof PhoneNumberDetail | keyof AddressDetail, value: string | boolean | Date) => {
    const details = [...formData[type]];

    details[index] = { ...details[index], [field]: value };

    if (field === 'is_primary' && value === true) {
      details.forEach((contact, i) => {
        if (i !== index) {
          return contact['is_primary'] = false;
        }
      });
    }

    setFormData({ ...formData, [type]: details });
  };

  const removeContact = async (type: 'emails' | 'phones' | 'addresses', index: number) => {
    const removeType = type === 'phones' ? 'phone_numbers' : type
    const removeContactId = formData[type][index]?.id
    const response = await fetch(`http://localhost:3000/peoples/${user.id}/${removeType}/${removeContactId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    if (response.ok) { console.log('data with index', index, 'deleted')}
    const details = formData[type].filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: details });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New User</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <Form method="post" className="space-y-6">
            <input type="hidden" name="id" value={formData.id} />
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
                  <input type="hidden" name={`emails[${index}].id`} value={contact.id} />
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
                      value={'true'}
                      checked={contact.is_primary}
                      onChange={(e) => updatePrimaryContact('emails', index, e.target.checked ? true : false)}
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
                  <input type="hidden" name={`phones[${index}].id`} value={contact.id} />
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
                      onChange={(e) => updatePrimaryContact('phones', index, e.target.checked ? true : false)}
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
                  <input type="hidden" name={`addresses[${index}].id`} value={contact.id} />
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
                        onChange={(e) => updatePrimaryContact('addresses', index, e.target.checked ? true : false)}
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
                Update Person
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}