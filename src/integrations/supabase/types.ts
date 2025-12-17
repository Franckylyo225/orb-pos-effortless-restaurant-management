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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "saas_restaurant_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          email: string
          id: string
          last_attempt_at: string | null
          locked_until: string | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          email: string
          id?: string
          last_attempt_at?: string | null
          locked_until?: string | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          email?: string
          id?: string
          last_attempt_at?: string | null
          locked_until?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category_id: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price: number
          restaurant_id: string
          updated_at: string
          variants: Json | null
        }
        Insert: {
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price?: number
          restaurant_id: string
          updated_at?: string
          variants?: Json | null
        }
        Update: {
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price?: number
          restaurant_id?: string
          updated_at?: string
          variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "saas_restaurant_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_money_providers: {
        Row: {
          code: string
          created_at: string
          id: string
          is_enabled: boolean
          name: string
          restaurant_id: string
          sort_order: number | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          name: string
          restaurant_id: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          name?: string
          restaurant_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mobile_money_providers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_money_providers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "saas_restaurant_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string | null
          name: string
          notes: string | null
          order_id: string
          price: number
          quantity: number
          variant: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          name: string
          notes?: string | null
          order_id: string
          price: number
          quantity?: number
          variant?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          name?: string
          notes?: string | null
          order_id?: string
          price?: number
          quantity?: number
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          created_by: string | null
          discount_amount: number | null
          discount_percent: number | null
          id: string
          notes: string | null
          order_number: number
          restaurant_id: string
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number | null
          table_id: string | null
          tax_amount: number | null
          total: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          notes?: string | null
          order_number?: number
          restaurant_id: string
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number | null
          table_id?: string | null
          tax_amount?: number | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          notes?: string | null
          order_number?: number
          restaurant_id?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number | null
          table_id?: string | null
          tax_amount?: number | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "saas_restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          order_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          processed_by: string | null
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          processed_by?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          processed_by?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          restaurant_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          restaurant_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          restaurant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "saas_restaurant_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          applicable_plans: string[] | null
          code: string
          created_at: string
          created_by: string | null
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_plans?: string[] | null
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_plans?: string[] | null
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          notes: string | null
          quantity: number
          stock_product_id: string
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          notes?: string | null
          quantity?: number
          stock_product_id: string
          unit?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          notes?: string | null
          quantity?: number
          stock_product_id?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_stock_product_id_fkey"
            columns: ["stock_product_id"]
            isOneToOne: false
            referencedRelation: "stock_products"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          created_at: string
          cuisine_type: string | null
          email: string | null
          id: string
          logo_url: string | null
          menu_bg_style: string | null
          menu_cover_image: string | null
          menu_primary_color: string | null
          menu_show_address: boolean | null
          menu_show_logo: boolean | null
          menu_show_phone: boolean | null
          menu_welcome_message: string | null
          name: string
          phone: string | null
          subscription_plan: string | null
          team_size: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          cuisine_type?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          menu_bg_style?: string | null
          menu_cover_image?: string | null
          menu_primary_color?: string | null
          menu_show_address?: boolean | null
          menu_show_logo?: boolean | null
          menu_show_phone?: boolean | null
          menu_welcome_message?: string | null
          name: string
          phone?: string | null
          subscription_plan?: string | null
          team_size?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          cuisine_type?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          menu_bg_style?: string | null
          menu_cover_image?: string | null
          menu_primary_color?: string | null
          menu_show_address?: boolean | null
          menu_show_logo?: boolean | null
          menu_show_phone?: boolean | null
          menu_welcome_message?: string | null
          name?: string
          phone?: string | null
          subscription_plan?: string | null
          team_size?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          notes: string | null
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: string
          notes?: string | null
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_products: {
        Row: {
          cost_per_unit: number | null
          created_at: string
          current_stock: number | null
          id: string
          min_stock_threshold: number | null
          name: string
          restaurant_id: string
          supplier_id: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string
          current_stock?: number | null
          id?: string
          min_stock_threshold?: number | null
          name: string
          restaurant_id: string
          supplier_id?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string
          current_stock?: number | null
          id?: string
          min_stock_threshold?: number | null
          name?: string
          restaurant_id?: string
          supplier_id?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_products_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_products_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "saas_restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_payments: {
        Row: {
          amount: number
          cinetpay_payment_token: string | null
          cinetpay_payment_url: string | null
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          paid_at: string | null
          payment_method: string | null
          restaurant_id: string
          status: string
          subscription_id: string
          transaction_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          cinetpay_payment_token?: string | null
          cinetpay_payment_url?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          restaurant_id: string
          status?: string
          subscription_id: string
          transaction_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          cinetpay_payment_token?: string | null
          cinetpay_payment_url?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          restaurant_id?: string
          status?: string
          subscription_id?: string
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_payments_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "saas_restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          restaurant_id: string
          status: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          restaurant_id: string
          status?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          restaurant_id?: string
          status?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "saas_restaurant_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admins: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "saas_restaurant_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          assigned_server_id: string | null
          capacity: number | null
          created_at: string
          id: string
          name: string
          position_x: number | null
          position_y: number | null
          restaurant_id: string
          shape: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_server_id?: string | null
          capacity?: number | null
          created_at?: string
          id?: string
          name: string
          position_x?: number | null
          position_y?: number | null
          restaurant_id: string
          shape?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_server_id?: string | null
          capacity?: number | null
          created_at?: string
          id?: string
          name?: string
          position_x?: number | null
          position_y?: number | null
          restaurant_id?: string
          shape?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "saas_restaurant_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      user_restaurants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_owner: boolean
          restaurant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_owner?: boolean
          restaurant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_owner?: boolean
          restaurant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_restaurants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_restaurants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "saas_restaurant_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          restaurant_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          restaurant_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          restaurant_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "saas_restaurant_stats"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      saas_restaurant_stats: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          name: string | null
          phone: string | null
          subscription_plan: string | null
          team_size: number | null
          total_menu_items: number | null
          total_orders: number | null
          total_revenue: number | null
          total_tables: number | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
          subscription_plan?: string | null
          team_size?: number | null
          total_menu_items?: never
          total_orders?: never
          total_revenue?: never
          total_tables?: never
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
          subscription_plan?: string | null
          team_size?: number | null
          total_menu_items?: never
          total_orders?: never
          total_revenue?: never
          total_tables?: never
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_recipe_cost: {
        Args: { p_menu_item_id: string }
        Returns: number
      }
      check_account_locked: { Args: { user_email: string }; Returns: Json }
      check_stock_availability: { Args: never; Returns: Json }
      convert_unit: {
        Args: { p_from_unit: string; p_quantity: number; p_to_unit: string }
        Returns: number
      }
      decrement_stock_on_sale: {
        Args: { p_order_id: string; p_user_id?: string }
        Returns: Json
      }
      get_subscription_restaurant_limit: {
        Args: { plan_name: string }
        Returns: number
      }
      get_user_restaurant_count: { Args: { _user_id: string }; Returns: number }
      get_user_restaurant_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      record_failed_login: { Args: { user_email: string }; Returns: Json }
      reset_login_attempts: { Args: { user_email: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "manager" | "serveur" | "caissier"
      order_status:
        | "pending"
        | "in_kitchen"
        | "ready"
        | "served"
        | "paid"
        | "cancelled"
      payment_method: "cash" | "card" | "mobile_money" | "other"
      payment_status: "pending" | "completed" | "refunded" | "failed"
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
      app_role: ["admin", "manager", "serveur", "caissier"],
      order_status: [
        "pending",
        "in_kitchen",
        "ready",
        "served",
        "paid",
        "cancelled",
      ],
      payment_method: ["cash", "card", "mobile_money", "other"],
      payment_status: ["pending", "completed", "refunded", "failed"],
    },
  },
} as const
