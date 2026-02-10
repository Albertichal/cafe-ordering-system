import { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import ChatMessage from './ChatMessage';
import Button from '../UI/Button';

export default function ChatBox({
    messages,
    onSendMessage,
    isLoading = false,
    pendingDrink = null,
    onQuickReply
}) {
    const [inputMessage, setInputMessage] = useState('');
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [voiceSupported, setVoiceSupported] = useState(true);

    const chatEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);

    // Auto scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, interimTranscript]);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setVoiceSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;

        let finalTranscript = '';

        recognition.onresult = (event) => {
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interim += transcript;
                }
            }

            setInterimTranscript(interim);
            clearTimeout(silenceTimerRef.current);

            silenceTimerRef.current = setTimeout(() => {
                if (finalTranscript.trim()) {
                    const cleanedText = finalTranscript.trim();
                    setInputMessage(cleanedText);
                    setInterimTranscript('');
                    finalTranscript = '';
                    recognition.stop();
                    setIsListening(false);
                    setTimeout(() => handleSendMessage(cleanedText), 100);
                }
            }, 3000);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            setInterimTranscript('');
            clearTimeout(silenceTimerRef.current);
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimTranscript('');
            clearTimeout(silenceTimerRef.current);
        };

        recognition.onstart = () => {
            finalTranscript = '';
            setInterimTranscript('');
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            clearTimeout(silenceTimerRef.current);
        };
    }, []);

    // Text-to-Speech
    const speak = (text) => {
        window.speechSynthesis.cancel();

        const cleanText = text
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
            .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
            .replace(/[\u{2600}-\u{26FF}]/gu, '')
            .replace(/[\u{2700}-\u{27BF}]/gu, '')
            .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
            .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
            .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
            .replace(/[\u{FE0F}]/gu, '')
            .replace(/[\u{200D}]/gu, '')
            .replace(/:\)|:\(|:D|:P|;\)|:\/|:\||XD|xD/gi, '')
            .replace(/:-\)|:-\(|:-D|:-P|;-\)|:-\/|:-\|/gi, '')
            .replace(/\^_\^|\^-\^|\^o\^|o_o|O_O|T_T|>_</gi, '')
            .replace(/[✓✗🗑️☕📝👍❌✅]/g, '')
            .replace(/\n+/g, '. ')
            .replace(/\s+/g, ' ')
            .trim();

        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'id-ID';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const startVoiceRecording = () => {
        if (!voiceSupported) {
            alert('Browser tidak support voice recognition');
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            setInterimTranscript('');
            clearTimeout(silenceTimerRef.current);
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (error) {
                console.error('Error starting recognition:', error);
            }
        }
    };

    const handleSendMessage = (voiceText = null) => {
        const messageText = voiceText || inputMessage;
        if (!messageText.trim()) return;

        onSendMessage(messageText);
        setInputMessage('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSendMessage();
    };

    // Auto-speak AI responses
    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'assistant' && isVoiceMode) {
                speak(lastMessage.content);
            }
        }
    }, [messages, isVoiceMode]);

    return (
        <div className="card-cafe flex flex-col h-[500px]">
            {/* Header */}
            <div className="p-4 bg-[#3E2723] text-white rounded-t-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg">AI Assistant</h3>
                        <p className="text-xs text-[#D7CCC8]">Chat untuk memesan</p>
                    </div>

                    {/* Voice Toggle */}
                    <button
                        onClick={() => {
                            setIsVoiceMode(!isVoiceMode);
                            if (isVoiceMode) {
                                stopSpeaking();
                                if (isListening) recognitionRef.current?.stop();
                            }
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isVoiceMode
                                ? 'bg-white text-[#3E2723]'
                                : 'bg-[#5D4037] text-white hover:bg-[#8D6E63]'
                            }`}
                        disabled={!voiceSupported}
                    >
                        {isVoiceMode ? <MicOff size={14} /> : <Mic size={14} />}
                        {isVoiceMode ? 'Voice ON' : 'Voice OFF'}
                    </button>
                </div>

                {/* Status Indicators */}
                {(isListening || isSpeaking) && (
                    <div className="mt-2 text-xs flex items-center gap-3">
                        {isListening && (
                            <span className="flex items-center gap-1 animate-pulse">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                Recording...
                            </span>
                        )}
                        {isSpeaking && (
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full pulse-cafe"></span>
                                Speaking...
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-cafe">
                {messages.map((msg, idx) => (
                    <ChatMessage
                        key={idx}
                        message={msg.content}
                        isUser={msg.role === 'user'}
                    />
                ))}

                {/* Interim Transcript */}
                {isListening && interimTranscript && (
                    <div className="flex justify-end">
                        <div className="bg-[#FFA726]/30 text-[#3E2723] px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] italic">
                            {interimTranscript}...
                        </div>
                    </div>
                )}

                {/* Quick Reply Buttons */}
                {pendingDrink && !isLoading && (
                    <div className="flex justify-center fade-in">
                        <div className="bg-[#EFEBE9] border-2 border-[#D7CCC8] rounded-lg p-3">
                            <p className="text-xs text-[#5D4037] mb-2 text-center font-semibold">Pilih varian:</p>
                            <div className="flex gap-2">
                                <Button
                                    variant="danger"
                                    onClick={() => onQuickReply('hot')}
                                    className="text-sm !py-2"
                                >
                                    🔥 Hot
                                </Button>
                                <Button
                                    variant="accent"
                                    onClick={() => onQuickReply('warm')}
                                    className="text-sm !py-2 !bg-yellow-500 hover:!bg-yellow-600"
                                >
                                    ☀️ Warm
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => onQuickReply('ice')}
                                    className="text-sm !py-2 !bg-blue-500 hover:!bg-blue-600"
                                >
                                    ❄️ Ice
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-[#EFEBE9] px-4 py-2 rounded-2xl">
                            <span className="animate-pulse">Mengetik...</span>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#EFEBE9]">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    {/* Voice Button */}
                    {isVoiceMode && (
                        <button
                            type="button"
                            onClick={startVoiceRecording}
                            disabled={isLoading || isSpeaking}
                            className={`p-3 rounded-lg transition flex-shrink-0 ${isListening
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'bg-[#FF6F00] text-white hover:bg-[#FFA726]'
                                }`}
                        >
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                    )}

                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={isVoiceMode ? "Atau ketik pesan..." : "Ketik pesanan kamu..."}
                        className="input-cafe !py-2"
                        disabled={isLoading || isListening}
                    />

                    <button
                        type="submit"
                        disabled={isLoading || isListening}
                        className="btn-primary !px-4 !py-2"
                    >
                        <Send size={20} />
                    </button>
                </form>

                {/* Stop Speaking */}
                {isSpeaking && (
                    <button
                        onClick={stopSpeaking}
                        className="w-full mt-2 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200 transition"
                    >
                        Stop Speaking
                    </button>
                )}

                {/* Voice Hint */}
                {isVoiceMode && !isListening && !isSpeaking && (
                    <p className="text-xs text-[#8D6E63] text-center mt-2">
                        Klik mic untuk pesan dengan suara (auto-send setelah 3 detik diam)
                    </p>
                )}
            </div>
        </div>
    );
}