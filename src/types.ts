export type TUserDB = {
  id: string
  name: string
  email: string
  password: string
  created_at: string
}

export type TProductDB = {
  id: string
  name: string
  price: number
  description: string
  image_url: string
}

export type TPurchaseDB = {
  id: string;
  buyer: string;
  total_price: number;
  created_at: string;
};


