import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone the request and add headers
  const authReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
    }
  });

  return next(authReq);
};