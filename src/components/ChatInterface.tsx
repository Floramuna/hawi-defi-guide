
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from "@/components/ChatMessage";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm HAWI-AI, your decentralized DeFi learning companion. I'm powered by Internet Computer's LLM canisters and ready to help you understand decentralized finance. What would you like to learn about today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response (replace with actual LLM canister call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `Great question about "${inputValue}"! Let me explain this DeFi concept in simple terms. This is a simulated response - in the full implementation, this would be processed by the LLM canister on the Internet Computer for complete decentralization and privacy.`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What is yield farming?",
    "How do liquidity pools work?",
    "Explain smart contracts",
    "What are the risks in DeFi?",
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>HAWI-AI is thinking...</span>
          </div>
        )}
        
        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Try asking about:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedQuestions.map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  className="text-left justify-start h-auto p-3 text-wrap"
                  onClick={() => setInputValue(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="border-t border-border p-6">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything about DeFi..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-primary text-white hover:opacity-90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Powered by Internet Computer LLM Canisters • Private & Decentralized
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
