import { X } from 'lucide-react';

export default function Modal({ show, onClose, title, children, maxWidth = 'md' }) {
    if (!show) return null;

    const widths = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/**/}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className={`relative w-full ${widths[maxWidth]} bg-white rounded-2xl shadow-2xl transform transition-all fade-in`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Homepage */}
                    <div className="flex items-center justify-between p-6 border-b border-[#EFEBE9]">
                        <h3 className="text-2xl font-bold text-[#3E2723]">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-[#8D6E63] hover:text-[#5D4037] transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Konten */}
                    <div className="p-6">{children}</div>
                </div>
            </div>
        </div>
    );
}