import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PrivacyPolicyComponent implements OnInit {
  currentYear: number = new Date().getFullYear();

  constructor(
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit(): void {
    // Set page title and meta tags for SEO
    this.titleService.setTitle('Privacy Policy | HealthConnect');
    this.metaService.updateTag({ name: 'description', content: 'HealthConnect Privacy Policy - Learn about how we collect, use, and protect your personal information.' });
    
    // Scroll to top when component initializes
    window.scrollTo(0, 0);
  }
} 