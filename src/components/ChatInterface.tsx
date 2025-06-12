
import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "@/components/ChatMessage";
import { useLLMCanister } from "@/hooks/useLLMCanister";
import { toast } from "sonner";

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
      text: "Hello! I'm HAWI-AI, your DeFi learning companion powered by Internet Computer's LLM canister. I'm here to help you understand decentralized finance concepts, from basic terms to advanced strategies. What would you like to learn about today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  
  const { isInitialized, isLoading, error, generateResponse, getChatHistory } = useLLMCanister();

  useEffect(() => {
    if (error) {
      toast.error(`LLM Canister Error: ${error}`);
    }
  }, [error]);

  useEffect(() => {
    if (isInitialized) {
      toast.success("Connected to LLM Canister successfully!");
      loadChatHistory();
    }
  }, [isInitialized]);

  const loadChatHistory = async () => {
    try {
      const history = await getChatHistory();
      if (history.length > 0) {
        const historyMessages: Message[] = [];
        
        history.forEach((item, index) => {
          // Add user message
          historyMessages.push({
            id: `history-user-${index}`,
            text: item.prompt,
            isUser: true,
            timestamp: new Date(Number(item.timestamp) / 1000000), // Convert nanoseconds to milliseconds
          });
          
          // Add AI response
          historyMessages.push({
            id: `history-ai-${index}`,
            text: item.response,
            isUser: false,
            timestamp: new Date(Number(item.timestamp) / 1000000),
          });
        });
        
        setMessages(prev => [...prev, ...historyMessages]);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    if (!isInitialized) {
      toast.error("LLM canister not initialized. Please wait or refresh the page.");
      return;
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    const currentInput = inputValue;
    setInputValue("");

    try {
      // Generate AI response using the LLM canister
      const aiResponseText = await generateResponse(currentInput);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error generating response:", error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
      toast.error("Failed to generate AI response. Please try again.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-lg p-4 max-w-[70%]">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gradient-primary rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-gradient-primary rounded-full animate-pulse delay-150"></div>
                  <span className="text-sm text-muted-foreground ml-2">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-6 bg-card/50 backdrop-blur">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isInitialized ? "Ask me anything about DeFi..." : "Connecting to LLM canister..."}
              className="flex-1"
              disabled={!isInitialized || isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || !isInitialized || isLoading}
              className="bg-gradient-primary text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {isInitialized ? (
              <>Powered by Internet Computer LLM Canisters • Privacy-first AI</>
            ) : (
              <>Connecting to LLM canister...</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
