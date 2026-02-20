import { ImageIcon } from 'lucide-react';

export default function MenuItem({ item, onClick, showActions = false, onEdit, onDelete, onToggleStatus }) {
    return (
        <div className={`card-menu p-4 ${item.status === 'sold' ? 'opacity-60 bg-gray-50' : ''}`}>
            {/* Gambar */}
            <div className="mb-3 rounded-lg overflow-hidden bg-[#EFEBE9] aspect-square flex items-center justify-center">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <ImageIcon size={48} className="text-[#D7CCC8]" />
                )}
            </div>

            {/* Info */}
            <div className="space-y-2">
                <h4 className="font-bold text-[#3E2723] text-sm line-clamp-1">
                    {item.name}
                </h4>

                <p className="text-[#FF6F00] font-bold text-base">
                    Rp {item.price.toLocaleString('id-ID')}
                </p>

                {/* Status */}
                <div className="flex items-center justify-between">
                    <span className={item.status === 'ready' ? 'badge-ready' : 'badge-sold'}>
                        {item.status === 'ready' ? '✓ Ready' : '✗ Sold Out'}
                    </span>

                    {/* Tombol AKsi (cmn atmin) */}
                    {showActions && (
                        <div className="flex gap-1">
                            <button
                                onClick={() => onEdit(item)}
                                className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                                title="Edit"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => onDelete(item)}
                                className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                                title="Hapus"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Toggle Tombol Status (Admin) */}
                {showActions && onToggleStatus && (
                    <button
                        onClick={() => onToggleStatus(item)}
                        className={`w-full mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${item.status === 'ready'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                    >
                        {item.status === 'ready' ? 'Mark as Sold' : 'Mark as Ready'}
                    </button>
                )}
            </div>

            {/* Aksi Klik Customer */}
            {onClick && !showActions && (
                <button
                    onClick={() => onClick(item)}
                    className="w-full mt-3 btn-accent text-sm py-2"
                    disabled={item.status === 'sold'}
                >
                    {item.status === 'ready' ? 'Pesan' : 'Habis'}
                </button>
            )}
        </div>
    );
}