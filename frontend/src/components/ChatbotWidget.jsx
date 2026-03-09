import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';

const QUICK_REPLIES = [
  { label: '📄 Upload Resume', message: 'How do I upload my resume?' },
  { label: '💼 Apply to Jobs', message: 'How do I apply to jobs?' },
  { label: '📊 Match Score', message: 'What is the match score?' },
  { label: '🏆 Certificates', message: 'How does certificate verification work?' },
  { label: '🚀 Career Guide', message: 'Tell me about career guidance' },
  { label: '⚙️ Backend Path', message: 'How to become a backend developer?' },
  { label: '🧠 AI/ML Path', message: 'How to get into AI and machine learning?' },
  { label: '📝 Post a Job', message: 'How do I post a job as a recruiter?' },
];

function ChatbotWidget() {
  const { user, token } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi there! 👋 I am the CollabNet AI Assistant.\n\nI can help you with resumes, job applications, career guidance, certificate verification, and more.\n\nTap a quick option below or type your question!' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isOpen, showQuickReplies]);

  if (!token || !user) return null;

  const sendMessage = async (userMessage) => {
    setMessages((p) => [...p, { sender: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);
    setShowQuickReplies(false);

    try {
      const response = await api.post('/chatbot/ask', { message: userMessage });
      const reply = response.data.success ? response.data.reply : 'Sorry, I encountered an error.';
      setMessages((p) => [...p, { sender: 'bot', text: reply }]);
    } catch {
      setMessages((p) => [...p, { sender: 'bot', text: 'Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setIsLoading(false);
      // Show quick replies again after bot responds
      setTimeout(() => setShowQuickReplies(true), 500);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
  };

  const handleQuickReply = (qr) => {
    sendMessage(qr.message);
  };

  // Format bot messages: bold text between ** ** and newlines
  const formatMessage = (text) => {
    if (!text) return text;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      // Handle newlines
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>{j > 0 && <br />}{line}</span>
      ));
    });
  };

  return (
    <>
      {/* Floating Button */}
      <button onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all z-50"
        aria-label="Chatbot">
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[560px] glass rounded-2xl shadow-2xl shadow-indigo-500/10 flex flex-col z-50 overflow-hidden border border-white/10">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 shrink-0">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-bold text-white text-sm mr-3 backdrop-blur">AI</div>
              <div className="text-white">
                <h3 className="font-bold text-sm tracking-wide">CollabNet Assistant</h3>
                <p className="text-xs text-indigo-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a1a]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-none shadow-lg shadow-indigo-500/10'
                    : 'bg-white/5 border border-white/10 text-gray-300 rounded-bl-none'
                }`}>
                  {msg.sender === 'bot' ? formatMessage(msg.text) : msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-bl-none flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}

            {/* Quick Reply Options */}
            {showQuickReplies && !isLoading && (
              <div className="flex flex-wrap gap-2 pt-2">
                {QUICK_REPLIES.map((qr, idx) => (
                  <button key={idx} onClick={() => handleQuickReply(qr)}
                    className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs font-medium hover:bg-indigo-500/20 hover:border-indigo-400/30 transition-all active:scale-95 whitespace-nowrap">
                    {qr.label}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/5 p-3 shrink-0 bg-[#0d0d22]">
            <form onSubmit={handleSend} className="flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question..."
                disabled={isLoading} className="flex-1 bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition" />
              <button type="submit" disabled={isLoading || !input.trim()}
                className={`p-2.5 rounded-xl text-white transition-all ${isLoading || !input.trim() ? 'bg-indigo-500/20 cursor-not-allowed' : 'bg-gradient-to-br from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95'}`}
                aria-label="Send">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;
