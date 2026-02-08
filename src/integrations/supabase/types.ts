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
          company_id: string
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issued_at: string | null
          notes: string | null
          paid_at: string | null
          shipment_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          company_id: string
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issued_at?: string | null
          notes?: string | null
          paid_at?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string | null
          notes?: string | null
          paid_at?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_v2_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
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
      [_ in never]: never
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
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
      inventory_movement_type:
        | "Inbound"
        | "Outbound"
        | "Transfer"
        | "Adjustment"
        | "Return"
      invoice_status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled"
      order_status: "Draft" | "Confirmed" | "Cancelled" | "ConvertedToShipment"
      payment_method: "cash" | "bank_transfer" | "credit_card" | "check"
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
