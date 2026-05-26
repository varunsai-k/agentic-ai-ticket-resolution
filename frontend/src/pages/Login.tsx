import React, { useState } from 'react';
import { api } from '../utils/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '../components/ui';
import { Cpu, ShieldAlert, Languages } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

interface LoginProps {
  onLoginSuccess: (token: string, username: string) => void;
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const { t, toggleLanguage, language } = useTranslation();
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { access_token } = response.data;
      onLoginSuccess(access_token, username);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || t('auth.error')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-6 overflow-hidden">
      
      {/* Background neon glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      {/* Language Toggle floating button */}
      <div className="absolute top-6 right-6 z-25">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleLanguage} 
          className="h-10 px-3 flex items-center space-x-2 text-xs border-border/60 hover:border-primary/50"
        >
          <Languages size={14} className="text-primary" />
          <span className="font-semibold uppercase">{language === 'en' ? 'ES' : 'EN'}</span>
        </Button>
      </div>

      <div className="w-full max-w-[420px] z-10">
        
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8 space-y-3">
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-xl shadow-primary/5 animate-pulse">
            <Cpu size={32} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">{t('nav.brand')}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {t('auth.sub')}
            </p>
          </div>
        </div>

        <Card className="glass shadow-2xl border-border/80">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-center">{t('auth.welcome')}</CardTitle>
            <CardDescription className="text-center text-xs">
              {t('auth.desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {error && (
                <div className="flex items-start space-x-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive-foreground text-xs leading-normal">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">{t('auth.user')}</label>
                <Input
                  type="text"
                  placeholder={t('auth.placeholder.user')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">{t('auth.pass')}</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full mt-2" 
                loading={loading}
              >
                {t('auth.btn')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info footer */}
        <p className="text-center text-[10px] text-muted-foreground/60 mt-6 tracking-wide">
          {t('auth.footer')}
        </p>
      </div>
    </div>
  );
};
