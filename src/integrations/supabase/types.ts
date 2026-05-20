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
      bookings: {
        Row: {
          adults: number
          check_in: string
          check_out: string
          children: number
          created_at: string
          currency: string
          guest_email: string
          guest_full_name: string
          guest_phone: string
          hotel_name: string
          hotel_slug: string
          id: string
          nights: number
          notes: string | null
          pets_allowed: boolean
          reference: string
          room_id: string | null
          room_type_id: string
          room_type_name: string
          status: Database["public"]["Enums"]["booking_status"]
          subtotal_cents: number
          taxes_cents: number
          total_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          adults: number
          check_in: string
          check_out: string
          children?: number
          created_at?: string
          currency?: string
          guest_email: string
          guest_full_name: string
          guest_phone: string
          hotel_name: string
          hotel_slug: string
          id?: string
          nights: number
          notes?: string | null
          pets_allowed?: boolean
          reference?: string
          room_id?: string | null
          room_type_id: string
          room_type_name: string
          status?: Database["public"]["Enums"]["booking_status"]
          subtotal_cents: number
          taxes_cents?: number
          total_cents: number
          updated_at?: string
          user_id: string
        }
        Update: {
          adults?: number
          check_in?: string
          check_out?: string
          children?: number
          created_at?: string
          currency?: string
          guest_email?: string
          guest_full_name?: string
          guest_phone?: string
          hotel_name?: string
          hotel_slug?: string
          id?: string
          nights?: number
          notes?: string | null
          pets_allowed?: boolean
          reference?: string
          room_id?: string | null
          room_type_id?: string
          room_type_name?: string
          status?: Database["public"]["Enums"]["booking_status"]
          subtotal_cents?: number
          taxes_cents?: number
          total_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_settings: {
        Row: {
          address: string
          city: string
          contact_email: string
          contact_phone: string
          country: string
          description: string
          hero_image: string
          id: boolean
          name: string
          tagline: string
          updated_at: string
        }
        Insert: {
          address?: string
          city?: string
          contact_email?: string
          contact_phone?: string
          country?: string
          description?: string
          hero_image?: string
          id?: boolean
          name?: string
          tagline?: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          contact_email?: string
          contact_phone?: string
          country?: string
          description?: string
          hero_image?: string
          id?: boolean
          name?: string
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          preferences: Json
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferences?: Json
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferences?: Json
          updated_at?: string
        }
        Relationships: []
      }
      room_inventory: {
        Row: {
          created_at: string
          date: string
          id: string
          note: string | null
          room_id: string
          status: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          note?: string | null
          room_id: string
          status: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          note?: string | null
          room_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_inventory_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          active: boolean
          amenities: string[]
          bed_type: string | null
          cover_image: string | null
          created_at: string
          description: string
          id: string
          images: string[]
          max_adults: number
          max_children: number
          name: string
          pets_allowed: boolean
          price_per_night_cents: number
          size: string | null
          slug: string
          sort_order: number
          total_units: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          amenities?: string[]
          bed_type?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          max_adults?: number
          max_children?: number
          name: string
          pets_allowed?: boolean
          price_per_night_cents?: number
          size?: string | null
          slug: string
          sort_order?: number
          total_units?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          amenities?: string[]
          bed_type?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          max_adults?: number
          max_children?: number
          name?: string
          pets_allowed?: boolean
          price_per_night_cents?: number
          size?: string | null
          slug?: string
          sort_order?: number
          total_units?: number
          updated_at?: string
        }
        Relationships: []
      }
      saved_hotels: {
        Row: {
          created_at: string
          hotel_slug: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hotel_slug: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hotel_slug?: string
          id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Enums: {
      app_role: "admin" | "user"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
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
      app_role: ["admin", "user"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
    },
  },
} as const
