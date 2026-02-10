export default function Card({ children, className = '', hover = false, ...props }) {
    return (
        <div
            className={`card-cafe ${hover ? 'hover:scale-[1.02] transition-transform' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}