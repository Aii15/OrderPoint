export interface CreateOrderItemInput {
  name: string;
  quantity: number;
  price: number;
}

export class CreateOrderDto {
  customerName!: string;
  items!: CreateOrderItemInput[];
  subtotal!: number;
  tax!: number;
  total!: number;
}