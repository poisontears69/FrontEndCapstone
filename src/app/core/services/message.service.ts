import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService, User } from './auth.service';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'document' | 'video';
}

export interface ChatThread {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantRole: 'doctor' | 'patient';
  lastMessage?: Message;
  unreadCount: number;
  lastActivity: string;
  isOnline: boolean;
}

export interface VideoCallInfo {
  callId: string;
  initiator: string; 
  receiver: string;
  appointmentId?: string;
  roomId: string;
  status: 'ringing' | 'in-progress' | 'ended' | 'missed';
  startTime: string;
  endTime?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://localhost:8080/api';
  private _activeChat = new BehaviorSubject<ChatThread | null>(null);
  private _activeCall = new BehaviorSubject<VideoCallInfo | null>(null);
  
  activeChat$ = this._activeChat.asObservable();
  activeCall$ = this._activeCall.asObservable();
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get all chat threads for current user
  getChatThreads(): Observable<ChatThread[]> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return of([]);
    
    const url = `${this.apiUrl}/${currentUser.role}s/messages/threads`;
    
    return this.http.get<ChatThread[]>(url).pipe(
      catchError(error => {
        console.error('Error fetching chat threads:', error);
        return of(this.generateMockChatThreads(currentUser.role));
      })
    );
  }

  // Get messages for a specific chat thread
  getMessages(threadId: string): Observable<Message[]> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return of([]);
    
    const url = `${this.apiUrl}/${currentUser.role}s/messages/threads/${threadId}`;
    
    return this.http.get<Message[]>(url).pipe(
      catchError(error => {
        console.error(`Error fetching messages for thread ${threadId}:`, error);
        return of(this.generateMockMessages());
      })
    );
  }

  // Send a new message
  sendMessage(receiverId: string, content: string, attachmentFile?: File): Observable<Message> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) throw new Error('User not authenticated');
    
    const url = `${this.apiUrl}/${currentUser.role}s/messages`;
    
    const formData = new FormData();
    formData.append('receiverId', receiverId);
    formData.append('content', content);
    
    if (attachmentFile) {
      formData.append('attachment', attachmentFile);
    }
    
    return this.http.post<Message>(url, formData).pipe(
      catchError(error => {
        console.error('Error sending message:', error);
        // Return mock message for now
        const mockMessage: Message = {
          id: `msg-${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.role === 'doctor' ? 'Dr. Jane Smith' : 'Patient Name',
          receiverId,
          receiverName: 'Recipient Name',
          content,
          timestamp: new Date().toISOString(),
          isRead: false
        };
        return of(mockMessage);
      })
    );
  }

  // Mark messages as read
  markAsRead(threadId: string): Observable<boolean> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return of(false);
    
    const url = `${this.apiUrl}/${currentUser.role}s/messages/threads/${threadId}/read`;
    
    return this.http.put<{success: boolean}>(url, {}).pipe(
      map(res => res.success),
      catchError(error => {
        console.error(`Error marking messages as read for thread ${threadId}:`, error);
        return of(true);
      })
    );
  }

  // Initiate a video call
  initiateVideoCall(receiverId: string, appointmentId?: string): Observable<VideoCallInfo> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) throw new Error('User not authenticated');
    
    const url = `${this.apiUrl}/${currentUser.role}s/calls/initiate`;
    
    const payload = {
      receiverId,
      appointmentId
    };
    
    return this.http.post<VideoCallInfo>(url, payload).pipe(
      map(callInfo => {
        this._activeCall.next(callInfo);
        return callInfo;
      }),
      catchError(error => {
        console.error('Error initiating video call:', error);
        // Create mock call info
        const callInfo: VideoCallInfo = {
          callId: `call-${Date.now()}`,
          initiator: currentUser.id,
          receiver: receiverId,
          appointmentId,
          roomId: `room-${Date.now()}`,
          status: 'ringing',
          startTime: new Date().toISOString()
        };
        this._activeCall.next(callInfo);
        return of(callInfo);
      })
    );
  }

  // Accept a video call
  acceptVideoCall(callId: string): Observable<VideoCallInfo> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) throw new Error('User not authenticated');
    
    const url = `${this.apiUrl}/${currentUser.role}s/calls/${callId}/accept`;
    
    return this.http.put<VideoCallInfo>(url, {}).pipe(
      map(callInfo => {
        callInfo.status = 'in-progress';
        this._activeCall.next(callInfo);
        return callInfo;
      }),
      catchError(error => {
        console.error(`Error accepting video call ${callId}:`, error);
        const currentCall = this._activeCall.value;
        if (currentCall) {
          currentCall.status = 'in-progress';
          this._activeCall.next(currentCall);
          return of(currentCall);
        }
        const mockCallInfo: VideoCallInfo = {
          callId,
          initiator: '',
          receiver: currentUser.id,
          roomId: `room-${Date.now()}`,
          status: 'in-progress',
          startTime: new Date().toISOString()
        };
        return of(mockCallInfo);
      })
    );
  }

  // End a video call
  endVideoCall(callId: string): Observable<VideoCallInfo> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) throw new Error('User not authenticated');
    
    const url = `${this.apiUrl}/${currentUser.role}s/calls/${callId}/end`;
    
    return this.http.put<VideoCallInfo>(url, {}).pipe(
      map(callInfo => {
        callInfo.status = 'ended';
        callInfo.endTime = new Date().toISOString();
        this._activeCall.next(null);
        return callInfo;
      }),
      catchError(error => {
        console.error(`Error ending video call ${callId}:`, error);
        const currentCall = this._activeCall.value;
        if (currentCall) {
          currentCall.status = 'ended';
          currentCall.endTime = new Date().toISOString();
          this._activeCall.next(null);
          return of(currentCall);
        }
        const mockCallInfo: VideoCallInfo = {
          callId,
          initiator: '',
          receiver: '',
          roomId: '',
          status: 'ended',
          startTime: '',
          endTime: new Date().toISOString()
        };
        return of(mockCallInfo);
      })
    );
  }

  // Set active chat thread
  setActiveChat(chat: ChatThread | null): void {
    this._activeChat.next(chat);
    
    // If there's a chat and it has unread messages, mark them as read
    if (chat && chat.unreadCount > 0) {
      this.markAsRead(chat.id).subscribe();
    }
  }

  // Generate mock chat threads for development
  private generateMockChatThreads(userRole: string): ChatThread[] {
    const basePatientAvatars = 'assets/images/patients/patient';
    const baseDoctorAvatars = 'assets/images/doctors/doctor';
    
    const getRandomParticipants = (count: number, role: 'doctor' | 'patient'): any[] => {
      const participants = [];
      for (let i = 1; i <= count; i++) {
        const name = role === 'doctor' 
          ? `Dr. ${['James Wilson', 'Sarah Parker', 'Michael Chen', 'Emily Rodriguez', 'David Kim'][i % 5]}` 
          : `${['John Smith', 'Mary Johnson', 'Robert Davis', 'Linda Miller', 'James Brown'][i % 5]}`;
        
        participants.push({
          id: `${role}-${i}`,
          name,
          avatar: `${role === 'doctor' ? baseDoctorAvatars : basePatientAvatars}${i % 10 + 1}.jpg`,
          role
        });
      }
      return participants;
    };
    
    const participants = userRole === 'doctor' 
      ? getRandomParticipants(10, 'patient')
      : getRandomParticipants(5, 'doctor');
    
    return participants.map((p, index) => {
      const lastMessageTime = new Date();
      lastMessageTime.setMinutes(lastMessageTime.getMinutes() - index * 30);
      
      const messages = [
        'Hello, how can I help you today?',
        'I have a question about my prescription.',
        'When would be a good time for a follow-up?',
        'Thank you for your time, doctor.',
        'I\'m still experiencing the same symptoms.',
        'Your test results look good, nothing to worry about.',
        'Please make sure to take your medication as prescribed.',
        'Can we schedule a follow-up appointment next week?'
      ];
      
      return {
        id: `thread-${p.id}`,
        participantId: p.id,
        participantName: p.name,
        participantAvatar: p.avatar,
        participantRole: p.role,
        lastMessage: {
          id: `msg-${Date.now()}-${index}`,
          senderId: index % 2 === 0 ? p.id : 'current-user',
          senderName: index % 2 === 0 ? p.name : 'You',
          senderAvatar: index % 2 === 0 ? p.avatar : undefined,
          receiverId: index % 2 === 0 ? 'current-user' : p.id,
          receiverName: index % 2 === 0 ? 'You' : p.name,
          receiverAvatar: index % 2 === 0 ? undefined : p.avatar,
          content: messages[index % messages.length],
          timestamp: lastMessageTime.toISOString(),
          isRead: index % 3 !== 0
        },
        unreadCount: index % 3 === 0 ? Math.floor(Math.random() * 5) + 1 : 0,
        lastActivity: lastMessageTime.toISOString(),
        isOnline: index % 3 === 0
      };
    });
  }

  // Generate mock messages for development
  private generateMockMessages(): Message[] {
    const messages: Message[] = [];
    const now = new Date();
    
    // Sample conversation content to make it look realistic
    const conversation = [
      { sender: 'patient', content: 'Hello doctor, I\'ve been having severe headaches for the past few days.' },
      { sender: 'doctor', content: 'I\'m sorry to hear that. Can you describe the pain? Is it constant or intermittent?' },
      { sender: 'patient', content: 'It\'s mostly in the afternoon and evening. Throbbing pain on the right side of my head.' },
      { sender: 'doctor', content: 'Have you been experiencing any other symptoms like nausea, sensitivity to light or sound?' },
      { sender: 'patient', content: 'Yes, I do feel a bit nauseous sometimes, and bright lights make it worse.' },
      { sender: 'doctor', content: 'That sounds like it could be migraine. Have you taken any medication for it?' },
      { sender: 'patient', content: 'Just some over-the-counter painkillers, but they don\'t seem to help much.' },
      { sender: 'doctor', content: 'I would recommend scheduling an appointment so I can examine you properly. In the meantime, try to rest in a dark, quiet room when you feel an attack coming.' },
      { sender: 'patient', content: 'Thank you doctor, I\'ll book an appointment soon.' },
      { sender: 'doctor', content: 'Please do. Also, try to keep a diary of when the headaches occur and what you were doing beforehand. That might help identify triggers.' },
      { sender: 'patient', content: 'That\'s a good idea. I\'ll do that.' },
      { sender: 'doctor', content: 'Great. I have some available slots next Tuesday. Would that work for you?' },
      { sender: 'patient', content: 'Tuesday morning would be perfect if available.' },
      { sender: 'doctor', content: 'I\'ve scheduled you for Tuesday at 10:00 AM. Please arrive 15 minutes early to complete any necessary paperwork.' },
      { sender: 'patient', content: 'Thank you, doctor. I really appreciate your help and quick response.' },
      { sender: 'doctor', content: 'You\'re welcome. If your symptoms worsen before the appointment, please let me know right away or go to the emergency room if it becomes severe.' }
    ];
    
    // Create messages with timestamps going back from now
    for (let i = 0; i < conversation.length; i++) {
      const messageTime = new Date(now);
      messageTime.setMinutes(now.getMinutes() - (conversation.length - i) * 5);
      
      const entry = conversation[i];
      messages.push({
        id: `msg-${Date.now()}-${i}`,
        senderId: entry.sender === 'doctor' ? 'doctor-1' : 'patient-1',
        senderName: entry.sender === 'doctor' ? 'Dr. James Wilson' : 'John Smith',
        senderAvatar: entry.sender === 'doctor' ? 'assets/images/doctors/doctor1.jpg' : 'assets/images/patients/patient1.jpg',
        receiverId: entry.sender === 'doctor' ? 'patient-1' : 'doctor-1',
        receiverName: entry.sender === 'doctor' ? 'John Smith' : 'Dr. James Wilson',
        receiverAvatar: entry.sender === 'doctor' ? 'assets/images/patients/patient1.jpg' : 'assets/images/doctors/doctor1.jpg',
        content: entry.content,
        timestamp: messageTime.toISOString(),
        isRead: true
      });
    }
    
    return messages;
  }
} 