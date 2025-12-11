"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Key } from 'lucide-react';

interface TwoFactorVerifyProps {
  email: string;
  onVerify: (token: string, backupCode?: string) => Promise<void>;
  onCancel?: () => void;
}

export default function TwoFactorVerify({ email, onVerify, onCancel }: TwoFactorVerifyProps) {
  const [token, setToken] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (useBackupCode) {
        if (!backupCode || backupCode.length < 8) {
          setError('Please enter a valid backup code');
          setLoading(false);
          return;
        }
        await onVerify('', backupCode);
      } else {
        if (!token || token.length !== 6) {
          setError('Please enter a valid 6-digit code');
          setLoading(false);
          return;
        }
        await onVerify(token);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication Required
        </CardTitle>
        <CardDescription>
          Enter the code from your authenticator app to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!useBackupCode ? (
            <div className="space-y-2">
              <Label htmlFor="token">6-digit code from authenticator app</Label>
              <Input
                id="token"
                type="text"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest"
                autoFocus
              />
              <p className="text-xs text-gray-500">
                Open your authenticator app and enter the 6-digit code
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="backup-code">Backup Code</Label>
              <Input
                id="backup-code"
                type="text"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                placeholder="XXXXXXXX"
                className="text-center font-mono"
                autoFocus
              />
              <p className="text-xs text-gray-500">
                Enter one of your saved backup codes
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setToken('');
                setBackupCode('');
                setError(null);
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              {useBackupCode ? 'Use authenticator app instead' : 'Use backup code instead'}
            </button>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading || (!useBackupCode && token.length !== 6) || (useBackupCode && !backupCode)}
              className="flex-1"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

