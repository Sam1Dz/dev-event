import 'server-only';

import type { NextRequest } from 'next/server';

import geoip from 'fast-geoip';
import { UAParser } from 'ua-parser-js';

/**
 * Retrieves the client's IP address from the request headers.
 * Checks 'x-forwarded-for' header and handles localhost IPv6 '::1'.
 *
 * @param req - The incoming request object.
 * @returns The client's IP address as a string.
 */
export function getClientIP(req: NextRequest): string {
  let ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  if (ip === '::1') {
    ip = '127.0.0.1';
  }

  return ip;
}

/**
 * extracts user agent information and geolocation from the request.
 * Parses browser, OS, and roughly estimates location based on IP.
 *
 * @param req - The incoming request object.
 * @returns Promise resolving to an object containing IP, OS, browser, and location.
 */
export async function getUserAgent(req: NextRequest) {
  const ip = getClientIP(req);

  const userAgent = req.headers.get('user-agent') || '';
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const osName = result.os.name || 'Unknown OS';
  const osVersion = result.os.version ? ` ${result.os.version}` : '';
  const os = `${osName}${osVersion}`;

  const browser = result.browser.name || 'Unknown Browser';

  const geo = await geoip.lookup(ip);
  const location = geo ? `${geo.city}, ${geo.country}` : 'Unknown Location';

  return {
    ip,
    os,
    browser,
    location,
  };
}
