import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, BookOpen, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Message = {
  sender: "user" | "bot";
  text: string;
  id: string;
  timestamp: Date;
  category?: "defi" | "bitcoin" | "ethereum" | "stablecoins" | "general";
};

// Knowledge Base
const KNOWLEDGE_BASE: Record<string, { answer: string; category: Message["category"]; keywords: string[] }> = {
  "bitcoin": {
    category: "bitcoin",
    keywords: ["bitcoin", "btc", "what is bitcoin", "bitcoin explained", "bitcoin def", "what is btc", "bitcoin meaning"],
    answer: `**Bitcoin (BTC)** is the world's first and most famous cryptocurrency, created in 2009 by an anonymous person (or group) named Satoshi Nakamoto.

🔑 **Key Features:**
• **Decentralized**: No central authority or government controls it
• **Limited Supply**: Only 21 million bitcoins will ever exist
• **Blockchain Technology**: Transactions are recorded on a public ledger
• **Peer-to-Peer**: Direct transactions without intermediaries
• **Digital Gold**: Often called "digital gold" as a store of value

💡 **Why it matters**: Bitcoin introduced blockchain technology and proved that decentralized digital money could work. It's now a $1+ trillion asset class accepted by institutions worldwide.

📊 **Current Stats**: 
• Market Cap: ~$1.2 Trillion
• Max Supply: 21 million
• Block Time: ~10 minutes
• Mining Reward: 3.125 BTC per block

🔗 **How to get Bitcoin**: You can buy Bitcoin on exchanges like Coinbase, Binance, or Kraken, or earn it through mining or services.`
  },
  "defi": {
    category: "defi",
    keywords: ["defi", "decentralized finance", "what is defi", "defi explained", "decentralized finance explained", "what is decentralized finance"],
    answer: `**DeFi (Decentralized Finance)** is a revolutionary financial system built on blockchain that removes traditional intermediaries like banks.

🌐 **What Makes DeFi Special:**
• **No Banks**: You control your money directly with your crypto wallet
• **Open to Anyone**: No credit checks, no minimum balances
• **Transparent**: All code is open-source and auditable
• **Programmable**: Smart contracts automate financial services
• **Permissionless**: Anyone with internet can participate

💰 **Popular DeFi Applications:**
• **Lending/Borrowing**: Aave, Compound - earn interest or borrow crypto
• **DEXs**: Uniswap, SushiSwap - trade without centralized exchanges
• **Yield Farming**: Earn returns by providing liquidity
• **Staking**: Lock crypto to support networks and earn rewards
• **Insurance**: Nexus Mutual - decentralized insurance protocols

📈 **DeFi Growth:**
• Total Value Locked (TVL): Over $50+ Billion
• Thousands of protocols across Ethereum, Solana, and other chains
• Democratizing finance globally

⚠️ **Risks to Consider:**
• Smart contract vulnerabilities
• Impermanent loss in liquidity pools
• High gas fees on Ethereum
• Regulatory uncertainty

⚡ **Why It Matters**: DeFi gives anyone with internet access the ability to save, invest, borrow, and trade without needing permission from banks or governments.`
  },
  "stablecoins": {
    category: "stablecoins",
    keywords: ["stablecoin", "stablecoins", "usdt", "usdc", "dai", "what are stablecoins", "stablecoin explained", "what is stablecoin"],
    answer: `**Stablecoins** are cryptocurrencies designed to maintain a stable value by pegging to real-world assets like the US Dollar.

🏦 **Types of Stablecoins:**

**1. Fiat-Collateralized** (USDT, USDC, BUSD)
• Backed 1:1 by real dollars in bank accounts
• Most popular and widely used
• Centralized but highly liquid
• Audited regularly by third parties

**2. Crypto-Collateralized** (DAI, sUSD)
• Backed by other cryptocurrencies (ETH, BTC)
• Over-collateralized for safety (150%+)
• Fully decentralized
• More complex but censorship-resistant

**3. Algorithmic** (Failed examples: UST, LUNA, FRAX)
• Uses algorithms and smart contracts to maintain peg
• No collateral backing
• High risk, many have failed
• Not recommended for beginners

💎 **Why Stablecoins Matter:**
• **Trading**: Safe haven during crypto volatility
• **Payments**: Stable value for transactions
• **DeFi Essential**: Used for lending, borrowing, yield farming
• **Remittances**: Cheap cross-border transfers
• **Savings**: Earn interest without bank accounts

📊 **Top Stablecoins by Market Cap:**
• USDT (Tether) - $80B+ - Most liquid
• USDC (Circle) - $25B+ - Most regulated
• DAI (MakerDAO) - $5B+ - Most decentralized
• BUSD (Binance) - $2B+ - Exchange-backed

⚠️ **Always diversify stablecoin holdings across different types to manage risk! Never keep all your funds in one stablecoin.**`
  },
  "ethereum": {
    category: "ethereum",
    keywords: ["ethereum", "eth", "what is ethereum", "ether", "ethereum explained", "smart contracts", "what is eth", "vitalik buterin"],
    answer: `**Ethereum (ETH)** is the world's leading programmable blockchain platform, launched in 2015 by Vitalik Buterin and a team of developers.

🚀 **What Makes Ethereum Special:**
• **Smart Contracts**: Self-executing code that powers DeFi and NFTs
• **dApps**: Thousands of decentralized applications running on Ethereum
• **The Merge**: Ethereum now uses Proof-of-Stake, 99.9% more energy efficient
• **Layer 2 Solutions**: Polygon, Arbitrum, Optimism for scaling
• **Developer Friendly**: Largest developer community in crypto

💎 **ETH Token Uses:**
• **Gas Fees**: Pay for transactions and computation
• **Staking**: Earn ~4-6% APY securing the network
• **DeFi Foundation**: Most DeFi protocols built on Ethereum
• **NFTs**: Premier platform for digital art and collectibles
• **Collateral**: Used as collateral in DeFi lending

📈 **Ethereum Ecosystem Stats:**
• **TVL**: ~$30 Billion in DeFi protocols
• **Active Developers**: 4,000+ monthly active devs
• **Daily Transactions**: 1-2 million
• **Validator Count**: 800,000+ active validators

🔮 **Ethereum Roadmap:**
• **The Surge**: Scaling with rollups (2024-2025)
• **The Scourge**: Improving censorship resistance
• **The Verge**: Verkle trees for stateless clients
• **The Purge**: Reducing historical data requirements
• **The Splurge**: Final upgrades and optimizations

**Quick Facts:**
• Founded: 2015
• Consensus: Proof-of-Stake (after The Merge 2022)
• Max Supply: No hard cap, but issuance is controlled
• Transaction Speed: ~15-30 TPS (Layer 2s handle thousands)
• Energy Usage: 99.9% less than before The Merge`
  },
  "hi": {
    category: "general",
    keywords: ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening", "howdy", "sup"],
    answer: `👋 **Hello there!** I'm HAWI-AI, your DeFi learning companion!

I'm here to help you understand the exciting world of blockchain and decentralized finance.

📚 **I can teach you about:**
• 💰 **Bitcoin** - The original cryptocurrency and digital gold
• 🌊 **DeFi** - Decentralized Finance - banking without banks
• 💎 **Stablecoins** - Digital dollars on blockchain
• ⚡ **Ethereum** - Smart contract platform and Web3 foundation

💡 **Try asking me:**
• "What is Bitcoin?" - Learn about the first cryptocurrency
• "Explain DeFi" - Discover decentralized finance
• "What are stablecoins?" - Understand digital dollars
• "Tell me about Ethereum" - Explore smart contracts

**What would you like to learn about today?** Just type your question and I'll help you understand! 🚀`
  },
  "thanks": {
    category: "general",
    keywords: ["thanks", "thank you", "appreciate", "helpful", "great"],
    answer: `You're welcome! 😊 I'm glad I could help you learn about blockchain and DeFi!

Remember, this space is constantly evolving. Feel free to ask me more questions about:
• Bitcoin (BTC)
• Decentralized Finance (DeFi)
• Stablecoins (USDT, USDC, DAI)
• Ethereum (ETH)
• Smart contracts
• Web3 technology

**Keep learning and stay curious!** 🚀 What else would you like to know?`
  },
  "default": {
    category: "general",
    keywords: [],
    answer: `I'm here to help you learn about blockchain and DeFi! I specialize in explaining:

**📚 Topics I cover:**
• 💰 **Bitcoin** - The original cryptocurrency
• 🌊 **DeFi** - Decentralized Finance
• 💎 **Stablecoins** - Price-stable digital assets
• ⚡ **Ethereum** - Smart contract platform

Could you please rephrase your question about one of these topics? I'm best at explaining these concepts in simple terms!

💡 **Try asking:**
• "What is Bitcoin?"
• "Explain DeFi in simple terms"
• "What are stablecoins and how do they work?"
• "Tell me about Ethereum"

Or just say "Hi" to get started! 🤖`
  }
};

