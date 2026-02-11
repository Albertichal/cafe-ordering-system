import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus, Check, Clock, Upload, Edit2, Trash2, X } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Modal from '@/Components/UI/Modal';
import MenuItem from '@/Components/Menu/MenuItem';
import axios from 'axios';

export default function Dashboard({ auth }) {
    const [menus, setMenus] = useState({});
    const [pendingOrders, setPendingOrders] = useState([]);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showEditMenu, setShowEditMenu] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [newMenu, setNewMenu] = useState({
        name: '',
        category: 'Makanan Berat',
        description: '',
        price: '',
        image: null,
        status: 'ready'
    });

    useEffect(() => {
        fetchMenus();
        fetchPendingOrders();

        const interval = setInterval(fetchPendingOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchMenus = async () => {
        try {
            const response = await axios.get('/api/menus');
            const grouped = response.data.reduce((acc, menu) => {
                if (!acc[menu.category]) acc[menu.category] = [];
                acc[menu.category].push(menu);
                return acc;
            }, {});
            setMenus(grouped);
        } catch (error) {
            console.error('Error fetching menus:', error);
        }
    };

    const fetchPendingOrders = async () => {
        try {
            const response = await axios.get('/api/orders/pending');
            setPendingOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const toggleMenuStatus = async (menu) => {
        try {
            const newStatus = menu.status === 'ready' ? 'sold' : 'ready';
            await axios.patch(`/admin/menus/${menu.id}/status`, { status: newStatus });
            fetchMenus();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Gagal update status menu!');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (showEditMenu) {
                setSelectedMenu({ ...selectedMenu, image: file });
            } else {
                setNewMenu({ ...newMenu, image: file });
            }

            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleEditClick = (menu) => {
        setSelectedMenu({ ...menu, image: null });
        setImagePreview(menu.image);
        setShowEditMenu(true);
    };

    const handleUpdateMenu = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('name', selectedMenu.name);
            formData.append('category', selectedMenu.category);
            formData.append('description', selectedMenu.description || '');
            formData.append('price', parseInt(selectedMenu.price));

            if (selectedMenu.image) {
                formData.append('image', selectedMenu.image);
            }

            await axios.post(`/admin/menus/${selectedMenu.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-HTTP-Method-Override': 'PUT'
                },
            });

            setShowEditMenu(false);
            setSelectedMenu(null);
            setImagePreview(null);
            fetchMenus();
            alert('Menu berhasil diupdate!');
        } catch (error) {
            console.error('Error updating menu:', error);
            alert('Gagal mengupdate menu!');
        }
    };

    const handleDeleteMenu = async (menu) => {
        if (!confirm(`Yakin mau hapus menu "${menu.name}"?`)) return;

        try {
            await axios.delete(`/admin/menus/${menu.id}`);
            fetchMenus();
            alert('Menu berhasil dihapus!');
        } catch (error) {
            console.error('Error deleting menu:', error);
            alert('Gagal menghapus menu!');
        }
    };

    const handleAddMenu = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('name', newMenu.name);
            formData.append('category', newMenu.category);
            formData.append('description', newMenu.description);
            formData.append('price', parseInt(newMenu.price));
            formData.append('image', newMenu.image);

            await axios.post('/admin/menus', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setShowAddMenu(false);
            setImagePreview(null);
            setNewMenu({
                name: '',
                category: 'Makanan Berat',
                description: '',
                price: '',
                image: null,
                status: 'ready'
            });
            fetchMenus();
            alert('Menu berhasil ditambahkan!');
        } catch (error) {
            console.error('Error adding menu:', error);
            alert('Gagal menambahkan menu!');
        }
    };

    const completeOrder = async (orderId) => {
        if (!confirm('Tandai pesanan ini selesai?')) return;

        try {
            await axios.patch(`/api/orders/${orderId}/status`, { status: 'completed' });
            fetchPendingOrders();
            alert('Pesanan berhasil diselesaikan!');
        } catch (error) {
            console.error('Error completing order:', error);
            alert('Gagal menyelesaikan pesanan!');
        }
    };

    return (
        <AdminLayout
            user={auth.user}
            header={
                <h2 className="font-bold text-2xl text-[#3E2723]">
                    Dashboard Admin - Cafe Ichal
                </h2>
            }
        >
            <Head title="Dashboard Admin" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* LEFT - KELOLA MENU */}
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-[#3E2723]">🍽️ Kelola Menu</h3>
                        <span className="text-sm text-[#8D6E63] font-medium">
                            Total: {Object.values(menus).flat().length} item
                        </span>
                    </div>

                    <div className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 scrollbar-cafe">
                        {Object.entries(menus).map(([category, items]) => (
                            <div key={category} className="fade-in">
                                <h4 className="font-bold text-[#5D4037] mb-3 text-sm uppercase tracking-wide">
                                    {category}
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {items.map(item => (
                                        <MenuItem
                                            key={item.id}
                                            item={item}
                                            showActions={true}
                                            onEdit={handleEditClick}
                                            onDelete={handleDeleteMenu}
                                            onToggleStatus={toggleMenuStatus}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Add Menu Button */}
                        <button
                            onClick={() => setShowAddMenu(true)}
                            className="w-full border-2 border-dashed border-[#D7CCC8] rounded-lg p-6 hover:border-[#FF6F00] hover:bg-[#FFF8E1] transition-all group"
                        >
                            <div className="flex flex-col items-center gap-2 text-[#8D6E63] group-hover:text-[#FF6F00]">
                                <Plus size={32} />
                                <span className="font-semibold">Tambah Menu Baru</span>
                            </div>
                        </button>
                    </div>
                </Card>

                {/* RIGHT - PESANAN AKTIF */}
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-[#3E2723]">📋 Pesanan Aktif</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full pulse-cafe"></div>
                            <span className="text-sm text-[#8D6E63] font-medium">
                                {pendingOrders.length} pesanan
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 scrollbar-cafe">
                        {pendingOrders.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">🍽️</div>
                                <p className="text-[#8D6E63] font-medium">Belum ada pesanan masuk</p>
                                <p className="text-[#D7CCC8] text-sm mt-2">Pesanan akan muncul di sini secara realtime</p>
                            </div>
                        ) : (
                            pendingOrders.map(order => (
                                <div
                                    key={order.id}
                                    className="border-2 border-[#FF6F00] rounded-xl p-4 bg-gradient-to-br from-[#FFF8E1] to-[#EFEBE9] hover:shadow-lg transition-all fade-in"
                                >
                                    {/* Order Header */}
                                    <div className="flex justify-between items-start mb-3 pb-3 border-b border-[#D7CCC8]">
                                        <div>
                                            <p className="font-bold text-[#3E2723] text-lg">
                                                Meja {order.table_number}
                                            </p>
                                            <p className="text-sm text-[#5D4037] font-medium">
                                                {order.customer_name}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Clock size={12} className="text-[#8D6E63]" />
                                                <p className="text-xs text-[#8D6E63]">
                                                    {new Date(order.created_at).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="badge-pending">
                                            ⏳ Baru
                                        </span>
                                    </div>

                                    {/* Order Items */}
                                    <div className="space-y-2 mb-4">
                                        {order.order_items.map(item => (
                                            <div
                                                key={item.id}
                                                className="bg-white rounded-lg p-3 border border-[#EFEBE9]"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-[#3E2723]">
                                                            {item.menu.name}
                                                        </p>
                                                        {item.custom_request && (
                                                            <p className="text-xs text-[#FF6F00] mt-1 bg-[#FFF8E1] px-2 py-1 rounded inline-block">
                                                                📝 {item.custom_request}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right ml-3">
                                                        <p className="text-xs text-[#8D6E63]">
                                                            Qty: {item.quantity}
                                                        </p>
                                                        <p className="text-sm font-bold text-[#3E2723]">
                                                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Footer */}
                                    <div className="border-t-2 border-[#D7CCC8] pt-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-[#8D6E63] mb-1">Total Bayar</p>
                                            <p className="text-xl font-bold text-[#FF6F00]">
                                                Rp {order.total_price.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <Button
                                            variant="accent"
                                            onClick={() => completeOrder(order.id)}
                                            className="flex items-center gap-2"
                                        >
                                            <Check size={18} />
                                            <span>Selesai</span>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            {/* MODAL - ADD MENU */}
            <Modal
                show={showAddMenu}
                onClose={() => {
                    setShowAddMenu(false);
                    setImagePreview(null);
                }}
                title="Tambah Menu Baru"
                maxWidth="md"
            >
                <form onSubmit={handleAddMenu} className="space-y-4">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                            Gambar Menu <span className="text-red-500">*</span>
                        </label>

                        {imagePreview ? (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg border-2 border-[#EFEBE9]"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setNewMenu({ ...newMenu, image: null });
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="w-full h-48 border-2 border-dashed border-[#D7CCC8] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6F00] hover:bg-[#FFF8E1] transition">
                                <Upload size={40} className="text-[#8D6E63] mb-2" />
                                <span className="text-sm text-[#8D6E63] font-medium">Click to upload image</span>
                                <span className="text-xs text-[#D7CCC8] mt-1">JPG, PNG, WEBP (Max 2MB)</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    required
                                />
                            </label>
                        )}
                    </div>

                    <Input
                        label="Nama Menu"
                        required
                        value={newMenu.name}
                        onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
                        placeholder="Contoh: Nasi Goreng Spesial"
                    />

                    <div>
                        <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                            Kategori <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={newMenu.category}
                            onChange={(e) => setNewMenu({ ...newMenu, category: e.target.value })}
                            className="input-cafe"
                        >
                            <option>Makanan Berat</option>
                            <option>Minuman</option>
                        </select>
                    </div>

                    <Input
                        label="Harga (Rp)"
                        type="number"
                        required
                        value={newMenu.price}
                        onChange={(e) => setNewMenu({ ...newMenu, price: e.target.value })}
                        placeholder="25000"
                        min="0"
                    />

                    <div>
                        <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                            Deskripsi (Optional)
                        </label>
                        <textarea
                            value={newMenu.description}
                            onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
                            className="input-cafe resize-none"
                            rows="3"
                            placeholder="Deskripsi singkat menu..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setShowAddMenu(false);
                                setImagePreview(null);
                            }}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                        >
                            Tambah Menu
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL - EDIT MENU */}
            <Modal
                show={showEditMenu}
                onClose={() => {
                    setShowEditMenu(false);
                    setSelectedMenu(null);
                    setImagePreview(null);
                }}
                title="Edit Menu"
                maxWidth="md"
            >
                {selectedMenu && (
                    <form onSubmit={handleUpdateMenu} className="space-y-4">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                                Gambar Menu
                            </label>

                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg border-2 border-[#EFEBE9]"
                                />
                                <label className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition cursor-pointer">
                                    <Edit2 size={16} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-[#8D6E63] mt-1">Klik icon edit untuk ganti gambar</p>
                        </div>

                        <Input
                            label="Nama Menu"
                            required
                            value={selectedMenu.name}
                            onChange={(e) => setSelectedMenu({ ...selectedMenu, name: e.target.value })}
                        />

                        <div>
                            <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                                Kategori <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedMenu.category}
                                onChange={(e) => setSelectedMenu({ ...selectedMenu, category: e.target.value })}
                                className="input-cafe"
                            >
                                <option>Makanan Berat</option>
                                <option>Minuman</option>
                            </select>
                        </div>

                        <Input
                            label="Harga (Rp)"
                            type="number"
                            required
                            value={selectedMenu.price}
                            onChange={(e) => setSelectedMenu({ ...selectedMenu, price: e.target.value })}
                            min="0"
                        />

                        <div>
                            <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                                Deskripsi (Optional)
                            </label>
                            <textarea
                                value={selectedMenu.description || ''}
                                onChange={(e) => setSelectedMenu({ ...selectedMenu, description: e.target.value })}
                                className="input-cafe resize-none"
                                rows="3"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setShowEditMenu(false);
                                    setSelectedMenu(null);
                                    setImagePreview(null);
                                }}
                                className="flex-1"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="accent"
                                className="flex-1"
                            >
                                Update Menu
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </AdminLayout>
    );
}