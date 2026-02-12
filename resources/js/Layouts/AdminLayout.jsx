import { Link } from '@inertiajs/react';
import { Coffee, LogOut, LayoutDashboard } from 'lucide-react';

export default function AdminLayout({ user, header, children }) {
    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            {/* Admin Navbar */}
            <nav className="navbar-cafe">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        {/* Logo & Brand */}
                        <div className="flex items-center gap-4">
                            <Coffee size={28} className="text-[#FF6F00]" />
                            <div>
                                <h1 className="text-xl font-bold">Cafe AMJA</h1>
                                <p className="text-xs text-[#D7CCC8]">Admin Panel</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center gap-6">
                            <Link
                                href={route('dashboard')}
                                className="flex items-center gap-2 text-white hover:text-[#FF6F00] transition-colors font-semibold"
                            >
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </Link>

                            {/* User Dropdown */}
                            <div className="flex items-center gap-4 pl-6 border-l border-[#5D4037]">
                                <span className="text-sm text-[#D7CCC8]">
                                    Halo, <span className="font-semibold text-white">{user?.name}</span>
                                </span>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex items-center gap-2 px-4 py-2 bg-[#5D4037] hover:bg-[#8D6E63] rounded-lg transition-colors text-sm font-semibold"
                                >
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Header */}
            {header && (
                <header className="bg-white shadow-sm border-b border-[#EFEBE9]">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        {header}
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
}