
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
    const start = Date.now();
    const response = NextResponse.next();
    const duration = Date.now() - start;

    const endpoint = req.nextUrl.pathname;

    // In a real application, you would log this to your analytics service
    console.log({
        event: 'api_response_time',
        endpoint,
        duration,
    });

    return response;
}
