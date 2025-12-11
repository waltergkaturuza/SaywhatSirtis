"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, Copy, Download } from 'lucide-react';

interface TwoFactorSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  } | null>(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [backupCodesSaved, setBackupCodesSaved] = useState(false);

  const handleSetup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to setup 2FA');
      }

      setSetupData(data.data);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!setupData) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: verificationToken,
          secret: setupData.secret,
          backupCodes: setupData.backupCodes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      setSuccess(true);
      setTimeout(() => {
        onComplete?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    if (!setupData) return;
    const codesText = setupData.backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    alert('Backup codes copied to clipboard');
  };

  const downloadBackupCodes = () => {
    if (!setupData) return;
    const codesText = `SAYWHAT SIRTIS - 2FA Backup Codes\n\n${setupData.backupCodes.join('\n')}\n\nSave these codes in a secure location.`;
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">2FA Enabled Successfully!</h3>
            <p className="text-sm text-gray-600">
              Two-factor authentication has been enabled for your account.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'setup') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enable Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Two-factor authentication (2FA) adds an extra layer of security by requiring a code from your authenticator app in addition to your password.
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>Scan the QR code that will be shown</li>
              <li>Enter the verification code to complete setup</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSetup} disabled={loading} className="flex-1">
              {loading ? 'Setting up...' : 'Start Setup'}
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete 2FA Setup</CardTitle>
        <CardDescription>
          Scan the QR code and enter the verification code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {setupData && (
          <>
            <div className="flex justify-center">
              <img 
                src={setupData.qrCodeUrl} 
                alt="2FA QR Code" 
                className="border rounded-lg p-2 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-token">Enter 6-digit code from your app</Label>
              <Input
                id="verification-token"
                type="text"
                maxLength={6}
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold text-sm mb-2">Backup Codes</h4>
              <p className="text-xs text-gray-600 mb-3">
                Save these codes in a secure location. You can use them if you lose access to your authenticator app.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3 font-mono text-xs">
                {setupData.backupCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-white rounded border">
                    {code}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyBackupCodes}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadBackupCodes}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
              <div className="mt-3">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={backupCodesSaved}
                    onChange={(e) => setBackupCodesSaved(e.target.checked)}
                  />
                  I have saved my backup codes
                </label>
              </div>
            </div>

            <Button
              onClick={handleVerify}
              disabled={loading || verificationToken.length !== 6 || !backupCodesSaved}
              className="w-full"
            >
              {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

