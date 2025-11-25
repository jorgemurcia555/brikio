import { useState } from 'react';
import { Send, Sparkles, Lock, Crown } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { useAuthStore } from '../../../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface AIChatPanelProps {
  onGenerateEstimate?: (prompt: string) => void;
}

export function AIChatPanel({ onGenerateEstimate }: AIChatPanelProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const isPremium = user?.subscription?.plan?.name === 'premium' || 
                    user?.subscription?.plan?.features?.aiEnabled;

  const handleSend = () => {
    if (!message.trim() || !isPremium) return;

    const userMessage = { role: 'user' as const, content: message };
    setMessages([...messages, userMessage]);
    setMessage('');

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant' as const,
        content: 'I\'m analyzing your requirements and will generate the estimate items based on your specifications...',
      };
      setMessages((prev) => [...prev, aiResponse]);
      
      // Call the actual generation function
      if (onGenerateEstimate) {
        onGenerateEstimate(message);
      }
    }, 1000);
  };

  const handleUpgrade = () => {
    navigate('/billing');
  };

  return (
    <div className={`w-full lg:w-80 lg:mt-[5rem] bg-white border-2 border-[#F4C197] rounded-2xl shadow-lg flex flex-col ${!isPremium ? 'opacity-50' : ''}`}>
      <div className="p-4 border-b-2 border-[#F4C197]">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className={`w-5 h-5 ${isPremium ? 'text-[#F15A24]' : 'text-[#C05A2B]'}`} />
          <h3 className="text-lg font-display text-[#8A3B12] font-bold">AI Assistant</h3>
          {!isPremium && (
            <Crown className="w-4 h-4 text-[#F15A24] ml-auto" />
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[180px] max-h-[calc(100vh-400px)]">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-[#6C4A32] mt-1">
            <Sparkles className="w-12 h-12 text-[#F4C197] mx-auto mb-3" />
            <p className="font-semibold text-[#8A3B12] mb-2">Ask me to generate your estimate</p>
            <p className="text-xs">
              Describe your project and I'll create line items automatically
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-[#F15A24] text-white'
                    : 'bg-[#FFF7EA] text-[#6C4A32] border border-[#F4C197]'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t-2 border-[#F4C197]">
        {!isPremium ? (
          <div className="space-y-3">
            <div className="bg-[#FFF7EA] border-2 border-dashed border-[#F4C197] rounded-lg p-3 text-center">
              <Lock className="w-6 h-6 text-[#C05A2B] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#8A3B12] mb-1">Premium Feature</p>
              <p className="text-xs text-[#6C4A32] mb-3">
                Unlock AI-powered estimate generation
              </p>
              <Button
                variant="primary"
                onClick={handleUpgrade}
                className="w-full"
                icon={<Crown className="w-4 h-4" />}
              >
                Upgrade to Premium
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Describe your project..."
              className="flex-1 px-3 py-2 border-2 border-[#F4C197] rounded-lg focus:outline-none focus:border-[#F15A24] text-sm text-[#6C4A32]"
              disabled={!isPremium}
            />
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={!message.trim() || !isPremium}
              icon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

