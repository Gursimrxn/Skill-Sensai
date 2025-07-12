# User Connection and Availability System API Documentation

This document describes the comprehensive connection and availability management system that allows users to connect with each other and book time slots.

## 📋 **System Overview**

### Key Features
1. **User Connections**: Send, accept, decline connection requests
2. **Availability Management**: Set recurring availability and specific time slots
3. **Session Scheduling**: Book time slots between connected users
4. **Automatic Slot Blocking**: Booked slots become unavailable
5. **Common Availability**: Find overlapping free time between users

## 🔄 **Connection System**

### Connection Model
```typescript
interface IConnection {
  requester: ObjectId;           // User who sent the request
  recipient: ObjectId;           // User who received the request
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  connectionType: 'skill-swap' | 'mentorship' | 'collaboration';
  message?: string;              // Optional message with request
  skillsOffered: string[];       // Skills the requester can teach
  skillsRequested: string[];     // Skills the requester wants to learn
  scheduledSlots?: ScheduledSlot[];
}
```

### API Endpoints

#### 1. **Get User Connections**
**Endpoint:** `GET /api/connections`

**Query Parameters:**
- `status`: Filter by connection status
- `type`: `'received'`, `'sent'`, or `'all'`

**Example:**
```
GET /api/connections?status=pending&type=received
```

#### 2. **Create Connection Request**
**Endpoint:** `POST /api/connections`

**Request Body:**
```json
{
  "recipientId": "user_id",
  "connectionType": "skill-swap",
  "message": "I'd love to exchange JavaScript for Python knowledge!",
  "skillsOffered": ["JavaScript", "React"],
  "skillsRequested": ["Python", "Django"]
}
```

#### 3. **Manage Connection**
**Endpoint:** `PUT /api/connections/[id]`

**Request Body:**
```json
{
  "action": "accept" // or "decline", "cancel"
}
```

## 📅 **Availability System**

### Availability Model
```typescript
interface IUserAvailability {
  userId: ObjectId;
  availableSlots: {
    date: Date;
    timeSlot: string;      // e.g., "09:00-10:00"
    isBooked: boolean;
    bookedBy?: ObjectId;
    connectionId?: ObjectId;
    notes?: string;
  }[];
  timezone: string;
  recurringAvailability: {
    dayOfWeek: number;     // 0-6 (Sunday-Saturday)
    timeSlots: string[];
    isActive: boolean;
  }[];
}
```

### API Endpoints

#### 1. **Get User's Availability**
**Endpoint:** `GET /api/availability`

**Query Parameters:**
- `startDate`: Start date for filtering slots
- `endDate`: End date for filtering slots
- `type`: `'available'`, `'booked'`, or `'all'`

**Example:**
```
GET /api/availability?startDate=2024-01-01&endDate=2024-01-31&type=available
```

#### 2. **Set User Availability**
**Endpoint:** `POST /api/availability`

**Request Body Examples:**

**Set Recurring Availability:**
```json
{
  "action": "setRecurring",
  "timezone": "UTC-5",
  "recurringAvailability": [
    {
      "dayOfWeek": 1,
      "timeSlots": ["09:00-10:00", "14:00-15:00"],
      "isActive": true
    },
    {
      "dayOfWeek": 3,
      "timeSlots": ["10:00-11:00", "15:00-16:00"],
      "isActive": true
    }
  ]
}
```

**Add Specific Slots:**
```json
{
  "action": "addSlots",
  "availableSlots": [
    {
      "date": "2024-01-15T09:00:00Z",
      "timeSlot": "09:00-10:00",
      "notes": "Available for JavaScript tutoring"
    },
    {
      "date": "2024-01-16T14:00:00Z",
      "timeSlot": "14:00-15:00"
    }
  ]
}
```

