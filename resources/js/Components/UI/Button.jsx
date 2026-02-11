export default function Button({ 
    type = 'button', 
    variant = 'primary', 
    children, 
    className = '', 
    disabled = false,
    onClick,
    ...props 
}) {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        accent: 'btn-accent',
        danger: 'btn-danger',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${variants[variant]} ${className} ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            {...props}
        >
            {children}
        </button>
    );
}