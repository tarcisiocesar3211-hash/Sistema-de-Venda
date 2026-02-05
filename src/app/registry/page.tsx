'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { format, subHours, subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type Session = {
  id: string;
  ipAddress: string;
  location: string;
  lastSeen: Date;
  userAgent: string;
  isCurrent?: boolean;
};

// Mock function to get user agent info
const getDeviceType = (userAgent: string) => {
    if (/mobile/i.test(userAgent)) return "Celular";
    if (/tablet/i.test(userAgent)) return "Tablet";
    if (/windows/i.test(userAgent)) return "Windows";
    if (/mac os/i.test(userAgent)) return "Mac";
    if (/linux/i.test(userAgent)) return "Linux";
    return "Desconhecido";
}

export default function RegistryPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [sessions, setSessions] = useState<Session[]>([
      {
        id: 'SESSION1',
        ipAddress: '187.75.123.45',
        location: 'Recife, BR',
        lastSeen: new Date(),
        userAgent: `${getDeviceType(typeof navigator !== 'undefined' ? navigator.userAgent : '')} (Este dispositivo)`,
        isCurrent: true,
      },
      {
        id: 'SESSION2',
        ipAddress: '200.150.98.21',
        location: 'São Paulo, BR',
        lastSeen: subHours(new Date(), 3),
        userAgent: 'Celular (Android)',
      },
      {
        id: 'SESSION3',
        ipAddress: '177.45.67.89',
        location: 'Rio de Janeiro, BR',
        lastSeen: subDays(new Date(), 1),
        userAgent: 'Windows (Chrome)',
      },
  ]);

  const [deletionTarget, setDeletionTarget] = useState<string | null>(null);

  const handleRemoveDevice = () => {
    if (!deletionTarget) return;

    const sessionToRemove = sessions.find(s => s.id === deletionTarget);
    
    if (sessionToRemove?.isCurrent && auth) {
        auth.signOut().then(() => {
            router.push('/login');
        });
    } else {
        setSessions(prev => prev.filter(s => s.id !== deletionTarget));
        toast({
            title: 'Dispositivo removido',
            description: 'A sessão foi encerrada e o dispositivo precisará fazer login novamente no próximo acesso.',
        })
    }
    setDeletionTarget(null);
  };
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Registro de Acessos
        </h2>
      </div>
      <p className="text-muted-foreground">
        Esta é uma lista de dispositivos que acessaram o sistema. Remover um dispositivo irá forçá-lo a fazer login novamente.
      </p>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Endereço IP</TableHead>
              <TableHead>Localização (Aproximada)</TableHead>
              <TableHead>Dispositivo</TableHead>
              <TableHead>Último Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="font-medium">{session.ipAddress}</TableCell>
                <TableCell>{session.location}</TableCell>
                <TableCell>{session.userAgent}</TableCell>
                <TableCell>{format(session.lastSeen, "dd/MM/yyyy 'às' HH:mm")}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletionTarget(session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       <AlertDialog
        open={deletionTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletionTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação desconectará o dispositivo selecionado. Ele precisará inserir a senha novamente para acessar o sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleRemoveDevice}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
