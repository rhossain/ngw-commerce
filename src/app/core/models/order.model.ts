
// Order domain model

export interface Order {

  id: string | number;

  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded' | 'on-hold';

  total?: number;

  createdAt?: string;

  updatedAt?: string;

  items?: Array<{

    productId: string | number;

    name?: string;

    quantity: number;

    price?: number;

  }>;

  // Allow additional backend-provided fields

  [key: string]: any;

}

