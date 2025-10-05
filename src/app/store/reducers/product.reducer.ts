import { createReducer, on } from '@ngrx/store';
import { Product } from '../../core/models/product.model';
import * as ProductActions from '../actions/product.actions';

export interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  total: number;
  pages: number;
  currentPage: number;
  loading: boolean;
  error: any;
}

export const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  total: 0,
  pages: 0,
  currentPage: 1,
  loading: false,
  error: null
};

export const productReducer = createReducer(
  initialState,
  on(ProductActions.loadProducts, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductActions.loadProductsSuccess, (state, { response }) => ({
    ...state,
    products: response.products,
    total: response.total,
    pages: response.pages,
    currentPage: response.current_page,
    loading: false
  })),
  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(ProductActions.loadProductDetail, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductActions.loadProductDetailSuccess, (state, { product }) => ({
    ...state,
    selectedProduct: product,
    loading: false
  })),
  on(ProductActions.loadProductDetailFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(ProductActions.clearProductDetail, (state) => ({
    ...state,
    selectedProduct: null
  }))
);