import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Trash2, Github, Zap } from 'lucide-react';
import { ChatMessage, Role, SendMessageOptions, GroundingSource } from './types';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import { streamGeminiResponse, fileToGenerativePart } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'init-1',
          role: Role.MODEL,
          text: "Hello! I'm **Gemini Spark v2**. \n\nI can now **Browse the Web** 🌐, **Think Deeply** 🧠, and analyze your images. \n\nTry enabling the toggles below to see what I can do!",
          timestamp: Date.now()
        }
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async ({ message, image, config }: SendMessageOptions) => {
    if (isLoading) return;

    let imageBase64: string | undefined = undefined;
    if (image) {
      try {
        imageBase64 = await fileToGenerativePart(image);
      } catch (e) {
        console.error("Failed to process image", e);
        return;
      }
    }

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: Role.USER,
      text: message,
      image: imageBase64,
      timestamp: Date.now()
    };

    // Add user message to state
    const updatedHistory = [...messages, newUserMessage];
    setMessages(updatedHistory);
    setIsLoading(true);

    // Placeholder for AI response
    const botMessageId = (Date.now() + 1).toString();
    const initialBotMessage: ChatMessage = {
      id: botMessageId,
      role: Role.MODEL,
      text: '',
      isStreaming: true,
      timestamp: Date.now(),
      modelConfig: config, // Store what config was used for this turn
      groundingSources: []
    };

    setMessages(prev => [...prev, initialBotMessage]);

    try {
      let fullText = '';
      let collectedSources: GroundingSource[] = [];
      
      await streamGeminiResponse(
        updatedHistory,
        message,
        imageBase64,
        config,
        (chunkText) => {
          fullText += chunkText;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, text: fullText } 
                : msg
            )
          );
        },
        (sources) => {
           // Merge sources avoiding duplicates if any
           sources.forEach(s => {
             if (!collectedSources.find(cs => cs.uri === s.uri)) {
               collectedSources.push(s);
             }
           });
           
           setMessages(prev => 
            prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, groundingSources: collectedSources } 
                : msg
            )
          );
        }
      );

      // Finalize message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error(error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: "**Error**: I encountered an issue connecting to the API. Please try again.", isStreaming: false } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the conversation?")) {
      setMessages([
        {
          id: Date.now().toString(),
          role: Role.MODEL,
          text: "Chat cleared. Ready for a new topic!",
          timestamp: Date.now()
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950">
      
      {/* Header */}
      <header className="flex-none px-6 py-4 flex items-center justify-between border-b border-white/5 bg-slate-950/60 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
            <div className="relative h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center border border-white/10">
              <Sparkles className="text-indigo-400" size={20} />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 flex items-center gap-2">
              Gemini Spark <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">v2.0</span>
            </h1>
            <div className="flex items-center gap-1.5">
               <Zap size={10} className="text-amber-400 fill-amber-400" />
               <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Powered by Google Gen AI</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Clear Chat"
          >
            <Trash2 size={20} />
          </button>
          <a 
            href="https://github.com/google/generative-ai-js" 
            target="_blank" 
            rel="noreferrer"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Github size={20} />
          </a>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-4xl mx-auto flex flex-col min-h-full justify-start">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50">
              <Sparkles size={48} className="mb-4" />
              <p>Start a conversation...</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none z-20">
        <InputArea onSend={handleSendMessage} isLoading={isLoading} />
      </footer>
    </div>
  );
};

export default App;