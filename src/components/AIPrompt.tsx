/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  X, 
  Command, 
  Send, 
  RotateCcw, 
  Bot, 
  Layers, 
  Wand2, 
  ShieldAlert, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

interface AIPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string, options?: { model: string; systemPrompt?: string }) => void;
  currentContext?: string;
  aiConfigs?: { provider: string; model: string; apiKey: string }[];
}

const DEFAULT_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gpt-4o',
  'claude-3-5-sonnet'
];

const PRESET_PROMPTS = [
  {
    label: '生成边界用例',
    prompt: '请基于当前场景，自动生成包含极限值、空值、SQL特殊字符及超时等边界测试用例。'
  },
  {
    label: '补充校验断言',
    prompt: '请分析各节点的返回数据结构，自动添加状态码200校验、响应时延(<500ms)以及关键JSON字段完整性断言。'
  },
  {
    label: '参数化测试数据',
    prompt: '将当前步骤中的硬编码入参提取为动态变量，并生成一份包含有效与无效场景的测试数据集。'
  },
  {
    label: '流程安全审计',
    prompt: '对当前测试用例流进行安全漏洞与鉴权机制审查，找出未经验证的敏感数据暴露点。'
  }
];

export function AIPrompt({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentContext = '项目全局',
  aiConfigs = [] 
}: AIPromptProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS[0]);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Available models from configured keys or defaults
  const availableModels = aiConfigs.length > 0 
    ? aiConfigs.map(c => `${c.provider} · ${c.model}`)
    : DEFAULT_MODELS;

  useEffect(() => {
    if (aiConfigs.length > 0) {
      setSelectedModel(`${aiConfigs[0].provider} · ${aiConfigs[0].model}`);
    } else {
      setSelectedModel(DEFAULT_MODELS[0]);
    }
  }, [aiConfigs]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    } else {
      setPrompt('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isOpen) {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, prompt, selectedModel, systemPrompt]);

  const handleSubmit = () => {
    if (!prompt.trim() || isSubmitting) return;
    setIsSubmitting(true);
    onSubmit(prompt.trim(), { model: selectedModel, systemPrompt });
    setTimeout(() => {
      setIsSubmitting(false);
      setPrompt('');
      onClose();
    }, 400);
  };

  const handleClear = () => {
    setPrompt('');
    inputRef.current?.focus();
  };

  const tokenEstimate = Math.ceil(prompt.trim().length / 3.5);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.96, y: -20, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed top-20 left-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden border border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-200">
                  <Sparkles size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-gray-900">大模型 Prompt</h2>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Layers size={10} />
                      {currentContext}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">向大模型输入自然语言提示词以生成、优化或审计测试流</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="appearance-none bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold pl-2.5 pr-7 py-1.5 rounded-lg outline-none cursor-pointer focus:border-blue-500 transition-colors shadow-2xs"
                  >
                    {availableModels.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <button 
                  onClick={onClose} 
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                  title="关闭"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Prompt Input Section */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Bot size={14} className="text-blue-600" />
                  提示词文本 (Prompt)
                </label>
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span>{prompt.length} 字符</span>
                  <span>约 {tokenEstimate} Tokens</span>
                  {prompt && (
                    <button 
                      onClick={handleClear} 
                      className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                      title="清空输入"
                    >
                      <RotateCcw size={11} />
                      清空
                    </button>
                  )}
                </div>
              </div>

              <div className="relative rounded-xl border border-gray-200 bg-gray-50/40 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <textarea
                  ref={inputRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="在此输入需要大模型处理的任务文本...&#10;例如：&#10;• 请为当前测试流补充异常边界用例，覆盖登录密码错误与账号冻结情况&#10;• 提取前序节点的响应 token 传递给后续请求，并配置自动刷新断言&#10;• 自动生成 5 组针对商品下单接口的合法测试入参"
                  className="w-full h-36 bg-transparent text-gray-800 text-xs sm:text-sm resize-none outline-none p-3.5 leading-relaxed font-sans placeholder:text-gray-400"
                />
              </div>

              {/* Preset Quick Chips */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Wand2 size={11} className="text-gray-400" />
                  常用快捷指令 (点击填入):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PROMPTS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(preset.prompt)}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-transparent text-gray-600 text-xs rounded-lg transition-all active:scale-95 text-left"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Collapsible */}
              <div className="pt-1">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors font-medium"
                >
                  <SlidersHorizontal size={12} />
                  <span>高级配置 (系统指令 / System Prompt)</span>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-2"
                    >
                      <input
                        type="text"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        placeholder="可选系统人设/指令，如：你是一位顶级 QA 架构师，严格输出断言格式..."
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white text-gray-800"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono text-[10px] text-gray-500 shadow-2xs">
                  <Command size={10} />
                  <span>Enter</span>
                </div>
                <span>发送</span>
                <span className="text-gray-300">·</span>
                <div className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono text-[10px] text-gray-500 shadow-2xs">
                  <span>Esc</span>
                </div>
                <span>关闭</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || isSubmitting}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold transition-all shadow-md active:scale-95 ${
                    prompt.trim() && !isSubmitting
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Send size={13} />
                  <span>{isSubmitting ? '发送中...' : '发送 Prompt'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
