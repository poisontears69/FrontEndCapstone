import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-legal-redirect',
  template: `<div>Redirecting to legal pages...</div>`,
  standalone: true
})
export class LegalRedirectComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Open terms of service in a new tab
    window.open('/legal/terms-of-service', '_blank');
    
    // Open privacy policy in a new tab
    window.open('/legal/privacy-policy', '_blank');
    
    // Navigate back to home page
    this.router.navigate(['/']);
  }
} 