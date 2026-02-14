# API Routes & Endpoints Implementation Guide

## Overview
Complete REST API specification for the content-driven MBA portal. All routes designed for zero-friction discovery.

---

## 1. PUBLIC ROUTES (NO AUTHENTICATION REQUIRED)

### 1.1 College Directory & Search

#### GET /api/colleges
Browse all colleges with advanced filtering and sorting

**Query Parameters:**
```
- tier: 'Tier-1: IIM Blacki' | 'Tier-1: IIT MBA' | 'Tier-2: Strategic' | etc.
- location: 'Bangalore' | 'Delhi' | etc.
- min_package: 20 (min avg package in lakhs)
- max_package: 35
- search: 'IIM Bangalore' (free text search on name/alias)
- sort: 'package_desc' | 'package_asc' | 'trending' | 'name_asc'
- limit: 20 (default)
- offset: 0 (pagination)
```

**Request:**
```bash
GET /api/colleges?tier=Tier-1:%20IIM%20Blacki&min_package=25&sort=package_desc&limit=10
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId_1",
      "name": "IIM Bangalore",
      "tier": "Tier-1: IIM Blacki",
      "location": {
        "city": "Bangalore",
        "state": "Karnataka"
      },
      "avg_package": {
        "total": 29.8,
        "base": 23.0,
        "currency": "INR (Lakhs)"
      },
      "social_metrics": {
        "recent_news_count": 127,
        "reddit_mentions_count": 58,
        "controversy_count": 3
      },
      "recruitment_stats": {
        "placement_rate": 100,
        "major_recruiters": ["McKinsey", "BCG", "Amazon"]
      }
    },
    // more colleges...
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

**Error Cases:**
```json
// 400 Bad Request
{
  "success": false,
  "error": "Invalid tier value"
}
```

---

#### GET /api/colleges/search
Fast search for colleges (optimized with indexes)

**Query Parameters:**
```
- q: 'IIM' (search term)
- limit: 20
```

**Request:**
```bash
GET /api/colleges/search?q=IIM%20B
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "name": "IIM Bangalore",
      "alias": ["IIM B", "IIMB"],
      "tier": "Tier-1: IIM Blacki",
      "location": { "city": "Bangalore" }
    },
    {
      "_id": "ObjectId",
      "name": "IIM Bombay",
      "alias": ["IIMB Mumbai"],
      "tier": "Tier-1: IIM Blacki"
    }
  ]
}
```

---

#### GET /api/colleges/:collegeId
Get detailed college information

**Request:**
```bash
GET /api/colleges/507f1f77bcf86cd799439011
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "IIM Bangalore",
    "alias": ["IIM B", "IIMB"],
    "tier": "Tier-1: IIM Blacki",
    "establishment_type": "Government",
    "location": {
      "city": "Bangalore",
      "state": "Karnataka",
      "country": "India",
      "campus_address": "Bannerghatta Road, Bangalore 560076"
    },
    "avg_package": {
      "total": 29.8,
      "median": 28.0,
      "base": 23.0,
      "international": 48.0,
      "currency": "INR (Lakhs)"
    },
    "recruitment_stats": {
      "placement_rate": 100,
      "avg_base_salary": 23.0,
      "top_recruiter_packages": 2.65,
      "major_recruiters": ["McKinsey", "BCG", "Bain", "Google", "Amazon", "Microsoft"],
      "last_updated": "2025-12-15T00:00:00.000Z"
    },
    "academics": {
      "entrance_exam": "CAT",
      "avg_entrance_score": 99.5,
      "program_duration_months": 24,
      "batch_size": 450,
      "cutoff_percentile": 98.5
    },
    "social_metrics": {
      "reddit_mentions_count": 285,
      "controversy_count": 8,
      "recent_news_count": 127,
      "trending_score": 95.4
    },
    "contact_info": {
      "phone": "+91-80-6691-9000",
      "email": "pgp@iimb.ac.in",
      "website": "www.iimb.ac.in"
    },
    "recent_articles": [
      {
        "_id": "ArticleId1",
        "title": "IIM B Placement Season 2025: New Benchmarks",
        "content_type": "placement_stats",
        "published_at": "2026-02-10T00:00:00.000Z"
      },
      // More articles...
    ],
    "related_colleges": [
      {
        "_id": "IIM_A_Id",
        "name": "IIM Ahmedabad",
        "avg_package": 28.5
      }
      // Similar tier colleges
    ]
  }
}
```

**Error Cases:**
```json
// 404 Not Found
{
  "success": false,
  "error": "College not found"
}
```

---

### 1.2 News & Content Feed

#### GET /api/news
Main news feed (all or filtered by college/type)

**Query Parameters:**
```
- college_ids: '507f1f77bcf86cd799439011,507f1f77bcf86cd799439012' (comma-separated)
- content_type: 'all' | 'placement_stats' | 'controversy' | 'ragging' | 'general_news' | 'admissions'
- search: 'ragging' (full-text search)
- sort: 'recent' | 'trending' | 'most_engagement'
- timeframe: 'week' | 'month' | 'all_time' (for trending)
- limit: 20
- offset: 0
```

**Request:**
```bash
GET /api/news?content_type=placement_stats&sort=trending&limit=20
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ArticleId1",
      "title": "IIM Bangalore Spring Placements 2026: 100% Placement Achieved",
      "summary": "Strong recruitment drive by top consulting firms. Average package up 15% YoY...",
      "content_type": "placement_stats",
      "colleges": ["IIM Bangalore"],
      "source": {
        "name": "Economic Times",
        "platform": "news_site",
        "url": "https://economictimes.indiatimes.com/..."
      },
      "sentiment": "positive",
      "published_at": "2026-02-08T10:30:00.000Z",
      "engagement_metrics": {
        "reddit_score": 245,
        "reddit_comments": 32,
        "shares": 12
      },
      "is_verified": true,
      "is_featured": true
    },
    {
      "_id": "ArticleId2",
      "title": "IIM A Student Ragging Incident: What Administrators Did Wrong",
      "summary": "New ragging case raises questions about grievance redressal at IIMs...",
      "content_type": "controversy",
      "colleges": ["IIM Ahmedabad"],
      "source": {
        "name": "Reddit r/IIM",
        "platform": "reddit",
        "url": "https://reddit.com/r/IIM/..."
      },
      "sentiment": "negative",
      "published_at": "2026-02-07T15:45:00.000Z",
      "engagement_metrics": {
        "reddit_score": 1200,
        "reddit_comments": 187
      }
    }
    // More articles...
  ],
  "pagination": {
    "total": 2847,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**Error Cases:**
```json
// 400 Bad Request - Invalid content type
{
  "success": false,
  "error": "Invalid content_type. Allowed values: all, placement_stats, controversy, ragging, general_news, admissions"
}
```

---

#### GET /api/colleges/:collegeId/news
College-specific news feed

**Query Parameters:**
```
- content_type: 'all' | 'placement_stats' | 'controversy' | etc.
- sort: 'recent' | 'trending'
- limit: 20
- offset: 0
```

**Request:**
```bash
GET /api/colleges/507f1f77bcf86cd799439011/news?content_type=controversy&limit=10
```

**Response: 200 OK**
```json
{
  "success": true,
  "college": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "IIM Bangalore",
    "tier": "Tier-1: IIM Blacki"
  },
  "data": [
    {
      "_id": "ArticleId",
      "title": "Controversy: IIM B Placement Records Questioned",
      "content_type": "controversy",
      // Full article object...
    }
    // More articles specific to IIM Bangalore...
  ],
  "stats": {
    "total_articles": 127,
    "articles_this_month": 15,
    "breakdown_by_type": {
      "placement_stats": 42,
      "general_news": 35,
      "controversy": 25,
      "ragging": 15,
      "admissions": 10
    }
  }
}
```

---

#### GET /api/trending-colleges
Get colleges trending in news (by mentions, engagement)

**Query Parameters:**
```
- timeframe: 'week' | 'month' | 'all_time' (default: week)
- limit: 10
```

**Request:**
```bash
GET /api/trending-colleges?timeframe=week&limit=5
```

**Response: 200 OK**
```json
{
  "success": true,
  "timeframe": "week",
  "data": [
    {
      "_id": "CollegeId1",
      "name": "IIM Sambalpur",
      "tier": "Tier-1: IIM Baby",
      "trending_rank": 1,
      "reason": "Major ragging controversy, 234 Reddit mentions",
      "recent_articles_count": 42,
      "trending_score": 98.5,
      "top_articles": [
        {
          "title": "IIM Sambalpur Ragging: Students Appeal to State Commerce Ministry",
          "engagement_metrics": { "reddit_score": 1850 }
        }
      ]
    },
    {
      "_id": "CollegeId2",
      "name": "ISB Hyderabad",
      "trending_rank": 2,
      "reason": "New placement season started, 156 mentions",
      "recent_articles_count": 31,
      "trending_score": 87.3
    }
    // More colleges...
  ]
}
```

---

#### GET /api/trending-news
Get trending news articles overall

**Query Parameters:**
```
- timeframe: 'week' | 'month' (default: week)
- limit: 20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ArticleId",
      "title": "Article Title",
      "engagement_metrics": {
        "reddit_score": 2400,
        "reddit_comments": 340
      },
      // Full article...
    }
    // More articles sorted by engagement...
  ]
}
```

---

### 1.3 Featured Content

#### GET /api/featured
Homepage featured stories (manual curation)

**Response: 200 OK**
```json
{
  "success": true,
  "featured_articles": [
    {
      "_id": "ArticleId",
      "title": "Featured: The Rise of Baby IIMs",
      "is_featured": true,
      "featured_position": 1,
      // Full article...
    }
    // Up to 5 featured stories
  ],
  "featured_colleges": [
    {
      "_id": "CollegeId",
      "name": "IIM Indore",
      "feature_reason": "New Tier-1 upgrade, trending this week"
    }
  ]
}
```

---

## 2. AUTHENTICATION ROUTES

### 2.1 Request OTP

#### POST /auth/request-otp
User initiates login (optional for browsing)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "OTP sent to your email. Valid for 10 minutes.",
  "userId": "UserId123" // For frontend tracking
}
```

**Error Cases:**
```json
// 400 Bad Request - Invalid email
{
  "success": false,
  "error": "Please provide a valid email address"
}

