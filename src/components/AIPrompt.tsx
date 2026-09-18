/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, CornerDownLeft, Command, Search, Wand2, Zap, Send } from 'lucide-react';

interface AIPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
}

export function AIPrompt({ isOpen, onClose, onSubmit }: AIPromptProps) {
  const [prompt, setPrompt] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    } else {
      setPrompt('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
      if (e.key === 'Enter' && e.metaKey && isOpen) handleSubmit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, prompt]);

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    onSubmit(prompt);
    setPrompt('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden border border-gray-200"
          >
            <div className="p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                  <Sparkles size={14} className="text-blue-600" />
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">AI Assistant</span>
                <div className="ml-auto flex items-center gap-2">
                   <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-400">
                    <Command size={10} />
                    <span>ENTER</span>
                  </div>
                  <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="How can I help you with the project or scenarios today?"
                  className="w-full h-32 bg-transparent text-gray-800 text-sm resize-none outline-none placeholder:text-gray-300 py-2 leading-relaxed"
                />
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                  <div className="flex items-center gap-4">
                    <ActionButton icon={<Wand2 size={14} />} label="Refactor" onClick={() => setPrompt('Refactor the selected scenario to...')} />
                    <ActionButton icon={<Zap size={14} />} label="Optimise" onClick={() => setPrompt('Optimize performance for...')} />
                    <ActionButton icon={<Search size={14} />} label="Audit" onClick={() => setPrompt('Audit the security of this test suite')} />
                  </div>
                  
                  <button 
                    onClick={handleSubmit}
                    disabled={!prompt.trim()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                      prompt.trim() 
                        ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 active:scale-95' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <span>Execute</span>
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex items-center gap-6">
              <Hint icon={<Command size={10} />} text="K to focus" />
              <Hint icon={<span className="text-[10px]">ESC</span>} text="to close" />
              <Hint icon={<Zap size={10} />} text="Instant commands supported" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-all border border-transparent hover:border-blue-100"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Hint({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-tight">
      {icon}
      <span>{text}</span>
    </div>
  );
}
