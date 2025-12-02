import React from 'react';
import { User, Sparkles, ExternalLink, Globe, BrainCircuit } from 'lucide-react';
import { ChatMessage, Role } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  // Custom "Lite" Markdown Parser
  // We use this instead of a heavy library to keep the app lightweight and avoid complex polyfills in this environment
  const renderMarkdown = (text: string) => {
    if (!text) return null;

    // 1. Split by Code Blocks (```)
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // Handle Code Block
      if (part.startsWith('```') && part.endsWith('```')) {
        const content = part.slice(3, -3).replace(/^[a-z]+\n/, ''); // remove language identifier if present
        return (
          <div key={index} className="my-3 overflow-hidden rounded-lg bg-slate-950/50 border border-slate-700/50">
            <div className="flex items-center px-3 py-1.5 bg-slate-900/50 border-b border-slate-700/30">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
              </div>
            </div>
            <pre className="p-3 overflow-x-auto text-xs md:text-sm font-mono text-slate-300">
              <code>{content.trim()}</code>
            </pre>
          </div>
        );
      }

      // Handle Regular Text (Inline formatting)
      // Split by double newline for paragraphs
      return part.split(/\n\n+/).map((paragraph, pIndex) => {
        // Process inline bold, italic, inline-code
        const processInline = (str: string) => {
          // Rudimentary parsing for Bold (**text**) and Inline Code (`text`)
          // We split by ` then by **
          const codeSegments = str.split(/(`[^`]+`)/g);
          return codeSegments.map((seg, i) => {
            if (seg.startsWith('`') && seg.endsWith('`')) {
              return <code key={i} className="px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-200 font-mono text-xs">{seg.slice(1, -1)}</code>;
            }
            // Process Bold
            const boldSegments = seg.split(/(\*\*[^*]+\*\*)/g);
            return boldSegments.map((bSeg, j) => {
              if (bSeg.startsWith('**') && bSeg.endsWith('**')) {
                return <strong key={`${i}-${j}`} className="font-semibold text-white">{bSeg.slice(2, -2)}</strong>;
              }
              // Basic list handling for lines starting with "- " or "* "
              if (bSeg.trim().startsWith('- ') || bSeg.trim().startsWith('* ')) {
                  return (
                    <ul key={`${i}-${j}`} className="list-disc pl-4 space-y-1 my-2">
                        {bSeg.split('\n').map((line, k) => {
                            const trimmed = line.trim();
                            if(trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                                return <li key={k}>{trimmed.substring(2)}</li>
                            }
                            return <span key={k}>{line}<br/></span>
                        })}
                    </ul>
                  )
              }
              return bSeg;
            });
          });
        };

        if (!paragraph.trim()) return null;

        return (
          <p key={`${index}-${pIndex}`} className="mb-2 last:mb-0 leading-relaxed whitespace-pre-wrap">
            {processInline(paragraph)}
          </p>
        );
      });
    });
  };

  const hasSources = message.groundingSources && message.groundingSources.length > 0;
  const isThinking = message.modelConfig?.useThinking;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8 group animate-fade-in-up`}>
      <div className={`flex max-w-[90%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center shadow-lg ${
          isUser 
            ? 'bg-blue-600 text-white shadow-blue-900/20' 
            : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-purple-900/20'
        }`}>
          {isUser ? <User size={18} /> : <Sparkles size={18} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full min-w-0`}>
          
          {/* Metadata Badges for Model */}
          {!isUser && (isThinking || hasSources) && (
             <div className="flex gap-2 mb-2 ml-1">
                {isThinking && (
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                        <BrainCircuit size={10} />
                        <span>Thinking</span>
                    </div>
                )}
                {hasSources && (
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <Globe size={10} />
                        <span>Connected</span>
                    </div>
                )}
             </div>
          )}

          <div className={`px-5 py-4 rounded-2xl shadow-sm text-sm md:text-base ${
            isUser 
              ? 'bg-blue-600 text-white rounded-tr-sm' 
              : 'bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-slate-200 rounded-tl-sm w-full'
          }`}>
            
            {message.image && (
              <div className="mb-4 overflow-hidden rounded-lg border border-white/10 shadow-lg">
                <img 
                  src={message.image} 
                  alt="User attachment" 
                  className="max-h-60 w-auto object-cover" 
                />
              </div>
            )}

            <div className={`prose prose-invert max-w-none ${isUser ? 'text-blue-50' : 'text-slate-200'}`}>
              {isUser ? message.text : renderMarkdown(message.text)}
              
              {message.isStreaming && (
                <span className="inline-flex gap-1 items-center ml-1 align-baseline">
                   <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]"></span>
                   <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]"></span>
                   <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"></span>
                </span>
              )}
            </div>
            
            {/* Grounding Sources (Search Results) */}
            {!isUser && hasSources && (
                <div className="mt-4 pt-3 border-t border-slate-700/50">
                    <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
                        <Globe size={12} /> Sources
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {message.groundingSources!.map((source, idx) => (
                            <a 
                                key={idx}
                                href={source.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 max-w-full bg-slate-900/50 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 rounded px-2 py-1 transition-colors group"
                            >
                                <span className="text-xs text-slate-300 truncate max-w-[150px]">{source.title}</span>
                                <ExternalLink size={10} className="text-slate-500 group-hover:text-slate-300" />
                            </a>
                        ))}
                    </div>
                </div>
            )}

          </div>
          
          <span className="text-xs text-slate-500 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;