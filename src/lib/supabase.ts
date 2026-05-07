import { createClient } from '@supabase/supabase-js'

// ===== Database schema types =====

export interface Database {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string
          name: string
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          created_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact_name: string | null
          contact_phone: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_name?: string | null
          contact_phone?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_name?: string | null
          contact_phone?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          id: string
          name: string
          label: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          label: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          label?: string
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          category_id: string
          unit_label: string
          units_per_box: number | null
          min_stock_alert: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category_id: string
          unit_label?: string
          units_per_box?: number | null
          min_stock_alert?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category_id?: string
          unit_label?: string
          units_per_box?: number | null
          min_stock_alert?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'product_categories'
            referencedColumns: ['id']
          },
        ]
      }
      stock: {
        Row: {
          id: string
          location_id: string
          product_id: string
          quantity: number
          last_updated: string
        }
        Insert: {
          id?: string
          location_id: string
          product_id: string
          quantity?: number
          last_updated?: string
        }
        Update: {
          id?: string
          location_id?: string
          product_id?: string
          quantity?: number
          last_updated?: string
        }
        Relationships: [
          {
            foreignKeyName: 'stock_location_id_fkey'
            columns: ['location_id']
            isOneToOne: false
            referencedRelation: 'locations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'stock_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      movements: {
        Row: {
          id: string
          location_id: string
          product_id: string
          movement_type: 'sale' | 'restock' | 'adjustment'
          quantity: number
          supplier_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          location_id: string
          product_id: string
          movement_type: 'sale' | 'restock' | 'adjustment'
          quantity: number
          supplier_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          product_id?: string
          movement_type?: 'sale' | 'restock' | 'adjustment'
          quantity?: number
          supplier_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'movements_location_id_fkey'
            columns: ['location_id']
            isOneToOne: false
            referencedRelation: 'locations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'movements_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'movements_supplier_id_fkey'
            columns: ['supplier_id']
            isOneToOne: false
            referencedRelation: 'suppliers'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      stock_current: {
        Row: {
          id: string
          location_id: string
          location_name: string
          product_id: string
          product_name: string
          category_name: string
          category_label: string
          quantity: number
          unit_label: string
          min_stock_alert: number
          is_low_stock: boolean
          last_updated: string
        }
        Relationships: []
      }
      stock_comparison: {
        Row: {
          product_id: string
          product_name: string
          category_label: string
          unit_label: string
          min_stock_alert: number
          acuna_qty: number
          triunvirato_qty: number
          total_qty: number
          acuna_low: boolean
          triunvirato_low: boolean
        }
        Relationships: []
      }
      low_stock_alerts: {
        Row: {
          location_name: string
          product_name: string
          category_label: string
          current_stock: number
          alert_threshold: number
          unit_label: string
          last_updated: string
        }
        Relationships: []
      }
      movement_history: {
        Row: {
          id: string
          created_at: string
          location_name: string
          product_name: string
          category_label: string
          movement_type: 'sale' | 'restock' | 'adjustment'
          movement_label: string
          quantity: number
          unit_label: string
          supplier_name: string | null
          notes: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      record_sale: {
        Args: {
          p_location_id: string
          p_product_id: string
          p_quantity: number
          p_notes?: string | null
        }
        Returns: Database['public']['Tables']['movements']['Row']
      }
      record_restock: {
        Args: {
          p_location_id: string
          p_product_id: string
          p_quantity: number
          p_supplier_id?: string | null
          p_notes?: string | null
        }
        Returns: Database['public']['Tables']['movements']['Row']
      }
      adjust_stock: {
        Args: {
          p_location_id: string
          p_product_id: string
          p_new_quantity: number
          p_notes?: string | null
        }
        Returns: Database['public']['Tables']['movements']['Row']
      }
    }
  }
}

// ===== Convenience row types =====

export type Location = Database['public']['Tables']['locations']['Row']
export type Supplier = Database['public']['Tables']['suppliers']['Row']
export type ProductCategory = Database['public']['Tables']['product_categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Stock = Database['public']['Tables']['stock']['Row']
export type Movement = Database['public']['Tables']['movements']['Row']
export type MovementType = Movement['movement_type']

export type StockCurrentRow = Database['public']['Views']['stock_current']['Row']
export type StockComparisonRow = Database['public']['Views']['stock_comparison']['Row']
export type LowStockAlertRow = Database['public']['Views']['low_stock_alerts']['Row']
export type MovementHistoryRow = Database['public']['Views']['movement_history']['Row']

// ===== Client factory =====

export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY)',
    )
  }

  return createClient<Database>(url, key)
}
