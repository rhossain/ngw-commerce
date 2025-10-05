import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Cart } from '../../core/models/cart.model';
import { Address } from '../../core/models/user.model';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cart$: Observable<Cart | null>;
  checkoutForm!: FormGroup;
  
  paymentMethods: any[] = [];
  shippingMethods: any[] = [];
  
  selectedPaymentMethod = '';
  selectedShippingMethod: any = null;
  
  isGuest = true;
  sameAsShipping = true;
  isProcessing = false;
  
  checkoutStep: 'shipping' | 'payment' | 'review' = 'shipping';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cartService: CartService,
    private orderService: OrderService,
    private userService: UserService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.checkAuthStatus();
    this.loadPaymentMethods();
    this.loadUserAddresses();
  }

  initializeForm(): void {
    this.checkoutForm = this.fb.group({
      billing: this.fb.group({
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        address_1: ['', Validators.required],
        address_2: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        postcode: ['', Validators.required],
        country: ['US', Validators.required],
        company: ['']
      }),
      shipping: this.fb.group({
        first_name: [''],
        last_name: [''],
        address_1: [''],
        address_2: [''],
        city: [''],
        state: [''],
        postcode: [''],
        country: ['US'],
        company: ['']
      }),
      order_comments: [''],
      terms_accepted: [false, Validators.requiredTrue]
    });
  }

  checkAuthStatus(): void {
    this.isGuest = !this.authService.isAuthenticated();
  }

  loadUserAddresses(): void {
    if (!this.isGuest) {
      this.userService.getAddresses().subscribe({
        next: (response: { success: boolean; billing: any; shipping: any }) => {
          if (response.success) {
            this.checkoutForm.patchValue({
              billing: response.billing,
              shipping: response.shipping
            });
          }
        },
        error: (error: any) => {
          console.error('Error loading addresses:', error);
        }
      });
    }
  }

  loadPaymentMethods(): void {
    this.orderService.getPaymentMethods().subscribe({
      next: (response: { success: boolean; payment_methods: any[] }) => {
        if (response.success) {
          this.paymentMethods = response.payment_methods;
          if (this.paymentMethods.length > 0) {
            this.selectedPaymentMethod = this.paymentMethods[0].id;
          }
        }
      },
      error: (error: any) => {
        console.error('Error loading payment methods:', error);
        this.toastr.error('Failed to load payment methods');
      }
    });
  }

  loadShippingMethods(): void {
    const shippingAddress = this.sameAsShipping 
      ? this.checkoutForm.get('billing')?.value 
      : this.checkoutForm.get('shipping')?.value;

    this.orderService.getShippingMethods(shippingAddress).subscribe({
      next: (response: { success: boolean; shipping_methods: any[] }) => {
        if (response.success) {
          this.shippingMethods = response.shipping_methods[0]?.methods || [];
          if (this.shippingMethods.length > 0) {
            this.selectedShippingMethod = this.shippingMethods[0];
          }
        }
      },
      error: (error: any) => {
        console.error('Error loading shipping methods:', error);
        this.toastr.error('Failed to load shipping methods');
      }
    });
  }

  onSameAsShippingChange(): void {
    if (this.sameAsShipping) {
      const billingAddress = this.checkoutForm.get('billing')?.value;
      this.checkoutForm.get('shipping')?.patchValue({
        first_name: billingAddress.first_name,
        last_name: billingAddress.last_name,
        address_1: billingAddress.address_1,
        address_2: billingAddress.address_2,
        city: billingAddress.city,
        state: billingAddress.state,
        postcode: billingAddress.postcode,
        country: billingAddress.country,
        company: billingAddress.company
      });
    }
  }

  nextStep(): void {
    if (this.checkoutStep === 'shipping') {
      if (this.checkoutForm.get('billing')?.valid) {
        if (!this.sameAsShipping && !this.checkoutForm.get('shipping')?.valid) {
          this.toastr.error('Please fill in all required shipping fields');
          return;
        }
        this.loadShippingMethods();
        this.checkoutStep = 'payment';
      } else {
        this.toastr.error('Please fill in all required billing fields');
      }
    } else if (this.checkoutStep === 'payment') {
      if (!this.selectedPaymentMethod) {
        this.toastr.error('Please select a payment method');
        return;
      }
      if (!this.selectedShippingMethod) {
        this.toastr.error('Please select a shipping method');
        return;
      }
      this.checkoutStep = 'review';
    }
  }

  previousStep(): void {
    if (this.checkoutStep === 'payment') {
      this.checkoutStep = 'shipping';
    } else if (this.checkoutStep === 'review') {
      this.checkoutStep = 'payment';
    }
  }

  placeOrder(): void {
    if (!this.checkoutForm.valid) {
      this.toastr.error('Please complete all required fields');
      return;
    }

    if (!this.checkoutForm.get('terms_accepted')?.value) {
      this.toastr.error('Please accept the terms and conditions');
      return;
    }

    this.isProcessing = true;

    const checkoutData = {
      billing: this.checkoutForm.get('billing')?.value,
      shipping: this.sameAsShipping 
        ? this.checkoutForm.get('billing')?.value 
        : this.checkoutForm.get('shipping')?.value,
      payment_method: this.selectedPaymentMethod,
      shipping_method: this.selectedShippingMethod,
      order_comments: this.checkoutForm.get('order_comments')?.value
    };

    this.orderService.processCheckout(checkoutData).subscribe({
      next: (response: { success: boolean; message?: string; payment_result?: { redirect_url?: string }; order_id?: number }) => {
        this.isProcessing = false;
        if (response.success) {
          this.toastr.success('Order placed successfully!');
          
          // Handle payment redirect if needed
          if (response.payment_result?.redirect_url) {
            window.location.href = response.payment_result.redirect_url;
          } else {
            this.router.navigate(['/account/orders', response.order_id]);
          }
        } else {
          this.toastr.error(response.message || 'Failed to place order');
        }
      },
      error: (error: any) => {
        this.isProcessing = false;
        this.toastr.error('Failed to place order. Please try again.');
        console.error('Checkout error:', error);
      }
    });
  }

  get billingForm() {
    return this.checkoutForm.get('billing') as FormGroup;
  }

  get shippingForm() {
    return this.checkoutForm.get('shipping') as FormGroup;
  }
}