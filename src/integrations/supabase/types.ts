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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          page_path: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      assistant_conversations: {
        Row: {
          claim_id: string | null
          created_at: string
          id: string
          messages: Json
          mode: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          claim_id?: string | null
          created_at?: string
          id?: string
          messages?: Json
          mode?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          claim_id?: string | null
          created_at?: string
          id?: string
          messages?: Json
          mode?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_conversations_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_embeddings: {
        Row: {
          chunk_text: string
          claim_id: string | null
          created_at: string
          embedding: string | null
          id: string
          user_id: string
        }
        Insert: {
          chunk_text: string
          claim_id?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          user_id: string
        }
        Update: {
          chunk_text?: string
          claim_id?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_embeddings_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_timeline: {
        Row: {
          claim_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          note: string | null
          user_id: string | null
        }
        Insert: {
          claim_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          note?: string | null
          user_id?: string | null
        }
        Update: {
          claim_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          note?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_timeline_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          amount_involved: number | null
          claim_type: string
          counterparty_email: string | null
          counterparty_name: string
          counterparty_type: string
          created_at: string
          deadline_date: string | null
          generated_document: string | null
          id: string
          incident_date: string | null
          instructions: string | null
          legal_rights: Json | null
          reminder_sent: boolean
          share_enabled: boolean
          share_token: string | null
          situation_description: string
          status: string
          success_probability: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_involved?: number | null
          claim_type: string
          counterparty_email?: string | null
          counterparty_name?: string
          counterparty_type?: string
          created_at?: string
          deadline_date?: string | null
          generated_document?: string | null
          id?: string
          incident_date?: string | null
          instructions?: string | null
          legal_rights?: Json | null
          reminder_sent?: boolean
          share_enabled?: boolean
          share_token?: string | null
          situation_description?: string
          status?: string
          success_probability?: number | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_involved?: number | null
          claim_type?: string
          counterparty_email?: string | null
          counterparty_name?: string
          counterparty_type?: string
          created_at?: string
          deadline_date?: string | null
          generated_document?: string | null
          id?: string
          incident_date?: string | null
          instructions?: string | null
          legal_rights?: Json | null
          reminder_sent?: boolean
          share_enabled?: boolean
          share_token?: string | null
          situation_description?: string
          status?: string
          success_probability?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      diagnostics: {
        Row: {
          answers: Json
          claim_id: string | null
          converted_to_claim: boolean | null
          created_at: string | null
          id: string
          result: Json
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          answers: Json
          claim_id?: string | null
          converted_to_claim?: boolean | null
          created_at?: string | null
          id?: string
          result: Json
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json
          claim_id?: string | null
          converted_to_claim?: boolean | null
          created_at?: string | null
          id?: string
          result?: Json
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostics_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          claim_id: string
          created_at: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          user_id: string | null
        }
        Insert: {
          claim_id: string
          created_at?: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          user_id?: string | null
        }
        Update: {
          claim_id?: string
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          body_preview: string | null
          cc_emails: string[] | null
          claim_id: string | null
          id: string
          pdf_attached: boolean | null
          recipient_email: string
          recipient_name: string | null
          resend_message_id: string | null
          sent_at: string | null
          status: string | null
          subject: string
          user_id: string
        }
        Insert: {
          body_preview?: string | null
          cc_emails?: string[] | null
          claim_id?: string | null
          id?: string
          pdf_attached?: boolean | null
          recipient_email: string
          recipient_name?: string | null
          resend_message_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          user_id: string
        }
        Update: {
          body_preview?: string | null
          cc_emails?: string[] | null
          claim_id?: string | null
          id?: string
          pdf_attached?: boolean | null
          recipient_email?: string
          recipient_name?: string | null
          resend_message_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_knowledge: {
        Row: {
          claim_type: string | null
          content: string
          content_type: string
          created_at: string
          embedding: string | null
          id: string
          source: string
        }
        Insert: {
          claim_type?: string | null
          content: string
          content_type: string
          created_at?: string
          embedding?: string | null
          id?: string
          source: string
        }
        Update: {
          claim_type?: string | null
          content?: string
          content_type?: string
          created_at?: string
          embedding?: string | null
          id?: string
          source?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          claims_used: number
          country: string
          created_at: string
          full_name: string
          id: string
          ocr_extractions_today: number
          ocr_last_reset: string
          plan: string
          updated_at: string
        }
        Insert: {
          claims_used?: number
          country?: string
          created_at?: string
          full_name?: string
          id: string
          ocr_extractions_today?: number
          ocr_last_reset?: string
          plan?: string
          updated_at?: string
        }
        Update: {
          claims_used?: number
          country?: string
          created_at?: string
          full_name?: string
          id?: string
          ocr_extractions_today?: number
          ocr_last_reset?: string
          plan?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_claim_funnel: {
        Row: {
          claims_completed: number | null
          claims_started: number | null
          docs_downloaded: number | null
          emails_sent: number | null
          wizard_opens: number | null
        }
        Relationships: []
      }
      v_daily_active_users: {
        Row: {
          date: string | null
          dau: number | null
        }
        Relationships: []
      }
      v_diagnostic_conversion: {
        Row: {
          avg_viability_score: number | null
          converted: number | null
          total_diagnostics: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      decrement_claims_used: { Args: { uid: string }; Returns: undefined }
      match_claim_embeddings: {
        Args: {
          match_count?: number
          p_claim_id: string
          query_embedding: string
        }
        Returns: {
          chunk_text: string
          id: string
          similarity: number
        }[]
      }
      match_legal_knowledge: {
        Args: {
          filter_claim_type?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          claim_type: string
          content: string
          content_type: string
          id: string
          similarity: number
          source: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
