/**
 * Chat WebSocket Service - Infrastructure layer
 * Handles WebSocket connections for real-time chat
 */

export interface ChatMessage {
  id?: string;
  content: string;
  senderId: string;
  senderName: string;
  targetUserId?: string;
  timestamp: string;
  type: 'text' | 'system';
}

export interface ChatWebSocketConfig {
  baseUrl?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class ChatWebSocketService {
  private ws: WebSocket | null = null;
  private config: ChatWebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];
  private isConnecting = false;

  constructor(config: ChatWebSocketConfig = {}) {
    this.config = {
      baseUrl: 'ws://localhost:8081',
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...config,
    };
  }

  connect(currentUserId: string, targetUserId: string, token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
        resolve();
        return;
      }

      this.isConnecting = true;
      this.disconnect(); // Clean up any existing connection

      try {
        let wsUrl = `${this.config.baseUrl}/ws/chat?userId=${currentUserId}&targetUserId=${targetUserId}`;
        
        // Add token if provided (required for authentication)
        if (token) {
          wsUrl += `&token=${encodeURIComponent(token)}`;
        }

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('Chat WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.notifyConnectionHandlers(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const message: ChatMessage = {
              id: data.id || Date.now().toString(),
              content: data.content || data.message || '',
              senderId: data.senderId || data.from || '',
              senderName: data.senderName || data.fromName || 'Unknown',
              targetUserId: data.targetUserId || data.to,
              timestamp: data.timestamp || new Date().toISOString(),
              type: data.type || 'text',
            };
            
            this.notifyMessageHandlers(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('Chat WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.notifyConnectionHandlers(false);
          
          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < (this.config.maxReconnectAttempts || 5)) {
            this.scheduleReconnect(currentUserId, targetUserId, token);
          }
        };

        this.ws.onerror = (error) => {
          console.error('Chat WebSocket error:', error);
          this.isConnecting = false;
          this.notifyConnectionHandlers(false);
          reject(error);
        };

        // Timeout for connection
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private scheduleReconnect(currentUserId: string, targetUserId: string, token?: string) {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`);
      
      this.connect(currentUserId, targetUserId, token).catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, this.config.reconnectInterval);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }

    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.notifyConnectionHandlers(false);
  }

  sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return false;
    }

    try {
      const messageWithTimestamp = {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };

      this.ws.send(JSON.stringify(messageWithTimestamp));
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  onMessage(handler: (message: ChatMessage) => void) {
    this.messageHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onConnectionChange(handler: (connected: boolean) => void) {
    this.connectionHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  private notifyMessageHandlers(message: ChatMessage) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  private notifyConnectionHandlers(connected: boolean) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }
}
