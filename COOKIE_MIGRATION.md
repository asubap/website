# Cookie-Based Authentication Migration Plan

## Overview

This document outlines the complete migration from localStorage-based authentication to secure HttpOnly cookie-based authentication.

**Current Architecture:**
```
Browser (localStorage) ←→ Supabase Auth
```

**Target Architecture:**
```
Browser ←→ Backend API (HttpOnly Cookies) ←→ Supabase Auth
```

---

## Table of Contents

1. [Security Benefits](#security-benefits)
2. [Backend Changes](#backend-changes)
3. [Frontend Changes](#frontend-changes)
4. [Migration Steps](#migration-steps)
5. [Testing](#testing)
6. [Security Hardening](#security-hardening)

---

## Security Benefits

### Why HttpOnly Cookies?

**localStorage (Current - Less Secure):**
- ❌ Vulnerable to XSS attacks - malicious JavaScript can steal tokens
- ❌ Accessible by any JavaScript on your domain
- ❌ No built-in expiration or security controls
- ✅ Easy to implement with Supabase JS client
- ✅ Works well for SPAs

**HttpOnly Cookies (Target - More Secure):**
- ✅ **Protected from XSS** - JavaScript cannot access HttpOnly cookies
- ✅ **Server-controlled** - only your backend can set/read them
- ✅ **Additional security flags** - Secure (HTTPS only), SameSite (CSRF protection)
- ✅ **Automatic expiration** - browsers handle cookie lifecycle
- ✅ **CSRF Protection** - SameSite attribute prevents cross-site attacks
- ✅ **Audit Trail** - Server can log all auth attempts
- ❌ Requires server-side session management
- ❌ More complex setup

---

## BACKEND CHANGES

### Step 1: Install Dependencies

#### Node.js Backend
```bash
npm install cookie-parser jsonwebtoken @supabase/supabase-js
```

#### Python Backend
```bash
pip install flask-cors pyjwt supabase
```

### Step 2: Create Auth Middleware

**File: `backend/middleware/auth.js`**

```javascript
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Server-side key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function validateSession(req, res, next) {
  try {
    // Read session cookie
    const sessionToken = req.cookies.session_token;

    if (!sessionToken) {
      return res.status(401).json({ error: 'No session found' });
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(sessionToken);

    if (error || !user) {
      // Clear invalid cookie
      res.clearCookie('session_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Attach user to request
    req.user = user;
    req.sessionToken = sessionToken;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

module.exports = { validateSession };
```

### Step 3: Create Auth Routes

**File: `backend/routes/auth.js`**

```javascript
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,                          // Prevents JavaScript access
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',                      // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000,        // 7 days
  path: '/'
};

// Login endpoint
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    const { session, user } = data;

    // Set HttpOnly cookie with access token
    res.cookie('session_token', session.access_token, COOKIE_OPTIONS);
    res.cookie('refresh_token', session.refresh_token, COOKIE_OPTIONS);

    // Return user info (NOT tokens)
    res.json({
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Google OAuth login
router.post('/auth/google', async (req, res) => {
  try {
    const { token } = req.body; // ID token from Google

    // Exchange Google token for Supabase session
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: token
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    const { session, user } = data;

    // Set cookies
    res.cookie('session_token', session.access_token, COOKIE_OPTIONS);
    res.cookie('refresh_token', session.refresh_token, COOKIE_OPTIONS);

    res.json({
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// Logout endpoint
router.post('/auth/logout', async (req, res) => {
  try {
    const sessionToken = req.cookies.session_token;

    if (sessionToken) {
      // Revoke session in Supabase
      await supabase.auth.admin.signOut(sessionToken);
    }

    // Clear cookies
    res.clearCookie('session_token', { ...COOKIE_OPTIONS, maxAge: 0 });
    res.clearCookie('refresh_token', { ...COOKIE_OPTIONS, maxAge: 0 });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Session validation endpoint
router.get('/auth/session', async (req, res) => {
  try {
    const sessionToken = req.cookies.session_token;
    const refreshToken = req.cookies.refresh_token;

    if (!sessionToken) {
      return res.status(401).json({ error: 'No session found' });
    }

    // Verify session with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(sessionToken);

    if (error) {
      // Try to refresh the session
      if (refreshToken) {
        const { data, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token: refreshToken
        });

        if (!refreshError && data.session) {
          // Update cookies with new tokens
          res.cookie('session_token', data.session.access_token, COOKIE_OPTIONS);
          res.cookie('refresh_token', data.session.refresh_token, COOKIE_OPTIONS);

          return res.json({
            user: {
              id: data.user.id,
              email: data.user.email
            }
          });
        }
      }

      // Session is invalid
      res.clearCookie('session_token', { ...COOKIE_OPTIONS, maxAge: 0 });
      res.clearCookie('refresh_token', { ...COOKIE_OPTIONS, maxAge: 0 });
      return res.status(401).json({ error: 'Session expired' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ error: 'Session validation failed' });
  }
});

// Refresh token endpoint
router.post('/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token found' });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error || !data.session) {
      res.clearCookie('session_token', { ...COOKIE_OPTIONS, maxAge: 0 });
      res.clearCookie('refresh_token', { ...COOKIE_OPTIONS, maxAge: 0 });
      return res.status(401).json({ error: 'Token refresh failed' });
    }

    // Update cookies
    res.cookie('session_token', data.session.access_token, COOKIE_OPTIONS);
    res.cookie('refresh_token', data.session.refresh_token, COOKIE_OPTIONS);

    res.json({ message: 'Token refreshed' });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

module.exports = router;
```

### Step 4: Update User Role Endpoint

**File: `backend/routes/users.js`**

```javascript
const express = require('express');
const router = express.Router();
const { validateSession } = require('../middleware/auth');

// This endpoint now uses the session cookie instead of Authorization header
router.post('/users', validateSession, async (req, res) => {
  try {
    const userEmail = req.user.email; // From middleware

    // Check if user is archived in your database
    const user = await db.query('SELECT * FROM members WHERE email = $1', [userEmail]);

    if (!user || user.is_archived) {
      // User is archived - clear the cookies
      res.clearCookie('session_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });

      return res.status(403).json({ error: 'Member is archived' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Return user role
    res.json({
      type: user.role,
      companyName: user.company_name // if sponsor
    });
  } catch (error) {
    console.error('User lookup error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

module.exports = router;
```

### Step 5: Update Main Server File

**File: `backend/server.js`**

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS - IMPORTANT: Must allow credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 6: Environment Variables

**File: `backend/.env`**

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For admin operations
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

---

## FRONTEND CHANGES

### Step 1: Create New Auth Service

**File: `src/services/authService.ts`**

```typescript
const API_URL = import.meta.env.VITE_BACKEND_URL;

export const authService = {
  // Login with email/password
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // IMPORTANT: Include cookies
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return await response.json();
  },

  // Google OAuth login
  async googleLogin(idToken: string) {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token: idToken })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Google login failed');
    }

    return await response.json();
  },

  // Logout
  async logout() {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return await response.json();
  },

  // Get current session
  async getSession() {
    const response = await fetch(`${API_URL}/auth/session`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  },

  // Refresh token
  async refreshToken() {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return await response.json();
  },

  // Fetch user role
  async getUserRole(email: string) {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Cookies sent automatically
      body: JSON.stringify({ user_email: email })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user role');
    }

    return await response.json();
  }
};
```

### Step 2: Update Auth Provider

**File: `src/context/auth/authProvider.tsx`**

```typescript
import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../../services/authService";

export type RoleType = string | { type: "sponsor"; companyName: string } | null;

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  role: RoleType;
  loading: boolean;
  authError: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<RoleType>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch user role
  const fetchUserRole = async (email: string) => {
    try {
      const data = await authService.getUserRole(email);
      setRole(data);
      setAuthError(null);
    } catch (error: any) {
      console.error("Error fetching role:", error);
      setAuthError(error.message);
      setRole(null);

      // If role fetch fails (archived/not found), logout
      await logout();
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const data = await authService.login(email, password);
      setUser(data.user);
      await fetchUserRole(data.user.email);
    } catch (error: any) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google login function
  const googleLogin = async (idToken: string) => {
    try {
      setLoading(true);
      const data = await authService.googleLogin(idToken);
      setUser(data.user);
      await fetchUserRole(data.user.email);
    } catch (error: any) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setRole(null);
      setAuthError(null);
    }
  };

  // Check session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const sessionData = await authService.getSession();

        if (sessionData?.user) {
          setUser(sessionData.user);
          await fetchUserRole(sessionData.user.email);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Periodic role validation - check every 30 seconds
  useEffect(() => {
    const roleValidationInterval = setInterval(async () => {
      if (user?.email) {
        try {
          await fetchUserRole(user.email);
        } catch (error) {
          // User was archived - logout happens in fetchUserRole
          console.log("User validation failed, logging out");
        }
      }
    }, 30000);

    return () => {
      clearInterval(roleValidationInterval);
    };
  }, [user]);

  const isAuthenticated = !!user && !!role && !authError;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        authError,
        isAuthenticated,
        login,
        googleLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

### Step 3: Update Login Page

**File: `src/pages/login/LogInPage.tsx`**

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/authProvider";
import { useToast } from "../../context/toast/ToastContext";

export default function LogInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      navigate("/auth/Home");
    } catch (error: any) {
      showToast(error.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (googleIdToken: string) => {
    setLoading(true);

    try {
      await googleLogin(googleIdToken);
      navigate("/auth/Home");
    } catch (error: any) {
      showToast(error.message || "Google login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Google login button - integrate with Google OAuth */}
      <button onClick={() => {/* Trigger Google OAuth flow */}}>
        Login with Google
      </button>
    </div>
  );
}
```

### Step 4: Update Logout Component

**File: `src/components/logOut/LogOut.tsx`**

```typescript
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/authProvider";

export default function LogOut() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <button onClick={handleLogout}>
      Log Out
    </button>
  );
}
```

### Step 5: Update All API Calls

**CRITICAL:** Add `credentials: 'include'` to ALL authenticated fetch requests.

**Example in EventsPage:**

```typescript
const fetchEvents = async () => {
  try {
    const endpoint = `${import.meta.env.VITE_BACKEND_URL}/events`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include" // CRITICAL: This sends cookies
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setAllEvents(data);
  } catch (error) {
    console.error("Error fetching events:", error);
    setAllEvents([]);
  }
};
```

**Find and Replace:**

Search for all fetch calls and add `credentials: 'include'`:

```bash
# Find all fetch calls in the project
grep -r "fetch(" src/

# Update each one to include credentials: 'include'
```

### Step 6: Remove Direct Supabase Client Usage

**Files to update:**
- Remove `supabaseClient.ts` imports for auth operations
- Keep Supabase client ONLY for non-auth operations (if any)
- All auth should go through your backend API

---

## MIGRATION STEPS

### Phase 1: Backend Setup (Do First)

- [ ] 1. Install dependencies (`cookie-parser`, `@supabase/supabase-js`)
- [ ] 2. Create `middleware/auth.js` with `validateSession`
- [ ] 3. Create `routes/auth.js` with login/logout/session endpoints
- [ ] 4. Update `routes/users.js` to use cookie-based auth
- [ ] 5. Update `server.js` to enable CORS with credentials
- [ ] 6. Add environment variables to `.env`
- [ ] 7. Test backend endpoints with curl/Postman

**Test Commands:**

```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt -v

# Test authenticated request
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"user_email":"test@example.com"}' \
  -b cookies.txt -v

# Test logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt -v
```

### Phase 2: Frontend Migration

- [ ] 1. Create `services/authService.ts`
- [ ] 2. Update `context/auth/authProvider.tsx`
- [ ] 3. Update `pages/login/LogInPage.tsx`
- [ ] 4. Update `components/logOut/LogOut.tsx`
- [ ] 5. Find and update ALL fetch calls to include `credentials: 'include'`
- [ ] 6. Remove Supabase client auth usage
- [ ] 7. Test login flow end-to-end

### Phase 3: Testing & Validation

- [ ] 1. Test login with email/password
- [ ] 2. Test Google OAuth login
- [ ] 3. Verify cookies are set (check browser DevTools)
- [ ] 4. Test authenticated requests (events, member info, etc.)
- [ ] 5. Test archive member → should clear cookies
- [ ] 6. Test unarchive → should require re-login
- [ ] 7. Test token refresh
- [ ] 8. Test session expiration
- [ ] 9. Test logout flow
- [ ] 10. Test across different browsers

### Phase 4: Security Hardening

- [ ] 1. Set `Secure: true` in production (HTTPS only)
- [ ] 2. Verify `SameSite: 'strict'` is set
- [ ] 3. Add Content Security Policy (CSP) headers
- [ ] 4. Implement rate limiting on auth endpoints
- [ ] 5. Add HTTPS redirect in production
- [ ] 6. Set up proper CORS origins (restrict to production domain)
- [ ] 7. Enable helmet.js for security headers
- [ ] 8. Set up logging for auth events
- [ ] 9. Implement session monitoring/alerting
- [ ] 10. Add account lockout after failed login attempts

---

## TESTING

### Manual Testing Checklist

**Login Flow:**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Login with archived account
- [ ] Login with non-existent account
- [ ] Verify cookies are set in browser DevTools
- [ ] Verify session persists across page refreshes

**Authenticated Requests:**
- [ ] Fetch events while logged in
- [ ] Fetch member info while logged in
- [ ] Verify cookies are sent with each request
- [ ] Verify 401 response when not logged in

**Archive/Unarchive Flow:**
- [ ] Archive a logged-in member
- [ ] Verify they get logged out within 30 seconds
- [ ] Verify cookies are cleared
- [ ] Unarchive the member
- [ ] Verify they must re-login (no auto-login)
- [ ] Verify login works after unarchiving

**Logout Flow:**
- [ ] Logout while logged in
- [ ] Verify cookies are cleared
- [ ] Verify cannot access protected routes
- [ ] Verify redirected to home/login page

**Token Refresh:**
- [ ] Wait for token to expire
- [ ] Verify refresh token automatically renews session
- [ ] Verify new cookies are set

### Automated Testing (curl)

```bash
# Save these in a test script

# 1. Login and save cookies
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt

# 2. Verify session
curl -X GET http://localhost:3000/api/auth/session \
  -b cookies.txt

# 3. Fetch user role
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"user_email":"test@example.com"}' \
  -b cookies.txt

# 4. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt

# 5. Verify session is gone
curl -X GET http://localhost:3000/api/auth/session \
  -b cookies.txt
# Should return 401
```

---

## SECURITY HARDENING

### Production Environment Variables

```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Additional Security Measures

#### 1. Add Helmet.js for Security Headers

```bash
npm install helmet
```

```javascript
// In server.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

#### 2. Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later'
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/google', authLimiter);
```

#### 3. HTTPS Redirect (Production Only)

```javascript
// In server.js
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

#### 4. Audit Logging

```javascript
// In auth routes
router.post('/auth/login', async (req, res) => {
  const { email } = req.body;

  // Log login attempt
  console.log(`[AUTH] Login attempt for ${email} from ${req.ip}`);

  // ... rest of login logic

  if (error) {
    console.log(`[AUTH] Login failed for ${email}: ${error.message}`);
  } else {
    console.log(`[AUTH] Login successful for ${email}`);
  }
});
```

---

## ROLLBACK PLAN

If migration fails, rollback steps:

1. **Revert Frontend:**
   - Restore `src/context/auth/authProvider.tsx` from git
   - Restore `src/context/auth/supabaseClient.ts`
   - Remove `src/services/authService.ts`
   - Remove `credentials: 'include'` from fetch calls

2. **Disable Backend Auth Routes:**
   - Comment out cookie-based auth routes
   - Keep existing Authorization header validation

3. **Test Old Flow:**
   - Verify localStorage auth still works
   - Verify login/logout functionality

---

## NOTES

- **Development vs Production:** Use `NODE_ENV` to control cookie security settings
- **Cookie Size Limits:** Cookies are limited to 4KB - store only essential tokens
- **Cross-Domain:** If frontend and backend are on different domains, ensure CORS is configured correctly
- **Mobile Apps:** HttpOnly cookies work in web views but not in native mobile apps
- **Session Duration:** Set appropriate `maxAge` for cookies (7 days default)
- **Refresh Strategy:** Implement token refresh before expiration
- **Browser Compatibility:** HttpOnly cookies work in all modern browsers

---

## RESOURCES

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [OWASP Cookie Security](https://owasp.org/www-community/controls/SecureCookieAttribute)
- [MDN HttpOnly Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [Express Cookie Parser](https://www.npmjs.com/package/cookie-parser)

---

## CONCLUSION

This migration significantly improves your application's security by:

1. **Eliminating XSS token theft risk** - tokens never exposed to JavaScript
2. **Adding CSRF protection** - SameSite cookie attribute
3. **Centralizing auth logic** - all validation happens server-side
4. **Enabling better monitoring** - server-side audit logs
5. **Automatic session management** - browser handles cookie lifecycle

The trade-off is increased complexity, but the security benefits are substantial for a production application handling sensitive data.
