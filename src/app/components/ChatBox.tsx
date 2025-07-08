'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTravelPlanContext } from '@/hooks/useTravelPlanContext';
import { XhsGrassAvatar } from './Chatbox/XhsGrassAvatar';
import styles from './ChatBox.module.css';
import ReactMarkdown from 'react-markdown';

export default function ChatBox() {
  const { state, addMessage, setLoading } = useTravelPlanContext();
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const [headerScale, setHeaderScale] = useState(0.7);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatHistory]);

  useEffect(() => {
    if (state.chatHistory.length === 0) {
      setTimeout(() => setHeaderScale(1), 100);
    }
  }, [state.chatHistory.length]);

  const sendMessage = async () => {
    if (!input.trim() || state.loading) return;

    addMessage({ role: 'user', content: input });
    const userInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...state.chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: userInput }
          ],
          temperature: 0.7
        }),
      });

      const data = await res.json();
      const aiReply = data?.result?.content || '抱歉，AI没有回复。';
      addMessage({ role: 'assistant', content: aiReply });
    } catch {
      addMessage({ role: 'assistant', content: '😥 网络错误，请重试' });
    } finally {
      setLoading(false);
    }
  };

  // 过滤AI回复中的json代码块和独立json对象
  function filterJsonContent(text: string) {
    // 移除 ```json ... ``` 代码块
    let filtered = text.replace(/```json[\s\S]*?```/gi, '');
    // 移除独立的 JSON 对象（如 { ... })，仅当整段为json时移除
    filtered = filtered.replace(/^\s*\{[\s\S]*?\}\s*$/gm, '');
    return filtered.trim();
  }

  return (
    <div className="relative flex flex-col h-full bg-white bg-[url('/img/paper-texture-4.png')] bg-cover">
      <div className="flex-1 overflow-y-auto p-4">
        {state.chatHistory.length === 0 && (
          <div className="text-center pt-16 pb-12">
            <div className="relative inline-block">
              <img
                src="/img/种草官grassheader.png"
                alt="种草官grassheader"
                className={styles.wiggle}
                style={{
                  display: 'inline-block',
                  transform: `scale(${headerScale})`,
                  transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
                }}
                width={368}
                height={138}
              />
            </div>
          </div>
        )}
        
        {state.chatHistory.map((msg) => (
          <div key={msg.id} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block max-w-[85%] px-4 py-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white rounded-br-md' 
                : 'bg-gray-100 text-gray-800 rounded-bl-md'
            }`}>
              <div className="text-sm font-medium mb-1">
                {msg.role === 'user' ? '我' : '种草官'}
              </div>
              <div className="prose prose-sm max-w-none text-left">
                <ReactMarkdown>{filterJsonContent(msg.content)}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {state.loading && (
          <div className="text-left mb-4">
            <div className="inline-block bg-gray-100 px-4 py-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t p-4 pb-[env(safe-area-inset-bottom)]">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={() => input.trim() && sendMessage()}
            placeholder="想去哪个城市玩？🌍"
            className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:border-blue-500 mt-[10px] mb-[10px]"
            disabled={state.loading}
          />
          <button
            onClick={sendMessage}
            disabled={state.loading || !input.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-full font-medium disabled:opacity-50 mt-[10px] mb-[10px]"
          >
            {state.loading ? '...' : '发送'}
          </button>
        </div>
        <div style={{position: 'absolute', right: 32, bottom: 80, zIndex: 10}}>
          <XhsGrassAvatar />
        </div>
      </div>
    </div>
  );
}