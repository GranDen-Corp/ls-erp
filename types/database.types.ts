export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          customer_id?: string
          name?: string
          customer_name?: string
          customer_full_name?: string
          customer_short_name?: string
          payment_term?: string
          delivery_terms?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      products: {
        Row: {
          id: string
          part_no: string
          component_name?: string
          description?: string
          is_assembly?: boolean
          customer_id?: string
          unit_price?: number
          sub_part_no?: any
          [key: string]: any
        }
        Insert: {
          id?: string
          part_no: string
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      orders: {
        Row: {
          id: string
          order_id: string
          customer_id: string
          po_id: string
          [key: string]: any
        }
        Insert: {
          id?: string
          order_id: string
          customer_id: string
          po_id: string
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
    }
    Views: {
      [key: string]: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
    }
    Functions: {
      [key: string]: {
        Args: Record<string, any>
        Returns: any
      }
    }
    Enums: {
      [key: string]: {
        [key: string]: any
      }
    }
  }
}
