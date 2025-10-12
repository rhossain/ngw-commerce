import { HttpContextToken } from '@angular/common/http';

// Token indicating a request should not trigger the global loading spinner.
export const SKIP_GLOBAL_LOADING = new HttpContextToken<boolean>(() => false);
