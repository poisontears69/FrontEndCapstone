import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ChatThread, Message, VideoCallInfo } from '../../../core/services/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-messages',
  templateUrl: './patient-messages.component.html',
  styleUrls: ['./patient-messages.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  providers: [DatePipe]
})
export class PatientMessagesComponent implements OnInit, OnDestroy, AfterViewChecked {
  chatThreads: ChatThread[] = [];
  activeThread: ChatThread | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  searchTerm: string = '';
  
  // File attachment variables
  @ViewChild('fileInput') fileInput!: ElementRef;
  attachmentFile: File | undefined = undefined;
  attachmentPreview: string | null = null;
  
  // Video call variables
  activeCall: VideoCallInfo | null = null;
  isCallInProgress: boolean = false;
  isMuted: boolean = false;
  isCameraOff: boolean = false;
  isCallMinimized: boolean = false;
  
  // Reference to the chat container for auto-scrolling
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  
  // Subscriptions for cleanup
  private subscriptions: Subscription[] = [];
  
  constructor(
    private messageService: MessageService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadChatThreads();
    
    // Subscribe to active call updates
    this.subscriptions.push(
      this.messageService.activeCall$.subscribe(call => {
        this.activeCall = call;
        this.isCallInProgress = !!call && call.status === 'in-progress';
      })
    );
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadChatThreads(): void {
    this.isLoading = true;
    
    this.messageService.getChatThreads().subscribe({
      next: (threads) => {
        this.chatThreads = threads;
        this.isLoading = false;
        
        // If there's an active thread, update it with the new data
        if (this.activeThread) {
          const updatedThread = threads.find(t => t.id === this.activeThread?.id);
          if (updatedThread) {
            this.activeThread = updatedThread;
          }
        }
      },
      error: (error) => {
        console.error('Error loading chat threads:', error);
        this.isLoading = false;
      }
    });
  }

  selectThread(thread: ChatThread): void {
    if (this.activeThread?.id === thread.id) return;
    
    this.activeThread = thread;
    this.loadMessages(thread.id);
    this.messageService.setActiveChat(thread);
  }

  loadMessages(threadId: string): void {
    this.isLoading = true;
    
    this.messageService.getMessages(threadId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error(`Error loading messages for thread ${threadId}:`, error);
        this.isLoading = false;
      }
    });
  }

  sendMessage(): void {
    if ((!this.newMessage || this.newMessage.trim() === '') && !this.attachmentFile) return;
    if (!this.activeThread) return;
    
    const content = this.newMessage.trim();
    this.isLoading = true;
    
    this.messageService.sendMessage(this.activeThread.participantId, content, this.attachmentFile).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.newMessage = '';
        this.clearAttachment();
        this.isLoading = false;
        this.scrollToBottom();
        
        // Refresh chat threads to update last message
        this.loadChatThreads();
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isLoading = false;
      }
    });
  }

  handleAttachment(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please select a smaller file.');
        this.clearAttachment();
        return;
      }
      
      this.attachmentFile = file;
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.attachmentPreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, show file name as preview
        this.attachmentPreview = null;
      }
    }
  }

  clearAttachment(): void {
    this.attachmentFile = undefined;
    this.attachmentPreview = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  initiateVideoCall(): void {
    if (!this.activeThread) return;
    
    this.messageService.initiateVideoCall(this.activeThread.participantId).subscribe({
      next: (call) => {
        console.log('Video call initiated:', call);
        // UI updates handled via the activeCall$ subscription
      },
      error: (error) => {
        console.error('Error initiating video call:', error);
      }
    });
  }

  acceptVideoCall(): void {
    if (!this.activeCall) return;
    
    this.messageService.acceptVideoCall(this.activeCall.callId).subscribe({
      next: (call) => {
        console.log('Video call accepted:', call);
        // UI updates handled via the activeCall$ subscription
      },
      error: (error) => {
        console.error('Error accepting video call:', error);
      }
    });
  }

  endVideoCall(): void {
    if (!this.activeCall) return;
    
    this.messageService.endVideoCall(this.activeCall.callId).subscribe({
      next: (call) => {
        console.log('Video call ended:', call);
        // UI updates handled via the activeCall$ subscription
      },
      error: (error) => {
        console.error('Error ending video call:', error);
      }
    });
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    // Here you would implement the actual muting functionality
    // with a video call library like WebRTC
  }

  toggleCamera(): void {
    this.isCameraOff = !this.isCameraOff;
    // Here you would implement the actual camera toggle functionality
    // with a video call library like WebRTC
  }

  toggleMinimizeCall(): void {
    this.isCallMinimized = !this.isCallMinimized;
  }

  // Format time for messages (today, yesterday, or date)
  formatMessageTime(timestamp: string): string {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if the message is from today
    if (messageDate.toDateString() === today.toDateString()) {
      return this.datePipe.transform(messageDate, 'h:mm a') || '';
    }
    
    // Check if the message is from yesterday
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday ' + (this.datePipe.transform(messageDate, 'h:mm a') || '');
    }
    
    // Otherwise return the date
    return this.datePipe.transform(messageDate, 'MMM d, y, h:mm a') || '';
  }

  // Get filtered chat threads based on search term
  get filteredChatThreads(): ChatThread[] {
    if (!this.searchTerm.trim()) return this.chatThreads;
    
    const term = this.searchTerm.toLowerCase().trim();
    return this.chatThreads.filter(thread => 
      thread.participantName.toLowerCase().includes(term) ||
      (thread.lastMessage?.content.toLowerCase().includes(term))
    );
  }

  // Check if a message is from the current user
  isOwnMessage(message: Message): boolean {
    return message.senderName === 'You' || message.senderId === 'current-user';
  }

  // Auto-scroll to the bottom of the chat
  private scrollToBottom(): void {
    if (this.chatContainer) {
      setTimeout(() => {
        const { nativeElement } = this.chatContainer;
        nativeElement.scrollTop = nativeElement.scrollHeight;
      }, 100);
    }
  }
} 