/**
 * Chat Page Component - Clean Architecture
 * Individual chat conversation with WebSocket integration
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { getContainer } from '@/infrastructure/di/Container';
import { ChatWebSocketService, ChatMessage } from '@/infrastructure/websocket/ChatWebSocketService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  Loader2
} from 'lucide-react';

// Use ChatMessage from the WebSocket service

interface ChatUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  
  const wsServiceRef = useRef<ChatWebSocketService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat user details
  useEffect(() => {
    const fetchChatUser = async () => {
      if (!userId) return;
      
      try {
        const apiService = getContainer().getApiService();
        const response = await apiService.getUserById(userId);
        
        if (response.error) {
          toast({
            title: "Error",
            description: "Failed to load user details",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        setChatUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        toast({
          title: "Error",
          description: "Failed to load user details",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchChatUser();
  }, [userId, navigate, toast]);

  // WebSocket connection using service
  useEffect(() => {
    if (!userId || !currentUser) return;

    // Initialize WebSocket service
    wsServiceRef.current = new ChatWebSocketService({
      baseUrl: 'ws://localhost:8081',
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
    });

    // Set up message handler
    const unsubscribeMessage = wsServiceRef.current.onMessage((message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    // Set up connection handler
    const unsubscribeConnection = wsServiceRef.current.onConnectionChange((isConnected: boolean) => {
      setConnected(isConnected);
      if (isConnected) {
        // Send a system message to indicate connection
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: 'Connected to chat',
          senderId: 'system',
          senderName: 'System',
          timestamp: new Date().toISOString(),
          type: 'system'
        }]);
      }
    });

    // Connect to WebSocket with authentication token
    const connectWithAuth = async () => {
      try {
        // Get the current access token from auth repository
        const authRepository = getContainer().getAuthRepository();
        const token = await authRepository.getAccessToken();
        
        if (!token) {
          throw new Error('No authentication token available');
        }
        
        await wsServiceRef.current!.connect(currentUser.id, userId, token);
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to chat. Please check your authentication.",
          variant: "destructive",
        });
      }
    };
    
    connectWithAuth();

    // Cleanup on unmount
    return () => {
      unsubscribeMessage();
      unsubscribeConnection();
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
      }
    };
  }, [userId, currentUser, toast]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !wsServiceRef.current || !connected || sending) return;

    setSending(true);
    try {
      const messageData = {
        content: newMessage.trim(),
        senderId: currentUser?.id || '',
        senderName: getUserDisplayName(currentUser),
        targetUserId: userId,
        type: 'text' as const
      };

      const success = wsServiceRef.current.sendMessage(messageData);
      if (success) {
        setNewMessage('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.name) {
      const names = user.name.split(' ');
      return names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getUserDisplayName = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.name || user?.username || user?.email || 'Unknown User';
  };

  const formatTime = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">Loading Chat</h2>
            <p className="text-slate-600">Please wait while we set up your conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getUserInitials(chatUser)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-lg font-semibold">
                    {getUserDisplayName(chatUser)}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {connected ? 'Online' : 'Connecting...'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-4">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Chat with {getUserDisplayName(chatUser)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 pb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
                      } ${message.type === 'system' ? 'justify-center' : ''}`}
                    >
                      {message.type === 'system' ? (
                        <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          {message.content}
                        </div>
                      ) : (
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.senderId === currentUser?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === currentUser?.id
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!connected || sending}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !connected || sending}
                  size="sm"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {!connected && (
                <p className="text-xs text-muted-foreground mt-2">
                  Connecting to chat server...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
