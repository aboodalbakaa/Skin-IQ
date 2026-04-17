import {defineRouting} from 'next-intl/routing';
import createMiddleware from 'next-intl/middleware';
 
import { updateSession } from '@/utils/supabase/middleware';
import { NextRequest } from 'next/server';
 
export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'ar'
});
 
const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 1. Run localization (sets headers, language cookies)
  const response = intlMiddleware(request);
  
  // 2. Run Supabase token refresh, injecting it into the intl response
  return await updateSession(request, response);
}
 
export const config = {
  matcher: ['/', '/(ar|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
