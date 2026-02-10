export default function Input({
    type = 'text',
    label,
    error,
    className = '',
    required = false,
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type={type}
                className={`input-cafe ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
                {...props}
            />
            {error && (
                <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
            )}
        </div>
    );
}