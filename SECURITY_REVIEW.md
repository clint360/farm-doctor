# Security Review - Farm Doctor Website

**Date:** April 11, 2026  
**Severity Levels:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## Executive Summary

This Next.js frontend has **11 security issues** ranging from critical to low severity. The most critical issues are:
1. Exposed ngrok URL in source code (production backend accessible publicly)
2. No input validation on user-submitted data
3. XSS vulnerability via `dangerouslySetInnerHTML`
4. Missing security headers and HTTPS enforcement
5. Phone numbers used as weak identifiers without encryption

---

## 🔴 Critical Issues

### 1. **Exposed Ngrok URL in Source Code**
**Files:** `app/call/CallClient.tsx`, `app/subscribe/SubscribeClient.tsx`, `app/expert-apply/ExpertApplyClient.tsx`, `app/insights/InsightsClient.tsx`

**Problem:**
```typescript
const API = process.env.NEXT_PUBLIC_API_URL || 
  "https://shon-unmonumented-nigel.ngrok-free.dev";
```
- Ngrok URLs are **public tunnels** with temporary validity
- The URL is hardcoded in 4 files and will be visible in:
  - Deployed client bundle (can be extracted from JS)
  - GitHub commits forever
  - Browser network tab for any user
- Anyone with the URL can directly attack your backend API
- Ngrok tunnels auto-expire; the current URL may be stale but demonstrates poor secret management

**Risk:** Complete backend API exposure, potential data theft, unauthorized API calls

**Fix:**
```typescript
// ❌ Remove hardcoded ngrok URL
const API = process.env.NEXT_PUBLIC_API_URL;

if (!API) {
  throw new Error("NEXT_PUBLIC_API_URL must be set");
}
```

---

## 🟠 High Issues

### 2. **No Input Validation**
**Files:** `SubscribeClient.tsx`, `ExpertApplyClient.tsx`, `InsightsClient.tsx`

**Problem:**
- Phone numbers accepted as-is without format validation
- Form fields (name, location, LinkedIn, cover letter) sent to backend without sanitization
- LinkedI URL could contain XSS payloads if backend doesn't validate
- No client-side validation before sending to API

**Example (SubscribeClient.tsx):**
```typescript
// Phone number only checks length, not format
if (!phone || phone.length < 9) {
  setError("Invalid phone");
  return;
}
// But then sends: { phone, plan, momo_number, medium } directly to API
```

**Risk:** 
- Backend injection attacks (SQL, NoSQL, command injection)
- Data integrity issues
- Potential XSS if backend echoes user input

**Fix:**
```typescript
function validatePhone(phone: string): boolean {
  // Cameroon phone format validation
  const regex = /^(?:\+237|237)?[1-9]\d{7,8}$/;
  return regex.test(phone.replace(/\s+/g, ''));
}

function validateFormInput(input: string, fieldName: string, maxLen: number = 500): boolean {
  if (!input || input.trim().length === 0) return false;
  if (input.length > maxLen) return false;
  // Check for suspicious patterns
  if (/<|>|javascript:|onerror=|onclick=/i.test(input)) return false;
  return true;
}
```

### 3. **XSS Vulnerability via `dangerouslySetInnerHTML`**
**Files:** `HomeClient.tsx` (line 69), `SubscribeClient.tsx`, `InsightsClient.tsx`

**Problem:**
```typescript
// HomeClient.tsx
<div className="hcl" dangerouslySetInnerHTML={{ __html: t("hero.s1") }} />

// SubscribeClient.tsx
<div style={...} dangerouslySetInnerHTML={{ __html: t("sub.plan.free") }} />

// InsightsClient.tsx
<MarkdownText inline text={step} />
```

The `parseInline()` function in InsightsClient processes markdown-like syntax but has potential issues:
- Doesn't sanitize HTML tags outside markdown syntax
- Backend returns insights data via API—if compromised, could inject malicious HTML
- i18n strings from translations could be compromised

