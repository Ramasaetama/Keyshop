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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          is_default: boolean
          label: string
          postal_code: string
          recipient: string
          street: string
          user_id: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          postal_code?: string
          recipient: string
          street: string
          user_id?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          postal_code?: string
          recipient?: string
          street?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          id: string
          product_item_id: number
          qty: number
          user_id: string
        }
        Insert: {
          id?: string
          product_item_id: number
          qty: number
          user_id?: string
        }
        Update: {
          id?: string
          product_item_id?: number
          qty?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_item_id_fkey"
            columns: ["product_item_id"]
            isOneToOne: false
            referencedRelation: "product_items"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: number
          name: string
          parent_id: number | null
        }
        Insert: {
          id?: number
          name: string
          parent_id?: number | null
        }
        Update: {
          id?: number
          name?: string
          parent_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_lines: {
        Row: {
          base_price: number | null
          id: string
          order_id: string
          price: number
          product_item_id: number
          qty: number
        }
        Insert: {
          base_price?: number | null
          id?: string
          order_id: string
          price: number
          product_item_id: number
          qty: number
        }
        Update: {
          base_price?: number | null
          id?: string
          order_id?: string
          price?: number
          product_item_id?: number
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_lines_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_lines_product_item_id_fkey"
            columns: ["product_item_id"]
            isOneToOne: false
            referencedRelation: "product_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          created_at: string
          id: string
          note: string
          order_id: string
          payment_status: string | null
          status_id: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string
          order_id: string
          payment_status?: string | null
          status_id?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          order_id?: string
          payment_status?: string | null
          status_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "order_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      order_statuses: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_last4: string
          created_at: string
          expiry: string
          id: string
          is_default: boolean
          payment_type_id: number
          provider: string
          user_id: string
        }
        Insert: {
          account_last4: string
          created_at?: string
          expiry?: string
          id?: string
          is_default?: boolean
          payment_type_id: number
          provider: string
          user_id?: string
        }
        Update: {
          account_last4?: string
          created_at?: string
          expiry?: string
          id?: string
          is_default?: boolean
          payment_type_id?: number
          provider?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_payment_type_id_fkey"
            columns: ["payment_type_id"]
            isOneToOne: false
            referencedRelation: "payment_types"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_types: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: never
          name: string
        }
        Update: {
          id?: never
          name?: string
        }
        Relationships: []
      }
      product_configurations: {
        Row: {
          product_item_id: number
          variation_option_id: number
        }
        Insert: {
          product_item_id: number
          variation_option_id: number
        }
        Update: {
          product_item_id?: number
          variation_option_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_configurations_product_item_id_fkey"
            columns: ["product_item_id"]
            isOneToOne: false
            referencedRelation: "product_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_configurations_variation_option_id_fkey"
            columns: ["variation_option_id"]
            isOneToOne: false
            referencedRelation: "variation_options"
            referencedColumns: ["id"]
          },
        ]
      }
      product_items: {
        Row: {
          id: number
          price: number
          product_id: number
          qty_in_stock: number
          sku: string
        }
        Insert: {
          id?: number
          price: number
          product_id: number
          qty_in_stock?: number
          sku: string
        }
        Update: {
          id?: number
          price?: number
          product_id?: number
          qty_in_stock?: number
          sku?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: number
          created_at: string
          description: string
          id: number
          image_url: string
          is_deal: boolean
          name: string
          tag: string | null
        }
        Insert: {
          category_id: number
          created_at?: string
          description?: string
          id?: number
          image_url?: string
          is_deal?: boolean
          name: string
          tag?: string | null
        }
        Update: {
          category_id?: number
          created_at?: string
          description?: string
          id?: number
          image_url?: string
          is_deal?: boolean
          name?: string
          tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          id: string
          phone?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
        }
        Relationships: []
      }
      promotion_categories: {
        Row: {
          category_id: number
          promotion_id: number
        }
        Insert: {
          category_id: number
          promotion_id: number
        }
        Update: {
          category_id?: number
          promotion_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotion_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_categories_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          description: string
          discount_rate: number
          end_date: string
          id: number
          name: string
          start_date: string
        }
        Insert: {
          description?: string
          discount_rate: number
          end_date: string
          id?: number
          name: string
          start_date: string
        }
        Update: {
          description?: string
          discount_rate?: number
          end_date?: string
          id?: number
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          order_line_id: string
          product_id: number
          rating: number
          reviewer_name: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          order_line_id: string
          product_id: number
          rating: number
          reviewer_name?: string
          user_id?: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          order_line_id?: string
          product_id?: number
          rating?: number
          reviewer_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_line_id_fkey"
            columns: ["order_line_id"]
            isOneToOne: true
            referencedRelation: "order_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_methods: {
        Row: {
          id: number
          name: string
          price: number
        }
        Insert: {
          id?: number
          name: string
          price: number
        }
        Update: {
          id?: number
          name?: string
          price?: number
        }
        Relationships: []
      }
      shop_orders: {
        Row: {
          courier: string | null
          currency: string
          id: string
          order_date: string
          order_total: number
          paid_at: string | null
          payment_id: string | null
          payment_label: string
          payment_method_id: string | null
          payment_status: string
          shipped_at: string | null
          shipping_address: string
          shipping_method_id: number
          shipping_price: number
          status_id: number
          tracking_number: string | null
          user_id: string
        }
        Insert: {
          courier?: string | null
          currency?: string
          id?: string
          order_date?: string
          order_total: number
          paid_at?: string | null
          payment_id?: string | null
          payment_label: string
          payment_method_id?: string | null
          payment_status?: string
          shipped_at?: string | null
          shipping_address: string
          shipping_method_id: number
          shipping_price: number
          status_id?: number
          tracking_number?: string | null
          user_id: string
        }
        Update: {
          courier?: string | null
          currency?: string
          id?: string
          order_date?: string
          order_total?: number
          paid_at?: string | null
          payment_id?: string | null
          payment_label?: string
          payment_method_id?: string | null
          payment_status?: string
          shipped_at?: string | null
          shipping_address?: string
          shipping_method_id?: number
          shipping_price?: number
          status_id?: number
          tracking_number?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_orders_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_orders_shipping_method_id_fkey"
            columns: ["shipping_method_id"]
            isOneToOne: false
            referencedRelation: "shipping_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_orders_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "order_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      variation_options: {
        Row: {
          id: number
          value: string
          variation_id: number
        }
        Insert: {
          id?: number
          value: string
          variation_id: number
        }
        Update: {
          id?: number
          value?: string
          variation_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "variation_options_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "variations"
            referencedColumns: ["id"]
          },
        ]
      }
      variations: {
        Row: {
          id: number
          name: string
          product_id: number
        }
        Insert: {
          id?: number
          name: string
          product_id: number
        }
        Update: {
          id?: number
          name?: string
          product_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_save_product: { Args: { _payload: Json }; Returns: number }
      can_review: {
        Args: { _line: string; _product: number }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      item_price: { Args: { _item: number }; Returns: number }
      place_order: {
        Args: { _address: string; _payment: string; _shipping: number }
        Returns: string
      }
      set_order_status: {
        Args: { _order: string; _status: number }
        Returns: undefined
      }
      set_payment_status: {
        Args: { _order: string; _status: string }
        Returns: undefined
      }
      ship_order: {
        Args: { _courier: string; _order: string; _tracking: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
