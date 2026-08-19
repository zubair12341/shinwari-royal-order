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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address: string
          area: string | null
          created_at: string
          id: string
          instructions: string | null
          is_default: boolean
          label: string | null
          landmark: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          area?: string | null
          created_at?: string
          id?: string
          instructions?: string | null
          is_default?: boolean
          label?: string | null
          landmark?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          area?: string | null
          created_at?: string
          id?: string
          instructions?: string | null
          is_default?: boolean
          label?: string | null
          landmark?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string | null
          area: string | null
          city: string | null
          closing_time: string | null
          created_at: string
          delivery_available: boolean
          delivery_fee: number
          id: string
          image_url: string | null
          is_active: boolean
          is_open: boolean
          latitude: number | null
          longitude: number | null
          maps_url: string | null
          name: string
          opening_time: string | null
          phone: string | null
          pickup_available: boolean
          short_name: string | null
          slug: string
          sort_order: number
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          area?: string | null
          city?: string | null
          closing_time?: string | null
          created_at?: string
          delivery_available?: boolean
          delivery_fee?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_open?: boolean
          latitude?: number | null
          longitude?: number | null
          maps_url?: string | null
          name: string
          opening_time?: string | null
          phone?: string | null
          pickup_available?: boolean
          short_name?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          area?: string | null
          city?: string | null
          closing_time?: string | null
          created_at?: string
          delivery_available?: boolean
          delivery_fee?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_open?: boolean
          latitude?: number | null
          longitude?: number | null
          maps_url?: string | null
          name?: string
          opening_time?: string | null
          phone?: string | null
          pickup_available?: boolean
          short_name?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      catering_requests: {
        Row: {
          branch_id: string | null
          created_at: string
          email: string | null
          event_date: string
          event_time: string | null
          event_type: string | null
          full_name: string
          guests: number | null
          id: string
          internal_notes: string | null
          notes: string | null
          phone: string
          requirements: string | null
          service_type: string | null
          status: Database["public"]["Enums"]["catering_status"]
          updated_at: string
          user_id: string | null
          venue: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          email?: string | null
          event_date: string
          event_time?: string | null
          event_type?: string | null
          full_name: string
          guests?: number | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          phone: string
          requirements?: string | null
          service_type?: string | null
          status?: Database["public"]["Enums"]["catering_status"]
          updated_at?: string
          user_id?: string | null
          venue?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          email?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string | null
          full_name?: string
          guests?: number | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          phone?: string
          requirements?: string | null
          service_type?: string | null
          status?: Database["public"]["Enums"]["catering_status"]
          updated_at?: string
          user_id?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catering_requests_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_name: string
          notes: string | null
          order_id: string
          product_id: string | null
          quantity: number
          subtotal: number
          unit_price: number
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          notes?: string | null
          order_id: string
          product_id?: string | null
          quantity: number
          subtotal: number
          unit_price: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          notes?: string | null
          order_id?: string
          product_id?: string | null
          quantity?: number
          subtotal?: number
          unit_price?: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          branch_id: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_notes: string | null
          customer_phone: string
          delivery_address: string | null
          delivery_area: string | null
          delivery_charge: number
          delivery_instructions: string | null
          delivery_landmark: string | null
          discount: number
          fulfillment: Database["public"]["Enums"]["fulfillment_type"]
          id: string
          internal_notes: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_notes?: string | null
          customer_phone: string
          delivery_address?: string | null
          delivery_area?: string | null
          delivery_charge?: number
          delivery_instructions?: string | null
          delivery_landmark?: string | null
          discount?: number
          fulfillment: Database["public"]["Enums"]["fulfillment_type"]
          id?: string
          internal_notes?: string | null
          order_number: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string
          delivery_address?: string | null
          delivery_area?: string | null
          delivery_charge?: number
          delivery_instructions?: string | null
          delivery_landmark?: string | null
          discount?: number
          fulfillment?: Database["public"]["Enums"]["fulfillment_type"]
          id?: string
          internal_notes?: string | null
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      product_branch_availability: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          is_available: boolean
          out_of_stock: boolean
          product_id: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          is_available?: boolean
          out_of_stock?: boolean
          product_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          is_available?: boolean
          out_of_stock?: boolean
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_branch_availability_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_branch_availability_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          price: number
          product_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price: number
          product_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          product_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number | null
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          includes: string[] | null
          is_active: boolean
          is_bestseller: boolean
          is_chef_special: boolean
          is_featured: boolean
          is_new: boolean
          is_popular: boolean
          name: string
          out_of_stock: boolean
          price_note: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          base_price?: number | null
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean
          is_bestseller?: boolean
          is_chef_special?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_popular?: boolean
          name: string
          out_of_stock?: boolean
          price_note?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          base_price?: number | null
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean
          is_bestseller?: boolean
          is_chef_special?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_popular?: boolean
          name?: string
          out_of_stock?: boolean
          price_note?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
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
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          branch_id: string
          created_at: string
          email: string | null
          full_name: string
          guests: number
          id: string
          internal_notes: string | null
          phone: string
          reservation_date: string
          reservation_time: string
          special_request: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          email?: string | null
          full_name: string
          guests: number
          id?: string
          internal_notes?: string | null
          phone: string
          reservation_date: string
          reservation_time: string
          special_request?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          guests?: number
          id?: string
          internal_notes?: string | null
          phone?: string
          reservation_date?: string
          reservation_time?: string
          special_request?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      place_order: { Args: { payload: Json }; Returns: Json }
      track_order: {
        Args: { _order_number: string; _phone: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "customer"
      catering_status:
        | "pending"
        | "contacted"
        | "confirmed"
        | "cancelled"
        | "completed"
      fulfillment_type: "delivery" | "pickup"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready"
        | "out_for_delivery"
        | "completed"
        | "cancelled"
      payment_method: "cod" | "cop" | "online"
      payment_status: "unpaid" | "paid" | "refunded"
      reservation_status: "pending" | "confirmed" | "cancelled" | "completed"
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
      app_role: ["admin", "staff", "customer"],
      catering_status: [
        "pending",
        "contacted",
        "confirmed",
        "cancelled",
        "completed",
      ],
      fulfillment_type: ["delivery", "pickup"],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "completed",
        "cancelled",
      ],
      payment_method: ["cod", "cop", "online"],
      payment_status: ["unpaid", "paid", "refunded"],
      reservation_status: ["pending", "confirmed", "cancelled", "completed"],
    },
  },
} as const
