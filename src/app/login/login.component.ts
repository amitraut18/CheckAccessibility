import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  errorMessage = '';
  isLoading = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      console.log('Login form submitted:', this.loginForm.value);
      // Add your authentication logic here
      alert('Login successful! (Demo)');
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.focusFirstInvalidField();
    }
  }

  private focusFirstInvalidField(): void {
    const firstInvalidControl = Object.keys(this.loginForm.controls)
      .find(key => this.loginForm.controls[key].invalid);
    
    if (firstInvalidControl) {
      const el = document.querySelector(`[formControlName="${firstInvalidControl}"]`) as HTMLElement;
      if (el) {
        setTimeout(() => el.focus(), 100);
      }
    }
  }

  clearEmail(): void {
    this.loginForm.patchValue({ email: '' });
  }

  forgotPassword(): void {
    console.log('Forgot password clicked');
    alert('Forgot password functionality (Demo)');
  }

  showHelp(): void {
    console.log('Help clicked');
    alert('Help information (Demo)');
  }

  goToSignup(): void {
    console.log('Go to signup clicked');
    alert('Navigate to signup (Demo)');
  }

  toggleDarkMode(): void {
    console.log('Toggle dark mode clicked');
    alert('Dark mode toggled (Demo)');
  }
}