// Helper function to find matching knowledge
const findAnswer = (question: string): { answer: string; category: Message["category"] } => {
  const lowerQuestion = question.toLowerCase();
  
  // Check for keyword matches
  for (const [key, data] of Object.entries(KNOWLEDGE_BASE)) {
    if (key === "default") continue;
    
    for (const keyword of data.keywords) {
      if (lowerQuestion.includes(keyword)) {
        return { answer: data.answer, category: data.category };
      }
    }
  }
  
  // Return default answer if no match found
  return { 
    answer: KNOWLEDGE_BASE.default.answer, 
    category: "general" 
  };
};

// Helper to format message with markdown-like styling
const formatMessage = (text: string): string => {
  // Convert markdown-style bold to HTML
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert markdown-style bullet points
  formatted = formatted.replace(/• (.*?)(?:\n|$)/g, '<li class="ml-4 mb-1">• $1</li>\n');
  
  // Convert numbered sections
  formatted = formatted.replace(/\d+\. (.*?)(?:\n|$)/g, '<div class="mt-2 font-semibold text-primary">$&</div>');
  
  // Format section headers with emojis
  formatted = formatted.replace(/🔑 \*\*Key Features:\*\*/g, '<div class="mt-3 font-semibold text-primary text-base">🔑 Key Features:</div>');
  formatted = formatted.replace(/💡 \*\*Why it matters\*\*/g, '<div class="mt-3 font-semibold text-primary text-base">💡 Why it matters:</div>');
  formatted = formatted.replace(/📊 \*\*Current Stats\*\*/g, '<div class="mt-3 font-semibold text-primary text-base">📊 Current Stats:</div>');
  formatted = formatted.replace(/💰 \*\*Popular DeFi Applications:\*\*/g, '<div class="mt-3 font-semibold text-primary text-base">💰 Popular DeFi Applications:</div>');
  formatted = formatted.replace(/🌐 \*\*What Makes DeFi Special:\*\*/g, '<div class="mt-3 font-semibold text-primary text-base">🌐 What Makes DeFi Special:</div>');
  formatted = formatted.replace(/🏦 \*\*Types of Stablecoins:\*\*/g, '<div class="mt-3 font-semibold text-primary text-base">🏦 Types of Stablecoins:</div>');
  formatted = formatted.replace(/💎 \*\*Why Stablecoins Matter:\*\*/g, '<div class="mt-3 font-semibold text-primary text-base">💎 Why Stablecoins Matter:</div>');
  formatted = formatted.replace(/📊 \*\*Top Stablecoins by Market Cap:\*\*/g, '<div class="mt-3 font-semibold text-primary text-base">📊 Top Stablecoins by Market Cap:</div>');
  formatted = formatted.replace(/🚀 \*\*What Makes Ethereum Special:\*\*/g, '<div class="mt-3 font-semibold text-primary text-base">🚀 What Makes Ethereum Special:</div>');
  formatted = formatted.replace(/💎 \*\*ETH Token Uses:\*\*/g, '<div class="mt-3 font-semibold text-primary text-base">💎 ETH Token Uses:</div>');
  formatted = formatted.replace(/📈 \*\*Ethereum Ecosystem Stats:\*\*/g, '<div class="mt-3 font-semibold text-primary text-base">📈 Ethereum Ecosystem Stats:</div>');
  formatted = formatted.replace(/🔮 \*\*Ethereum Roadmap:\*\*/g, '<div class="mt-3 font-semibold text-primary text-base">🔮 Ethereum Roadmap:</div>');
  formatted = formatted.replace(/⚠️ \*\*Risks to Consider:\*\*/g, '<div class="mt-3 font-semibold text-warning text-base">⚠️ Risks to Consider:</div>');
  
  // Add spacing for bullet lists
  formatted = formatted.replace(/<li/g, '<ul class="list-none space-y-1 my-2"><li');
  formatted = formatted.replace(/<\/li>\n/g, '</li></ul>\n');
  
  return formatted;
};

