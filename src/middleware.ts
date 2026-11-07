import { NextResponse } from 'next/server';

// Page routes are case-sensitive, so /ADMIN or /Admin found no page. Any
// capitalisation of /admin (and its sections, e.g. /ADMIN/Resumes) is sent
// to the lowercase address; the admin page itself still decides who may in.
const ADMIN_PATH = /^\/admin(\/|$)/i;

export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  if (ADMIN_PATH.test(pathname)) {
    const lower = pathname.toLowerCase();
    if (lower !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = lower;
      url.search = search;
      return NextResponse.redirect(url, 308);
    }
  }
  return NextResponse.next();
}

export const config = {
  // Only addresses that start with /admin in any letter case.
  matcher: ['/:first([aA][dD][mM][iI][nN])', '/:first([aA][dD][mM][iI][nN])/:rest*'],
};
