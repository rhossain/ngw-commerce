import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone the request and add credentials
  const authReq = req.clone({
    withCredentials: true,
    setHeaders: {
      'Content-Type': 'application/json',
    }
  });

  return next(authReq);
};