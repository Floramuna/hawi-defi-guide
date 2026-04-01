import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "@/components/ChatMessage";
import { hawiBackend } from "@/services/hawiBackend";
import { toast } from "sonner";

type Message = {
  sender: "user" | "bot";
  text: string;
  id: string;
  timestamp: Date;
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I'm HAWI-AI, your DeFi learning companion powered by Internet Computer. Ask me anything about decentralized finance!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

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

    try {
      const response = await hawiBackend.askQuestion(currentInput);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "Error connecting to backend. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to get AI response");
    }

    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={{
                id: msg.id,
                text: msg.text,
                isUser: msg.sender === "user",
                timestamp: msg.timestamp,
              }}
            />
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-lg p-4 max-w-[70%]">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                  <span className="text-sm text-muted-foreground ml-2">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-6 bg-card/50 backdrop-blur">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask HAWI-AI about DeFi..."
              className="flex-1"
              disabled={loading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="bg-primary text-primary-foreground"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Powered by Internet Computer • Privacy-first AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
