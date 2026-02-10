import MenuItem from './MenuItem';

export default function MenuGrid({ menus, showActions = false, onEdit, onDelete, onToggleStatus, onItemClick }) {
    if (!menus || Object.keys(menus).length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-[#8D6E63] text-lg">Belum ada menu tersedia</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {Object.entries(menus).map(([category, items]) => (
                <div key={category} className="fade-in">
                    {/* Category Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-[#D7CCC8]"></div>
                        <h3 className="text-xl font-bold text-[#3E2723] uppercase tracking-wide">
                            {category}
                        </h3>
                        <div className="flex-1 h-px bg-[#D7CCC8]"></div>
                    </div>

                    {/* Menu Items Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {items.map((item) => (
                            <MenuItem
                                key={item.id}
                                item={item}
                                showActions={showActions}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onToggleStatus={onToggleStatus}
                                onClick={onItemClick}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}