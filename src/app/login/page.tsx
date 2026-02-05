'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useAuth, useUser, initiateAnonymousSignIn } from '@/firebase';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const fixedPassword = 'T@rcio2010';
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = () => {
    if (password === fixedPassword) {
      initiateAnonymousSignIn(auth);
    } else {
      toast({
        variant: 'destructive',
        title: 'Senha incorreta',
        description: 'Por favor, tente novamente.',
      });
    }
  };
  
  if (isUserLoading || user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="https://cdn.ereemby.com/attachments/17535888867771941imagem.png" alt="Visão de Vendas Logo" width={48} height={48} />
          </div>
          <CardTitle className="text-2xl font-bold font-headline">Visão de Vendas</CardTitle>
          <CardDescription>Acesse seu painel de vendas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Entrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
