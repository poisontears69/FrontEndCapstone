import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-placeholder',
  template: `
    <div class="placeholder-container">
      <div class="placeholder-icon">
        <i [class]="icon"></i>
      </div>
      <h2>{{ title }}</h2>
      <p>{{ title }} Works!</p>
    </div>
  `,
  styles: [`
    .placeholder-container {
      padding: 40px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      text-align: center;
    }
    
    .placeholder-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: #d4edda;
      color: #155724;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    
    .placeholder-icon i {
      font-size: 32px;
    }
    
    h2 {
      color: #155724;
      margin-bottom: 15px;
    }
    
    p {
      color: #6c757d;
      font-size: 16px;
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class DoctorPlaceholderComponent {
  @Input() title: string = 'Page';
  @Input() icon: string = 'fas fa-file-medical';
} 