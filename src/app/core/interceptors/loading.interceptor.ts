import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { SKIP_GLOBAL_LOADING } from '../http-context-tokens';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  const skip = req.context.get(SKIP_GLOBAL_LOADING);

  if (!skip) {
    loadingService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (!skip) {
        loadingService.hide();
      }
    })
  );
};