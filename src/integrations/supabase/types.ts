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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      abbreviations: {
        Row: {
          abbreviation: string
          category_id: string | null
          created_at: string
          definition_ar: string | null
          definition_en: string | null
          full_form_ar: string
          full_form_en: string
          id: string
          updated_at: string
        }
        Insert: {
          abbreviation: string
          category_id?: string | null
          created_at?: string
          definition_ar?: string | null
          definition_en?: string | null
          full_form_ar: string
          full_form_en: string
          id?: string
          updated_at?: string
        }
        Update: {
          abbreviation?: string
          category_id?: string | null
          created_at?: string
          definition_ar?: string | null
          definition_en?: string | null
          full_form_ar?: string
          full_form_en?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "abbreviations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      action_plans: {
        Row: {
          actions: Json
          category: string
          created_at: string
          description_ar: string | null
          description_en: string | null
          difficulty: string
          estimated_time_ar: string | null
          estimated_time_en: string | null
          id: string
          title_ar: string
          title_en: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json
          category?: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          difficulty?: string
          estimated_time_ar?: string | null
          estimated_time_en?: string | null
          id?: string
          title_ar: string
          title_en: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          category?: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          difficulty?: string
          estimated_time_ar?: string | null
          estimated_time_en?: string | null
          id?: string
          title_ar?: string
          title_en?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          company_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          company_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      blanket_order_lines: {
        Row: {
          blanket_order_id: string
          created_at: string
          id: string
          item_id: string | null
          item_name: string
          notes: string | null
          quantity_per_release: number
          total_released: number
          unit: string
          unit_price: number
        }
        Insert: {
          blanket_order_id: string
          created_at?: string
          id?: string
          item_id?: string | null
          item_name: string
          notes?: string | null
          quantity_per_release?: number
          total_released?: number
          unit?: string
          unit_price?: number
        }
        Update: {
          blanket_order_id?: string
          created_at?: string
          id?: string
          item_id?: string | null
          item_name?: string
          notes?: string | null
          quantity_per_release?: number
          total_released?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "blanket_order_lines_blanket_order_id_fkey"
            columns: ["blanket_order_id"]
            isOneToOne: false
            referencedRelation: "blanket_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blanket_order_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      blanket_orders: {
        Row: {
          blanket_number: string
          company_id: string
          created_at: string
          created_by: string | null
          currency: string
          end_date: string
          id: string
          next_release_date: string | null
          notes: string | null
          release_frequency_months: number
          start_date: string
          status: Database["public"]["Enums"]["blanket_status"]
          total_contract_value: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          blanket_number?: string
          company_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          end_date: string
          id?: string
          next_release_date?: string | null
          notes?: string | null
          release_frequency_months?: number
          start_date: string
          status?: Database["public"]["Enums"]["blanket_status"]
          total_contract_value?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          blanket_number?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          end_date?: string
          id?: string
          next_release_date?: string | null
          notes?: string | null
          release_frequency_months?: number
          start_date?: string
          status?: Database["public"]["Enums"]["blanket_status"]
          total_contract_value?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blanket_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blanket_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      blanket_releases: {
        Row: {
          blanket_order_id: string
          created_at: string
          id: string
          po_id: string | null
          release_date: string
          release_number: number
          status: string
        }
        Insert: {
          blanket_order_id: string
          created_at?: string
          id?: string
          po_id?: string | null
          release_date: string
          release_number: number
          status?: string
        }
        Update: {
          blanket_order_id?: string
          created_at?: string
          id?: string
          po_id?: string | null
          release_date?: string
          release_number?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "blanket_releases_blanket_order_id_fkey"
            columns: ["blanket_order_id"]
            isOneToOne: false
            referencedRelation: "blanket_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blanket_releases_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description_ar: string | null
          description_en: string | null
          icon: string | null
          id: string
          name_ar: string
          name_en: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          name_ar: string
          name_en: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: Json | null
          company_id: string
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          type: Database["public"]["Enums"]["client_type"]
          updated_at: string
        }
        Insert: {
          address?: Json | null
          company_id: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          type?: Database["public"]["Enums"]["client_type"]
          updated_at?: string
        }
        Update: {
          address?: Json | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          type?: Database["public"]["Enums"]["client_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          logo: string | null
          name: string
          plan: Database["public"]["Enums"]["company_plan"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo?: string | null
          name: string
          plan?: Database["public"]["Enums"]["company_plan"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo?: string | null
          name?: string
          plan?: Database["public"]["Enums"]["company_plan"]
          updated_at?: string
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string | null
          country: string
          created_at: string
          customer_id: string
          id: string
          is_default: boolean
          label: string
          postal_code: string | null
          state: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city?: string | null
          country?: string
          created_at?: string
          customer_id: string
          id?: string
          is_default?: boolean
          label?: string
          postal_code?: string | null
          state?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string | null
          country?: string
          created_at?: string
          customer_id?: string
          id?: string
          is_default?: boolean
          label?: string
          postal_code?: string | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          billing_address: Json | null
          company_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          billing_address?: Json | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          billing_address?: Json | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cycle_count_lines: {
        Row: {
          counted_at: string | null
          counted_by: string | null
          counted_quantity: number | null
          expected_quantity: number
          id: string
          item_id: string
          notes: string | null
          session_id: string
          variance: number | null
        }
        Insert: {
          counted_at?: string | null
          counted_by?: string | null
          counted_quantity?: number | null
          expected_quantity?: number
          id?: string
          item_id: string
          notes?: string | null
          session_id: string
          variance?: number | null
        }
        Update: {
          counted_at?: string | null
          counted_by?: string | null
          counted_quantity?: number | null
          expected_quantity?: number
          id?: string
          item_id?: string
          notes?: string | null
          session_id?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cycle_count_lines_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cycle_count_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cycle_count_sessions: {
        Row: {
          closed_at: string | null
          company_id: string
          id: string
          location_id: string
          notes: string | null
          session_number: string
          started_at: string
          started_by: string | null
          status: string
        }
        Insert: {
          closed_at?: string | null
          company_id: string
          id?: string
          location_id: string
          notes?: string | null
          session_number?: string
          started_at?: string
          started_by?: string | null
          status?: string
        }
        Update: {
          closed_at?: string | null
          company_id?: string
          id?: string
          location_id?: string
          notes?: string | null
          session_number?: string
          started_at?: string
          started_by?: string | null
          status?: string
        }
        Relationships: []
      }
      dp_cod_settlement_lines: {
        Row: {
          cod_amount: number
          collected: boolean | null
          id: string
          settlement_id: string
          shipment_id: string
        }
        Insert: {
          cod_amount: number
          collected?: boolean | null
          id?: string
          settlement_id: string
          shipment_id: string
        }
        Update: {
          cod_amount?: number
          collected?: boolean | null
          id?: string
          settlement_id?: string
          shipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_settlement"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "dp_cod_settlements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_shipment"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "dp_shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      dp_cod_settlements: {
        Row: {
          closed_at: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          driver_id: string
          id: string
          status: string | null
          total_assigned: number | null
          total_collected: number | null
          variance: number | null
        }
        Insert: {
          closed_at?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          driver_id: string
          id?: string
          status?: string | null
          total_assigned?: number | null
          total_collected?: number | null
          variance?: number | null
        }
        Update: {
          closed_at?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          driver_id?: string
          id?: string
          status?: string | null
          total_assigned?: number | null
          total_collected?: number | null
          variance?: number | null
        }
        Relationships: []
      }
      dp_driver_risk_score: {
        Row: {
          company_id: string
          driver_id: string
          risk_points: number | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          driver_id: string
          risk_points?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          driver_id?: string
          risk_points?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dp_drivers: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
          vehicle_plate: string | null
          vehicle_type: Database["public"]["Enums"]["dp_vehicle_type"]
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
          vehicle_plate?: string | null
          vehicle_type?: Database["public"]["Enums"]["dp_vehicle_type"]
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
          vehicle_plate?: string | null
          vehicle_type?: Database["public"]["Enums"]["dp_vehicle_type"]
        }
        Relationships: [
          {
            foreignKeyName: "dp_drivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      dp_governance_events: {
        Row: {
          company_id: string
          created_at: string | null
          driver_id: string | null
          event_type: string
          id: string
          message: string | null
          metadata: Json | null
          reference_id: string | null
          severity: string
          severity_points: number | null
          shipment_id: string | null
          version: number | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          driver_id?: string | null
          event_type: string
          id?: string
          message?: string | null
          metadata?: Json | null
          reference_id?: string | null
          severity?: string
          severity_points?: number | null
          shipment_id?: string | null
          version?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          driver_id?: string | null
          event_type?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          reference_id?: string | null
          severity?: string
          severity_points?: number | null
          shipment_id?: string | null
          version?: number | null
        }
        Relationships: []
      }
      dp_inventory_scans: {
        Row: {
          company_id: string
          id: string
          scanned_at: string | null
          scanned_by: string | null
          session_id: string
          shipment_id: string
        }
        Insert: {
          company_id: string
          id?: string
          scanned_at?: string | null
          scanned_by?: string | null
          session_id: string
          shipment_id: string
        }
        Update: {
          company_id?: string
          id?: string
          scanned_at?: string | null
          scanned_by?: string | null
          session_id?: string
          shipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_session"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dp_inventory_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_shipment"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "dp_shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      dp_inventory_sessions: {
        Row: {
          closed_at: string | null
          company_id: string
          created_at: string | null
          id: string
          started_by: string | null
          status: string | null
          warehouse_id: string
        }
        Insert: {
          closed_at?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          started_by?: string | null
          status?: string | null
          warehouse_id: string
        }
        Update: {
          closed_at?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          started_by?: string | null
          status?: string | null
          warehouse_id?: string
        }
        Relationships: []
      }
      dp_risk_alerts: {
        Row: {
          alert_type: string
          company_id: string
          created_at: string | null
          driver_id: string | null
          id: string
          message: string | null
          shipment_id: string | null
        }
        Insert: {
          alert_type: string
          company_id: string
          created_at?: string | null
          driver_id?: string | null
          id?: string
          message?: string | null
          shipment_id?: string | null
        }
        Update: {
          alert_type?: string
          company_id?: string
          created_at?: string | null
          driver_id?: string | null
          id?: string
          message?: string | null
          shipment_id?: string | null
        }
        Relationships: []
      }
      dp_shelves: {
        Row: {
          capacity: number | null
          code: string
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          zone_id: string
        }
        Insert: {
          capacity?: number | null
          code: string
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          zone_id: string
        }
        Update: {
          capacity?: number | null
          code?: string
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dp_shelves_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dp_shelves_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "dp_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      dp_shipment_logs: {
        Row: {
          changed_at: string | null
          company_id: string
          id: string
          new_status: string | null
          old_status: string | null
          shipment_id: string
        }
        Insert: {
          changed_at?: string | null
          company_id: string
          id?: string
          new_status?: string | null
          old_status?: string | null
          shipment_id: string
        }
        Update: {
          changed_at?: string | null
          company_id?: string
          id?: string
          new_status?: string | null
          old_status?: string | null
          shipment_id?: string
        }
        Relationships: []
      }
      dp_shipment_status_log: {
        Row: {
          changed_by: string | null
          company_id: string
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["dp_shipment_status"]
          notes: string | null
          old_status: Database["public"]["Enums"]["dp_shipment_status"] | null
          shipment_id: string
          warehouse_id: string | null
        }
        Insert: {
          changed_by?: string | null
          company_id: string
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["dp_shipment_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["dp_shipment_status"] | null
          shipment_id: string
          warehouse_id?: string | null
        }
        Update: {
          changed_by?: string | null
          company_id?: string
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["dp_shipment_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["dp_shipment_status"] | null
          shipment_id?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dp_shipment_status_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dp_shipment_status_log_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "dp_shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dp_shipment_status_log_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      dp_shipments: {
        Row: {
          barcode: string
          cod_amount: number
          company_id: string
          created_at: string
          created_by: string | null
          current_warehouse_id: string | null
          delivered_at: string | null
          destination_warehouse_id: string | null
          driver_id: string | null
          expected_delivery_at: string | null
          id: string
          is_cod: boolean
          notes: string | null
          origin_warehouse_id: string | null
          pieces_count: number
          receiver_address: string | null
          receiver_city: string | null
          receiver_name: string
          receiver_phone: string | null
          returned_at: string | null
          sender_address: string | null
          sender_city: string | null
          sender_name: string
          sender_phone: string | null
          shelf_id: string | null
          status: Database["public"]["Enums"]["dp_shipment_status"]
          updated_at: string
          weight_kg: number | null
          zone_id: string | null
        }
        Insert: {
          barcode: string
          cod_amount?: number
          company_id: string
          created_at?: string
          created_by?: string | null
          current_warehouse_id?: string | null
          delivered_at?: string | null
          destination_warehouse_id?: string | null
          driver_id?: string | null
          expected_delivery_at?: string | null
          id?: string
          is_cod?: boolean
          notes?: string | null
          origin_warehouse_id?: string | null
          pieces_count?: number
          receiver_address?: string | null
          receiver_city?: string | null
          receiver_name: string
          receiver_phone?: string | null
          returned_at?: string | null
          sender_address?: string | null
          sender_city?: string | null
          sender_name: string
          sender_phone?: string | null
          shelf_id?: string | null
          status?: Database["public"]["Enums"]["dp_shipment_status"]
          updated_at?: string
          weight_kg?: number | null
          zone_id?: string | null
        }
        Update: {
          barcode?: string
          cod_amount?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          current_warehouse_id?: string | null
          delivered_at?: string | null
          destination_warehouse_id?: string | null
          driver_id?: string | null
          expected_delivery_at?: string | null
          id?: string
          is_cod?: boolean
          notes?: string | null
          origin_warehouse_id?: string | null
          pieces_count?: number
          receiver_address?: string | null
          receiver_city?: string | null
          receiver_name?: string
          receiver_phone?: string | null
          returned_at?: string | null
          sender_address?: string | null
          sender_city?: string | null
          sender_name?: string
          sender_phone?: string | null
          shelf_id?: string | null
          status?: Database["public"]["Enums"]["dp_shipment_status"]
          updated_at?: string
          weight_kg?: number | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dp_shipments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dp_shipments_current_warehouse_id_fkey"
            columns: ["current_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dp_shipments_destination_warehouse_id_fkey"
            columns: ["destination_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dp_shipments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "dp_driver_performance"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "dp_shipments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "dp_drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dp_shipments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "dp_weekly_risk_report"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "dp_shipments_origin_warehouse_id_fkey"
            columns: ["origin_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dp_shipments_shelf_id_fkey"
            columns: ["shelf_id"]
            isOneToOne: false
            referencedRelation: "dp_shelves"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dp_shipments_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "dp_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      dp_status_transitions: {
        Row: {
          from_status: string
          to_status: string
        }
        Insert: {
          from_status: string
          to_status: string
        }
        Update: {
          from_status?: string
          to_status?: string
        }
        Relationships: []
      }
      dp_zones: {
        Row: {
          code: string
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dp_zones_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dp_zones_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          company_id: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          expense_date: string
          expense_number: string
          id: string
          po_id: string | null
          reference: string | null
          shipment_id: string | null
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          company_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          expense_date?: string
          expense_number?: string
          id?: string
          po_id?: string | null
          reference?: string | null
          shipment_id?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          expense_date?: string
          expense_number?: string
          id?: string
          po_id?: string | null
          reference?: string | null
          shipment_id?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipt_lines: {
        Row: {
          created_at: string
          grn_id: string
          id: string
          item_id: string | null
          item_name: string
          po_line_id: string
          quantity_accepted: number
          quantity_received: number
          quantity_rejected: number
          rejection_reason: string | null
          unit: string
        }
        Insert: {
          created_at?: string
          grn_id: string
          id?: string
          item_id?: string | null
          item_name: string
          po_line_id: string
          quantity_accepted?: number
          quantity_received?: number
          quantity_rejected?: number
          rejection_reason?: string | null
          unit?: string
        }
        Update: {
          created_at?: string
          grn_id?: string
          id?: string
          item_id?: string | null
          item_name?: string
          po_line_id?: string
          quantity_accepted?: number
          quantity_received?: number
          quantity_rejected?: number
          rejection_reason?: string | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipt_lines_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "goods_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_lines_po_line_id_fkey"
            columns: ["po_line_id"]
            isOneToOne: false
            referencedRelation: "po_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipts: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          grn_number: string
          id: string
          notes: string | null
          po_id: string
          received_date: string
          status: Database["public"]["Enums"]["grn_status"]
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          grn_number?: string
          id?: string
          notes?: string | null
          po_id: string
          received_date?: string
          status?: Database["public"]["Enums"]["grn_status"]
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          grn_number?: string
          id?: string
          notes?: string | null
          po_id?: string
          received_date?: string
          status?: Database["public"]["Enums"]["grn_status"]
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_messages: {
        Row: {
          company_id: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          is_read: boolean
          message: string
          sender_id: string
          sender_name: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          is_read?: boolean
          message: string
          sender_id: string
          sender_name?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_read?: boolean
          message?: string
          sender_id?: string
          sender_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          id: string
          item_id: string
          location_id: string
          quantity: number
          reserved_quantity: number
          updated_at: string
        }
        Insert: {
          id?: string
          item_id: string
          location_id: string
          quantity?: number
          reserved_quantity?: number
          updated_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          location_id?: string
          quantity?: number
          reserved_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_ledger: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          item_id: string
          location_id: string
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          notes: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id: string
          location_id: string
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          notes?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id?: string
          location_id?: string
          movement_type?: Database["public"]["Enums"]["inventory_movement_type"]
          notes?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_ledger_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_reorder_rules: {
        Row: {
          auto_create_po: boolean
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          item_id: string
          lead_time_days: number | null
          location_id: string | null
          max_quantity: number
          min_quantity: number
          preferred_vendor_id: string | null
          reorder_quantity: number
          updated_at: string
        }
        Insert: {
          auto_create_po?: boolean
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          item_id: string
          lead_time_days?: number | null
          location_id?: string | null
          max_quantity?: number
          min_quantity?: number
          preferred_vendor_id?: string | null
          reorder_quantity?: number
          updated_at?: string
        }
        Update: {
          auto_create_po?: boolean
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          item_id?: string
          lead_time_days?: number | null
          location_id?: string | null
          max_quantity?: number
          min_quantity?: number
          preferred_vendor_id?: string | null
          reorder_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      inventory_transfer_lines: {
        Row: {
          batch_id: string | null
          created_at: string
          id: string
          item_id: string
          notes: string | null
          quantity: number
          transfer_id: string
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          id?: string
          item_id: string
          notes?: string | null
          quantity?: number
          transfer_id: string
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          id?: string
          item_id?: string
          notes?: string | null
          quantity?: number
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transfer_lines_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "inventory_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transfers: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          from_location_id: string
          id: string
          notes: string | null
          status: string
          to_location_id: string
          transfer_date: string
          transfer_number: string
          updated_at: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          from_location_id: string
          id?: string
          notes?: string | null
          status?: string
          to_location_id: string
          transfer_date?: string
          transfer_number?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          from_location_id?: string
          id?: string
          notes?: string | null
          status?: string
          to_location_id?: string
          transfer_date?: string
          transfer_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          order_id: string | null
          paid_date: string | null
          shipment_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          order_id?: string | null
          paid_date?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          order_id?: string | null
          paid_date?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices_v2: {
        Row: {
          amount: number
          client_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          currency: string
          due_date: string | null
          grn_id: string | null
          id: string
          invoice_number: string
          issued_at: string | null
          notes: string | null
          paid_at: string | null
          po_id: string | null
          shipment_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          due_date?: string | null
          grn_id?: string | null
          id?: string
          invoice_number: string
          issued_at?: string | null
          notes?: string | null
          paid_at?: string | null
          po_id?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          due_date?: string | null
          grn_id?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string | null
          notes?: string | null
          paid_at?: string | null
          po_id?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_v2_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_v2_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_v2_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "goods_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_v2_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_v2_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      item_batches: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          expiry_date: string | null
          id: string
          item_id: string
          location_id: string
          lot_number: string | null
          manufacture_date: string | null
          notes: string | null
          quantity: number
          serial_number: string | null
          status: string
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          item_id: string
          location_id: string
          lot_number?: string | null
          manufacture_date?: string | null
          notes?: string | null
          quantity?: number
          serial_number?: string | null
          status?: string
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          item_id?: string
          location_id?: string
          lot_number?: string | null
          manufacture_date?: string | null
          notes?: string | null
          quantity?: number
          serial_number?: string | null
          status?: string
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          barcode: string | null
          company_id: string | null
          created_at: string
          description: string | null
          dimensions: Json | null
          id: string
          is_active: boolean
          name: string
          sku: string
          unit: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          barcode?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          id?: string
          is_active?: boolean
          name: string
          sku: string
          unit?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          barcode?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          sku?: string
          unit?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          company_id: string | null
          country: string
          created_at: string
          id: string
          is_active: boolean
          location_type: string
          name: string
          postal_code: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_id?: string | null
          country?: string
          created_at?: string
          id?: string
          is_active?: boolean
          location_type?: string
          name: string
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_id?: string | null
          country?: string
          created_at?: string
          id?: string
          is_active?: boolean
          location_type?: string
          name?: string
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          item_name: string
          notes: string | null
          order_id: string
          quantity: number
          unit: string
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_name: string
          notes?: string | null
          order_id: string
          quantity?: number
          unit?: string
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_name?: string
          notes?: string | null
          order_id?: string
          quantity?: number
          unit?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
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
          company_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          delivery_address: Json | null
          delivery_location_id: string | null
          id: string
          notes: string | null
          order_number: string
          pickup_location_id: string | null
          requested_date: string | null
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_address?: Json | null
          delivery_location_id?: string | null
          id?: string
          notes?: string | null
          order_number: string
          pickup_location_id?: string | null
          requested_date?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_address?: Json | null
          delivery_location_id?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          pickup_location_id?: string | null
          requested_date?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_location_id_fkey"
            columns: ["delivery_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_pickup_location_id_fkey"
            columns: ["pickup_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string
          reference: string | null
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string
          reference?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      po_lines: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          item_name: string
          line_number: number
          notes: string | null
          po_id: string
          quantity: number
          received_quantity: number
          unit: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_name: string
          line_number: number
          notes?: string | null
          po_id: string
          quantity?: number
          received_quantity?: number
          unit?: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_name?: string
          line_number?: number
          notes?: string | null
          po_id?: string
          quantity?: number
          received_quantity?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "po_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_lines_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_approved: boolean
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          is_approved?: boolean
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_approved?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          currency: string
          delivery_date: string | null
          id: string
          notes: string | null
          payment_terms: string | null
          po_number: string
          requisition_id: string | null
          status: Database["public"]["Enums"]["po_status"]
          total_amount: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          po_number?: string
          requisition_id?: string | null
          status?: Database["public"]["Enums"]["po_status"]
          total_amount?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          po_number?: string
          requisition_id?: string | null
          status?: Database["public"]["Enums"]["po_status"]
          total_amount?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_requisition_id_fkey"
            columns: ["requisition_id"]
            isOneToOne: false
            referencedRelation: "purchase_requisitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_requisitions: {
        Row: {
          company_id: string
          created_at: string
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["pr_priority"]
          requested_by: string
          required_date: string | null
          requisition_number: string
          status: Database["public"]["Enums"]["requisition_status"]
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["pr_priority"]
          requested_by: string
          required_date?: string | null
          requisition_number?: string
          status?: Database["public"]["Enums"]["requisition_status"]
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["pr_priority"]
          requested_by?: string
          required_date?: string | null
          requisition_number?: string
          status?: Database["public"]["Enums"]["requisition_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requisitions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      requisition_lines: {
        Row: {
          created_at: string
          estimated_unit_price: number | null
          id: string
          item_id: string | null
          item_name: string
          notes: string | null
          quantity: number
          requisition_id: string
          unit: string
        }
        Insert: {
          created_at?: string
          estimated_unit_price?: number | null
          id?: string
          item_id?: string | null
          item_name: string
          notes?: string | null
          quantity?: number
          requisition_id: string
          unit?: string
        }
        Update: {
          created_at?: string
          estimated_unit_price?: number | null
          id?: string
          item_id?: string | null
          item_name?: string
          notes?: string | null
          quantity?: number
          requisition_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "requisition_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisition_lines_requisition_id_fkey"
            columns: ["requisition_id"]
            isOneToOne: false
            referencedRelation: "purchase_requisitions"
            referencedColumns: ["id"]
          },
        ]
      }
      return_orders: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          credit_amount: number | null
          grn_id: string | null
          grn_line_id: string | null
          id: string
          notes: string | null
          po_id: string
          po_line_id: string | null
          quantity: number
          resolution: Database["public"]["Enums"]["rtv_resolution"] | null
          return_reason: Database["public"]["Enums"]["return_reason"]
          rtv_number: string
          status: Database["public"]["Enums"]["rtv_status"]
          tracking_number: string | null
          unit: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          credit_amount?: number | null
          grn_id?: string | null
          grn_line_id?: string | null
          id?: string
          notes?: string | null
          po_id: string
          po_line_id?: string | null
          quantity: number
          resolution?: Database["public"]["Enums"]["rtv_resolution"] | null
          return_reason?: Database["public"]["Enums"]["return_reason"]
          rtv_number?: string
          status?: Database["public"]["Enums"]["rtv_status"]
          tracking_number?: string | null
          unit?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          credit_amount?: number | null
          grn_id?: string | null
          grn_line_id?: string | null
          id?: string
          notes?: string | null
          po_id?: string
          po_line_id?: string | null
          quantity?: number
          resolution?: Database["public"]["Enums"]["rtv_resolution"] | null
          return_reason?: Database["public"]["Enums"]["return_reason"]
          rtv_number?: string
          status?: Database["public"]["Enums"]["rtv_status"]
          tracking_number?: string | null
          unit?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "return_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_orders_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "goods_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_orders_grn_line_id_fkey"
            columns: ["grn_line_id"]
            isOneToOne: false
            referencedRelation: "goods_receipt_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_orders_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_orders_po_line_id_fkey"
            columns: ["po_line_id"]
            isOneToOne: false
            referencedRelation: "po_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_leads: {
        Row: {
          assigned_to: string | null
          company_id: string
          company_name: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          expected_revenue: number | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          expected_revenue?: number | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          expected_revenue?: number | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_products: {
        Row: {
          capacity: string | null
          category: string
          company_id: string
          created_at: string
          customer_type: string
          device_info: string | null
          id: string
          includes_extender: boolean | null
          includes_mifi: boolean | null
          includes_router: boolean | null
          includes_sim: boolean | null
          includes_voip: boolean | null
          includes_wifi_modem: boolean | null
          is_active: boolean | null
          name: string
          price_jd: number
          segment: string | null
          sim_price_jd: number | null
          sort_order: number | null
          speed: string | null
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          capacity?: string | null
          category: string
          company_id: string
          created_at?: string
          customer_type?: string
          device_info?: string | null
          id?: string
          includes_extender?: boolean | null
          includes_mifi?: boolean | null
          includes_router?: boolean | null
          includes_sim?: boolean | null
          includes_voip?: boolean | null
          includes_wifi_modem?: boolean | null
          is_active?: boolean | null
          name: string
          price_jd?: number
          segment?: string | null
          sim_price_jd?: number | null
          sort_order?: number | null
          speed?: string | null
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: string | null
          category?: string
          company_id?: string
          created_at?: string
          customer_type?: string
          device_info?: string | null
          id?: string
          includes_extender?: boolean | null
          includes_mifi?: boolean | null
          includes_router?: boolean | null
          includes_sim?: boolean | null
          includes_voip?: boolean | null
          includes_wifi_modem?: boolean | null
          is_active?: boolean | null
          name?: string
          price_jd?: number
          segment?: string | null
          sim_price_jd?: number | null
          sort_order?: number | null
          speed?: string | null
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_quotation_lines: {
        Row: {
          created_at: string | null
          discount_percent: number | null
          id: string
          item_id: string | null
          item_name: string
          quantity: number | null
          quotation_id: string
          total_price: number | null
          unit: string | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          discount_percent?: number | null
          id?: string
          item_id?: string | null
          item_name: string
          quantity?: number | null
          quotation_id: string
          total_price?: number | null
          unit?: string | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          discount_percent?: number | null
          id?: string
          item_id?: string | null
          item_name?: string
          quantity?: number | null
          quotation_id?: string
          total_price?: number | null
          unit?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_quotation_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_quotation_lines_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "sales_quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_quotations: {
        Row: {
          client_id: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          currency: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          lead_id: string | null
          notes: string | null
          quotation_number: string
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          lead_id?: string | null
          notes?: string | null
          quotation_number: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          lead_id?: string | null
          notes?: string | null
          quotation_number?: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_quotations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_quotations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_costs: {
        Row: {
          actual_amount: number | null
          cost_type: Database["public"]["Enums"]["cost_type"]
          created_at: string
          currency: string
          estimate_amount: number | null
          id: string
          notes: string | null
          shipment_id: string
          updated_at: string
          user_id: string
          vendor_name: string | null
        }
        Insert: {
          actual_amount?: number | null
          cost_type: Database["public"]["Enums"]["cost_type"]
          created_at?: string
          currency?: string
          estimate_amount?: number | null
          id?: string
          notes?: string | null
          shipment_id: string
          updated_at?: string
          user_id: string
          vendor_name?: string | null
        }
        Update: {
          actual_amount?: number | null
          cost_type?: Database["public"]["Enums"]["cost_type"]
          created_at?: string
          currency?: string
          estimate_amount?: number | null
          id?: string
          notes?: string | null
          shipment_id?: string
          updated_at?: string
          user_id?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_costs_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_documents: {
        Row: {
          created_at: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_url: string | null
          id: string
          shipment_id: string
          status: Database["public"]["Enums"]["document_status"]
          updated_at: string
          uploaded_at: string | null
        }
        Insert: {
          created_at?: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_url?: string | null
          id?: string
          shipment_id: string
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string
          uploaded_at?: string | null
        }
        Update: {
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          file_url?: string | null
          id?: string
          shipment_id?: string
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_documents_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_plans: {
        Row: {
          created_at: string
          generated_plan: string | null
          id: string
          shipment_state: Json
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_plan?: string | null
          id?: string
          shipment_state?: Json
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generated_plan?: string | null
          id?: string
          shipment_state?: Json
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shipment_tasks: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          shipment_id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          shipment_id: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          shipment_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_tasks_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_delivery_at: string | null
          actual_pickup_at: string | null
          created_at: string
          customer_id: string | null
          driver_name: string | null
          id: string
          order_id: string | null
          plan_id: string | null
          planned_delivery_date: string | null
          planned_pickup_date: string | null
          pod_image_url: string | null
          pod_notes: string | null
          pod_receiver_name: string | null
          pod_signature: string | null
          status: Database["public"]["Enums"]["shipment_status"]
          tracking_number: string | null
          updated_at: string
          user_id: string
          vehicle_plate: string | null
        }
        Insert: {
          actual_delivery_at?: string | null
          actual_pickup_at?: string | null
          created_at?: string
          customer_id?: string | null
          driver_name?: string | null
          id?: string
          order_id?: string | null
          plan_id?: string | null
          planned_delivery_date?: string | null
          planned_pickup_date?: string | null
          pod_image_url?: string | null
          pod_notes?: string | null
          pod_receiver_name?: string | null
          pod_signature?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          tracking_number?: string | null
          updated_at?: string
          user_id: string
          vehicle_plate?: string | null
        }
        Update: {
          actual_delivery_at?: string | null
          actual_pickup_at?: string | null
          created_at?: string
          customer_id?: string | null
          driver_name?: string | null
          id?: string
          order_id?: string | null
          plan_id?: string | null
          planned_delivery_date?: string | null
          planned_pickup_date?: string | null
          pod_image_url?: string | null
          pod_notes?: string | null
          pod_receiver_name?: string | null
          pod_signature?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
          vehicle_plate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "shipment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments_v2: {
        Row: {
          actual_delivery: string | null
          client_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          destination: string
          expected_delivery: string | null
          id: string
          notes: string | null
          origin: string
          status: Database["public"]["Enums"]["shipment_status_v2"]
          tracking_number: string | null
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          actual_delivery?: string | null
          client_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          destination: string
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          origin: string
          status?: Database["public"]["Enums"]["shipment_status_v2"]
          tracking_number?: string | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          actual_delivery?: string | null
          client_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          destination?: string
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          origin?: string
          status?: Database["public"]["Enums"]["shipment_status_v2"]
          tracking_number?: string | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_v2_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_v2_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_v2_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          category_id: string
          content_ar: string | null
          content_en: string | null
          created_at: string
          id: string
          slug: string
          sort_order: number | null
          summary_ar: string | null
          summary_en: string | null
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          category_id: string
          content_ar?: string | null
          content_en?: string | null
          created_at?: string
          id?: string
          slug: string
          sort_order?: number | null
          summary_ar?: string | null
          summary_en?: string | null
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          content_ar?: string | null
          content_en?: string | null
          created_at?: string
          id?: string
          slug?: string
          sort_order?: number | null
          summary_ar?: string | null
          summary_en?: string | null
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      training_ratings: {
        Row: {
          completed_steps: number
          created_at: string
          feedback: string | null
          id: string
          plan_id: string
          plan_title: string
          rating: number
          total_steps: number
          user_id: string
        }
        Insert: {
          completed_steps?: number
          created_at?: string
          feedback?: string | null
          id?: string
          plan_id: string
          plan_title: string
          rating: number
          total_steps?: number
          user_id: string
        }
        Update: {
          completed_steps?: number
          created_at?: string
          feedback?: string | null
          id?: string
          plan_id?: string
          plan_title?: string
          rating?: number
          total_steps?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vision_scans: {
        Row: {
          action_taken: string | null
          ai_result: Json
          company_id: string
          created_at: string
          detected_quantity: number | null
          id: string
          image_url: string | null
          matched_item_id: string | null
          matched_location_id: string | null
          notes: string | null
          reference_id: string | null
          reference_type: string | null
          scan_type: string
          user_id: string
        }
        Insert: {
          action_taken?: string | null
          ai_result?: Json
          company_id: string
          created_at?: string
          detected_quantity?: number | null
          id?: string
          image_url?: string | null
          matched_item_id?: string | null
          matched_location_id?: string | null
          notes?: string | null
          reference_id?: string | null
          reference_type?: string | null
          scan_type: string
          user_id: string
        }
        Update: {
          action_taken?: string | null
          ai_result?: Json
          company_id?: string
          created_at?: string
          detected_quantity?: number | null
          id?: string
          image_url?: string | null
          matched_item_id?: string | null
          matched_location_id?: string | null
          notes?: string | null
          reference_id?: string | null
          reference_type?: string | null
          scan_type?: string
          user_id?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          address_line1: string | null
          city: string | null
          company_id: string
          country: string | null
          created_at: string
          id: string
          is_active: boolean
          location: string | null
          name: string
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          city?: string | null
          company_id: string
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          city?: string | null
          company_id?: string
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      dp_company_risk_index: {
        Row: {
          company_id: string | null
          critical_count: number | null
          high_count: number | null
          medium_count: number | null
          total_risk_points: number | null
        }
        Relationships: []
      }
      dp_driver_performance: {
        Row: {
          cod_delivered: number | null
          cod_shipments: number | null
          company_id: string | null
          delivered_count: number | null
          driver_id: string | null
          on_time_count: number | null
          return_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dp_drivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      dp_governance_kpis: {
        Row: {
          company_id: string | null
          critical_events: number | null
          high_events: number | null
          medium_events: number | null
          total_events: number | null
        }
        Relationships: []
      }
      dp_governance_live_feed: {
        Row: {
          company_id: string | null
          created_at: string | null
          driver_id: string | null
          driver_name: string | null
          event_type: string | null
          id: string | null
          message: string | null
          metadata: Json | null
          reference_id: string | null
          severity: string | null
          shipment_id: string | null
        }
        Relationships: []
      }
      dp_live_control_feed: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string | null
          message: string | null
          severity: string | null
          source: string | null
        }
        Relationships: []
      }
      dp_weekly_risk_report: {
        Row: {
          alerts_last_7_days: number | null
          company_id: string | null
          driver_id: string | null
          driver_name: string | null
          risk_points: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dp_drivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_company_and_assign_admin: {
        Args: { _name: string }
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          logo: string | null
          name: string
          plan: Database["public"]["Enums"]["company_plan"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "companies"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      dp_cleanup_old_governance_events: { Args: never; Returns: undefined }
      dp_create_cod_settlement: {
        Args: { _driver_id: string }
        Returns: string
      }
      dp_inventory_summary: {
        Args: { _session_id: string }
        Returns: {
          expected_count: number
          missing_count: number
          scanned_count: number
        }[]
      }
      dp_scan_inventory: {
        Args: { _barcode: string; _session_id: string }
        Returns: string
      }
      execute_inventory_transfer: {
        Args: { _transfer_id: string }
        Returns: Json
      }
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_approved: { Args: { _user_id: string }; Returns: boolean }
      log_audit_event: {
        Args: {
          p_action: string
          p_entity_id: string
          p_entity_type: string
          p_new_values?: Json
          p_old_values?: Json
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "operations"
        | "warehouse"
        | "finance"
        | "viewer"
      blanket_status: "Active" | "Paused" | "Expired" | "Cancelled"
      client_type: "CLIENT" | "VENDOR"
      company_plan: "free" | "starter" | "pro" | "enterprise"
      cost_type:
        | "Freight"
        | "Customs"
        | "Clearance"
        | "Insurance"
        | "LastMile"
        | "Storage"
        | "Other"
      document_status: "Missing" | "Uploaded" | "Approved"
      document_type:
        | "Commercial_Invoice"
        | "Packing_List"
        | "Bill_of_Lading"
        | "AWB"
        | "Other"
      dp_shipment_status:
        | "CREATED"
        | "PICKED_UP"
        | "RECEIVED_AT_ORIGIN"
        | "IN_TRANSIT"
        | "RECEIVED_AT_DESTINATION"
        | "OUT_FOR_DELIVERY"
        | "DELIVERED"
        | "RETURNED"
        | "CANCELLED"
      dp_vehicle_type: "motorcycle" | "sedan" | "van" | "pickup" | "truck"
      expense_category:
        | "Freight"
        | "Customs"
        | "Insurance"
        | "Warehouse"
        | "Fuel"
        | "Maintenance"
        | "Salaries"
        | "Utilities"
        | "Office"
        | "Marketing"
        | "Other"
      grn_status: "Draft" | "Posted"
      inventory_movement_type:
        | "Inbound"
        | "Outbound"
        | "Transfer"
        | "Adjustment"
        | "Return"
      invoice_status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled"
      order_status: "Draft" | "Confirmed" | "Cancelled" | "ConvertedToShipment"
      payment_method: "cash" | "bank_transfer" | "credit_card" | "check"
      po_status:
        | "Draft"
        | "Sent"
        | "Acknowledged"
        | "Partially_Received"
        | "Received"
        | "Closed"
        | "Cancelled"
      pr_priority: "Low" | "Normal" | "High" | "Urgent"
      requisition_status:
        | "Draft"
        | "Submitted"
        | "Approved"
        | "Rejected"
        | "Converted"
      return_reason:
        | "Defective"
        | "Wrong_Item"
        | "Damaged"
        | "Quality_Issue"
        | "Expired"
        | "Other"
      rtv_resolution: "Replace" | "Refund" | "Credit"
      rtv_status:
        | "Draft"
        | "Approved"
        | "Shipped"
        | "Received_by_Vendor"
        | "Credited"
        | "Closed"
      shipment_status:
        | "Planned"
        | "Booked"
        | "In_Transit"
        | "Cleared"
        | "Delivered"
      shipment_status_v2:
        | "CREATED"
        | "PICKED_UP"
        | "IN_WAREHOUSE"
        | "OUT_FOR_DELIVERY"
        | "DELIVERED"
      task_status: "Pending" | "Done"
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
      app_role: [
        "admin",
        "user",
        "operations",
        "warehouse",
        "finance",
        "viewer",
      ],
      blanket_status: ["Active", "Paused", "Expired", "Cancelled"],
      client_type: ["CLIENT", "VENDOR"],
      company_plan: ["free", "starter", "pro", "enterprise"],
      cost_type: [
        "Freight",
        "Customs",
        "Clearance",
        "Insurance",
        "LastMile",
        "Storage",
        "Other",
      ],
      document_status: ["Missing", "Uploaded", "Approved"],
      document_type: [
        "Commercial_Invoice",
        "Packing_List",
        "Bill_of_Lading",
        "AWB",
        "Other",
      ],
      dp_shipment_status: [
        "CREATED",
        "PICKED_UP",
        "RECEIVED_AT_ORIGIN",
        "IN_TRANSIT",
        "RECEIVED_AT_DESTINATION",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "RETURNED",
        "CANCELLED",
      ],
      dp_vehicle_type: ["motorcycle", "sedan", "van", "pickup", "truck"],
      expense_category: [
        "Freight",
        "Customs",
        "Insurance",
        "Warehouse",
        "Fuel",
        "Maintenance",
        "Salaries",
        "Utilities",
        "Office",
        "Marketing",
        "Other",
      ],
      grn_status: ["Draft", "Posted"],
      inventory_movement_type: [
        "Inbound",
        "Outbound",
        "Transfer",
        "Adjustment",
        "Return",
      ],
      invoice_status: ["Draft", "Sent", "Paid", "Overdue", "Cancelled"],
      order_status: ["Draft", "Confirmed", "Cancelled", "ConvertedToShipment"],
      payment_method: ["cash", "bank_transfer", "credit_card", "check"],
      po_status: [
        "Draft",
        "Sent",
        "Acknowledged",
        "Partially_Received",
        "Received",
        "Closed",
        "Cancelled",
      ],
      pr_priority: ["Low", "Normal", "High", "Urgent"],
      requisition_status: [
        "Draft",
        "Submitted",
        "Approved",
        "Rejected",
        "Converted",
      ],
      return_reason: [
        "Defective",
        "Wrong_Item",
        "Damaged",
        "Quality_Issue",
        "Expired",
        "Other",
      ],
      rtv_resolution: ["Replace", "Refund", "Credit"],
      rtv_status: [
        "Draft",
        "Approved",
        "Shipped",
        "Received_by_Vendor",
        "Credited",
        "Closed",
      ],
      shipment_status: [
        "Planned",
        "Booked",
        "In_Transit",
        "Cleared",
        "Delivered",
      ],
      shipment_status_v2: [
        "CREATED",
        "PICKED_UP",
        "IN_WAREHOUSE",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
      ],
      task_status: ["Pending", "Done"],
    },
  },
} as const
