'use client';

import { useState } from 'react';
import { SearchAPI } from '@/lib/api';

interface SearchSource {
  noteId: string;
  title: string;
  excerpt: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: SearchSource[];
}

interface ConversationalSearchProps {
  userId: string;
  onNoteClick: (noteId: string) => void;
}

export default function ConversationalSearch({ userId, onNoteClick }: ConversationalSearchProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await SearchAPI.conversationalSearch(
        input,
        userId,
        conversationId,
      );

      setConversationId(result.conversationId);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: result.response,
          sources: result.sources,
        },
      ]);
    } catch (error) {
      console.error('Search failed:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error while searching your notes. Please try again.',
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ask ScribbleAI</h2>
            <p className="text-xs text-gray-600">Search your notes naturally</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-700 font-medium mb-4">Try asking:</p>
            <div className="space-y-2">
              <button
                onClick={() => setInput('What did I work on last week?')}
                className="block w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-800 font-medium transition-colors border border-gray-200"
              >
                &ldquo;What did I work on last week?&rdquo;
              </button>
              <button
                onClick={() => setInput('Find my React notes')}
                className="block w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-800 font-medium transition-colors border border-gray-200"
              >
                &ldquo;Find my React notes&rdquo;
              </button>
              <button
                onClick={() => setInput('Show me notes about meetings')}
                className="block w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-800 font-medium transition-colors border border-gray-200"
              >
                &ldquo;Show me notes about meetings&rdquo;
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Sources:</p>
                  {msg.sources.map((source, i) => (
                    <button
                      key={i}
                      onClick={() => onNoteClick(source.noteId)}
                      className="block w-full text-left p-2 bg-white rounded-lg hover:bg-indigo-50 transition-colors border border-gray-200"
                    >
                      <p className="text-sm font-semibold text-indigo-700">{source.title}</p>
                      <p className="text-xs text-gray-700 line-clamp-1">{source.excerpt}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask anything about your notes..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

