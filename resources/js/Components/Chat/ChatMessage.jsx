export default function ChatMessage({ message, isUser }) {
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} fade-in`}>
            <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message}
                </p>
            </div>
        </div>
    );
}