**Risk:** Stored/Reflected XSS attacks, session hijacking, credential theft

**Fix:**
```typescript
import DOMPurify from "dompurify";

// Create a safe version
function SafeMarkdown({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, { 
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'ul', 'ol', 'li', 'code', 'p'],
    ALLOWED_ATTR: []
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

Install: `npm install dompurify`

### 4. **Missing HTTPS Enforcement & Security Headers**
**Files:** `next.config.ts`

**Problem:**
- No security headers configured
- No HTTPS redirect configured
- No Content Security Policy (CSP)
- No X-Frame-Options to prevent clickjacking
- No Strict-Transport-Security (HSTS)

**Risk:** 
- Man-in-the-middle attacks
- Clickjacking attacks
- Unsafe third-party script injection
- Browser cache poisoning

**Fix (next.config.ts):**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self' https://api.example.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(self), camera=()"
          }
        ]
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
            has: [{ type: "host", value: "farm-doctor.vercel.app" }]
          }
        ]
      }
    ];
  },
  
  async redirects() {
    return [
      {
        source: "/(.*)",
        destination: "https://farm-doctor.vercel.app/:path*",
        permanent: true,
        has: [{ type: "host", value: "^(?!farm-doctor\\.vercel\\.app$)" }]
      }
    ];
  }
};

export default nextConfig;
```

---

## 🟡 Medium Issues

### 5. **Phone Numbers Used as Weak Identifiers**
**Files:** `SubscribeClient.tsx`, `ExpertApplyClient.tsx`

**Problem:**
- User phone numbers are the only identifier for subscriptions and applications
- Phone numbers are sequential and potentially guessable
- No user authentication or session management
- An attacker can query anyone's subscription status with different phone numbers

**Example:**
```typescript
// Anyone can check subscription status
GET /api/subscription?phone=237680612360
GET /api/subscription?phone=237680612361
GET /api/subscription?phone=237680612362
```

**Risk:** 
- Information disclosure (IDOR - Insecure Direct Object Reference)
- Privacy violations
- Subscription hijacking

**Fix:**
- Implement proper user authentication (JWT tokens, session management)
- Generate random transaction IDs instead of using phone numbers as lookup keys
- Add rate limiting to prevent enumeration attacks

### 6. **localStorage Used for Sensitive Data Without Protection**
**Files:** `CallClient.tsx`

**Problem:**
```typescript
const USAGE_KEY = "fd_call_usage";
// { date, usedSeconds } stored in plaintext
localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
```

**Issues:**
- Any script on the page (via XSS) can read/modify localStorage
- User can easily bypass usage limits by clearing localStorage
- Data persists even after logout
- Cross-site tracking possible if domain shared

**Risk:** 
- Business logic bypass (users get unlimited free calls)
- User data manipulation

**Fix:**
```typescript
// Option 1: Move logic to backend (best)
// Option 2: Encrypt localStorage
import crypto from 'crypto';

function encryptUsage(usage: UsageData, key: string): string {
  const encrypted = crypto.encryptSync(JSON.stringify(usage), key);
  return encrypted;
}

// Option 3: Sign data with HMAC to detect tampering
function signUsage(usage: UsageData, secret: string): string {
  const data = JSON.stringify(usage);
  const signature = crypto.createHmac('sha256', secret)
    .update(data)
    .digest('hex');
  return JSON.stringify({ data: usage, signature });
}
```

### 7. **No CSRF Protection**
**Files:** `SubscribeClient.tsx`, `ExpertApplyClient.tsx`, `CallClient.tsx`

**Problem:**
```typescript
// POST requests with no CSRF token
const res = await fetch(`${API}/api/subscription`, {
  method: "POST",
  headers: apiHeaders,
  body: JSON.stringify({ phone, plan, momo_number, medium }),
});
```

If a CSRF token isn't validated server-side, attackers can:
- Forge POST requests from malicious sites
- Trigger unauthorized payments
- Submit expert applications on behalf of users

