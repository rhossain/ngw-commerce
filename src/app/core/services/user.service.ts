import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, Address, UserAddresses } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private api: ApiService) {}

  getProfile(): Observable<{ success: boolean; user: User }> {
    return this.api.get<{ success: boolean; user: User }>('/user/profile');
  }

  updateProfile(userData: Partial<User>): Observable<any> {
    return this.api.post('/user/profile', userData);
  }

  getAddresses(): Observable<{ success: boolean; billing: Address; shipping: Address }> {
    return this.api.get<{ success: boolean; billing: Address; shipping: Address }>('/user/addresses');
  }

  updateAddress(type: 'billing' | 'shipping', address: Address): Observable<any> {
    return this.api.post(`/user/addresses/${type}`, address);
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.api.post('/user/change-password', {
      old_password: oldPassword,
      new_password: newPassword
    });
  }
}
