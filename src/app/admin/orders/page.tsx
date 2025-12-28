'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/src/utils/api/apiRequest';
import { useAlert } from '@/src/contexts/AlertContext';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
  user: {
    id: number;
    name: string | null;
    phoneNumber: string;
    address: string | null;
  };
  orderProducts: {
    id: number;
    name: string;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
      images: { url: string }[];
    };
  }[];
  companyOrder?: {
    name: string;
    taxId: string;
    phoneNumber: string | null;
  } | null;
}

const STATUS_OPTIONS = [
  { value: 'PENDING_PAYMENT', label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PROCESSING', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  { value: 'READY_TO_SHIP', label: 'Ready to Ship', color: 'bg-purple-100 text-purple-800' },
  { value: 'SHIPPED', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'REFUNDED', label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await apiRequest.get<Order[]>('/v1/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      showAlert({ message: 'Failed to load orders' });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await apiRequest.patch(`/v1/admin/orders/${orderId}`, { status });
      showAlert({ message: 'Order status updated successfully' });
      loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to update order:', error);
      showAlert({ message: 'Failed to update order status' });
    }
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.label || status;
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
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

  const openWhatsApp = (phoneNumber: string, orderNumber: string) => {
    const message = `Halo! Mengenai pesanan ${orderNumber}, `;
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const waNumber = cleanNumber.startsWith('0') ? '62' + cleanNumber.substring(1) : cleanNumber;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        <div className="text-sm text-gray-600">
          Total Orders: <span className="font-bold text-gray-900">{orders.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
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
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.companyOrder ? order.companyOrder.name : (order.user.name || 'N/A')}
                    </div>
                    <div className="text-sm text-gray-500">{order.user.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.orderProducts.length} item(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit Status
                    </button>
                    <button
                      onClick={() => openWhatsApp(order.user.phoneNumber, order.orderNumber)}
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

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Update Order Status</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">Order #{selectedOrder.orderNumber}</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Name:</span> {selectedOrder.companyOrder ? selectedOrder.companyOrder.name : (selectedOrder.user.name || 'N/A')}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Phone:</span> {selectedOrder.user.phoneNumber}
                  </p>
                  {selectedOrder.user.address && (
                    <p className="text-sm">
                      <span className="font-medium">Address:</span> {selectedOrder.user.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.orderProducts.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                      {item.product.images[0] && (
                        <img src={item.product.images[0].url} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => updateOrderStatus(selectedOrder.id, status.value)}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        selectedOrder.status === status.value
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
