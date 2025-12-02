export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  image?: string; // Base64 string
  isStreaming?: boolean;
  timestamp: number;
  // Metadata for grounding (search results)
  groundingSources?: GroundingSource[];
  // Metadata for performance/usage
  modelConfig?: ModelConfig; 
}

export interface ModelConfig {
  useSearch: boolean;
  useThinking: boolean;
}

export interface SendMessageOptions {
  message: string;
  image?: File | null;
  config: ModelConfig;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}