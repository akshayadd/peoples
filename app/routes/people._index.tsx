import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { ChevronDown, ChevronUp, Mail, Phone, MapPin, Star, StarOff, Plus, Pencil, Trash2Icon, RefreshCcwDot } from 'lucide-react';
import { userInfo } from "os";
import React, { useState } from "react";
import { AddressDetail, ContactDetail, EmailDetail, PhoneNumberDetail, User } from "~/types/people";

export const loader: LoaderFunction = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/peoples`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  const Users = await response.json();

  const users: User[] = Users.map((user: any) => ({
    id: user.id.toString(),
    name: user.first_name+ ' ' + user.last_name,
    date_of_birth: user.date_of_birth,
    emails: user.emails,
    phones: user.phone_numbers,
    addresses: user.addresses,
    deleted: user.deleted_at !== null ? true : false
  }));

  return json({users})
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const userIds = formData.get("userIds")?.toString().split(",");

  if (intent === "delete" && userIds) {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/peoples/destroy_multiple`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids: userIds })
    })
    if(response.ok) {
      return json({ success: true });
    } else {
      console.log(response.status)
    }
  }

  return json({ success: false });
};

const AddressesList = ({ items, icon: Icon }: { items: AddressDetail[], icon: React.ElementType }) => (
  <div className="space-y-2">
    {items.length === 0 ? <p className="text-sm text-gray-500">No Address Yet</p> : null}
    {items.length > 0 && items.map((item, index) => (
      <div key={index} className="flex items-center space-x-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-500">{item.street} {item.landmark} {item.city}-{item.postal_code} {item.state} {item.country}</span>
        {item.is_primary ? (
          <Star className="w-4 h-4 text-yellow-500" />
        ) : (
          <StarOff className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-xs text-gray-500">({item.is_primary ? 'Primary' : 'default'})</span>
      </div>
    ))}
  </div>
);

const EmailList = ({ items, icon: Icon }: { items: EmailDetail[], icon: React.ElementType }) => (
  <div className="space-y-2">
    {items.length === 0 ? <p className="text-sm text-gray-500">No Email's Yet</p> : null}
    {items.length > 0 && items.map((item, index) => (
      <div key={index} className="flex items-center space-x-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-500">{item.email}</span>
        {item.is_primary ? (
          <Star className="w-4 h-4 text-yellow-500" />
        ) : (
          <StarOff className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-xs text-gray-500">({item.is_primary ? 'Primary' : 'default'})</span>
      </div>
    ))}
  </div>
);

const PhoneNumbersList = ({ items, icon: Icon }: { items: PhoneNumberDetail[], icon: React.ElementType }) => (
  <div className="space-y-2">
    {items.length === 0 ? <p className="text-sm text-gray-500">No Number Yet</p> : null}
    {items.length > 0 && items.map((item, index) => (
      <div key={index} className="flex items-center space-x-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-500">{item.mobile_number}</span>
        {item.is_primary ? (
          <Star className="w-4 h-4 text-yellow-500" />
        ) : (
          <StarOff className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-xs text-gray-500">({item.is_primary ? 'Primary' : 'default'})</span>
      </div>
    ))}
  </div>
);

export default function Users() {
  const { users } = useLoaderData<{ users: User[] }>();
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const deleteUser = async (userId: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/peoples/${userId}`, {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json"
      }
    })
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    if (response.ok) {
      return navigate(`/people`)
    }
    // return json({ success: true });
  }

  const restoreUser = async (userId: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/peoples/${userId}/restore`, {
      method: 'POST'
    })
    if (!response.ok) {
      throw new Error('Failed to restore user');
    }
    if (response.ok) {
      return navigate(`/people`)
    }
  }

  const toggleRow = (userId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(userId)) {
      newExpandedRows.delete(userId);
    } else {
      newExpandedRows.add(userId);
    }
    setExpandedRows(newExpandedRows);
  };

  const toggleUserSelection = (userId: string) => {
    const newSelectedUsers = new Set(selectedUsers);
    if (newSelectedUsers.has(userId)) {
      newSelectedUsers.delete(userId);
    } else {
      newSelectedUsers.add(userId);
    }
    setSelectedUsers(newSelectedUsers);
  };

  const toggleAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(user => user.id)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <div className="space-x-4">
            {selectedUsers.size > 1 && (
              <form method="post">
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="userIds" value={Array.from(selectedUsers).join(",")} />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Selected ({selectedUsers.size})
                </button>
              </form>
            )}
            <button
              onClick={() => navigate("/people/new")}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        checked={selectedUsers.size === users.length}
                        onChange={toggleAllUsers}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Primary Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Primary Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const isExpanded = expandedRows.has(user.id);
                  const primaryEmail = user.emails.find(email => email.is_primary);
                  const primaryPhone = user.phones.find(phone => phone.is_primary);
                  const classForDeleted = user.deleted ? 'bg-red-50 hover:bg-red-300' : ''
                  return (
                    <React.Fragment key={user.id}>
                      <tr className={`${classForDeleted} hover:bg-gray-50`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                            checked={selectedUsers.has(user.id)}
                            disabled={user.deleted}
                            onChange={() => toggleUserSelection(user.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{primaryEmail?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{primaryPhone?.mobile_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-3">
                          {user.deleted ? null : (
                            <button
                              onClick={() => navigate(`/people/edit/${user.id}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>)}
                            {user.deleted ? (
                              <button
                                onClick={() => restoreUser(user.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <RefreshCcwDot className="h-5 w-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Trash2Icon className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => toggleRow(user.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Email Addresses</h4>
                                <EmailList items={user.emails} icon={Mail} />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Phone Numbers</h4>
                                <PhoneNumbersList items={user.phones} icon={Phone} />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Addresses</h4>
                                <AddressesList items={user.addresses} icon={MapPin} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}