import { Request, Response, NextFunction } from 'express';

const allowedOrigin = 'https://frontend-iota-gules-58.vercel.app';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const userAgent = req.headers['user-agent'];

    // Block requests without proper headers
    if (!origin || !referer || !userAgent) {
        res.status(403).json({ error: 'Invalid request headers' });
        return;
    }

    // Check if the request is coming from a browser
    const isBrowserRequest = userAgent.includes('Mozilla') || 
                           userAgent.includes('Chrome') || 
                           userAgent.includes('Safari') ||
                           userAgent.includes('Firefox');

    if (!isBrowserRequest) {
        res.status(403).json({ error: 'Non-browser requests not allowed' });
        return;
    }

    // Verify both origin and referer match our allowed domain
    if (origin === allowedOrigin && referer.startsWith(allowedOrigin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
        
        // Add security headers
        res.header('X-Frame-Options', 'DENY');
        res.header('X-Content-Type-Options', 'nosniff');
        res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
            return;
        }
        next();
    } else {
        res.status(403).json({ error: 'Access denied' });
    }
}; 