**Generate Slots from Recurring Pattern:**
```json
{
  "action": "generateFromRecurring",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Bulk Generate Slots:**
```json
{
  "action": "bulkGenerate",
  "bulkConfig": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "daysOfWeek": [1, 2, 3, 4, 5],
    "timeSlots": ["09:00-10:00", "14:00-15:00"],
    "excludeDates": ["2024-01-15", "2024-01-25"]
  }
}
```

#### 3. **Remove Availability Slot**
**Endpoint:** `DELETE /api/availability`

**Query Parameters:**
- `date`: Date of the slot to remove
- `timeSlot`: Time slot to remove

**Example:**
```
DELETE /api/availability?date=2024-01-15T09:00:00Z&timeSlot=09:00-10:00
```

#### 4. **Get Another User's Availability**
**Endpoint:** `GET /api/user/[userId]/availability`

**Query Parameters:**
- `startDate`: Start date for filtering
- `endDate`: End date for filtering

#### 5. **Find Common Availability**
**Endpoint:** `GET /api/availability/common/[userId]`

**Query Parameters:**
- `startDate`: Start date for comparison
- `endDate`: End date for comparison

## 🗓️ **Session Scheduling**

### API Endpoints

#### 1. **Schedule a Session**
**Endpoint:** `POST /api/connections/[id]/sessions`

**Request Body:**
```json
{
  "date": "2024-01-15T09:00:00Z",
  "timeSlot": "09:00-10:00",
  "duration": 60,
  "meetingLink": "https://meet.google.com/abc-xyz",
  "notes": "JavaScript fundamentals session"
}
```

#### 2. **Manage Session**
**Endpoint:** `PUT /api/connections/[id]/sessions`

**Request Body:**
```json
{
  "slotIndex": 0,
  "action": "cancel", // or "complete"
  "notes": "Session completed successfully!"
}
```

## 🔄 **System Workflow**

### 1. **Connection Flow**
```
User A → Send Request → User B
User B → Accept/Decline → Connection Established/Rejected
If Accepted → Both users can schedule sessions
```

### 2. **Availability Flow**
```
User → Set Recurring Availability
User → Generate Specific Slots
User → Add/Remove Individual Slots
System → Automatically block booked slots
```

### 3. **Booking Flow**
```
Connected Users → Find Common Availability
User A → Schedule Session → System blocks slots for both users
Session → Complete/Cancel → Update status
```

## 📊 **Usage Examples**

### Frontend Integration

```javascript
// 1. Send connection request
const sendConnectionRequest = async (recipientId, data) => {
  const response = await fetch('/api/connections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipientId,
      connectionType: 'skill-swap',
      skillsOffered: ['JavaScript', 'React'],
      skillsRequested: ['Python', 'Django'],
      message: 'Let\'s exchange skills!'
    })
  });
  return response.json();
};

// 2. Set recurring availability
const setWeeklyAvailability = async () => {
  const response = await fetch('/api/availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'setRecurring',
      timezone: 'UTC-5',
      recurringAvailability: [
        { dayOfWeek: 1, timeSlots: ['09:00-10:00', '14:00-15:00'], isActive: true },
        { dayOfWeek: 3, timeSlots: ['10:00-11:00'], isActive: true }
      ]
    })
  });
  return response.json();
};

// 3. Find common availability
const findCommonSlots = async (otherUserId, startDate, endDate) => {
  const response = await fetch(
    `/api/availability/common/${otherUserId}?startDate=${startDate}&endDate=${endDate}`
  );
  return response.json();
};

// 4. Schedule a session
const scheduleSession = async (connectionId, sessionData) => {
  const response = await fetch(`/api/connections/${connectionId}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData)
  });
  return response.json();
};

// 5. Get user's connections
const getUserConnections = async (status = 'all') => {
  const response = await fetch(`/api/connections?status=${status}`);
  return response.json();
};
```

## 🔒 **Security & Validation**

### Authentication
- All endpoints require valid NextAuth session
- Users can only modify their own availability
- Users can only interact with their own connections

### Validation
- Date ranges limited to 90 days for performance
- Time slots must be in the future for booking
- Cannot remove booked time slots
- Cannot connect to yourself
- Duplicate connections prevented

### Error Handling
- Comprehensive error messages for validation failures
- Rollback mechanisms for failed bookings
- Automatic cleanup of cancelled sessions

## 📈 **Performance Considerations**

### Database Indexes
- Compound indexes on userId and date ranges
- Unique constraints on connections
- Optimized queries for availability searches

### Rate Limiting
- Connection requests limited per user
- Bulk operations have size limits
- Date range queries are capped

## 🚀 **Next Steps**

1. **Notifications**: Email/push notifications for connection requests and session reminders
2. **Calendar Integration**: Sync with Google Calendar, Outlook
3. **Video Integration**: Built-in video calling
4. **Reviews**: Post-session rating and feedback system
5. **Analytics**: Connection success rates and usage statistics

This system provides a complete foundation for user-to-user connections with intelligent availability management and automatic booking coordination.