**Fix:**
```typescript
// Add CSRF token to request headers
const csrfToken = getCsrfToken(); // From meta tag or cookie

const res = await fetch(`${API}/api/subscription`, {
  method: "POST",
  headers: {
    ...apiHeaders,
    "X-CSRF-Token": csrfToken,
  },
  body: JSON.stringify({ phone, plan, momo_number, medium }),
});
```

### 8. **Predictable Polling Intervals Enable DoS**
**Files:** `SubscribeClient.tsx`, `ExpertApplyClient.tsx`

**Problem:**
```typescript
const interval = setInterval(pollPayment, 4000); // 4-second intervals
```

Every user polls exactly every 4 seconds for up to 2 minutes = ~60 requests per user. If you have 1000 concurrent users, that's 15,000 requests/minute to backend.

**Risk:** 
- Easy to amplify DoS attacks
- Predictable load on backend
- Can be exploited with automated clients

**Fix:**
```typescript
// Add exponential backoff + jitter
let pollCount = 0;
const pollPayment = useCallback(async () => {
  const maxAttempts = 30;
  const baseDelay = 1000; // 1 second
  
  if (pollCount >= maxAttempts) {
    setError(t("sub.poll.timeout"));
    setStep("checkout");
    return;
  }
  
  // Exponential backoff: 1s, 2s, 4s, 8s (with capping)
  const delay = Math.min(baseDelay * Math.pow(1.5, pollCount), 15000);
  const jitter = Math.random() * 1000; // Add randomness
  
  pollCount++;
  // ... polling logic
}, [transId]);

useEffect(() => {
  if (step !== "polling") return;
  pollPayment();
  
  const timeout = setTimeout(() => {
    const interval = setInterval(pollPayment, calculateDelay(pollCount));
    return () => clearInterval(interval);
  }, calculateDelay(pollCount - 1));
  
  return () => clearTimeout(timeout);
}, [step, pollPayment]);
```

### 9. **Silent Error Handling Masks Security Issues**
**Files:** `CallClient.tsx`, `SubscribeClient.tsx`, `ExpertApplyClient.tsx`

**Problem:**
```typescript
// Silent catches everywhere
fetch(`${BACKEND_URL}/api/retell/call-ended`, {
  method: "POST",
  headers: apiHeaders,
  body: JSON.stringify({ duration }),
}).catch(() => {}); // ❌ Silent failure

try {
  const data = await res.json();
  // ...
} catch {
  // silent retry ❌
}
```

**Risk:**
- Attackers can't tell if attacks succeeded/failed
- Makes debugging security issues difficult
- Security events go unlogged
- Business logic errors silently fail

**Fix:**
```typescript
// Log security-relevant events
function logSecurityEvent(event: string, details: any) {
  console.error(`[SECURITY] ${event}:`, details);
  // In production, send to security logging service
  // fetch('/api/security-log', { method: 'POST', body: JSON.stringify({ event, details }) });
}

try {
  const res = await fetch(`${BACKEND_URL}/api/retell/call-ended`, {
    method: "POST",
    headers: apiHeaders,
    body: JSON.stringify({ duration }),
  });
  
  if (!res.ok) {
    logSecurityEvent('CALL_END_FAILED', { status: res.status, duration });
  }
} catch (err) {
  logSecurityEvent('CALL_END_ERROR', { error: err.message });
}
```

### 10. **API Header reveals ngrok-skip-browser-warning**
**Files:** All client files

**Problem:**
```typescript
const apiHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true", // ❌ Reveals infrastructure
};
```

This header:
- Reveals you use ngrok for development (information disclosure)
- Is meant for development only
- Suggests backend API is still in dev/staging environment

**Fix:**
```typescript
const apiHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  "Accept": "application/json",
  // Remove ngrok header for production
};
```

---

## 🟢 Low Issues

