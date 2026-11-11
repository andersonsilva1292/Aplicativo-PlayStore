export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      automation_activity: {
        Row: {
          action: string
          created_at: string
          id: string
          lesson_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      automation_bank_attempts: {
        Row: {
          answers: Json
          correct_answers: number
          created_at: string
          id: string
          level: string
          passed: boolean
          score_percentage: number
          time_spent_seconds: number
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json
          correct_answers: number
          created_at?: string
          id?: string
          level: string
          passed: boolean
          score_percentage: number
          time_spent_seconds?: number
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json
          correct_answers?: number
          created_at?: string
          id?: string
          level?: string
          passed?: boolean
          score_percentage?: number
          time_spent_seconds?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      automation_progress: {
        Row: {
          code_draft: string | null
          code_draft_updated_at: string | null
          code_submitted: string | null
          completed_at: string | null
          created_at: string
          exam_attempts: number
          exam_passed: boolean
          exam_score: number
          exam_taken_at: string | null
          id: string
          lesson_id: string
          notes: string | null
          pdf_opened_at: string | null
          quiz_draft: Json
          quiz_passed: boolean
          quiz_score: number
          submitted_at: string | null
          updated_at: string
          user_id: string
          video_position_seconds: number
          video_watched_at: string | null
        }
        Insert: {
          code_draft?: string | null
          code_draft_updated_at?: string | null
          code_submitted?: string | null
          completed_at?: string | null
          created_at?: string
          exam_attempts?: number
          exam_passed?: boolean
          exam_score?: number
          exam_taken_at?: string | null
          id?: string
          lesson_id: string
          notes?: string | null
          pdf_opened_at?: string | null
          quiz_draft?: Json
          quiz_passed?: boolean
          quiz_score?: number
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          video_position_seconds?: number
          video_watched_at?: string | null
        }
        Update: {
          code_draft?: string | null
          code_draft_updated_at?: string | null
          code_submitted?: string | null
          completed_at?: string | null
          created_at?: string
          exam_attempts?: number
          exam_passed?: boolean
          exam_score?: number
          exam_taken_at?: string | null
          id?: string
          lesson_id?: string
          notes?: string | null
          pdf_opened_at?: string | null
          quiz_draft?: Json
          quiz_passed?: boolean
          quiz_score?: number
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          video_position_seconds?: number
          video_watched_at?: string | null
        }
        Relationships: []
      }
      course_access: {
        Row: {
          active: boolean
          created_at: string
          expires_at: string | null
          granted_at: string
          id: string
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      java_lab_submissions: {
        Row: {
          code: string
          created_at: string
          exercise_id: string
          id: string
          logs: string
          passed: boolean
          passed_count: number
          total_count: number
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          exercise_id: string
          id?: string
          logs?: string
          passed?: boolean
          passed_count?: number
          total_count?: number
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          exercise_id?: string
          id?: string
          logs?: string
          passed?: boolean
          passed_count?: number
          total_count?: number
          user_id?: string
        }
        Relationships: []
      }
      lesson_media: {
        Row: {
          created_at: string
          generated_at: string | null
          id: string
          kind: string
          lesson_id: string
          script: Json
          status: string
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          generated_at?: string | null
          id?: string
          kind: string
          lesson_id: string
          script?: Json
          status?: string
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          generated_at?: string | null
          id?: string
          kind?: string
          lesson_id?: string
          script?: Json
          status?: string
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          approved_at: string | null
          confirmation_email_error: string | null
          confirmation_email_sent_at: string | null
          created_at: string
          currency: string
          email: string | null
          environment: string
          expires_at: string | null
          failure_reason: string | null
          id: string
          method: string
          mp_payment_id: string | null
          mp_preapproval_id: string | null
          paid_at: string | null
          price_id: string | null
          product_name: string | null
          provider: string
          refund_amount_cents: number
          refunded_at: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_cents?: number
          approved_at?: string | null
          confirmation_email_error?: string | null
          confirmation_email_sent_at?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          environment?: string
          expires_at?: string | null
          failure_reason?: string | null
          id?: string
          method?: string
          mp_payment_id?: string | null
          mp_preapproval_id?: string | null
          paid_at?: string | null
          price_id?: string | null
          product_name?: string | null
          provider?: string
          refund_amount_cents?: number
          refunded_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          approved_at?: string | null
          confirmation_email_error?: string | null
          confirmation_email_sent_at?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          environment?: string
          expires_at?: string | null
          failure_reason?: string | null
          id?: string
          method?: string
          mp_payment_id?: string | null
          mp_preapproval_id?: string | null
          paid_at?: string | null
          price_id?: string | null
          product_name?: string | null
          provider?: string
          refund_amount_cents?: number
          refunded_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          active: boolean
          amount_cents: number
          created_at: string
          currency: string
          description: string | null
          id: string
          name: string
          recurring_interval: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          amount_cents: number
          created_at?: string
          currency?: string
          description?: string | null
          id: string
          name: string
          recurring_interval?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          amount_cents?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          name?: string
          recurring_interval?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      practice_drafts: {
        Row: {
          code: string
          created_at: string
          id: string
          language: string
          lesson_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code?: string
          created_at?: string
          id?: string
          language?: string
          lesson_id?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          language?: string
          lesson_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          preferred_track: string | null
          trial_started_at: string
          updated_at: string
          user_id: string
          welcome_email_sent_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          preferred_track?: string | null
          trial_started_at?: string
          updated_at?: string
          user_id: string
          welcome_email_sent_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          preferred_track?: string | null
          trial_started_at?: string
          updated_at?: string
          user_id?: string
          welcome_email_sent_at?: string | null
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          chapter_breakdown: Json | null
          chapters_filter: number[] | null
          correct_answers: number
          created_at: string
          id: string
          level_filter: string | null
          passed: boolean
          questions_data: Json
          score_percentage: number
          time_spent_seconds: number | null
          total_questions: number
          user_id: string
        }
        Insert: {
          chapter_breakdown?: Json | null
          chapters_filter?: number[] | null
          correct_answers: number
          created_at?: string
          id?: string
          level_filter?: string | null
          passed: boolean
          questions_data?: Json
          score_percentage: number
          time_spent_seconds?: number | null
          total_questions: number
          user_id: string
        }
        Update: {
          chapter_breakdown?: Json | null
          chapters_filter?: number[] | null
          correct_answers?: number
          created_at?: string
          id?: string
          level_filter?: string | null
          passed?: boolean
          questions_data?: Json
          score_percentage?: number
          time_spent_seconds?: number | null
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          mp_preapproval_id: string | null
          price_id: string | null
          product_id: string | null
          provider: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          mp_preapproval_id?: string | null
          price_id?: string | null
          product_id?: string | null
          provider?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          mp_preapproval_id?: string | null
          price_id?: string | null
          product_id?: string | null
          provider?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_platform_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_master_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "master_admin" | "aluno"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["master_admin", "aluno"],
    },
  },
} as const