// 429 Too Many Requests - Rate limited
{
  "success": false,
  "error": "Too many OTP requests. Please try again after 15 minutes."
}
```

---

### 2.2 Verify OTP

#### POST /auth/verify-otp
User verifies OTP and gets authenticated

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "OTP verified. You are now logged in.",
  "user": {
    "_id": "UserId123",
    "email": "user@example.com",
    "is_verified": true,
    "profile_complete": false
  }
}
```

**Error Cases:**
```json
// 400 Bad Request - Invalid OTP
{
  "success": false,
  "error": "Invalid or expired OTP. Please request a new one."
}
```

---

### 2.3 Complete Profile (OPTIONAL)

#### POST /auth/complete-profile
User optionally completes profile (marks are not required)

**Request Body:**
```json
{
  "email": "user@example.com",
  "acad_10th": null,           // Can be null/empty
  "acad_12th": 85,
  "acad_grad": null,
  "acad_stream": "Science",
  "interested_colleges": ["CollegeId1", "CollegeId2"],
  "interested_tiers": ["Tier-1: IIM Blacki", "Tier-1: IIT MBA"]
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Profile saved successfully.",
  "profile": {
    "completed": true,
    "acad_10th": null,
    "acad_12th": 85,
    "acad_grad": null,
    "interested_colleges": 2,
    "interested_tiers": 2
  }
}
```

