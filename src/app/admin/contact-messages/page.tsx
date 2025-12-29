'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/src/utils/api/apiRequest';
import { useAlert } from '@/src/contexts/AlertContext';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string | null;
    phoneNumber: string;
  } | null;
}

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'READ', label: 'Read', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'REPLIED', label: 'Replied', color: 'bg-green-100 text-green-800' },
  { value: 'ARCHIVED', label: 'Archived', color: 'bg-gray-100 text-gray-800' },
];

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { showAlert } = useAlert();

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (selectedMessage) {
      setAdminNotes(selectedMessage.adminNotes || '');
    }
  }, [selectedMessage]);

  const loadMessages = async () => {
    try {
      const response = await apiRequest.get<ContactMessage[]>('/v1/admin/contact-messages');
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load contact messages:', error);
      showAlert({ message: 'Failed to load contact messages' });
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: number, status: string) => {
    try {
      await apiRequest.patch(`/v1/admin/contact-messages/${messageId}`, {
        status,
        adminNotes: adminNotes || null,
      });
      showAlert({ message: 'Contact message updated successfully' });
      loadMessages();
      setSelectedMessage(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Failed to update contact message:', error);
      showAlert({ message: 'Failed to update contact message' });
    }
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.label || status;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openEmail = (email: string, subject: string) => {
    window.open(`mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`, '_blank');
  };

  const openWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const waNumber = cleanNumber.startsWith('0') ? '62' + cleanNumber.substring(1) : cleanNumber;
    window.open(`https://wa.me/${waNumber}`, '_blank');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600">Loading contact messages...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
        <div className="text-sm text-gray-600">
          Total Messages: <span className="font-bold text-gray-900">{messages.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages.map((message) => (
                <tr key={message.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{message.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{message.name}</div>
                    {message.user && (
                      <div className="text-xs text-gray-500">User #{message.user.id}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{message.email}</div>
                    {message.phone && (
                      <div className="text-xs text-gray-500">{message.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {message.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(message.status)}`}>
                      {getStatusLabel(message.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(message.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedMessage(message)}
                      className="text-red-600 hover:text-red-900"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEmail(message.email, message.subject)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Email
                    </button>
                    {message.phone && (
                      <button
                        onClick={() => openWhatsApp(message.phone!)}
                        className="text-green-600 hover:text-green-900"
                      >
                        WhatsApp
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No contact messages found</p>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMessage(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Contact Message Details</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">Message #{selectedMessage.id}</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-gray-900">
                  <p className="text-sm">
                    <span className="font-medium">Name:</span> {selectedMessage.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> {selectedMessage.email}
                  </p>
                  {selectedMessage.phone && (
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span> {selectedMessage.phone}
                    </p>
                  )}
                  {selectedMessage.user && (
                    <p className="text-sm">
                      <span className="font-medium">User Account:</span> {selectedMessage.user.name || 'N/A'} ({selectedMessage.user.phoneNumber})
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">Date:</span> {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Subject</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900">{selectedMessage.subject}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Message</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-600 focus:outline-none transition text-gray-900"
                  placeholder="Add notes for internal reference..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => updateMessageStatus(selectedMessage.id, status.value)}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                        selectedMessage.status === status.value
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => openEmail(selectedMessage.email, selectedMessage.subject)}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  📧 Reply via Email
                </button>
                {selectedMessage.phone && (
                  <button
                    onClick={() => openWhatsApp(selectedMessage.phone!)}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    💬 Reply via WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
