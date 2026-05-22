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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          cpf_cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      configuracoes_empresa: {
        Row: {
          celular: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          configuracoes_notificacao: Json | null
          configuracoes_sistema: Json | null
          cor_tema: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          logo_url: string | null
          nome_empresa: string
          razao_social: string | null
          site: string | null
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          celular?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          configuracoes_notificacao?: Json | null
          configuracoes_sistema?: Json | null
          cor_tema?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          logo_url?: string | null
          nome_empresa: string
          razao_social?: string | null
          site?: string | null
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          celular?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          configuracoes_notificacao?: Json | null
          configuracoes_sistema?: Json | null
          cor_tema?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          logo_url?: string | null
          nome_empresa?: string
          razao_social?: string | null
          site?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      processos: {
        Row: {
          cliente_id: string
          created_at: string
          documentos_recebidos: string[] | null
          id: string
          numero_protocolo: string
          observacoes: string | null
          prazo: string
          servico: Database["public"]["Enums"]["servico_tipo"]
          status: Database["public"]["Enums"]["processo_status"]
          updated_at: string
          user_id: string
          valor: number
          veiculo_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          documentos_recebidos?: string[] | null
          id?: string
          numero_protocolo: string
          observacoes?: string | null
          prazo: string
          servico: Database["public"]["Enums"]["servico_tipo"]
          status?: Database["public"]["Enums"]["processo_status"]
          updated_at?: string
          user_id: string
          valor: number
          veiculo_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          documentos_recebidos?: string[] | null
          id?: string
          numero_protocolo?: string
          observacoes?: string | null
          prazo?: string
          servico?: Database["public"]["Enums"]["servico_tipo"]
          status?: Database["public"]["Enums"]["processo_status"]
          updated_at?: string
          user_id?: string
          valor?: number
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "processos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          interval_type: string | null
          is_active: boolean | null
          name: string
          price_cents: number
          stripe_price_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval_type?: string | null
          is_active?: boolean | null
          name: string
          price_cents: number
          stripe_price_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval_type?: string | null
          is_active?: boolean | null
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      transacoes_financeiras: {
        Row: {
          categoria: string
          cliente_id: string | null
          created_at: string
          data_transacao: string
          descricao: string
          id: string
          metodo_pagamento: string | null
          observacoes: string | null
          processo_id: string | null
          status: string
          tipo: Database["public"]["Enums"]["transacao_tipo"]
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria: string
          cliente_id?: string | null
          created_at?: string
          data_transacao?: string
          descricao: string
          id?: string
          metodo_pagamento?: string | null
          observacoes?: string | null
          processo_id?: string | null
          status?: string
          tipo: Database["public"]["Enums"]["transacao_tipo"]
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string
          cliente_id?: string | null
          created_at?: string
          data_transacao?: string
          descricao?: string
          id?: string
          metodo_pagamento?: string | null
          observacoes?: string | null
          processo_id?: string | null
          status?: string
          tipo?: Database["public"]["Enums"]["transacao_tipo"]
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_transacoes_clientes"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transacoes_processos"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      veiculos: {
        Row: {
          ano: number | null
          chassi: string | null
          cliente_id: string | null
          created_at: string
          id: string
          marca: string
          modelo: string
          placa: string
          renavam: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ano?: number | null
          chassi?: string | null
          cliente_id?: string | null
          created_at?: string
          id?: string
          marca: string
          modelo: string
          placa: string
          renavam?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ano?: number | null
          chassi?: string | null
          cliente_id?: string | null
          created_at?: string
          id?: string
          marca?: string
          modelo?: string
          placa?: string
          renavam?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { target_user_id?: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_permission: {
        Args: { action: string; module: string }
        Returns: boolean
      }
    }
    Enums: {
      processo_status:
        | "Recebido"
        | "Em Conferência"
        | "No DETRAN"
        | "Aguardando Pagamento"
        | "Concluído"
      servico_tipo:
        | "Transferência de Propriedade"
        | "Licenciamento Anual"
        | "2ª Via CRV"
        | "Comunicação de Venda"
        | "IPVA"
        | "Multas"
        | "Outros"
      transacao_tipo: "receita" | "despesa"
      user_role: "admin" | "gerente" | "usuario"
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
    Enums: {
      processo_status: [
        "Recebido",
        "Em Conferência",
        "No DETRAN",
        "Aguardando Pagamento",
        "Concluído",
      ],
      servico_tipo: [
        "Transferência de Propriedade",
        "Licenciamento Anual",
        "2ª Via CRV",
        "Comunicação de Venda",
        "IPVA",
        "Multas",
        "Outros",
      ],
      transacao_tipo: ["receita", "despesa"],
      user_role: ["admin", "gerente", "usuario"],
    },
  },
} as const
