import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { Send, LogIn, Mic, MicOff } from 'lucide-react';
import axios from 'axios';

export default function HomePage({ menus }) {
    const [customerName, setCustomerName] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [isStarted, setIsStarted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [pendingDrink, setPendingDrink] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // ✅ Voice feature states
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(true);
    
    // ✅ NEW: Interim transcript for real-time feedback
    const [interimTranscript, setInterimTranscript] = useState('');
    
    const chatEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null); // ✅ NEW: Timer untuk deteksi silence

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ✅ IMPROVED: Initialize Speech Recognition dengan settings yang lebih baik
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            setVoiceSupported(false);
            console.warn('Browser tidak support Speech Recognition');
            return;
        }

        const recognition = new SpeechRecognition();
        
        // ✅ IMPROVED SETTINGS untuk akurasi lebih baik
        recognition.lang = 'id-ID'; // Bahasa Indonesia
        recognition.continuous = true; // ✅ CHANGED: Continuous mode untuk capture lebih baik
        recognition.interimResults = true; // ✅ CHANGED: Show interim results untuk feedback
        recognition.maxAlternatives = 3; // ✅ NEW: Get multiple alternatives untuk akurasi lebih baik

        let finalTranscript = '';

        // ✅ Event: Hasil speech recognition (real-time)
        recognition.onresult = (event) => {
            let interim = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                    console.log('Final transcript:', transcript);
                } else {
                    interim += transcript;
                }
            }
            
            // Show interim transcript untuk feedback visual
            setInterimTranscript(interim);
            
            // ✅ NEW: Reset silence timer setiap ada hasil baru
            clearTimeout(silenceTimerRef.current);
            
            // ✅ NEW: Tunggu 3 detik silence sebelum auto-send
            silenceTimerRef.current = setTimeout(() => {
                if (finalTranscript.trim()) {
                    console.log('3 seconds silence detected, sending:', finalTranscript);
                    const cleanedText = finalTranscript.trim();
                    setInputMessage(cleanedText);
                    setInterimTranscript('');
                    finalTranscript = '';
                    
                    // Stop recognition
                    recognition.stop();
                    setIsListening(false);
                    
                    // Auto send message setelah 100ms
                    setTimeout(() => {
                        handleSendMessage(cleanedText);
                    }, 100);
                }
            }, 3000); // ✅ 3 detik delay
        };

        // ✅ Event: Recognition error
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            setInterimTranscript('');
            clearTimeout(silenceTimerRef.current);
            
            if (event.error === 'no-speech') {
                // Jangan alert, just stop
                console.log('No speech detected');
            } else if (event.error === 'network') {
                alert('Koneksi internet bermasalah. Periksa koneksi kamu.');
            } else if (event.error === 'aborted') {
                // Normal abort, jangan alert
                console.log('Recognition aborted');
            } else {
                alert('Terjadi kesalahan: ' + event.error);
            }
        };

        // ✅ Event: Recognition end
        recognition.onend = () => {
            console.log('Recognition ended');
            setIsListening(false);
            setInterimTranscript('');
            clearTimeout(silenceTimerRef.current);
        };

        // ✅ Event: Recognition start
        recognition.onstart = () => {
            console.log('Recognition started');
            finalTranscript = '';
            setInterimTranscript('');
        };

        recognitionRef.current = recognition;

        // Cleanup
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            clearTimeout(silenceTimerRef.current);
        };
    }, []);

    // ✅ IMPROVED: Text-to-Speech dengan cleaning yang lebih baik
    const speak = (text) => {
        window.speechSynthesis.cancel();
        
        // ✅ Aggressive cleaning untuk remove semua emoji dan emoticon
        const cleanText = text
            // Remove ALL emoji menggunakan Unicode ranges
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
            .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
            .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
            .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
            .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
            .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
            .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols Extended-A
            .replace(/[\u{FE0F}]/gu, '')             // Variation Selectors
            .replace(/[\u{200D}]/gu, '')             // Zero Width Joiner
            // ✅ NEW: Remove text emoticons
            .replace(/:\)|:\(|:D|:P|;\)|:\/|:\||XD|xD/gi, '')
            .replace(/:-\)|:-\(|:-D|:-P|;-\)|:-\/|:-\|/gi, '')
            .replace(/\(\:|\)\:|D\:|P\:|\(;|\/\:||\:/gi, '')
            .replace(/\^_\^|\^-\^|\^o\^|o_o|O_O|T_T|>_</gi, '')
            // Remove special characters
            .replace(/[✓✗🗑️☕📝👍❌✅]/g, '')
            // Clean up spacing
            .replace(/\n+/g, '. ')
            .replace(/\s+/g, ' ')
            .trim();
        
        if (!cleanText) {
            console.log('Text kosong setelah dibersihkan, skip speaking');
            return;
        }
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'id-ID';
        utterance.rate = 0.95; // ✅ Slightly slower untuk lebih jelas
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
            setIsSpeaking(true);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    // ✅ IMPROVED: Start/Stop Voice Recording
    const startVoiceRecording = () => {
        if (!voiceSupported) {
            alert('Browser kamu tidak support voice recognition. Gunakan Chrome/Edge ya!');
            return;
        }

        if (isListening) {
            // Stop recording
            recognitionRef.current?.stop();
            setIsListening(false);
            setInterimTranscript('');
            clearTimeout(silenceTimerRef.current);
        } else {
            // Start recording
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (error) {
                console.error('Error starting recognition:', error);
                // Jangan alert kalau error 'already started'
                if (error.message && !error.message.includes('already')) {
                    alert('Gagal memulai voice recording. Coba lagi ya!');
                }
            }
        }
    };

    // ✅ Stop speaking
    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const handleStart = () => {
        if (customerName && tableNumber) {
            setIsStarted(true);
            const welcomeMsg = `Halo ${customerName}! Selamat datang di Cafe Ichal. Meja nomor ${tableNumber} ya. Mau pesan apa nih?`;
            setMessages([
                {
                    role: 'assistant',
                    content: welcomeMsg
                }
            ]);
            
            speak(welcomeMsg);
        }
    };

    const handleSendMessage = async (voiceText = null) => {
        const messageText = voiceText || inputMessage;
        
        if (!messageText.trim()) return;

        const userMsg = { role: 'user', content: messageText };
        setMessages(prev => [...prev, userMsg]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await axios.post('/api/chat', {
                message: messageText,
                current_cart: selectedItems,
                conversation_history: messages
            });

            const aiMsg = {
                role: 'assistant',
                content: response.data.response
            };
            setMessages(prev => [...prev, aiMsg]);

            // ✅ SELALU speak AI response
            speak(response.data.response);

            // ✅ NEW: Auto-confirm logic
            const autoConfirm = response.data.auto_confirm || false;

            // Handle cart actions
            if (response.data.cart_action) {
                if (response.data.cart_action === 'clear') {
                    setSelectedItems([]);
                    setPendingDrink(null);
                } else if (response.data.cart_action === 'update' && response.data.updated_cart) {
                    const updatedItems = response.data.updated_cart.map(item => ({
                        ...item,
                        id: item.id || (Date.now() + Math.random())
                    }));
                    setSelectedItems(updatedItems);
                }
            }
            
            // Handle pending drink
            if (response.data.pending_drink) {
                setPendingDrink(response.data.pending_drink);
            }

            // ✅ NEW: Auto-confirm - langsung masukkan ke cart tanpa tombol konfirmasi
            if (response.data.detected_items && response.data.detected_items.length > 0) {
                if (autoConfirm) {
                    // LANGSUNG masukkan ke cart
                    setSelectedItems(prev => {
                        const updated = [...prev];

                        response.data.detected_items.forEach(newItem => {
                            const existingIndex = updated.findIndex(item => 
                                item.menu_id === newItem.menu_id && 
                                item.custom_request === newItem.custom_request
                            );

                            if (existingIndex !== -1) {
                                updated[existingIndex] = {
                                    ...updated[existingIndex],
                                    quantity: updated[existingIndex].quantity + newItem.quantity
                                };
                            } else {
                                updated.push({
                                    id: Date.now() + Math.random(),
                                    ...newItem
                                });
                            }
                        });

                        return updated;
                    });
                    
                    setPendingDrink(null);
                } else {
                    // Legacy: masih pakai pending (tidak akan terjadi karena AI sekarang selalu set auto_confirm: true)
                    // Kept for backward compatibility
                    console.warn('Auto-confirm is false, this should not happen with new AI logic');
                }
            }

        } catch (error) {
            console.error('Error:', error);
            const errorMsg = {
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan. Silahkan coba lagi.'
            };
            setMessages(prev => [...prev, errorMsg]);
            speak('Maaf, terjadi kesalahan. Silahkan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteOrder = async () => {
        if (selectedItems.length === 0) {
            alert('Belum ada pesanan!');
            return;
        }

        try {
            const orderData = {
                customer_name: customerName,
                table_number: tableNumber,
                items: selectedItems.map(item => ({
                    menu_id: item.menu_id,
                    quantity: item.quantity,
                    custom_request: item.custom_request,
                    price: item.price
                }))
            };

            const response = await axios.post('/api/orders', orderData);

            if (response.data.success) {
                alert('Pesanan berhasil dibuat! Silahkan tunggu ya');
                setSelectedItems([]);
                setPendingDrink(null);
                setMessages([]);
                setIsStarted(false);
                setCustomerName('');
                setTableNumber('');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal membuat pesanan. Silahkan coba lagi.');
        }
    };

    // ✅ Quick reply buttons untuk varian minuman
    const handleQuickReply = (variant) => {
        setInputMessage(variant);
        setTimeout(() => {
            handleSendMessage(variant);
        }, 100);
    };

    const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <>
            <Head title="Cafe Ichal - Order Online" />

            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-orange-600">Cafe Ichal</h1>
                            <p className="text-sm text-gray-600">Pesan dengan AI Chatbot</p>
                        </div>
                        <a
                            href="/login"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        >
                            <LogIn size={18} />
                            <span>Login Admin</span>
                        </a>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {!isStarted ? (
                        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-center mb-6">Mulai Pesanan</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Nama Pelanggan</label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Masukkan nama kamu"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Nomor Meja</label>
                                    <input
                                        type="text"
                                        value={tableNumber}
                                        onChange={(e) => setTableNumber(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Contoh: 5"
                                    />
                                </div>
                                <button
                                    onClick={handleStart}
                                    disabled={!customerName || !tableNumber}
                                    className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Mulai Pesan
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Menu List */}
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold mb-2">Menu Tersedia</h2>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p className="font-semibold">Cara Pesan:</p>
                                        <ul className="list-disc list-inside space-y-1 ml-2">
                                            <li><b>Pesan minuman:</b> "mau teh obeng" (AI tanya varian)</li>
                                            <li><b>Dengan varian:</b> "kopi susu ice 2" (langsung masuk)</li>
                                            <li><b>Pesan makanan:</b> "ayam bakar 2" (langsung masuk)</li>
                                            <li><b>Setuju rekomendasi:</b> "boleh tuh" / "yauda mau" (langsung masuk)</li>
                                            <li><b>Kurangi:</b> "kurangin nasi putih 1"</li>
                                            <li><b>Hapus:</b> "hapus ayam bakar"</li>
                                        </ul>
                                        <p className="text-xs text-orange-600 mt-2 font-semibold">Pesanan langsung masuk ke cart tanpa perlu konfirmasi!</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {Object.entries(menus).map(([category, items]) => (
                                        <div key={category}>
                                            <h3 className="font-semibold text-gray-700 mb-3">{category}</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {items.map(item => (
                                                    <div
                                                        key={item.id}
                                                        className={`border rounded-lg p-4 ${item.status === 'sold'
                                                                ? 'opacity-50 bg-gray-50'
                                                                : 'hover:shadow-md transition'
                                                            }`}
                                                    >
                                                        <div className="mb-2">
                                                            {item.image.startsWith('/storage/') || item.image.startsWith('http') ? (
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    className="w-full h-24 object-cover rounded-lg"
                                                                />
                                                            ) : (
                                                                <div className="text-4xl text-center">{item.image}</div>
                                                            )}
                                                        </div>
                                                        <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
                                                        <p className="text-orange-600 font-bold text-sm">
                                                            Rp {item.price.toLocaleString('id-ID')}
                                                        </p>
                                                        {item.status === 'sold' && (
                                                            <span className="inline-block mt-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                                                Habis
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Chat & Cart */}
                            <div className="space-y-4">
                                {/* Chat Interface */}
                                <div className="bg-white rounded-xl shadow-lg flex flex-col h-[400px]">
                                    <div className="p-4 border-b bg-orange-500 text-white rounded-t-xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold">AI Assistant</h3>
                                                <p className="text-xs opacity-90">Chat untuk memesan</p>
                                            </div>
                                            
                                            {/* Voice Mode Toggle */}
                                            <button
                                                onClick={() => {
                                                    setIsVoiceMode(!isVoiceMode);
                                                    if (isVoiceMode) {
                                                        stopSpeaking();
                                                        if (isListening) {
                                                            recognitionRef.current?.stop();
                                                        }
                                                    }
                                                }}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                                    isVoiceMode 
                                                        ? 'bg-white text-orange-500' 
                                                        : 'bg-orange-600 text-white hover:bg-orange-700'
                                                }`}
                                                disabled={!voiceSupported}
                                                title={!voiceSupported ? 'Browser tidak support voice' : 'Toggle voice input'}
                                            >
                                                {isVoiceMode ? <MicOff size={14} /> : <Mic size={14} />}
                                                {isVoiceMode ? 'Voice ON' : 'Voice OFF'}
                                            </button>
                                        </div>
                                        
                                        {/* Voice Status Indicator */}
                                        <div className="mt-2 text-xs opacity-90 flex items-center gap-3">
                                            {isListening && (
                                                <span className="flex items-center gap-1 animate-pulse">
                                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                    Recording... (auto-send setelah 3 detik diam)
                                                </span>
                                            )}
                                            {isSpeaking && (
                                                <span className="flex items-center gap-1">
                                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                                    Speaking...
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        {messages.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] px-4 py-2 rounded-lg ${msg.role === 'user'
                                                            ? 'bg-orange-500 text-white'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}

                                        {/* ✅ Interim Transcript Display (real-time feedback) */}
                                        {isListening && interimTranscript && (
                                            <div className="flex justify-end">
                                                <div className="max-w-[80%] px-4 py-2 rounded-lg bg-orange-200 text-orange-800 italic">
                                                    {interimTranscript}...
                                                </div>
                                            </div>
                                        )}

                                        {/* Quick Reply Buttons untuk varian minuman */}
                                        {pendingDrink && !isLoading && (
                                            <div className="flex justify-center">
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <p className="text-xs text-gray-600 mb-2 text-center">Pilih varian:</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleQuickReply('hot')}
                                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-semibold"
                                                        >
                                                            Hot
                                                        </button>
                                                        <button
                                                            onClick={() => handleQuickReply('warm')}
                                                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm font-semibold"
                                                        >
                                                            Warm
                                                        </button>
                                                        <button
                                                            onClick={() => handleQuickReply('ice')}
                                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-semibold"
                                                        >
                                                            Ice
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {isLoading && (
                                            <div className="flex justify-start">
                                                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                                                    <span className="animate-pulse">Mengetik...</span>
                                                </div>
                                            </div>
                                        )}

                                        <div ref={chatEndRef} />
                                    </div>

                                    <div className="p-4 border-t">
                                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                                            {/* Voice Mode: Show Mic Button */}
                                            {isVoiceMode && (
                                                <button
                                                    type="button"
                                                    onClick={startVoiceRecording}
                                                    disabled={isLoading || isSpeaking}
                                                    className={`p-3 rounded-lg transition flex-shrink-0 ${
                                                        isListening
                                                            ? 'bg-red-500 text-white animate-pulse'
                                                            : 'bg-orange-500 text-white hover:bg-orange-600'
                                                    }`}
                                                    title={isListening ? 'Recording... Click to stop' : 'Click to record voice'}
                                                >
                                                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                                </button>
                                            )}
                                            
                                            <input
                                                type="text"
                                                value={inputMessage}
                                                onChange={(e) => setInputMessage(e.target.value)}
                                                placeholder={isVoiceMode ? "Atau ketik pesan..." : "Ketik pesanan kamu..."}
                                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                                disabled={isLoading || isListening}
                                            />
                                            <button
                                                type="submit"
                                                disabled={isLoading || isListening}
                                                className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition disabled:bg-gray-300"
                                            >
                                                <Send size={20} />
                                            </button>
                                        </form>
                                        
                                        {/* Voice Instructions */}
                                        {isVoiceMode && !isListening && !isSpeaking && (
                                            <p className="text-xs text-gray-500 text-center mt-2">
                                                Klik mic untuk pesan dengan suara (auto-send setelah 3 detik diam)
                                            </p>
                                        )}
                                        
                                        {/* Stop Speaking Button */}
                                        {isSpeaking && (
                                            <button
                                                onClick={stopSpeaking}
                                                className="w-full mt-2 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200 transition"
                                            >
                                                Stop Speaking
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Cart */}
                                <div className="bg-white rounded-xl shadow-lg p-4">
                                    <h3 className="font-bold mb-3">Pesanan Kamu</h3>

                                    {selectedItems.length === 0 ? (
                                        <p className="text-center text-gray-400 py-4 text-sm">Belum ada pesanan</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedItems.map(item => (
                                                <div key={item.id} className="border rounded-lg p-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-sm">
                                                                {item.quantity}x {item.name}
                                                            </p>
                                                            {item.custom_request && (
                                                                <p className="text-xs text-gray-600 mt-1">
                                                                    {item.custom_request}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <p className="text-orange-600 font-bold text-sm">
                                                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="border-t pt-3 mt-3">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="font-bold">Total:</span>
                                                    <span className="text-lg font-bold text-orange-600">
                                                        Rp {totalPrice.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={handleCompleteOrder}
                                                    className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-semibold"
                                                >
                                                    Selesai & Pesan
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}