'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/src/contexts/AuthContext';
import { useCart } from '@/src/contexts/CartContext';
import { useAlert } from '@/src/contexts/AlertContext';
import { PrimaryButton, SecondaryButton, PrimaryInput, PrimaryTextArea, Loader } from '@/src/components/ui';
import type { User, Company } from '@/generated/prisma/browser';
import { apiRequest } from '@/src/utils/api/apiRequest';
import { trackCheckoutStarted, trackOrderCompleted } from '@/src/utils/analytics/posthog.util';

export default function CheckoutPage() {
    const router = useRouter();
    const { isAuthenticated, user, isLoading } = useAuth();
    const { items, totalPrice, totalItems, clearCart } = useCart();
    const { showAlert } = useAlert();
    const [isProcessing, setIsProcessing] = useState(false);
    const [useCompany, setUseCompany] = useState(false);
    const [orderCompleted, setOrderCompleted] = useState(false);

    // Calculate subtotal (after product discounts are already applied in totalPrice)
    // totalPrice from cart already includes product-level discounts
    const subtotal = totalPrice;
    
    // Calculate global discount (applied to subtotal which already has product discounts)
    const discountPercentage = user?.globalDiscountPercentage ? Number(user.globalDiscountPercentage) : 0;
    const globalDiscountAmount = (subtotal * discountPercentage) / 100;
    const finalPrice = subtotal - globalDiscountAmount;

    const [customerInfo, setCustomerInfo] = useState<Partial<User>>({
        name: '',
        governmentId: '',
        address: '',
    });

    const [companyInfo, setCompanyInfo] = useState<Partial<Company>>({
        name: '',
        taxId: '',
        address: '',
        phoneNumber: '',
    });

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        if (items.length === 0 && !isLoading && !orderCompleted) {
            router.push('/shop');
        }
    }, [items, isLoading, orderCompleted, router]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                try {
                    const response = await apiRequest.get('/v1/user/profile');
                    if (response.success && response.data) {
                        const userData = response.data as any;
                        setCustomerInfo({
                            name: userData.name || '',
                            governmentId: userData.governmentId || '',
                            address: userData.address || '',
                        });
                        
                        // Prefill company data if user has a company
                        if (userData.company) {
                            setUseCompany(true);
                            setCompanyInfo({
                                name: userData.company.name || '',
                                taxId: userData.company.taxId || '',
                                address: userData.company.address || '',
                                phoneNumber: userData.company.phoneNumber || '',
                            });
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch user data:', error);
                    // Fallback to basic user data from auth context
                    setCustomerInfo({
                        name: user.name || '',
                        governmentId: '',
                        address: '',
                    });
                }
            }
        };
        
        fetchUserData();
        
        // Track checkout started
        if (items.length > 0) {
            trackCheckoutStarted({
                total: finalPrice,
                itemCount: totalItems,
                products: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
            });
        }
    }, [user]);

    const handlePayment = async () => {
        // Validate required fields
        if (!customerInfo.name?.trim()) {
            showAlert({ message: 'Nama harus diisi' });
            return;
        }
        if (!customerInfo.address?.trim()) {
            showAlert({ message: 'Alamat harus diisi' });
            return;
        }

        if (useCompany) {
            if (!companyInfo.name?.trim()) {
                showAlert({ message: 'Nama perusahaan harus diisi' });
                return;
            }
            if (!companyInfo.taxId?.trim()) {
                showAlert({ message: 'NPWP perusahaan harus diisi' });
                return;
            }
        }

        setIsProcessing(true);
        
        try {
            const orderData = {
                customer: customerInfo,
                company: useCompany ? companyInfo : null,
                items: items.map(item => ({
                    id: parseInt(item.id),
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    discount: item.discount,
                    affiliatePercent: item.affiliatePercent,
                    isPreOrder: item.isPreOrder,
                })),
                subtotal: subtotal,
                discountPercentage,
                discountAmount: globalDiscountAmount,
                finalPrice,
            };

            const response = await apiRequest.post('/v1/orders', orderData);

            if (response.success) {
                // Track order completed
                trackOrderCompleted({
                    orderId: (response.data as any).orderNumber,
                    total: finalPrice,
                    itemCount: totalItems,
                    products: items.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                });
                
                // Set order completed flag to prevent redirect to shop
                setOrderCompleted(true);
                // Clear the cart
                clearCart();
                // Redirect to order details page using order number
                router.push(`/activity/orders/${(response.data as any).orderNumber}`);
            } else {
                showAlert({ message: response.message || 'Gagal membuat pesanan' });
            }
        } catch (error: any) {
            console.error('Order creation error:', error);
            showAlert({ message: error.message || 'Terjadi kesalahan saat membuat pesanan' });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (!isAuthenticated || items.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Black overlay for navbar */}
            <div className="fixed top-0 left-0 right-0 h-20 bg-black z-40"></div>

            <div className="relative pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
                        <p className="text-gray-600">Selesaikan pesanan Anda</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Order Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Item Pesanan ({totalItems})
                                </h2>

                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                                            <div className="relative w-24 h-24 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                                {item.image && (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="96px"
                                                    />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                                                {item.brand && (
                                                    <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        {item.discount && item.discount > 0 ? (
                                                            <>
                                                                <p className="text-sm text-gray-400 line-through">
                                                                    Rp {item.price.toLocaleString('id-ID')}
                                                                </p>
                                                                <p className="text-lg font-bold text-red-600">
                                                                    Rp {(item.price * (1 - item.discount / 100)).toLocaleString('id-ID')}
                                                                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                                                        -{item.discount}%
                                                                    </span>
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <p className="text-lg font-bold text-red-600">
                                                                Rp {item.price.toLocaleString('id-ID')}
                                                            </p>
                                                        )}
                                                        <p className="text-sm text-gray-600">
                                                            Qty: {item.quantity}
                                                        </p>
                                                    </div>
                                                    <p className="text-xl font-bold text-gray-900">
                                                        Rp {((item.price * (1 - (item.discount || 0) / 100)) * item.quantity).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                                {(item.preOrderReadyEarliest || item.preOrderReadyLatest) && (
                                                    <div className="mt-2">
                                                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                                            Pre-Order: {item.preOrderReadyEarliest}
                                                            {item.preOrderReadyLatest && `-${item.preOrderReadyLatest}`} minggu
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Informasi Pelanggan
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Nama Lengkap <span className="text-red-600">*</span>
                                        </label>
                                        <PrimaryInput
                                            type="text"
                                            value={customerInfo.name || ''}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                            placeholder="Masukkan nama lengkap"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            NIK / No. KTP
                                        </label>
                                        <PrimaryInput
                                            type="text"
                                            value={customerInfo.governmentId || ''}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, governmentId: e.target.value })}
                                            placeholder="Masukkan NIK (opsional)"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Diperlukan untuk faktur pajak</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Nomor Telepon
                                        </label>
                                        <PrimaryInput
                                            type="text"
                                            value={user?.phoneNumber || ''}
                                            disabled
                                            className="bg-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Alamat Lengkap <span className="text-red-600">*</span>
                                        </label>
                                        <PrimaryTextArea
                                            value={customerInfo.address || ''}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                            placeholder="Masukkan alamat lengkap pengiriman"
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-gray-600">
                                            Kami akan menghubungi Anda melalui WhatsApp untuk konfirmasi pesanan dan detail pembayaran.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Company Information */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Informasi Perusahaan
                                    </h2>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useCompany}
                                            onChange={(e) => setUseCompany(e.target.checked)}
                                            className="w-5 h-5 text-red-600 rounded focus:ring-red-500 focus:ring-2"
                                        />
                                        <span className="ml-2 text-sm font-semibold text-gray-700">
                                            Atas Nama Perusahaan
                                        </span>
                                    </label>
                                </div>

                                {useCompany && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Nama Perusahaan <span className="text-red-600">*</span>
                                            </label>
                                            <PrimaryInput
                                                type="text"
                                                value={companyInfo.name || ''}
                                                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                                                placeholder="PT. Nama Perusahaan"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                NPWP Perusahaan <span className="text-red-600">*</span>
                                            </label>
                                            <PrimaryInput
                                                type="text"
                                                value={companyInfo.taxId || ''}
                                                onChange={(e) => setCompanyInfo({ ...companyInfo, taxId: e.target.value })}
                                                placeholder="00.000.000.0-000.000"
                                                required
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Diperlukan untuk faktur pajak</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Alamat Perusahaan
                                            </label>
                                            <PrimaryTextArea
                                                value={companyInfo.address || ''}
                                                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                                                placeholder="Alamat lengkap perusahaan"
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Nomor Telepon Perusahaan
                                            </label>
                                            <PrimaryInput
                                                type="text"
                                                value={companyInfo.phoneNumber || ''}
                                                onChange={(e) => setCompanyInfo({ ...companyInfo, phoneNumber: e.target.value })}
                                                placeholder="021-xxxxxxxx"
                                            />
                                        </div>
                                    </div>
                                )}

                                {!useCompany && (
                                    <p className="text-sm text-gray-500 italic">
                                        Centang opsi di atas jika pembelian atas nama perusahaan untuk mendapatkan faktur pajak
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Ringkasan Pesanan
                                </h2>

                                {/* User Discount Badge */}
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-semibold text-green-800">
                                                Diskon Aktif {discountPercentage}%
                                            </p>
                                            <p className="text-xs text-green-600">
                                                Jumlah diskon akan meningkat sesuai misi dan level keanggotaan Anda
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <div>
                                            <span>Subtotal ({totalItems} item)</span>
                                            <p className="text-xs text-gray-500 mt-0.5">Setelah diskon produk</p>
                                        </div>
                                        <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    {discountPercentage > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Diskon Global ({discountPercentage}%)</span>
                                            <span>- Rp {globalDiscountAmount.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-600">
                                        <span>Biaya Pengiriman</span>
                                        <span className="text-sm font-bold text-red-600">GRATIS</span>
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-900">Total</span>
                                            <span className="text-2xl font-bold text-red-600">
                                                Rp {finalPrice.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        {discountPercentage > 0 && (
                                            <p className="text-xs text-green-600 mt-1 text-right">
                                                Hemat Rp {globalDiscountAmount.toLocaleString('id-ID')} dari diskon global
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <PrimaryButton
                                        onClick={handlePayment}
                                        disabled={isProcessing}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isProcessing ? 'Memproses...' : 'Lanjut ke Pembayaran'}
                                    </PrimaryButton>

                                    <SecondaryButton
                                        onClick={() => router.push('/shop')}
                                        className="w-full"
                                        size="md"
                                    >
                                        Lanjut Belanja
                                    </SecondaryButton>
                                </div>

                                <div className="mt-6 pt-6 border-t">
                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                        <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p>
                                            Pesanan Anda akan diproses setelah konfirmasi pembayaran.
                                            Tim kami akan menghubungi Anda untuk detail lebih lanjut.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
