import { createAction, props } from '@ngrx/store';
import { Product, ProductSearchParams, ProductSearchResponse } from '../../core/models/product.model';

export const loadProducts = createAction(
  '[Product] Load Products',
  props<{ params: ProductSearchParams }>()
);

export const loadProductsSuccess = createAction(
  '[Product] Load Products Success',
  props<{ response: ProductSearchResponse }>()
);

export const loadProductsFailure = createAction(
  '[Product] Load Products Failure',
  props<{ error: any }>()
);

export const loadProductDetail = createAction(
  '[Product] Load Product Detail',
  props<{ id: number }>()
);

export const loadProductDetailSuccess = createAction(
  '[Product] Load Product Detail Success',
  props<{ product: Product }>()
);

export const loadProductDetailFailure = createAction(
  '[Product] Load Product Detail Failure',
  props<{ error: any }>()
);

export const clearProductDetail = createAction(
  '[Product] Clear Product Detail'
);