const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.sender === "user";
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary' : 'bg-gradient-to-br from-blue-500 to-purple-600'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-primary-foreground" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>
        
        <div className="flex-1">
          {!isUser && message.category && message.category !== "general" && (
            <Badge variant="outline" className="mb-2 text-xs capitalize">
              {message.category === "bitcoin" && "💰 Bitcoin"}
              {message.category === "defi" && "🌊 DeFi"}
              {message.category === "ethereum" && "⚡ Ethereum"}
              {message.category === "stablecoins" && "💎 Stablecoins"}
            </Badge>
          )}
          
          <Card className={`p-4 ${
            isUser 
              ? 'bg-primary text-primary-foreground border-none' 
              : 'bg-card border-border shadow-sm'
          }`}>
            <div 
              className="prose prose-sm dark:prose-invert max-w-none break-words"
              dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
            />
            <div className={`text-xs mt-2 ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "👋 **Hello! I'm HAWI-AI**, your DeFi learning companion powered by Internet Computer!\n\nI'm here to help you understand the exciting world of blockchain and decentralized finance.\n\n**What would you like to learn about today?**",
      timestamp: new Date(),
      category: "general",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    // Simulate AI thinking with a slight delay for realism
    setTimeout(() => {
      // Find answer from knowledge base
      const { answer, category } = findAnswer(currentInput);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: answer,
        timestamp: new Date(),
        category: category,
      };

      setMessages((prev) => [...prev, botMessage]);
      setLoading(false);
      
      // Show toast for special categories
      if (category !== "general") {
        toast.success(`📚 Learning about ${category.charAt(0).toUpperCase() + category.slice(1)}!`, {
          duration: 2000,
        });
      }
    }, 600); // Simulate processing time
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Suggested questions
  const suggestedQuestions = [
    { text: "What is Bitcoin?", icon: "💰", color: "bg-orange-100 text-orange-700" },
    { text: "Explain DeFi", icon: "🌊", color: "bg-blue-100 text-blue-700" },
    { text: "What are stablecoins?", icon: "💎", color: "bg-green-100 text-green-700" },
    { text: "Tell me about Ethereum", icon: "⚡", color: "bg-purple-100 text-purple-700" },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-white">HAWI-AI Assistant</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">DeFi Learning Companion</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1 bg-blue-50 dark:bg-blue-950">
            <BookOpen className="w-3 h-3" />
            <span>Knowledge Base Active</span>
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <Card className="p-4 bg-card">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-sm text-muted-foreground ml-2">HAWI is thinking...</span>
                  </div>
                </Card>
              </div>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Suggested Questions */}
      {messages.length <= 3 && !loading && (
        <div className="px-6 pb-3">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">💡 Try asking:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedQuestions.map((q, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(q.text);
                    setTimeout(() => sendMessage(), 100);
                  }}
                  className={`gap-2 hover:scale-105 transition-transform ${q.color} border-0`}
                >
                  <span>{q.icon}</span>
                  {q.text}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about Bitcoin, DeFi, Stablecoins, or Ethereum..."
              className="flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🤖 AI-powered learning • No backend required
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800">
                📚 Bitcoin
              </Badge>
              <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800">
                🌊 DeFi
              </Badge>
              <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800">
                💎 Stablecoins
              </Badge>
              <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800">
                ⚡ Ethereum
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;