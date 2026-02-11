import { Link } from '@inertiajs/react';
import { Coffee, LogIn } from 'lucide-react';

export default function CafeLayout({ children, showLoginButton = true }) {
    return (
        <div className="min-h-screen bg-pattern-cafe">
            {/* Navbar */}
            <nav className="navbar-cafe">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        {/* Logo & Brand */}
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <Coffee size={32} className="text-[#FF6F00]" />
                            <div>
                                <h1 className="text-2xl font-bold tracking-wide">Cafe Ichal</h1>
                                <p className="text-xs text-[#D7CCC8]">Pesan dengan AI Chatbot</p>
                            </div>
                        </Link>

                        {/* Login Button */}
                        {showLoginButton && (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 px-4 py-2 bg-[#FFF8E1] text-[#3E2723] rounded-lg hover:bg-white transition-colors font-semibold"
                            >
                                <LogIn size={18} />
                                <span>Login Admin</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-[#3E2723] text-[#D7CCC8] py-6 mt-12">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm">
                        © 2026 Cafe Ichal. Made with ☕ and ❤️
                    </p>
                </div>
            </footer>
        </div>
    );
}