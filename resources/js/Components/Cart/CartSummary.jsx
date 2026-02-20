import { ShoppingCart, Trash2, Check } from 'lucide-react';
import Button from '../UI/Button';
import Card from '../UI/Card';

export default function CartSummary({ items = [], onComplete, onRemoveItem }) {
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (items.length === 0) {
        return (
            <Card className="p-6">
                <div className="text-center py-8">
                    <ShoppingCart size={48} className="mx-auto text-[#D7CCC8] mb-3" />
                    <h3 className="font-bold text-[#3E2723] mb-1">Keranjang Kosong</h3>
                    <p className="text-sm text-[#8D6E63]">Belum ada pesanan</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            {/* Awalan */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#EFEBE9]">
                <ShoppingCart size={20} className="text-[#FF6F00]" />
                <h3 className="font-bold text-[#3E2723] text-lg">Pesanan Kamu</h3>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto scrollbar-cafe">
                {items.map((item, index) => (
                    <div
                        key={item.id || index}
                        className="bg-[#FFF8E1] border border-[#EFEBE9] rounded-lg p-3"
                    >
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                                <p className="font-semibold text-[#3E2723] text-sm">
                                    {item.quantity}x {item.name}
                                </p>
                                {item.custom_request && (
                                    <p className="text-xs text-[#8D6E63] mt-1 bg-white px-2 py-1 rounded inline-block">
                                        📝 {item.custom_request}
                                    </p>
                                )}
                            </div>

                            <div className="text-right flex items-start gap-2">
                                <div>
                                    <p className="text-sm font-bold text-[#FF6F00]">
                                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-xs text-[#8D6E63]">
                                        @Rp {item.price.toLocaleString('id-ID')}
                                    </p>
                                </div>

                                {onRemoveItem && (
                                    <button
                                        onClick={() => onRemoveItem(item)}
                                        className="p-1 text-red-500 hover:bg-red-100 rounded transition"
                                        title="Hapus item"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="border-t-2 border-[#D7CCC8] pt-4 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-[#3E2723]">Total Bayar:</span>
                    <span className="text-2xl font-bold text-[#FF6F00]">
                        Rp {totalPrice.toLocaleString('id-ID')}
                    </span>
                </div>

                {/* Tombol Selesai Order*/}
                {onComplete && (
                    <Button
                        variant="accent"
                        onClick={onComplete}
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <Check size={20} />
                        <span>Selesai & Pesan</span>
                    </Button>
                )}
            </div>
        </Card>
    );
}