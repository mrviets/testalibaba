export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  balance: number;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  image_url?: string;
  available_count: number;
  total_count: number;
  product_type: 'account' | 'tool';
  tutorial_content?: string;
  tutorial_video_url?: string;
  tutorial_steps?: string[];
  download_file_name?: string;
  download_file_size?: string;
  download_file_url?: string;
  download_requirements?: string;
  download_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: number;
  product_id: number;
  username: string;
  password: string;
  additional_info?: string;
  account_data?: string;
  status: 'available' | 'sold' | 'reserved';
  sold_to_user_id?: number;
  sold_at?: string;
  created_at: string;
  updated_at: string;
  product?: Product;
  soldToUser?: User;
}

export interface Order {
  id: number;
  user_id: number;
  product_id: number;
  account_id?: number;
  order_code: string;
  amount: number;
  quantity: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  completed_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  product?: Product;
  account?: Account;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'deposit' | 'purchase' | 'refund';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference_code?: string;
  processed_at?: string;
  processed_by?: number;
  created_at: string;
  updated_at: string;
  user?: User;
  processedBy?: User;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface CreateOrderData {
  product_id: number;
  quantity: number;
}

export interface CreateTransactionData {
  type: 'deposit' | 'purchase' | 'refund';
  amount: number;
  description: string;
}

export interface AutoDeposit {
  id: number;
  user_id: number;
  reference_code: string;
  amount: number;
  bank_account: string;
  qr_code_url?: string;
  status: 'pending' | 'completed' | 'expired' | 'failed';
  webhook_transaction_id?: string;
  webhook_data?: any;
  expires_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}
