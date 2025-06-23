
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Image as ImageIcon, Download, Bot, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AuthHeader from "@/components/AuthHeader";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface GeneratedImage {
  id: string;
  prompt: string;
  base64: string;
  timestamp: Date;
}

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [typingAnimation, setTypingAnimation] = useState(false);

  const sendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use the chat feature.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);
    setTypingAnimation(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", parts: [{ text: chatInput }] }]
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimeout(() => {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "bot",
            content: data.response,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, botMessage]);
          setTypingAnimation(false);
        }, 1500);
      } else {
        throw new Error(data.error || "Failed to send message");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setTypingAnimation(false);
    } finally {
      setIsLoading(false);
    }
  };

  const generateImage = async () => {
    if (!imagePrompt.trim() || isImageLoading) return;

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate images.",
        variant: "destructive",
      });
      return;
    }

    setIsImageLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      const data = await response.json();

      if (response.ok) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          prompt: imagePrompt,
          base64: data.image_base64,
          timestamp: new Date(),
        };
        setImages(prev => [newImage, ...prev]);
        setImagePrompt("");
        toast({
          title: "Success",
          description: "Image generated successfully!",
        });
      } else {
        throw new Error(data.error || "Failed to generate image");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImageLoading(false);
    }
  };

  const downloadImage = (base64: string, prompt: string) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${base64}`;
    link.download = `generated-${prompt.slice(0, 20).replace(/\s+/g, "-")}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with Auth */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-fade-in">
              AI Assistant
            </h1>
            <p className="text-slate-300 text-lg animate-fade-in animation-delay-500">
              Chat with AI and generate stunning images
            </p>
          </div>
          <div className="absolute top-0 right-0">
            <AuthHeader />
          </div>
        </div>

        {/* Main interface */}
        <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50 shadow-2xl shadow-purple-500/20 animate-scale-in">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 border-slate-600">
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-300"
              >
                <Bot className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="images" 
                className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white transition-all duration-300"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Generate Images
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="p-6">
              <div className="space-y-6">
                {/* Messages */}
                <div className="h-96 overflow-y-auto space-y-4 p-4 bg-slate-900/30 rounded-lg border border-slate-700/50">
                  {messages.length === 0 && (
                    <div className="text-center text-slate-400 mt-20">
                      <Bot className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                      <p>Start a conversation with your AI assistant</p>
                      {!isAuthenticated && (
                        <p className="text-sm mt-2 text-slate-500">Sign in to unlock chat features</p>
                      )}
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.type === "user"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                            : "bg-gradient-to-r from-slate-700 to-slate-600 text-slate-100 shadow-lg shadow-slate-500/30"
                        } transform hover:scale-105 transition-transform duration-200`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === "bot" && <Bot className="w-5 h-5 mt-0.5 text-cyan-400" />}
                          {message.type === "user" && <User className="w-5 h-5 mt-0.5" />}
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {typingAnimation && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-4 py-3 rounded-2xl shadow-lg">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-5 h-5 text-cyan-400" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce animation-delay-200"></div>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce animation-delay-400"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat input */}
                <div className="flex space-x-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={isAuthenticated ? "Type your message..." : "Sign in to start chatting..."}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/50"
                    disabled={isLoading || !isAuthenticated}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !chatInput.trim() || !isAuthenticated}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="p-6">
              <div className="space-y-6">
                {/* Image generation input */}
                <div className="flex space-x-2">
                  <Input
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder={isAuthenticated ? "Describe the image you want to generate..." : "Sign in to generate images..."}
                    onKeyPress={(e) => e.key === "Enter" && generateImage()}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/50"
                    disabled={isImageLoading || !isAuthenticated}
                  />
                  <Button
                    onClick={generateImage}
                    disabled={isImageLoading || !imagePrompt.trim() || !isAuthenticated}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/30 transform hover:scale-105 transition-all duration-200"
                  >
                    {isImageLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Images grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((image) => (
                    <Card
                      key={image.id}
                      className="bg-slate-800/50 border-slate-700/50 overflow-hidden hover:shadow-xl hover:shadow-cyan-500/20 transform hover:scale-105 transition-all duration-300 animate-fade-in"
                    >
                      <div className="relative group">
                        <img
                          src={`data:image/png;base64,${image.base64}`}
                          alt={image.prompt}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button
                            onClick={() => downloadImage(image.base64, image.prompt)}
                            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                            size="sm"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-slate-300 text-sm line-clamp-2">{image.prompt}</p>
                        <p className="text-slate-500 text-xs mt-2">
                          {image.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>

                {images.length === 0 && (
                  <div className="text-center text-slate-400 mt-20">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
                    <p>Generate your first AI image</p>
                    {!isAuthenticated && (
                      <p className="text-sm mt-2 text-slate-500">Sign in to unlock image generation</p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Index;
