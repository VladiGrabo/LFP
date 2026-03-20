export interface Database {
  public: {
    Tables: {
      financial_goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          target_amount: number;
          current_amount: number;
          deadline: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          target_amount: number;
          current_amount?: number;
          deadline: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          target_amount?: number;
          current_amount?: number;
          deadline?: string;
          created_at?: string;
        };
      };
      income: {
        Row: {
          id: string;
          user_id: string;
          source: string;
          amount: number;
          category: string;
          date: string;
          description: string;
          is_recurring: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source: string;
          amount: number;
          category: string;
          date: string;
          description?: string;
          is_recurring?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source?: string;
          amount?: number;
          category?: string;
          date?: string;
          description?: string;
          is_recurring?: boolean;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          amount: number;
          category: string;
          date: string;
          description: string;
          is_recurring: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          amount: number;
          category: string;
          date: string;
          description?: string;
          is_recurring?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          amount?: number;
          category?: string;
          date?: string;
          description?: string;
          is_recurring?: boolean;
          created_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          value: number;
          description: string;
          purchase_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: string;
          value: number;
          description?: string;
          purchase_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string;
          value?: number;
          description?: string;
          purchase_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bank_statements: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_content: string;
          status: string;
          transactions_extracted: number;
          error_message: string | null;
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_content: string;
          status?: string;
          transactions_extracted?: number;
          error_message?: string | null;
          created_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          file_content?: string;
          status?: string;
          transactions_extracted?: number;
          error_message?: string | null;
          created_at?: string;
          processed_at?: string | null;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          currency: string;
          created_at: string;
          updated_at: string;
          telegram_bot_token: string | null;
          telegram_chat_id: string | null;
          telegram_notifications_enabled: boolean | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          currency?: string;
          created_at?: string;
          updated_at?: string;
          telegram_bot_token?: string | null;
          telegram_chat_id?: string | null;
          telegram_notifications_enabled?: boolean | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          currency?: string;
          created_at?: string;
          updated_at?: string;
          telegram_bot_token?: string | null;
          telegram_chat_id?: string | null;
          telegram_notifications_enabled?: boolean | null;
        };
      };
    };
  };
}
