# User Search and Recommendations API

This document describes the new API endpoints for searching users by skills and getting personalized recommendations.

## Updated User Schema

The User model now includes the following new fields:

```typescript
interface IUser {
  // ... existing fields
  skillsToLearn?: string[];  // Skills the user wants to learn
  availability?: {
    days: string[];          // Available days of the week
    timeSlots: string[];     // Available time slots
    timezone: string;        // User's timezone
  };
}
```

## API Endpoints

### 1. Search Users by Skills

**Endpoint:** `GET /api/user/search`

Search for users based on their skills, skills they want to learn, level, and availability.

**Query Parameters:**
- `skills`: Comma-separated list of skills to search for
- `skillsToLearn`: Comma-separated list of skills users want to learn
- `level`: Specific level to filter by
- `days`: Comma-separated list of available days
- `timeSlots`: Comma-separated list of time slots
- `limit`: Maximum number of results (default: 20, max: 50)

**Example:**
```
GET /api/user/search?skills=JavaScript,React&skillsToLearn=Python&level=3&limit=10
```

**Response:**
```json
{
  "users": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "image": "avatar_url",
      "skills": ["JavaScript", "React", "Node.js"],
      "skillsToLearn": ["Python", "Machine Learning"],
      "level": 3,
      "availability": {
        "days": ["Monday", "Wednesday", "Friday"],
        "timeSlots": ["9:00-12:00", "14:00-17:00"],
        "timezone": "UTC-5"
      },
      "memberSince": "2024-01-15T00:00:00.000Z"
    }
  ],
  "total": 1,
  "searchCriteria": {
    "skills": ["JavaScript", "React"],
    "skillsToLearn": ["Python"],
    "level": 3,
    "availability": {
      "days": [],
      "timeSlots": []
    }
  }
}
```

### 2. Advanced Search with Scoring

**Endpoint:** `POST /api/user/search`

Perform advanced search with match scoring and ranking.

**Request Body:**
```json
{
  "skills": ["JavaScript", "React"],
  "skillsToLearn": ["Python", "AI"],
  "level": 3,
  "availability": {
    "days": ["Monday", "Wednesday"],
    "timeSlots": ["9:00-12:00"]
  },
  "limit": 15
}
```

**Response:** Similar to GET endpoint but includes `matchScore` for each user.

### 3. Get Available Skills

**Endpoint:** `GET /api/user/skills`

Get a list of all available skills with usage statistics.

**Query Parameters:**
- `search`: Filter skills by search term
- `limit`: Maximum number of results (default: 50)

**Example:**
```
GET /api/user/skills?search=java&limit=20
```

**Response:**
```json
{
  "skills": [
    {
      "name": "JavaScript",
      "count": 45,
      "isPopular": true
    },
    {
      "name": "Java",
      "count": 32,
      "isPopular": true
    }
  ],
  "total": 2
}
```

### 4. Get Personalized Recommendations

**Endpoint:** `GET /api/user/recommendations`

Get personalized user recommendations based on skill compatibility.

**Query Parameters:**
- `limit`: Maximum number of recommendations (default: 10)

**Response:**
```json
{
  "recommendations": [
    {
      "id": "user_id",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "image": "avatar_url",
      "skills": ["Python", "Machine Learning"],
      "skillsToLearn": ["JavaScript", "React"],
      "level": 4,
      "availability": null,
      "memberSince": "2024-02-01T00:00:00.000Z",
      "compatibilityScore": 8,
      "matchReasons": {
        "canTeachYou": ["Python", "Machine Learning"],
        "canLearnFromYou": ["JavaScript", "React"],
        "levelDifference": 1
      }
    }
  ],
  "total": 1,
  "userProfile": {
    "skills": ["JavaScript", "React", "Node.js"],
    "skillsToLearn": ["Python", "Machine Learning"],
    "level": 3
  }
}
```

### 5. Advanced Personalized Recommendations

**Endpoint:** `POST /api/user/recommendations`

Get customized recommendations with specific matching criteria.

**Request Body:**
```json
{
  "includeSkillsMatch": true,
  "includeLevelMatch": true,
  "includeAvailabilityMatch": false,
  "maxLevelDifference": 2,
  "limit": 15
}
```

**Response:** Enhanced version of GET endpoint with additional matching details.

## Usage Examples

### Frontend Integration

```javascript
// Search for users with specific skills
const searchUsers = async (criteria) => {
  const params = new URLSearchParams();
  if (criteria.skills?.length) params.append('skills', criteria.skills.join(','));
  if (criteria.skillsToLearn?.length) params.append('skillsToLearn', criteria.skillsToLearn.join(','));
  if (criteria.level) params.append('level', criteria.level.toString());
  
  const response = await fetch(`/api/user/search?${params}`);
  return response.json();
};

// Get recommendations
const getRecommendations = async () => {
  const response = await fetch('/api/user/recommendations');
  return response.json();
};

// Get available skills for autocomplete
const getSkills = async (searchTerm = '') => {
  const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
  const response = await fetch(`/api/user/skills${params}`);
  return response.json();
};
```

## Authentication

All endpoints require authentication via NextAuth session. Users must be logged in to access these APIs.

## Rate Limiting

- Search results are capped at 50 users per request
- Skills endpoint is capped at 100 results per request
- Recommendations are capped at 20 results per request

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `401`: Unauthorized (not logged in)
- `500`: Internal server error

Error responses include a descriptive error message:
```json
{
  "error": "Error description"
}
```
