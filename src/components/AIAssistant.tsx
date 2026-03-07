import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { askQuestion, QwenMessage } from '../services/qwenService';

export const AIAssistant: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const conversationHistory: QwenMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await askQuestion(userMessage, conversationHistory);

      if (response.success && response.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: response.message! }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `錯誤：${response.error || '無法獲取回應'}` },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '抱歉，發生錯誤了。請稍後再試。' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    t('ai.question1'),
    t('ai.question2'),
    t('ai.question3'),
    t('ai.question4'),
  ];

  return (
    <div className="card-blur space-y-6 h-[calc(100vh-200px)] flex flex-col">
      {/* 標題 */}
      <div className="flex items-center gap-3">
        <Sparkles className="w-8 h-8 text-accent" />
        <div>
          <h2 className="text-3xl font-bold text-white">{t('ai.title')}</h2>
          <p className="text-white/60 text-sm">{t('ai.subtitle')}</p>
        </div>
      </div>

      {/* 聊天區域 */}
      <div className="flex-1 overflow-y-auto space-y-4 bg-white/5 rounded-xl p-4 border border-white/10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-6">
            <div className="text-6xl">🤖</div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">{t('ai.welcome')}</h3>
              <p className="text-white/60 mb-6">{t('ai.askAnything')}</p>
              
              {/* 建議問題 */}
              <div className="space-y-2">
                <p className="text-white/40 text-sm">{t('ai.suggestions')}:</p>
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(question)}
                    className="block w-full text-left bg-white/5 hover:bg-white/10 text-white/80 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    💡 {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-accent text-dark'
                    : 'bg-white/10 text-white border border-white/20'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-white px-4 py-3 rounded-2xl border border-white/20 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('ai.thinking')}</span>
            </div>
          </div>
        )}
      </div>

      {/* 輸入區域 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('ai.inputPlaceholder')}
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-xl bg-white/90 text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="btn-primary px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
          {t('ai.send')}
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
