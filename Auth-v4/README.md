# 🔐 Auth-v4: JWT Access Token Authentication

> **Short-lived JWT tokens stored in memory for enhanced security**

A Node.js authentication system implementing **JWT Access Tokens** with short expiration times (5-15 minutes) and memory-only storage on the client side. This approach provides better security than long-lived tokens while maintaining stateless authentication.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Authentication Flow](#-authentication-flow)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [API Endpoints](#-api-endpoints)
- [Security Analysis](#-security-analysis)
- [Testing Guide](#-testing-guide)
- [Comparison with Other Methods](#-comparison-with-other-methods)

---

## 🎯 Overview

This project demonstrates **JWT Access Token authentication** where:
- Tokens have **short expiration** (10 minutes)
- Tokens are stored **in memory only** (not localStorage or cookies)
- Tokens are sent via **Authorization header** (`Bearer <token>`)
- Server is **stateless** (no session storage)

### Key Difference from Previous Auth Methods

| Method | Token Storage | Expiry | Sent Via |
|--------|--------------|--------|----------|
| Session-based | Server (session store) | Long | Cookie (automatic) |
| Bearer Token | Server DB | No expiry | Header |
| JWT (single) | httpOnly Cookie | Long (7 days) | Cookie (automatic) |
| **JWT Access Token** | **Memory (client)** | **Short (10 mins)** | **Header (manual)** |

---

## 🔄 Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Database
    participant JWT

    Note over Client,JWT: Registration Flow
    Client->>Server: POST /users/register<br/>{name, email, password}
    Server->>Database: Hash password & Store user
    Database-->>Server: User created
    Server-->>Client: 201 Created<br/>{message, user}

    Note over Client,JWT: Login Flow
    Client->>Server: POST /users/login<br/>{email, password}
    Server->>Database: Find user by email
    Database-->>Server: User data
    Server->>Server: Validate password
    Server->>JWT: Generate token<br/>(10 min expiry)
    JWT-->>Server: Access Token
    Server-->>Client: 201 OK<br/>{accessToken, user}
    Note over Client: Store token in<br/>MEMORY ONLY

    Note over Client,JWT: Protected Route Access
    Client->>Server: GET /api/profile<br/>Header: Authorization: Bearer <token>
    Server->>Server: Extract token from header
    Server->>JWT: Verify token signature & expiry
    alt Token Valid
        JWT-->>Server: Decoded payload
        Server->>Server: Attach user to req.user
        Server->>Database: Fetch user data
        Database-->>Server: User details
        Server-->>Client: 200 OK<br/>{user data}
    else Token Invalid/Expired
        JWT-->>Server: null
        Server-->>Client: 401 Unauthorized<br/>{error}
    end

    Note over Client,JWT: Token Expiry Scenario
    Client->>Server: GET /api/dashboard<br/>(after 10+ minutes)
    Server->>JWT: Verify token
    JWT-->>Server: Token expired (null)
    Server-->>Client: 401 Unauthorized
    Note over Client: Must re-login
```

---

## ✨ Features

- ✅ **User Registration** with password hashing
- ✅ **User Login** with JWT generation
- ✅ **Short-lived tokens** (10-minute expiry)
- ✅ **Stateless authentication** (no server-side sessions)
- ✅ **Protected routes** with middleware
- ✅ **Token verification** with automatic expiry checking
- ✅ **Authorization header** validation
- ✅ **Memory-only storage** (client-side)

---

## 🛠️ Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- JSON Web Tokens (jsonwebtoken)
- bcrypt (password hashing)

**Key Dependencies:**
```json
{
  "express": "^4.x",
  "mongoose": "^8.x",
  "jsonwebtoken": "^9.x",
  "bcryptjs": "^2.x",
  "dotenv": "^16.x",
  "cookie-parser": "^1.x"
}
```

---

## 📁 Project Structure

```
Auth-v4/
├── config/
│   └── db.js                 # MongoDB connection
├── controller/
│   ├── authController.js     # Register, Login, Logout
│   └── protectedController.js # Protected route handlers
├── middleware/
│   └── authMiddleware.js     # JWT verification middleware
├── models/
│   └── usersModel.js         # User schema with password hashing
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   └── protectedRoutes.js    # Protected endpoints
├── utils/
│   └── jwtHelper.js          # Token generation & verification
├── .env                      # Environment variables
├── app.js                    # Express app setup
└── package.json
```

---

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Auth-v4
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/auth-v4
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=10m
PORT=5000
```

### 4. Start MongoDB
```bash
# Make sure MongoDB is running
mongod
```

### 5. Run the server
```bash
npm run dev
# or
node app.js
```

Server will run on `http://localhost:5000`

---

## 📡 API Endpoints

### **Authentication Routes** (`/users`)

#### 1. Register User
```http
POST /users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

#### 2. Login
```http
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User Logged in Successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

> ⚠️ **Important:** Store the `accessToken` in memory (JavaScript variable/React state), NOT in localStorage!

---

### **Protected Routes** (`/api`)

All protected routes require the `Authorization` header:

```http
Authorization: Bearer <your_access_token>
```

#### 3. Get Profile
```http
GET /api/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "message": "User profile",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

#### 4. Get Dashboard
```http
GET /api/dashboard
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "User profile",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "iat": 1733584015,
    "exp": 1733584615
  }
}
```

---

### **Error Responses**

**401 Unauthorized** (No token):
```json
{
  "error": "Unauthorized"
}
```

**401 Unauthorized** (Invalid/Expired token):
```json
{
  "error": "Unauthorized"
}
```

---

## 🔒 Security Analysis

### **How It Works**

1. **Token Generation:**
   - User logs in → Server generates JWT with 10-min expiry
   - Token contains: `{ id, name, email, iat, exp }`
   - Signed with `JWT_SECRET` from environment

2. **Token Storage:**
   - Client stores token **in memory only** (e.g., React state)
   - NOT in localStorage (vulnerable to XSS)
   - NOT in cookies (we want explicit control)

3. **Token Transmission:**
   - Sent in `Authorization: Bearer <token>` header
   - Middleware extracts and verifies on each request

4. **Token Verification:**
   - `jwt.verify()` checks:
     - Signature validity
     - Token expiry
     - Token structure
   - If valid → Attach user to `req.user`
   - If invalid/expired → Return 401

---

### **Attack Vectors & Mitigation**

#### 1. **XSS (Cross-Site Scripting)**

**Risk:** If token is stored in localStorage, malicious scripts can steal it.

**Mitigation:**
- ✅ Store token **in memory only**
- ✅ Token lost on page refresh (acceptable with short expiry)
- ⚠️ Developer must NOT use `localStorage.setItem('token', ...)`

**Security Rating:** Medium-High (depends on implementation)

---

#### 2. **Man-in-the-Middle (MITM)**

**Risk:** Token visible in HTTP headers, can be intercepted.

**Mitigation:**
- ✅ Always use **HTTPS** in production
- ✅ Short token lifetime (10 mins) limits damage
- ⚠️ Never use HTTP for authentication

**Security Rating:** High (with HTTPS)

---

#### 3. **Token Theft**

**Risk:** If attacker steals token, they can impersonate user.

**Mitigation:**
- ✅ **Short expiry** (10 mins) → Limited attack window
- ❌ No token revocation (can't invalidate before expiry)
- 💡 Solution: Use refresh token pattern (Auth-v5)

**Security Rating:** Medium

---

#### 4. **CSRF (Cross-Site Request Forgery)**

**Risk:** Attacker tricks user into making unwanted requests.

**Mitigation:**
- ✅ **No cookies used** → CSRF not applicable
- ✅ Token must be explicitly sent in header
- ✅ SameSite not needed

**Security Rating:** High (CSRF-proof)

---

### **Security Comparison**

| Attack Type | Session-Based | JWT (Cookie) | JWT (Memory) |
|-------------|---------------|--------------|--------------|
| XSS | Medium | High (httpOnly) | High (if implemented correctly) |
| CSRF | High | Medium | Low (no cookies) |
| MITM | Medium | Medium | Medium (use HTTPS) |
| Token Theft | Low | Medium | Medium-High (short expiry) |
| Scalability | Low | High | High |

**Overall Security Rating:** ⭐⭐⭐⭐ (4/5)

---

## 🧪 Testing Guide

### **Using Postman**

#### Test 1: Register
```
POST http://localhost:5000/users/register
Body: { "name": "Test", "email": "test@test.com", "password": "pass123" }
Expected: 201 Created
```

#### Test 2: Login
```
POST http://localhost:5000/users/login
Body: { "email": "test@test.com", "password": "pass123" }
Expected: 201 + accessToken in response
Action: Copy the accessToken
```

#### Test 3: Access Protected Route (Valid Token)
```
GET http://localhost:5000/api/profile
Headers: Authorization: Bearer <paste_token>
Expected: 200 OK + user data
```

#### Test 4: Access Without Token
```
GET http://localhost:5000/api/profile
Headers: (none)
Expected: 401 Unauthorized
```

#### Test 5: Access with Invalid Format
```
GET http://localhost:5000/api/profile
Headers: Authorization: <token_without_Bearer>
Expected: 401 Unauthorized
```

#### Test 6: Access with Expired Token
```
1. Change .env: JWT_EXPIRES_IN=10s
2. Restart server
3. Login and get token
4. Wait 15 seconds
5. Try accessing protected route
Expected: 401 Unauthorized
```

---

## 📊 Comparison with Other Methods

### **Auth-v1: Session-Based**
- ❌ Stateful (server stores sessions)
- ❌ Hard to scale
- ✅ Secure (session ID in httpOnly cookie)
- ✅ Easy to revoke

### **Auth-v2: Bearer Token**
- ❌ Token stored in DB (not scalable)
- ❌ No expiration
- ❌ Vulnerable to token theft
- ✅ Simple implementation

### **Auth-v3: JWT (Single Token)**
- ✅ Stateless
- ✅ Scalable
- ❌ Long expiry (7 days) = security risk
- ✅ httpOnly cookie (XSS-safe)
- ❌ Vulnerable to CSRF

### **Auth-v4: JWT Access Token** ⭐ (Current)
- ✅ Stateless
- ✅ Scalable
- ✅ Short expiry (10 mins) = more secure
- ✅ Memory storage (XSS-resistant if implemented correctly)
- ✅ No CSRF risk
- ❌ Poor UX (frequent re-login)
- ❌ No token revocation

### **Auth-v5: Access + Refresh Token** 🚀 (Next)
- ✅ Best of both worlds
- ✅ Short-lived access token (5-15 mins)
- ✅ Long-lived refresh token (7 days) in httpOnly cookie
- ✅ Can revoke refresh tokens
- ✅ Better UX (auto-refresh)
- ✅ High security

---

## 🎓 Key Learnings

### **What I Learned:**

1. **JWT Lifecycle:**
   - Token generation with `jwt.sign()`
   - Token verification with `jwt.verify()`
   - Automatic expiry checking

2. **Middleware Pattern:**
   - Extracting tokens from headers
   - Validating token format
   - Attaching user data to request object

3. **Security Tradeoffs:**
   - Short expiry = Better security, Worse UX
   - Memory storage = XSS-resistant, Lost on refresh
   - Stateless = Scalable, No revocation

4. **Header-based Authentication:**
   - Manual token sending (vs automatic cookies)
   - `Authorization: Bearer <token>` format
   - CSRF protection by design

---

## 🔮 Next Steps (Auth-v5)

Implementing **Access + Refresh Token Pattern:**

```mermaid
graph LR
    A[Login] --> B[Get Access Token<br/>5 mins]
    A --> C[Get Refresh Token<br/>7 days, httpOnly]
    B --> D[Access Protected Routes]
    D --> E{Token Expired?}
    E -->|Yes| F[Call /refresh endpoint]
    F --> G[Validate Refresh Token]
    G --> H[Issue New Access Token]
    H --> D
    E -->|No| D
```

**Benefits:**
- ✅ Better UX (no frequent re-login)
- ✅ Better security (access token still short-lived)
- ✅ Token revocation (store refresh tokens in DB)

---

## 📝 Notes

- This is a **learning project** to understand JWT authentication
- **Not production-ready** without:
  - Rate limiting
  - Input validation
  - HTTPS enforcement
  - Refresh token implementation
  - Token blacklisting
  - Password reset flow

---

## 👨‍💻 Author

**Varun Mendre**

Learning authentication methods from scratch! 🚀

---

## 📄 License

MIT License - Feel free to use for learning purposes!

---

## 🙏 Acknowledgments

- JWT.io for token debugging
- Express.js documentation
- MongoDB documentation

---

**Previous:** [Auth-v3 (JWT Single Token)](../Auth-v3)  
**Next:** [Auth-v5 (Access + Refresh Token)](../Auth-v5)
