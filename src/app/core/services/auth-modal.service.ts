import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AuthModalMode = 'login' | 'register';

@Injectable({
  providedIn: 'root'
})
export class AuthModalService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  private modeSubject = new BehaviorSubject<AuthModalMode>('login');
  
  public isOpen$: Observable<boolean> = this.isOpenSubject.asObservable();
  public mode$: Observable<AuthModalMode> = this.modeSubject.asObservable();

  constructor() {}

  /**
   * Opens the authentication modal
   * @param mode The initial mode ('login' or 'register')
   */
  open(mode: AuthModalMode = 'login'): void {
    this.modeSubject.next(mode);
    this.isOpenSubject.next(true);
  }

  /**
   * Closes the authentication modal
   */
  close(): void {
    this.isOpenSubject.next(false);
  }

  /**
   * Switches between login and register modes
   * @param mode The mode to switch to
   */
  setMode(mode: AuthModalMode): void {
    this.modeSubject.next(mode);
  }

  /**
   * Get current open state
   */
  get isOpen(): boolean {
    return this.isOpenSubject.value;
  }

  /**
   * Get current mode
   */
  get mode(): AuthModalMode {
    return this.modeSubject.value;
  }
}
