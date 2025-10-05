import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ProductService } from '../../core/services/product.service';
import * as ProductActions from '../actions/product.actions';

@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      mergeMap((action) =>
        this.productService.searchProducts(action.params).pipe(
          map((response) => ProductActions.loadProductsSuccess({ response })),
          catchError((error) => of(ProductActions.loadProductsFailure({ error })))
        )
      )
    )
  );

  loadProductDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProductDetail),
      mergeMap((action) =>
        this.productService.getProductById(action.id).pipe(
          map((product) => ProductActions.loadProductDetailSuccess({ product })),
          catchError((error) => of(ProductActions.loadProductDetailFailure({ error })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}
}