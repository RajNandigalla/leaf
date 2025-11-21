# Content Security Policy (CSP) Setup

## Overview

Implemented a comprehensive Content Security Policy to protect against XSS attacks, clickjacking, and code injection vulnerabilities.

## What Was Implemented

### 1. CSP Utility ([src/utils/csp.ts](file:///Users/rajnandigalla/Documents/LeafInk/leaf-ink/src/utils/csp.ts))

**Functions:**
- `generateNonce()` - Creates cryptographically secure nonces for inline scripts
- `buildCSP(nonce?)` - Builds CSP policy string with environment-specific rules
- `getSecurityHeaders(nonce?)` - Returns all security headers

**CSP Directives:**
- `default-src 'self'` - Only allow resources from same origin
- `script-src 'self' 'nonce-{random}'` - Scripts with nonce support
- `style-src 'self' 'unsafe-inline'` - Styles (required for CSS-in-JS)
- `img-src 'self' data: https:` - Images from safe sources
- `frame-ancestors 'none'` - Prevent clickjacking
- `connect-src 'self'` - API calls (includes localhost in dev)

### 2. Security Middleware ([src/middleware.ts](file:///Users/rajnandigalla/Documents/LeafInk/leaf-ink/src/middleware.ts))

Next.js middleware that:
- Generates a unique nonce for each request
- Adds CSP and security headers to all responses
- Passes nonce via `x-nonce` header for use in pages

**Applies to all routes except:**
- Static files (`_next/static`)
- Images (`_next/image`)
- Public assets (`.svg`, `.png`, etc.)

### 3. Next.js Config ([next.config.ts](file:///Users/rajnandigalla/Documents/LeafInk/leaf-ink/next.config.ts))

Added fallback security headers:
- `X-DNS-Prefetch-Control`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`

## Security Headers Included

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | Dynamic | Prevent XSS and code injection |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer info |
| `Permissions-Policy` | Restrictive | Disable unnecessary features |
| `Strict-Transport-Security` | Production only | Force HTTPS |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS protection |

## Environment-Specific Behavior

### Development
- Allows `unsafe-eval` for webpack HMR
- Allows `ws://localhost:*` for hot reload
- Allows `http://localhost:*` for API calls
- No HSTS (Strict-Transport-Security)

### Production
- Strict CSP with nonce-based inline scripts
- Forces HTTPS with HSTS
- Blocks all unsafe sources

## How to Use Nonces (For Inline Scripts)

If you need to add inline scripts (e.g., for analytics), use the nonce:

```tsx
import { headers } from 'next/headers';

export default function Page() {
  const nonce = headers().get('x-nonce');
  
  return (
    <html>
      <head>
        <script nonce={nonce}>
          {/* Your inline script */}
          console.log('This script is allowed!');
        </script>
      </head>
      <body>...</body>
    </html>
  );
}
```

## Testing CSP

### 1. Check Headers in Browser

Open DevTools → Network → Select any request → Headers tab

You should see:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123...'; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

### 2. Check for Violations

Open DevTools → Console

CSP violations will appear as:
```
Refused to load the script 'https://evil.com/script.js' because it violates 
the following Content Security Policy directive: "script-src 'self'".
```

### 3. Test Clickjacking Protection

Try embedding your site in an iframe - it should be blocked:
```html
<iframe src="http://localhost:3000"></iframe>
<!-- Will show: Refused to display in a frame because it set 'X-Frame-Options' to 'deny'. -->
```

## Customizing CSP

### Allow External API
Edit `src/utils/csp.ts`:
```typescript
'connect-src': [
  "'self'",
  'https://api.yourservice.com', // Add your API
],
```

### Allow External Scripts
```typescript
'script-src': [
  "'self'",
  nonce ? `'nonce-${nonce}'` : "'unsafe-inline'",
  'https://cdn.example.com', // Add trusted CDN
],
```

### Allow Google Fonts
```typescript
'font-src': [
  "'self'",
  'data:',
  'https://fonts.gstatic.com', // Google Fonts
],
'style-src': [
  "'self'",
  "'unsafe-inline'",
  'https://fonts.googleapis.com', // Google Fonts
],
```

## Security Benefits

✅ **XSS Protection** - Blocks unauthorized scripts  
✅ **Clickjacking Prevention** - Can't be embedded in iframes  
✅ **MIME Sniffing Protection** - Prevents content type confusion  
✅ **HTTPS Enforcement** - Forces secure connections in production  
✅ **Privacy Protection** - Disables FLoC and unnecessary browser features  

## Files Created/Modified

### New Files
- `src/utils/csp.ts` - CSP utility functions
- `src/middleware.ts` - Security headers middleware

### Modified Files
- `next.config.ts` - Added fallback security headers

## Next Steps

The CSP is now active! Monitor the console for any violations and adjust the policy as needed for your specific use case.