### 11. **Dependencies Not Pinned for Security**
**File:** `package.json`

**Problem:**
```json
{
  "dependencies": {
    "next": "16.2.3",
    "retell-client-js-sdk": "^2.0.7"  // ❌ Allows minor/patch updates
  }
}
```

The `^` allows automatic minor version updates, which could introduce vulnerabilities or breaking changes.

**Risk:** 
- Automatic installation of vulnerable package versions
- Unexpected breaking changes in CI/CD

**Fix:**
```json
{
  "dependencies": {
    "next": "16.2.3",
    "react": "19.2.4",
    "retell-client-js-sdk": "2.0.7"  // ✅ Pin to exact version
  }
}
```

Run dependency audit:
```bash
npm audit
npm audit fix
```

---

## Summary Table

| Issue | Severity | File(s) | Impact | Fix Priority |
|-------|----------|---------|--------|--------------|
| Exposed ngrok URL | 🔴 Critical | Multiple | Backend compromise | 🚨 Urgent |
| No input validation | 🟠 High | Form components | Data injection | 🚨 Urgent |
| XSS via dangerouslySetInnerHTML | 🟠 High | HomeClient, SubscribeClient | Account hijacking | 🚨 Urgent |
| Missing security headers | 🟠 High | next.config.ts | MITM attacks | ⚠️ High |
| Weak user identifiers (phone) | 🟡 Medium | Sub/Expert pages | Information disclosure | ⚠️ High |
| localStorage data exposure | 🟡 Medium | CallClient | Business logic bypass | ⚠️ High |
| No CSRF protection | 🟡 Medium | Form components | Unauthorized actions | ⚠️ High |
| Predictable polling | 🟡 Medium | Sub/Expert pages | DoS amplification | ℹ️ Medium |
| Silent error handling | 🟡 Medium | All files | Hidden security issues | ℹ️ Medium |
| ngrok header leak | 🟡 Medium | All files | Info disclosure | ℹ️ Low |
| Unpinned dependencies | 🟢 Low | package.json | Vulnerable versions | ℹ️ Low |

---

## Immediate Action Items

**Before next deployment:**
1. ✅ Remove ngrok URLs from source code
2. ✅ Add input validation to all forms
3. ✅ Implement DOMPurify for XSS prevention
4. ✅ Configure security headers in next.config.ts
5. ✅ Remove ngrok-skip-browser-warning header

**Short-term (within 1 sprint):**
6. ✅ Implement CSRF token validation
7. ✅ Add security event logging
8. ✅ Implement proper authentication system
9. ✅ Move call usage tracking to backend
10. ✅ Pin all dependencies

**Medium-term:**
11. ✅ Add rate limiting on sensitive endpoints
12. ✅ Implement Web Application Firewall (WAF)
13. ✅ Regular security audits and penetration testing
14. ✅ Consider bug bounty program

---

## Additional Recommendations

### Environment Variables Best Practices
Create `.env.local` (not committed to git):
```bash
# .env.local (NEVER commit this)
NEXT_PUBLIC_API_URL=https://api.farm-doctor.com
# Only NEXT_PUBLIC_ vars are exposed to client
# Keep all secrets in server-only env
SECRET_API_KEY=xxx
```

### Content Security Policy Refinement
```typescript
// Adjust CSP based on your actual third-party services
"script-src 'self' 'unsafe-inline' https://retell-client-js.example.com;"
"connect-src 'self' https://api.farm-doctor.com https://wss.retell.cc;"
```

### Rate Limiting Example
```typescript
// Implement rate limiter on client and server
const rateLimiter = new Map<string, number[]>();

function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const requests = rateLimiter.get(key) || [];
  
  const recentRequests = requests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return true;
  }
  
  recentRequests.push(now);
  rateLimiter.set(key, recentRequests);
  return false;
}
```

---

**Generated:** April 11, 2026  
**Next Review:** After implementing critical fixes (1-2 weeks)
