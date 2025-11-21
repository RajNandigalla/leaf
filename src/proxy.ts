import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateNonce, getSecurityHeaders } from '@/utils/csp';

export function proxy(request: NextRequest) {
  // Generate a nonce for this request
  const nonce = generateNonce();

  // Get all security headers
  const securityHeaders = getSecurityHeaders(nonce);

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  // Create response with security headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add all security headers to the response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
