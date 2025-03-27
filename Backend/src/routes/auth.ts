import { Router, Request, Response, RequestHandler } from 'express';
import { db } from '../config/db';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', (async (req: Request, res: Response) => {
  try {
    const port = req.app.get('port') || process.env.PORT || 3000;
    
    // Start the OAuth flow
    const { data, error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: `http://localhost:${port}/auth/callback`
      }
    });

    if (error) {
      return res.status(401).json({ message: 'Authentication failed', error });
    }

    // Return the URL where the user should be redirected to complete the OAuth flow
    return res.json({ url: data.url });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}) as RequestHandler);

router.get('/callback', (async (req: Request, res: Response) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ message: 'No code provided' });
  }

  try {
    const { data, error } = await db.auth.exchangeCodeForSession(String(code));
    
    if (error) {
      return res.status(401).json({ message: 'Authentication failed', error });
    }

    if (!data.user) {
      return res.status(401).json({ message: 'No user data received' });
    }

    // Get or create user in our users table
    const { data: userData, error: userError } = await db
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      return res.status(500).json({ message: 'Database error', error: userError });
    }

    let user = userData;

    // If user doesn't exist, create new user with default role 'student'
    if (!userData) {
      const { data: newUser, error: createError } = await db
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          role: 'student'
        })
        .single();

      if (createError) {
        return res.status(500).json({ message: 'Failed to create user', error: createError });
      }

      user = newUser;
    }

    // Generate JWT
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    // Set JWT in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    });

    // Redirect to frontend homepage
    res.redirect('http://localhost:5173');
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}) as RequestHandler);

export default router;