**Important Notes:**
- All marks are OPTIONAL (can be null/empty)
- User can skip this step entirely
- No fields are mandatory
- Incomplete profiles are valid

**Error Cases:**
```json
// 400 Bad Request - Invalid marks range
{
  "success": false,
  "error": "Academic marks must be between 0-100"
}
```

---

### 2.4 Resend OTP

#### POST /auth/resend-otp
Resend OTP if user didn't receive it

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "New OTP sent to your email"
}
```

---

### 2.5 Logout

#### GET /auth/logout
End user session

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 3. PROTECTED ROUTES (AUTHENTICATION REQUIRED)

### 3.1 User Profile

#### GET /auth/me
Get current user info (protected)

**Headers:**
```
Authorization: Bearer {session_token}
```

**Response: 200 OK**
```json
{
  "success": true,
  "user": {
    "_id": "UserId123",
    "email": "user@example.com",
    "is_verified": true,
    "profile": {
      "acad_10th": null,
      "acad_12th": 85,
      "acad_grad": null,
      "completed": false
    },
    "preferences": {
      "bookmarked_articles": ["ArticleId1", "ArticleId2"],
      "favorite_colleges": ["CollegeId1"],
      "interested_tiers": ["Tier-1: IIM Blacki"]
    },
    "created_at": "2026-01-15T10:30:00.000Z",
    "last_login": "2026-02-10T14:20:00.000Z"
  }
}
```

**Error Cases:**
```json
// 401 Unauthorized - Not logged in
{
  "success": false,
  "error": "Authentication required"
}
```

---

### 3.2 Bookmarks

#### POST /auth/bookmarks/:articleId
Add article to bookmarks

**Request:**
```bash
POST /auth/bookmarks/ArticleId123
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Article bookmarked"
}
```

---

#### DELETE /auth/bookmarks/:articleId
Remove article from bookmarks

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Bookmark removed"
}
```

---

#### GET /auth/bookmarks
Get all bookmarked articles

**Query Parameters:**
```
- limit: 20
- offset: 0
- sort: 'recent' | 'oldest'
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ArticleId1",
      "title": "Article Title",
      "content_type": "placement_stats",
      "colleges": ["IIM Bangalore"],
      "published_at": "2026-02-10T00:00:00.000Z",
      "bookmarked_at": "2026-02-10T15:30:00.000Z"
    }
    // More bookmarks...
  ],
  "pagination": {
    "total": 15,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 3.3 Favorite Colleges

#### POST /auth/favorite-colleges/:collegeId
Add college to favorites

**Response: 200 OK**
```json
{
  "success": true,
  "message": "College added to favorites"
}
```

---

#### DELETE /auth/favorite-colleges/:collegeId
Remove college from favorites

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Removed from favorites"
}
```

