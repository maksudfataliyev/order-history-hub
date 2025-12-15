import { useState } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  messages: Message[];
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    participantId: 'user-2',
    participantName: 'Anar M.',
    lastMessage: 'Is the sofa still available?',
    lastMessageTime: '2h ago',
    unread: true,
    messages: [
      { id: 'm1', senderId: 'user-2', text: 'Hello! Is the sofa still available?', timestamp: '2024-01-15T10:30:00' },
      { id: 'm2', senderId: 'current', text: 'Yes, it is! Are you interested?', timestamp: '2024-01-15T10:35:00' },
      { id: 'm3', senderId: 'user-2', text: 'Is the sofa still available?', timestamp: '2024-01-15T10:40:00' },
    ],
  },
  {
    id: '2',
    participantId: 'user-3',
    participantName: 'Leyla H.',
    lastMessage: 'Would you accept a trade for...',
    lastMessageTime: '1d ago',
    unread: false,
    messages: [
      { id: 'm1', senderId: 'user-3', text: 'Hi! I saw your dining table listing.', timestamp: '2024-01-14T09:00:00' },
      { id: 'm2', senderId: 'current', text: 'Hello! Yes, what would you like to know?', timestamp: '2024-01-14T09:05:00' },
      { id: 'm3', senderId: 'user-3', text: 'Would you accept a trade for my vintage armchair?', timestamp: '2024-01-14T09:10:00' },
    ],
  },
  {
    id: '3',
    participantId: 'user-4',
    participantName: 'Rashad K.',
    lastMessage: 'Thank you for the quick delivery!',
    lastMessageTime: '3d ago',
    unread: false,
    messages: [
      { id: 'm1', senderId: 'current', text: 'Your order has been shipped!', timestamp: '2024-01-12T14:00:00' },
      { id: 'm2', senderId: 'user-4', text: 'Great, thanks!', timestamp: '2024-01-12T14:05:00' },
      { id: 'm3', senderId: 'user-4', text: 'Thank you for the quick delivery!', timestamp: '2024-01-13T10:00:00' },
    ],
  },
];

export const ChatSection = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: crypto.randomUUID(),
      senderId: 'current',
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { 
            ...conv, 
            messages: [...conv.messages, message],
            lastMessage: message.text,
            lastMessageTime: 'Just now',
          }
        : conv
    ));

    setSelectedConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message],
    } : null);

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (selectedConversation) {
    return (
      <div className="flex flex-col h-[500px] bg-card border border-border rounded-xl overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/50">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSelectedConversation(null)}
            className="sm:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedConversation.participantAvatar} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {selectedConversation.participantName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{selectedConversation.participantName}</h3>
            <p className="text-xs text-muted-foreground">Active now</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedConversation(null)}
            className="hidden sm:flex"
          >
            Back to list
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedConversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex',
                msg.senderId === 'current' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[75%] p-3 rounded-2xl',
                  msg.senderId === 'current'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                )}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={cn(
                  'text-xs mt-1',
                  msg.senderId === 'current' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-background">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <Button 
              size="icon" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => setSelectedConversation(conv)}
          className={cn(
            'flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer hover:border-primary/50',
            conv.unread ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
          )}
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={conv.participantAvatar} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {conv.participantName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-foreground">{conv.participantName}</span>
              {conv.unread && (
                <span className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{conv.lastMessageTime}</span>
        </div>
      ))}
    </div>
  );
};
