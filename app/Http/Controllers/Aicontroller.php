<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIController extends Controller
{
    /**
     * Drinks that need variant
     */
    private $drinksNeedVariant = [
        'Thai Tea', 'Teh Obeng', 'Coklat', 'Kopi Hitam', 
        'Kopi Susu', 'Lemon Tea', 'Teh'
    ];

    /**
     * Context patterns untuk smart understanding
     */
    private $contextPatterns = [
        'weather_hot' => [
            'keywords' => ['panas', 'gerah', 'terik', 'kepanasan'],
            'suggest_type' => 'cold_drinks',
        ],
        'weather_cold' => [
            'keywords' => ['dingin', 'hujan', 'sejuk', 'kedinginan', 'angin'],
            'suggest_type' => 'hot_drinks',
        ],
        'hungry' => [
            'keywords' => ['laper', 'lapar', 'kelaparan', 'perut kosong'],
            'suggest_type' => 'heavy_meals',
        ],
        'thirsty' => [
            'keywords' => ['haus', 'kehausan', 'minum'],
            'suggest_type' => 'drinks',
        ],
        'tired' => [
            'keywords' => ['cape', 'capek', 'lelah', 'ngantuk'],
            'suggest_type' => 'coffee',
        ],
        'sweet_tooth' => [
            'keywords' => ['manis', 'dessert', 'pencuci mulut'],
            'suggest_type' => 'sweet_items',
        ],
    ];

    /**
     * Process chat message and return AI response
     */
    public function chat(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'current_cart' => 'nullable|array',
            'conversation_history' => 'nullable|array',
        ]);

        $userMessage = $validated['message'];
        $currentCart = $validated['current_cart'] ?? [];
        $conversationHistory = $validated['conversation_history'] ?? [];
        
        // Analyze context first
        $context = $this->analyzeContext($userMessage, $conversationHistory);
        
        $response = $this->getAIResponse($userMessage, $currentCart, $conversationHistory, $context);

        return response()->json([
            'success' => true,
            'response' => $response['message'],
            'detected_items' => $response['detected_items'] ?? [],
            'cart_action' => $response['cart_action'] ?? null,
            'updated_cart' => $response['updated_cart'] ?? null,
            'auto_confirm' => $response['auto_confirm'] ?? false,
        ]);
    }

    /**
     * Analyze context from user message
     */
    private function analyzeContext($message, $history = [])
    {
        $message = strtolower($message);
        $detectedContexts = [];

        // Detect context patterns
        foreach ($this->contextPatterns as $contextName => $pattern) {
            foreach ($pattern['keywords'] as $keyword) {
                if (strpos($message, $keyword) !== false) {
                    $detectedContexts[] = [
                        'type' => $contextName,
                        'suggest' => $pattern['suggest_type'],
                    ];
                    break;
                }
            }
        }

        // Analyze conversation flow
        if (!empty($history)) {
            $lastAIMessage = $this->getLastAIMessage($history);
            if ($lastAIMessage) {
                $detectedContexts[] = [
                    'type' => 'conversation_flow',
                    'last_ai_message' => $lastAIMessage,
                ];
            }
        }

        return $detectedContexts;
    }

    /**
     * Get last AI message from history
     */
    private function getLastAIMessage($history)
    {
        for ($i = count($history) - 1; $i >= 0; $i--) {
            if ($history[$i]['role'] === 'assistant') {
                return $history[$i]['content'];
            }
        }
        return null;
    }

    /**
     * Generate AI response using Groq API with context awareness
     */
    private function getAIResponse($userMessage, $currentCart = [], $conversationHistory = [], $context = [])
    {
        try {
            // Get available menus
            $menus = Menu::where('status', 'ready')->get();

            // Build context-aware suggestions
            $suggestions = $this->buildContextSuggestions($context, $menus);

            // Format menu list
            $menuList = $menus->map(function ($menu) {
                return "- {$menu->name} (Rp" . number_format($menu->price, 0, ',', '.') . ')';
            })->implode("\n");

            // Format current cart
            $cartList = '';
            if (!empty($currentCart)) {
                $cartList = "\n\nPesanan saat ini:\n";
                foreach ($currentCart as $item) {
                    $cartList .= "- {$item['quantity']}x {$item['name']}";
                    if (!empty($item['custom_request'])) {
                        $cartList .= " ({$item['custom_request']})";
                    }
                    $cartList .= "\n";
                }
            }

            // Build context hint for AI
            $contextHint = '';
            if (!empty($suggestions)) {
                $contextHint = "\n\nContext hint:\n";
                foreach ($suggestions as $sug) {
                    $contextHint .= "User sepertinya {$sug['reason']}, suggest: " . implode(', ', $sug['items']);
                    if (isset($sug['variant'])) {
                        $contextHint .= " ({$sug['variant']})";
                    }
                    $contextHint .= "\n";
                }
            }

            // Ultra-minimal prompt - trust the AI
            $systemPrompt = "Kamu asisten Cafe Ichal yang friendly dan helpful.

MENU:
{$menuList}
{$cartList}
{$contextHint}

Drinks yang ada varian (hot/warm/ice): Teh, Kopi Hitam, latte

Respond ONLY in pure JSON format (no markdown, no emoji):
{
  \"message\": \"your response\",
  \"action\": \"add|reduce|remove|clear|show|chat|ask_variant|none\",
  \"items\": [{\"menu\": \"name\", \"quantity\": 1, \"custom\": \"hot/warm/ice or null\"}],
  \"target_menu\": \"menu name for reduce/remove\",
  \"reduce_quantity\": 1,
  \"auto_confirm\": true
}

Action guide:
- add: Add to cart immediately
- ask_variant: Ask which variant (hot/warm/ice) for drinks
- chat: Just chatting
- reduce/remove/clear: Modify cart
- show: Display cart

Rules:
1. Only suggest menus from the list above
2. For drinks with variants: if user doesn't specify hot/warm/ice, ask first (action: ask_variant)
3. If user confirms/agrees after your recommendation, add immediately (auto_confirm: true)
4. Understand context naturally (cold weather → suggest hot drinks, hot weather → suggest cold drinks)

Examples:
User: 'malam malam dingin enak pesen apa ya?'
Response: {\"message\": \"Wah dingin ya, enak tuh minum yang hangat. Mau Teh atau latte?\", \"action\": \"chat\", \"auto_confirm\": false}

User: 'boleh teh 1'
Response: {\"message\": \"Teh-nya mau hot, warm, atau ice?\", \"action\": \"ask_variant\", \"pending_drink\": \"Teh\", \"auto_confirm\": false}

User: 'hot aja'
Response: {\"message\": \"Siap, 1 Teh hot ya\", \"action\": \"add\", \"items\": [{\"menu\": \"Teh\", \"quantity\": 1, \"custom\": \"hot\"}], \"auto_confirm\": true}";

            // Call Groq API
            $apiKey = env('GROQ_API_KEY');

            if (!$apiKey) {
                throw new \Exception('GROQ_API_KEY tidak ditemukan');
            }

            // Build messages with history
            $messages = [
                [
                    'role' => 'system',
                    'content' => $systemPrompt,
                ]
            ];

            // Add recent conversation history (last 8 messages)
            $recentHistory = array_slice($conversationHistory, -8);
            foreach ($recentHistory as $msg) {
                $messages[] = [
                    'role' => $msg['role'],
                    'content' => $msg['content']
                ];
            }

            // Add current user message
            $messages[] = [
                'role' => 'user',
                'content' => $userMessage,
            ];

            $response = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.3-70b-versatile',
                    'messages' => $messages,
                    'temperature' => 0.7, // Higher for more natural responses
                    'max_tokens' => 500,
                ]);

            if (!$response->successful()) {
                Log::error('Groq API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \Exception('Groq API gagal');
            }

            $result = $response->json();
            $aiText = $result['choices'][0]['message']['content'] ?? '';

            // Aggressive cleaning
            $aiText = preg_replace('/```json\s*|\s*```/', '', $aiText);
            if (preg_match('/\{.*\}/s', $aiText, $matches)) {
                $aiText = $matches[0];
            }
            $aiText = preg_replace('/[\x00-\x1F\x7F]/u', '', $aiText);
            $aiText = trim($aiText);

            Log::info('AI Raw Response', ['raw' => $result['choices'][0]['message']['content'] ?? '']);
            Log::info('AI Cleaned Response', ['cleaned' => $aiText]);

            // Parse JSON
            $parsed = json_decode($aiText, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('JSON Parse Error', [
                    'error' => json_last_error_msg(),
                    'text' => $aiText
                ]);
                throw new \Exception('Gagal parse JSON: ' . json_last_error_msg());
            }

            // Remove emoji dan emoticon dari message
            if (isset($parsed['message'])) {
                $parsed['message'] = $this->removeEmojisAndEmoticons($parsed['message']);
            }

            $action = $parsed['action'] ?? 'none';
            $autoConfirm = $parsed['auto_confirm'] ?? false;

            // Handle actions
            switch ($action) {
                case 'add':
                    return $this->handleAddItems($parsed, $menus, $autoConfirm);

                case 'reduce':
                    return $this->handleReduceItem($parsed, $currentCart);

                case 'remove':
                    return $this->handleRemoveItem($parsed, $currentCart);

                case 'clear':
                    return [
                        'message' => $parsed['message'],
                        'cart_action' => 'clear',
                        'auto_confirm' => false,
                    ];

                case 'show':
                    return $this->handleShowCart($currentCart, $parsed['message']);

                case 'ask_variant':
                    return [
                        'message' => $parsed['message'],
                        'pending_drink' => $parsed['pending_drink'] ?? null,
                        'auto_confirm' => false,
                    ];

                case 'chat':
                    return [
                        'message' => $parsed['message'],
                        'auto_confirm' => false,
                    ];

                default:
                    return [
                        'message' => $parsed['message'],
                        'auto_confirm' => false,
                    ];
            }

        } catch (\Exception $e) {
            Log::error('AI Error', ['message' => $e->getMessage()]);
            return $this->getFallbackResponse($userMessage, Menu::where('status', 'ready')->get(), $context);
        }
    }

    /**
     * Build context-aware suggestions
     */
    private function buildContextSuggestions($contexts, $menus)
    {
        if (empty($contexts)) {
            return null;
        }

        $suggestions = [];
        
        foreach ($contexts as $ctx) {
            if (!isset($ctx['suggest'])) continue;

            switch ($ctx['suggest']) {
                case 'cold_drinks':
                    // Suggest minuman dingin yang ada
                    $coldDrinks = $menus->whereIn('name', ['Teh', 'latte'])->pluck('name')->toArray();
                    if (!empty($coldDrinks)) {
                        $suggestions[] = [
                            'reason' => 'panas/gerah',
                            'items' => $coldDrinks,
                            'variant' => 'ice',
                        ];
                    }
                    break;

                case 'hot_drinks':
                    // Suggest minuman hangat yang ada
                    $hotDrinks = $menus->whereIn('name', ['Kopi Hitam', 'Teh', 'latte'])->pluck('name')->toArray();
                    if (!empty($hotDrinks)) {
                        $suggestions[] = [
                            'reason' => 'dingin/hujan',
                            'items' => $hotDrinks,
                            'variant' => 'hot',
                        ];
                    }
                    break;

                case 'heavy_meals':
                    $meals = $menus->whereIn('name', ['Ayam Bakar', 'Nasi Putih'])->pluck('name')->toArray();
                    if (!empty($meals)) {
                        $suggestions[] = [
                            'reason' => 'lapar',
                            'items' => $meals,
                        ];
                    }
                    break;

                case 'coffee':
                    $coffee = $menus->where('name', 'like', '%Kopi%')->pluck('name')->toArray();
                    if (!empty($coffee)) {
                        $suggestions[] = [
                            'reason' => 'capek/ngantuk',
                            'items' => $coffee,
                        ];
                    }
                    break;
            }
        }

        return $suggestions;
    }

    /**
     * Remove all emojis AND emoticons from text
     */
    private function removeEmojisAndEmoticons($text)
    {
        // Remove all emoji using Unicode ranges
        $text = preg_replace('/[\x{1F600}-\x{1F64F}]/u', '', $text);
        $text = preg_replace('/[\x{1F300}-\x{1F5FF}]/u', '', $text);
        $text = preg_replace('/[\x{1F680}-\x{1F6FF}]/u', '', $text);
        $text = preg_replace('/[\x{1F1E0}-\x{1F1FF}]/u', '', $text);
        $text = preg_replace('/[\x{2600}-\x{26FF}]/u', '', $text);
        $text = preg_replace('/[\x{2700}-\x{27BF}]/u', '', $text);
        $text = preg_replace('/[\x{1F900}-\x{1F9FF}]/u', '', $text);
        $text = preg_replace('/[\x{1FA00}-\x{1FA6F}]/u', '', $text);
        $text = preg_replace('/[\x{1FA70}-\x{1FAFF}]/u', '', $text);
        $text = preg_replace('/[\x{FE0F}]/u', '', $text);
        $text = preg_replace('/[\x{200D}]/u', '', $text);
        
        // Remove text emoticons
        $emoticons = [
            ':)', ':(', ':D', ':P', ';)', ':/', ':|', 'XD', 'xD',
            ':-)', ':-(', ':-D', ':-P', ';-)', ':-/', ':-|',
            '^_^', '^-^', '^o^', 'o_o', 'O_O', 'T_T', '>_<',
            '(:', '):', 'D:', 'P:', '(;', '/:', '|:',
        ];
        
        foreach ($emoticons as $emoticon) {
            $text = str_replace($emoticon, '', $text);
        }
        
        return trim($text);
    }

    /**
     * Handle adding items
     */
    private function handleAddItems($parsed, $menus, $autoConfirm = false)
    {
        $detectedItems = [];

        if (!empty($parsed['items']) && is_array($parsed['items'])) {
            foreach ($parsed['items'] as $item) {
                if (empty($item['menu'])) continue;

                $menu = $menus->first(function ($m) use ($item) {
                    $similarity = 0;
                    similar_text(
                        strtolower($m->name),
                        strtolower($item['menu']),
                        $similarity
                    );
                    return $similarity > 70;
                });

                if ($menu) {
                    $detectedItems[] = [
                        'menu_id' => $menu->id,
                        'name' => $menu->name,
                        'price' => $menu->price,
                        'quantity' => $item['quantity'] ?? 1,
                        'custom_request' => $item['custom'] ?? null,
                    ];
                }
            }
        }

        return [
            'message' => $parsed['message'],
            'detected_items' => $detectedItems,
            'pending_drink' => $parsed['pending_drink'] ?? null,
            'auto_confirm' => $autoConfirm,
        ];
    }

    /**
     * Handle reducing quantity
     */
    private function handleReduceItem($parsed, $currentCart)
    {
        $targetMenuName = $parsed['target_menu'] ?? null;
        $reduceQty = $parsed['reduce_quantity'] ?? 1;

        if (!$targetMenuName) {
            return [
                'message' => 'Item mana yang mau dikurangi?',
                'auto_confirm' => false,
            ];
        }

        $itemFound = false;
        $updatedCart = array_map(function ($item) use ($targetMenuName, $reduceQty, &$itemFound) {
            $similarity = 0;
            similar_text(
                strtolower($item['name']),
                strtolower($targetMenuName),
                $similarity
            );

            if ($similarity > 70 && !$itemFound) {
                $itemFound = true;
                $newQty = max(1, $item['quantity'] - $reduceQty);
                return array_merge($item, ['quantity' => $newQty]);
            }
            return $item;
        }, $currentCart);

        if (!$itemFound) {
            return [
                'message' => "{$targetMenuName} ga ada di pesanan",
                'auto_confirm' => false,
            ];
        }

        return [
            'message' => $parsed['message'],
            'cart_action' => 'update',
            'updated_cart' => $updatedCart,
            'auto_confirm' => false,
        ];
    }

    /**
     * Handle removing item
     */
    private function handleRemoveItem($parsed, $currentCart)
    {
        $targetMenuName = $parsed['target_menu'] ?? null;

        if (!$targetMenuName) {
            return [
                'message' => 'Item mana yang mau dihapus?',
                'auto_confirm' => false,
            ];
        }

        $itemFound = false;
        $updatedCart = array_filter($currentCart, function ($item) use ($targetMenuName, &$itemFound) {
            $similarity = 0;
            similar_text(
                strtolower($item['name']),
                strtolower($targetMenuName),
                $similarity
            );

            if ($similarity > 70 && !$itemFound) {
                $itemFound = true;
                return false;
            }
            return true;
        });

        if (!$itemFound) {
            return [
                'message' => "{$targetMenuName} ga ada di pesanan",
                'auto_confirm' => false,
            ];
        }

        return [
            'message' => $parsed['message'],
            'cart_action' => 'update',
            'updated_cart' => array_values($updatedCart),
            'auto_confirm' => false,
        ];
    }

    /**
     * Handle showing cart
     */
    private function handleShowCart($currentCart, $aiMessage = null)
    {
        if (empty($currentCart)) {
            return [
                'message' => $aiMessage ?? 'Belum ada pesanan',
                'auto_confirm' => false,
            ];
        }

        if ($aiMessage) {
            return ['message' => $aiMessage, 'auto_confirm' => false];
        }

        $cartText = "Pesanan: ";
        $total = 0;
        $items = [];

        foreach ($currentCart as $item) {
            $subtotal = $item['price'] * $item['quantity'];
            $total += $subtotal;
            
            $itemText = "{$item['quantity']}x {$item['name']}";
            if (!empty($item['custom_request'])) {
                $itemText .= " ({$item['custom_request']})";
            }
            $items[] = $itemText;
        }

        $cartText .= implode(', ', $items);
        $cartText .= ". Total: Rp " . number_format($total, 0, ',', '.');

        return [
            'message' => $cartText,
            'auto_confirm' => false,
        ];
    }

    /**
     * Fallback response if AI fails (with context awareness)
     */
    private function getFallbackResponse($userMessage, $menus, $context = [])
    {
        $userMessage = strtolower($userMessage);

        if (preg_match('/(halo|hai|hi|hello|assalamualaikum)/i', $userMessage)) {
            return [
                'message' => 'Halo! Mau pesan apa?',
                'auto_confirm' => false,
            ];
        }

        // Context-based fallback suggestions
        if (!empty($context)) {
            foreach ($context as $ctx) {
                if ($ctx['type'] === 'weather_cold') {
                    $hotDrinks = $menus->whereIn('name', ['Teh', 'latte'])->pluck('name')->implode(', ');
                    return [
                        'message' => "Dingin ya? Enak nih minum yang hangat. Ada {$hotDrinks}",
                        'auto_confirm' => false,
                    ];
                }
                if ($ctx['type'] === 'weather_hot') {
                    $coldDrinks = $menus->whereIn('name', ['Teh', 'latte'])->pluck('name')->implode(', ');
                    return [
                        'message' => "Panas ya? Mau yang dingin-dingin? Ada {$coldDrinks}",
                        'auto_confirm' => false,
                    ];
                }
            }
        }

        if (preg_match('/(menu|ada apa|apa aja|list)/i', $userMessage)) {
            $availableMenu = $menus->pluck('name')->implode(', ');
            return [
                'message' => "Menu yang tersedia: {$availableMenu}. Mau pesan yang mana?",
                'auto_confirm' => false,
            ];
        }

        if (preg_match('/(terima kasih|makasih|thanks)/i', $userMessage)) {
            return [
                'message' => 'Sama-sama! Selamat menikmati',
                'auto_confirm' => false,
            ];
        }

        return [
            'message' => 'Maaf ada gangguan sistem. Coba lagi atau hubungi kasir ya',
            'auto_confirm' => false,
        ];
    }
}