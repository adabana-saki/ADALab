import type { PagesFunction } from '@cloudflare/workers-types';

// Redirect pages.dev to custom domain
export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  // Check if accessing via pages.dev
  if (url.hostname.endsWith('.pages.dev')) {
    // Redirect to custom domain
    const newUrl = new URL(url.pathname + url.search, 'https://adalabtech.com');
    return Response.redirect(newUrl.toString(), 301);
  }

  // Continue with the request
  return context.next();
};