---

#### GET /auth/favorite-colleges
Get favorite colleges

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "_id": "CollegeId",
      "name": "IIM Bangalore",
      "tier": "Tier-1: IIM Blacki",
      "avg_package": 29.8,
      "added_at": "2026-01-20T10:00:00.000Z"
    }
    // More colleges...
  ]
}
```

---

### 3.4 Personalized Recommendations

#### GET /auth/recommendations
Get college recommendations based on profile

**Query Parameters:**
```
- limit: 10
- include_news: true (include recent news for each college)
```

**Response: 200 OK**
```json
{
  "success": true,
  "recommendation_basis": "Based on your 10th/12th scores and interested tiers",
  "data": [
    {
      "_id": "CollegeId1",
      "name": "IIM Bangalore",
      "match_score": 95,
      "reason": "Matches your profile percentile range (98.5+)",
      "avg_package": 29.8,
      "recent_news": [
        {
          "title": "Top article related to this college",
          "published_at": "2026-02-08"
        }
      ]
    }
    // More recommendations...
  ]
}
```

---

## 4. ADMIN/MANAGEMENT ROUTES

### 4.1 Scraper Status (Admin)

#### GET /admin/scraper-status
Check scraper health

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response: 200 OK**
```json
{
  "success": true,
  "reddit_scraper": {
    "status": "healthy",
    "last_run": "2026-02-10T18:00:00.000Z",
    "articles_ingested": 47,
    "execution_time_ms": 8234
  },
  "news_scraper": {
    "status": "healthy",
    "last_run": "2026-02-10T12:00:00.000Z",
    "articles_ingested": 23,
    "execution_time_ms": 5412
  },
  "overall_health": "healthy"
}
```

---

#### POST /admin/run-scraper
Manually trigger scraper (for testing)

**Request Body:**
```json
{
  "scraper": "reddit" // or "news" or "all"
}
```

**Response: 202 Accepted**
```json
{
  "success": true,
  "message": "Scraper triggered",
  "job_id": "Job123"
}
```

---

### 4.2 Content Management

#### POST /admin/articles/:articleId/feature
Mark article as featured

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Article featured"
}
```

---

#### POST /admin/articles/:articleId/verify
Verify article authenticity

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Article verified"
}
```

---

## 5. ERROR HANDLING & STATUS CODES

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional details
}
```

### Status Codes
- **200 OK** - Successful request
- **201 Created** - Resource created
- **202 Accepted** - Async operation accepted
- **400 Bad Request** - Invalid parameters
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **429 Too Many Requests** - Rate limited
- **500 Internal Server Error** - Server error

---

## 6. RATE LIMITING

### Applied To
- POST /auth/request-otp: 3 requests per 15 minutes per email
- POST /auth/verify-otp: 5 attempts per 15 minutes per email
- POST /auth/bookmarks/*: 100 requests per hour per user

### Response
```json
{
  "success": false,
  "error": "Rate limit exceeded. Try again after 900 seconds",
  "retryAfter": 900
}
```

---

## 7. IMPLEMENTATION CHECKLIST

### Phase 1: Public Routes
- [ ] GET /api/colleges (with filters)
- [ ] GET /api/colleges/:id
- [ ] GET /api/colleges/search
- [ ] GET /api/news
- [ ] GET /api/colleges/:id/news
- [ ] GET /api/trending-colleges
- [ ] GET /api/featured

### Phase 2: Auth Routes
- [ ] POST /auth/request-otp
- [ ] POST /auth/verify-otp
- [ ] POST /auth/complete-profile
- [ ] GET /auth/logout
- [ ] GET /auth/me

### Phase 3: Protected Routes
- [ ] POST/DELETE /auth/bookmarks/:id
- [ ] GET /auth/bookmarks
- [ ] POST/DELETE /auth/favorite-colleges/:id
- [ ] GET /auth/favorite-colleges
- [ ] GET /auth/recommendations

### Phase 4: Admin Routes
- [ ] GET /admin/scraper-status
- [ ] POST /admin/run-scraper (trigger manually)
- [ ] POST /admin/articles/:id/verify

### Phase 5: Testing & Validation
- [ ] Test all endpoints
- [ ] Verify rate limiting
- [ ] Load test with 500+ articles
- [ ] Test authentication flows
- [ ] Test pagination

---

**Owner:** API Architecture Team  
**Last Updated:** February 2026  
**Status:** Ready for Implementation

