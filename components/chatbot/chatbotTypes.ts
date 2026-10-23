import { MOCK_PRODUCTS } from '../../data/products';

export type ChatMode = 'ai' | 'connecting' | 'agent' | 'live';

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'system' | 'agent';
  text: string;
  timestamp: Date;
  products?: typeof MOCK_PRODUCTS;
  quickReplies?: string[];
}
