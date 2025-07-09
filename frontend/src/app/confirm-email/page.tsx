'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const confirmEmail = async (token: string) => {
    try {
      const response = await api.post('/api/auth/confirm-email', null, {
        params: { token }
      });
      
      if (response.status === 200) {
        setStatus('success');
        setMessage('Email confirmed successfully! You can now use all features.');
      } else {
        setStatus('error');
        setMessage('Invalid or expired confirmation link.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data || 'Failed to confirm email');
    }
  };

  const resendConfirmation = async () => {
    setIsResending(true);
    try {
      const email = localStorage.getItem('lastRegisteredEmail');
      if (!email) {
        setMessage('Please log in and try again');
        return;
      }

      await api.post('/api/auth/resend-confirmation', { email });
      setMessage('New confirmation email sent! Check your inbox.');
    } catch (error: any) {
      setMessage('Failed to resend confirmation email');
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (token) {
      confirmEmail(token);
    } else {
      setStatus('error');
      setMessage('No confirmation token provided');
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-600" />
            )}
            {status === 'error' && (
              <AlertCircle className="h-12 w-12 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Email Confirmation
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Confirming your email address...'}
            {status === 'success' && 'Your email has been confirmed!'}
            {status === 'error' && 'Confirmation failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className={`${
            status === 'success' ? 'border-green-200 bg-green-50' : 
            status === 'error' ? 'border-red-200 bg-red-50' : 
            'border-blue-200 bg-blue-50'
          }`}>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>

          {status === 'success' && (
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/study">
                  Start Studying
                </Link>
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-2">
              <Button 
                onClick={resendConfirmation}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Confirmation
                  </>
                )}
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">
                  Back to Login
                </Link>
              </Button>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <Link href="/support" className="text-blue-600 hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}