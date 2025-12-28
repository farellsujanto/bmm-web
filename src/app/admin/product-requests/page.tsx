'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/src/utils/api/apiRequest';
import { useAlert } from '@/src/contexts/AlertContext';
import { PrimaryInput } from '@/src/components/ui';

interface ProductRequest {
  id: number;
  status: string;
  createdAt: string;
  adminNotes: string | null;
  quotedPrice: string | null;
  user: {
    id: number;
    name: string | null;
    phoneNumber: string;
  };
  products: {
    id: number;
    name: string;
    description: string | null;
    quantity: number;
  }[];
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'REVIEWING', label: 'Reviewing', color: 'bg-blue-100 text-blue-800' },
  { value: 'QUOTED', label: 'Quoted', color: 'bg-green-100 text-green-800' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800' },
];

export default function AdminProductRequestsPage() {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ProductRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const { showAlert } = useAlert();

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      setAdminNotes(selectedRequest.adminNotes || '');
      setQuotedPrice(selectedRequest.quotedPrice || '');
    }
  }, [selectedRequest]);

  const loadRequests = async () => {
    try {
      const response = await apiRequest.get<ProductRequest[]>('/v1/admin/product-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to load product requests:', error);
      showAlert({ message: 'Failed to load product requests' });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: number, status: string) => {
    try {
      await apiRequest.patch(`/v1/admin/product-requests/${requestId}`, {
        status,
        adminNotes: adminNotes || null,
        quotedPrice: quotedPrice ? parseFloat(quotedPrice) : null,
      });
      showAlert({ message: 'Product request updated successfully' });
      loadRequests();
      setSelectedRequest(null);
      setAdminNotes('');
      setQuotedPrice('');
    } catch (error) {
      console.error('Failed to update product request:', error);
      showAlert({ message: 'Failed to update product request' });
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

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const openWhatsApp = (phoneNumber: string, requestId: number) => {
    const message = `Halo! Mengenai permintaan produk #${requestId}, `;
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const waNumber = cleanNumber.startsWith('0') ? '62' + cleanNumber.substring(1) : cleanNumber;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600">Loading product requests...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Requests</h1>
        <div className="text-sm text-gray-600">
          Total Requests: <span className="font-bold text-gray-900">{requests.length}</span>
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
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products Requested
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
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{request.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.user.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">{request.user.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {request.products.map((p, idx) => (
                        <div key={p.id} className="mb-1">
                          <span className="font-medium">{p.name}</span>
                          {p.description && <span className="text-gray-500"> - {p.description}</span>}
                          <span className="text-gray-500"> (Qty: {p.quantity})</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(request.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => openWhatsApp(request.user.phoneNumber, request.id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      WhatsApp
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {requests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No product requests found</p>
          </div>
        )}
      </div>

      {/* Manage Request Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRequest(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Manage Product Request</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">Request #{selectedRequest.id}</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Name:</span> {selectedRequest.user.name || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Phone:</span> {selectedRequest.user.phoneNumber}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Requested Products</h3>
                <div className="space-y-3">
                  {selectedRequest.products.map((product) => (
                    <div key={product.id} className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      {product.description && (
                        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">Quantity: {product.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <PrimaryInput
                  label="Quoted Price (IDR)"
                  type="number"
                  placeholder="Enter quoted price"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                />
                {quotedPrice && (
                  <p className="text-sm text-gray-600 mt-1">
                    {formatCurrency(quotedPrice)}
                  </p>
                )}
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
                  placeholder="Add notes for internal reference or customer feedback..."
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
                      onClick={() => updateRequestStatus(selectedRequest.id, status.value)}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        selectedRequest.status === status.value
                          ? 'border-red-600 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
