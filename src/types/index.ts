
export interface ActionRequest {
  id: string;
  text: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'error';
}

export interface ActionResponse {
  id: string;
  requestId: string; 
  text: string;
  timestamp: Date;
  type: 'text' | 'result';
}

export interface SuggestionItem {
  id: string;
  text: string;
  icon: string;
}
