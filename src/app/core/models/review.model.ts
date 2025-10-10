export interface ProductReview {
  id: number;
  product_id: number;
  date_created: string;
  date_created_gmt?: string;
  status?: string;
  reviewer: string;
  reviewer_email?: string;
  review: string;
  rating: number;
  verified: boolean;
  reviewer_avatar_urls?: {
    24?: string;
    48?: string;
    96?: string;
  };
  user_id?: number; // WordPress user ID of the reviewer
}

export interface ReviewCreateRequest {
  product_id: number;
  review: string;
  rating: number;
  // Optional: for anonymous or non-WordPress users
  reviewer_name?: string;
  reviewer_email?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface ReviewUpdateRequest {
  id: number;
  review?: string;
  rating?: number;
}
