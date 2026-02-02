'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { placeholderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';

export function UserNav() {
  const userAvatar = placeholderImages.find(img => img.id === 'user-avatar');
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();

  const handleCopyLink = (link: string, label: string) => {
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: 'Link copiado!',
        description: `${label} copiado para a área de transferência.`,
      });
    });
  };

  const handleLogout = () => {
    auth.signOut();
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="@shadcn" data-ai-hint={userAvatar.imageHint} />}
            <AvatarFallback>VV</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Visão de Vendas</p>
            <p className="text-xs leading-none text-muted-foreground">
              {auth.currentUser?.email || 'Anônimo'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleCopyLink('https://www.telaup.shop/', 'Website')}>
            Website
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCopyLink('https://wa.me/558192369032', 'Contato ZAP')}>
            Contato ZAP
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCopyLink('https://ereemby.com/dashboard', 'Ereemby')}>
            Ereemby
          </DropdownMenuItem>
          <DropdownMenuItem>
            IPTV
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
