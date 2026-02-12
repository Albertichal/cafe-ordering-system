import { Head, useForm } from '@inertiajs/react';
import { Coffee, Mail, Lock, LogIn } from 'lucide-react';
import Input from '@/Components/UI/Input';
import Button from '@/Components/UI/Button';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login Admin - Cafe Ichal" />

            <div className="min-h-screen bg-pattern-cafe flex items-center justify-center p-6">
                {/* Login Card */}
                <div className="w-full max-w-md fade-in">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#3E2723] rounded-full mb-4 shadow-lg">
                            <Coffee size={40} className="text-[#FF6F00]" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#3E2723] mb-2 text-shadow-cafe">
                            Cafe Amja
                        </h1>
                        <p className="text-[#8D6E63] font-medium">Admin Panel</p>
                    </div>

                    {/* Login Form Card */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-[#EFEBE9]">
                        <h2 className="text-2xl font-bold text-[#3E2723] mb-6 text-center">
                            Login ke Dashboard
                        </h2>

                        {/* Status Message */}
                        {status && (
                            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
                                {status}
                            </div>
                        )}

                        {/* General Error */}
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                                <strong>Login Gagal!</strong>
                                <ul className="mt-1 list-disc list-inside">
                                    {Object.values(errors).map((error, idx) => (
                                        <li key={idx}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8D6E63]" size={20} />
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`input-cafe pl-11 ${errors.email ? 'border-red-500' : ''}`}
                                        placeholder="admin@cafeichal.com"
                                        autoFocus
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8D6E63]" size={20} />
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`input-cafe pl-11 ${errors.password ? 'border-red-500' : ''}`}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 text-[#FF6F00] bg-gray-100 border-[#D7CCC8] rounded focus:ring-[#FF6F00]"
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-[#5D4037] font-medium cursor-pointer">
                                    Ingat saya
                                </label>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <LogIn size={20} />
                                <span>{processing ? 'Logging in...' : 'Login'}</span>
                            </Button>
                        </form>

                        {/* Info Text */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-[#8D6E63]">
                                Lupa password? Hubungi administrator
                            </p>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center mt-6">
                        <a
                            href="/"
                            className="text-sm text-[#5D4037] hover:text-[#3E2723] font-semibold transition-colors"
                        >
                            ← Kembali ke Menu Customer
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}