import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { UserAddresses } from '../../../core/models/user.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.css']
})
export class AddressesComponent implements OnInit {
  billingForm!: FormGroup;
  shippingForm!: FormGroup;
  
  isEditingBilling = false;
  isEditingShipping = false;
  isUpdating = false;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadAddresses();
  }

  initializeForms(): void {
    this.billingForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      company: [''],
      address_1: ['', Validators.required],
      address_2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postcode: ['', Validators.required],
      country: ['US', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });

    this.shippingForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      company: [''],
      address_1: ['', Validators.required],
      address_2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postcode: ['', Validators.required],
      country: ['US', Validators.required]
    });

    // Disable forms initially
    this.billingForm.disable();
    this.shippingForm.disable();
  }

  loadAddresses(): void {
    this.loading = true;
    this.userService.getAddresses().subscribe({
      next: (response) => {
        if (response.success) {
          this.billingForm.patchValue(response.billing);
          this.shippingForm.patchValue(response.shipping);
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading addresses:', error);
        this.loading = false;
      }
    });
  }

  toggleEditBilling(): void {
    this.isEditingBilling = !this.isEditingBilling;
    if (this.isEditingBilling) {
      this.billingForm.enable();
    } else {
      this.billingForm.disable();
      this.loadAddresses();
    }
  }

  toggleEditShipping(): void {
    this.isEditingShipping = !this.isEditingShipping;
    if (this.isEditingShipping) {
      this.shippingForm.enable();
    } else {
      this.shippingForm.disable();
      this.loadAddresses();
    }
  }

  copyBillingToShipping(): void {
    const billingValues = this.billingForm.value;
    this.shippingForm.patchValue({
      first_name: billingValues.first_name,
      last_name: billingValues.last_name,
      company: billingValues.company,
      address_1: billingValues.address_1,
      address_2: billingValues.address_2,
      city: billingValues.city,
      state: billingValues.state,
      postcode: billingValues.postcode,
      country: billingValues.country
    });
  }

  updateAddresses(): void {
    if (this.billingForm.invalid || this.shippingForm.invalid) {
      this.toastr.error('Please fill in all required fields');
      return;
    }

    this.isUpdating = true;

    // Update billing address first, then shipping
    this.userService.updateAddress('billing', this.billingForm.value).subscribe({
      next: () => {
        // Update shipping address after billing is successful
        this.userService.updateAddress('shipping', this.shippingForm.value).subscribe({
          next: () => {
            this.isUpdating = false;
            this.isEditingBilling = false;
            this.isEditingShipping = false;
            this.billingForm.disable();
            this.shippingForm.disable();
            this.toastr.success('Addresses updated successfully!');
          },
          error: (error: any) => {
            this.isUpdating = false;
            this.toastr.error('Failed to update shipping address');
            console.error('Update shipping address error:', error);
          }
        });
      },
      error: (error: any) => {
        this.isUpdating = false;
        this.toastr.error('Failed to update billing address');
        console.error('Update billing address error:', error);
      }
    });
  }
}