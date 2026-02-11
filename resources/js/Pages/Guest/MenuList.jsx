import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import CafeLayout from '@/Layouts/CafeLayout';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import MenuGrid from '@/Components/Menu/MenuGrid';
import ChatBox from '@/Components/Chat/ChatBox';
import CartSummary from '@/Components/Cart/CartSummary';
import axios from 'axios';

export default function MenuList({ menus }) {
    const [customerName, setCustomerName] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [isStarted, setIsStarted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [pendingDrink, setPendingDrink] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = () => {
        if (customerName && tableNumber) {
            setIsStarted(true);
            const welcomeMsg = `Halo ${customerName}! Selamat datang di Cafe Ichal. Meja nomor ${tableNumber} ya. Mau pesan apa nih?`;
            setMessages([
                {
                    role: 'assistant',
                    content: welcomeMsg
                }
            ]);
        }
    };

    const handleSendMessage = async (messageText) => {
        if (!messageText.trim()) return;

        const userMsg = { role: 'user', content: messageText };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await axios.post('/api/chat', {
                message: messageText,
                current_cart: selectedItems,
                conversation_history: messages
            });

            const aiMsg = {
                role: 'assistant',
                content: response.data.response
            };
            setMessages(prev => [...prev, aiMsg]);

            const autoConfirm = response.data.auto_confirm || false;

            // Handle cart actions
            if (response.data.cart_action) {
                if (response.data.cart_action === 'clear') {
                    setSelectedItems([]);
                    setPendingDrink(null);
                } else if (response.data.cart_action === 'update' && response.data.updated_cart) {
                    const updatedItems = response.data.updated_cart.map(item => ({
                        ...item,
                        id: item.id || (Date.now() + Math.random())
                    }));
                    setSelectedItems(updatedItems);
                }
            }

            // Handle pending drink
            if (response.data.pending_drink) {
                setPendingDrink(response.data.pending_drink);
            }

            // Auto-confirm - langsung masukkan ke cart
            if (response.data.detected_items && response.data.detected_items.length > 0) {
                if (autoConfirm) {
                    setSelectedItems(prev => {
                        const updated = [...prev];

                        response.data.detected_items.forEach(newItem => {
                            const existingIndex = updated.findIndex(item =>
                                item.menu_id === newItem.menu_id &&
                                item.custom_request === newItem.custom_request
                            );

                            if (existingIndex !== -1) {
                                updated[existingIndex] = {
                                    ...updated[existingIndex],
                                    quantity: updated[existingIndex].quantity + newItem.quantity
                                };
                            } else {
                                updated.push({
                                    id: Date.now() + Math.random(),
                                    ...newItem
                                });
                            }
                        });

                        return updated;
                    });

                    setPendingDrink(null);
                }
            }

        } catch (error) {
            console.error('Error:', error);
            const errorMsg = {
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan. Silahkan coba lagi.'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickReply = (variant) => {
        handleSendMessage(variant);
    };

    const handleCompleteOrder = async () => {
        if (selectedItems.length === 0) {
            alert('Belum ada pesanan!');
            return;
        }

        try {
            const orderData = {
                customer_name: customerName,
                table_number: tableNumber,
                items: selectedItems.map(item => ({
                    menu_id: item.menu_id,
                    quantity: item.quantity,
                    custom_request: item.custom_request,
                    price: item.price
                }))
            };

            const response = await axios.post('/api/orders', orderData);

            if (response.data.success) {
                alert('Pesanan berhasil dibuat! Silahkan tunggu ya');
                setSelectedItems([]);
                setPendingDrink(null);
                setMessages([]);
                setIsStarted(false);
                setCustomerName('');
                setTableNumber('');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal membuat pesanan. Silahkan coba lagi.');
        }
    };

    return (
        <CafeLayout>
            <Head title="Menu - Cafe Ichal" />

            {!isStarted ? (
                /* FORM MULAI PESANAN */
                <div className="max-w-md mx-auto fade-in">
                    <Card className="p-8">
                        {/* Icon */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF6F00] rounded-full mb-4">
                                <UtensilsCrossed size={32} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#3E2723] mb-2">
                                Mulai Pesanan
                            </h2>
                            <p className="text-sm text-[#8D6E63]">
                                Isi data dulu sebelum pesan
                            </p>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            <Input
                                label="Nama Pelanggan"
                                required
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Masukkan nama kamu"
                            />

                            <Input
                                label="Nomor Meja"
                                required
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                placeholder="Contoh: 5"
                            />

                            <Button
                                variant="primary"
                                onClick={handleStart}
                                disabled={!customerName || !tableNumber}
                                className="w-full"
                            >
                                Mulai Pesan
                            </Button>
                        </div>
                    </Card>
                </div>
            ) : (
                /* MAIN ORDERING INTERFACE */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT - MENU LIST */}
                    <div className="lg:col-span-2">
                        <Card className="p-6">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-[#3E2723] mb-3">
                                    Menu Tersedia
                                </h2>
                                <div className="bg-[#FFF8E1] border-l-4 border-[#FF6F00] p-4 rounded-lg">
                                    <p className="font-semibold text-[#3E2723] mb-2">📋 Cara Pesan:</p>
                                    <ul className="text-sm text-[#5D4037] space-y-1">
                                        <li>• <b>Pesan minuman:</b> "mau teh obeng" (AI tanya varian)</li>
                                        <li>• <b>Dengan varian:</b> "kopi susu ice 2" (langsung masuk)</li>
                                        <li>• <b>Pesan makanan:</b> "ayam bakar 2" (langsung masuk)</li>
                                        <li>• <b>Setuju rekomendasi:</b> "boleh tuh" (langsung masuk)</li>
                                        <li>• <b>Kurangi:</b> "kurangin nasi putih 1"</li>
                                        <li>• <b>Hapus:</b> "hapus ayam bakar"</li>
                                    </ul>
                                    <p className="text-xs text-[#FF6F00] mt-2 font-bold">
                                        ✨ Pesanan langsung masuk ke cart tanpa konfirmasi!
                                    </p>
                                </div>
                            </div>

                            <MenuGrid menus={menus} />
                        </Card>
                    </div>

                    {/* RIGHT - CHAT & CART */}
                    <div className="space-y-4">
                        {/* Chatbot */}
                        <ChatBox
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            isLoading={isLoading}
                            pendingDrink={pendingDrink}
                            onQuickReply={handleQuickReply}
                        />

                        {/* Cart */}
                        <CartSummary
                            items={selectedItems}
                            onComplete={handleCompleteOrder}
                        />
                    </div>
                </div>
            )}
        </CafeLayout>
    );
}