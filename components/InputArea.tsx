import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Loader2, Globe, BrainCircuit } from 'lucide-react';
import { SendMessageOptions, ModelConfig } from '../types';

interface InputAreaProps {
  onSend: (options: SendMessageOptions) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Model Configuration State
  const [useSearch, setUseSearch] = useState(false);
  const [useThinking, setUseThinking] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;
    
    onSend({
      message: input,
      image: selectedImage,
      config: {
        useSearch,
        useThinking
      }
    });
    
    setInput('');
    clearImage();
    
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2">
      <div className="relative flex flex-col bg-slate-800/90 backdrop-blur-xl border border-slate-700/60 rounded-3xl shadow-2xl transition-all focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/40">
        
        {/* Image Preview Area */}
        {imagePreview && (
          <div className="px-4 pt-4 pb-2 flex animate-fade-in">
            <div className="relative group">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-24 w-24 object-cover rounded-xl border border-slate-600 shadow-lg"
              />
              <button 
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-slate-900 text-slate-200 rounded-full p-1.5 shadow-md hover:bg-red-500 hover:text-white transition-colors border border-slate-700"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Text Input */}
        <div className="p-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Shift+Enter for new line)"
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-base px-4 py-3 focus:outline-none resize-none max-h-[150px] rounded-2xl"
            rows={1}
            disabled={isLoading}
          />
        </div>

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between px-2 pb-2">
          
          <div className="flex items-center gap-1">
            {/* Attachment Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-xl transition-all duration-200 group"
              title="Attach Image"
            >
              <ImageIcon size={20} className="group-hover:scale-110 transition-transform" />
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageSelect}
              />
            </button>

            <div className="w-px h-6 bg-slate-700 mx-1"></div>

            {/* Toggle: Search */}
            <button
              onClick={() => setUseSearch(!useSearch)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                useSearch 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30 border border-transparent'
              }`}
              title="Enable Google Search"
            >
              <Globe size={16} />
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* Toggle: Thinking */}
            <button
              onClick={() => setUseThinking(!useThinking)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                useThinking 
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30 border border-transparent'
              }`}
              title="Enable Deep Thinking"
            >
              <BrainCircuit size={16} />
              <span className="hidden sm:inline">Think</span>
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className={`p-3 rounded-xl flex items-center justify-center transition-all duration-300 ${
              (!input.trim() && !selectedImage) || isLoading
                ? 'bg-slate-700/50 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-105 active:scale-95'
            }`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
      
      {/* Footer / Disclaimers */}
      <div className="flex justify-between items-center mt-3 px-2">
         <div className="text-xs text-slate-500">
           {useThinking ? "Running in Reasoning Mode" : "Running in Fast Mode"}
         </div>
         <div className="text-xs text-slate-500">
            Gemini 2.5 Flash
         </div>
      </div>
    </div>
  );
};

export default InputArea;