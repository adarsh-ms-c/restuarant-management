export type OrderStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
export type PaymentStatus = "PAID" | "UNPAID" | "REFUNDED";

export type Item = {
  id: number;
  name: string;
  price: number;
  stock: number;
  imgUrl: string;
};

export type Order = {
  id: number;
  itemId: number;
  quantity: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  stockDeducted: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  error?: string;
  items?: Item[];
  orders?: Order[];
  result?: T;
};

export type AddItemInput = {
  name: string;
  price: number;
  stock: number;
  imgUrl: string;
};
