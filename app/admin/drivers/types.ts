export interface Driver {
  id: string

  full_name: string

  status: "pending" | "approved" | "rejected"

  phone: string
  national_id: string

  vehicle_type: string
  plate_number: string
  vehicle_model: string
  vehicle_color: string

  license_url?: string
  id_front_url?: string
  id_back_url?: string
  vehicle_photo_url?: string
}