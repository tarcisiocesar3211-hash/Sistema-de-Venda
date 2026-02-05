'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { PlusCircle, Trash2, Pencil, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  useFirebase,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
} from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { SHARED_USER_ID } from '@/lib/shared-user';

const statuses = ['Estoque', 'Vendido', 'Caida'] as const;
type Status = (typeof statuses)[number];

type Account = {
  id: string;
  ownerId: string;
  email: string;
  senha: string;
  tela: string;
  pin: string;
  remetente: string;
  categoria: string;
  status: Status;
  observacao?: string;
};

const categories = [
  'Netflix',
  'Disney',
  'HBO',
  'Spotify',
  'Globoplay',
  'Paramount',
  'ClaroTV+',
  'Deezer',
  'UFC',
  'NBA',
  'Capcut',
  'Crunchyroll',
  'Prime Video',
  'Xbox',
];

export default function EstoquePage() {
  const { firestore } = useFirebase();

  const accountsQuery = useMemoFirebase(
    () =>
      firestore
        ? collection(firestore, 'users', SHARED_USER_ID, 'accounts')
        : null,
    [firestore]
  );
  const { data: accounts } = useCollection<Account>(accountsQuery);

  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [deletionTarget, setDeletionTarget] = useState<
    string | 'selected' | null
  >(null);
  const { toast } = useToast();
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  // Form states for adding
  const [newEmail, setNewEmail] = useState('');
  const [newSenha, setNewSenha] = useState('');
  const [newTela, setNewTela] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRemetente, setNewRemetente] = useState('');
  const [newCategoria, setNewCategoria] = useState('');
  const [newStatus, setNewStatus] = useState<Status | ''>('');
  const [newObservacao, setNewObservacao] = useState('');

  // State for editing an account
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedSenha, setEditedSenha] = useState('');
  const [editedTela, setEditedTela] = useState('');
  const [editedPin, setEditedPin] = useState('');
  const [editedRemetente, setEditedRemetente] = useState('');
  const [editedCategoria, setEditedCategoria] = useState('');
  const [editedStatus, setEditedStatus] = useState<Status>('Estoque');
  const [editedObservacao, setEditedObservacao] = useState('');

  useEffect(() => {
    if (editingAccount) {
      setEditedEmail(editingAccount.email);
      setEditedSenha(editingAccount.senha);
      setEditedTela(editingAccount.tela);
      setEditedPin(editingAccount.pin);
      setEditedRemetente(editingAccount.remetente);
      setEditedCategoria(editingAccount.categoria);
      setEditedStatus(editingAccount.status);
      setEditedObservacao(editingAccount.observacao || '');
    }
  }, [editingAccount]);

  const handleAddAccount = () => {
    if (!newEmail || !newSenha || !newCategoria || !newStatus || !firestore) {
      return;
    }

    const newAccountId = `ACC${Date.now()}`;
    const newAccount: Omit<Account, 'id'> = {
      ownerId: SHARED_USER_ID,
      email: newEmail,
      senha: newSenha,
      tela: newTela,
      pin: newPin,
      remetente: newRemetente,
      categoria: newCategoria,
      status: newStatus,
      observacao: newObservacao,
    };

    const accountRef = doc(
      firestore,
      'users',
      SHARED_USER_ID,
      'accounts',
      newAccountId
    );
    setDocumentNonBlocking(accountRef, newAccount, { merge: true });

    setNewEmail('');
    setNewSenha('');
    setNewTela('');
    setNewPin('');
    setNewRemetente('');
    setNewCategoria('');
    setNewStatus('');
    setNewObservacao('');
    setIsAddSheetOpen(false);
  };

  const handleRemoveAccount = (id: string) => {
    if (!firestore) return;
    const accountRef = doc(firestore, 'users', SHARED_USER_ID, 'accounts', id);
    deleteDocumentNonBlocking(accountRef);
    setDeletionTarget(null);
  };

  const handleUpdateAccount = () => {
    if (
      !editingAccount ||
      !editedEmail ||
      !editedSenha ||
      !editedCategoria ||
      !editedStatus ||
      !firestore
    ) {
      return;
    }

    const updatedAccountData = {
      email: editedEmail,
      senha: editedSenha,
      tela: editedTela,
      pin: editedPin,
      remetente: editedRemetente,
      categoria: editedCategoria,
      status: editedStatus,
      observacao: editedObservacao,
    };

    const accountRef = doc(
      firestore,
      'users',
      SHARED_USER_ID,
      'accounts',
      editingAccount.id
    );
    setDocumentNonBlocking(accountRef, updatedAccountData, { merge: true });

    setIsEditSheetOpen(false);
    setEditingAccount(null);
  };

  const handleCopyAccount = (account: Account) => {
    const textToCopy = `E-mail: ${account.email} - Senha: ${account.senha} - Tela: ${account.tela} - Pin: ${account.pin}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: 'Copiado!',
        description:
          'Os dados da conta foram copiados para a área de transferência.',
      });
    });
  };

  const filteredAccounts = useMemo(() => {
    if (!accounts) return [];
    if (selectedCategory === 'Todos') {
      return accounts;
    }
    return accounts.filter((acc) => acc.categoria === selectedCategory);
  }, [accounts, selectedCategory]);

  const allVisibleSelected = useMemo(() => {
    if (filteredAccounts.length === 0) return false;
    return filteredAccounts.every((acc) => selectedAccounts.includes(acc.id));
  }, [filteredAccounts, selectedAccounts]);

  const handleSelectAllVisible = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const visibleIds = filteredAccounts.map((acc) => acc.id);
      setSelectedAccounts((prev) => [...new Set([...prev, ...visibleIds])]);
    } else {
      const visibleIds = filteredAccounts.map((acc) => acc.id);
      setSelectedAccounts((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    }
  };

  const handleCopySelectedAccounts = () => {
    if (selectedAccounts.length === 0 || !accounts) return;

    const textToCopy = accounts
      .filter((acc) => selectedAccounts.includes(acc.id))
      .map(
        (account) =>
          `Categoria: ${account.categoria}\nE-mail: ${account.email}\nSenha: ${
            account.senha
          }\nTela: ${account.tela}\nPin: ${account.pin}\nRemetente: ${
            account.remetente
          }\nStatus: ${account.status}\nObservação: ${account.observacao || ''}`
      )
      .join('\n\n---\n\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: 'Contas copiadas!',
        description: 'Os dados das contas selecionadas foram copiados.',
      });
    });
  };

  const handleDeleteSelectedAccounts = () => {
    if (selectedAccounts.length === 0 || !firestore) return;

    const batch = writeBatch(firestore);
    selectedAccounts.forEach((accountId) => {
      const accountRef = doc(
        firestore,
        'users',
        SHARED_USER_ID,
        'accounts',
        accountId
      );
      batch.delete(accountRef);
    });

    batch
      .commit()
      .then(() => {
        setSelectedAccounts([]);
        setDeletionTarget(null);
      })
      .catch((error) => {
        console.error('Error deleting selected accounts: ', error);
        toast({
          variant: 'destructive',
          title: 'Erro!',
          description: 'Não foi possível apagar as contas selecionadas.',
        });
      });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Estoque
        </h2>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={selectedAccounts.length === 0}>
                Ações em Massa
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleCopySelectedAccounts}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Selecionadas
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeletionTarget('selected')}
                className="text-red-500 hover:text-red-500 focus:text-red-500"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Apagar Selecionadas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Conta
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Adicionar nova conta</SheetTitle>
                <SheetDescription>
                  Preencha os dados para adicionar uma nova conta ao estoque.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="categoria" className="text-right">
                    Categoria
                  </Label>
                  <Select value={newCategoria} onValueChange={setNewCategoria}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={newStatus}
                    onValueChange={(value) => setNewStatus(value as Status)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    placeholder="email@exemplo.com"
                    className="col-span-3"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="senha" className="text-right">
                    Senha
                  </Label>
                  <Input
                    id="senha"
                    placeholder="Sua senha"
                    className="col-span-3"
                    value={newSenha}
                    onChange={(e) => setNewSenha(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tela" className="text-right">
                    Tela
                  </Label>
                  <Input
                    id="tela"
                    placeholder="Ex: Perfil 1"
                    className="col-span-3"
                    value={newTela}
                    onChange={(e) => setNewTela(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pin" className="text-right">
                    PIN
                  </Label>
                  <Input
                    id="pin"
                    placeholder="Ex: 1234"
                    className="col-span-3"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="remetente" className="text-right">
                    Remetente
                  </Label>
                  <Input
                    id="remetente"
                    placeholder="Nome do remetente"
                    className="col-span-3"
                    value={newRemetente}
                    onChange={(e) => setNewRemetente(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="observacao" className="text-right">
                    Observação
                  </Label>
                  <Textarea
                    id="observacao"
                    placeholder="Qualquer observação"
                    className="col-span-3"
                    value={newObservacao}
                    onChange={(e) => setNewObservacao(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddAccount} className="w-full">
                  Salvar conta
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="Todos">Todos</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={allVisibleSelected}
                  onCheckedChange={handleSelectAllVisible}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Senha</TableHead>
              <TableHead>Tela</TableHead>
              <TableHead>PIN</TableHead>
              <TableHead>Remetente</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Observação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <TableRow
                  key={account.id}
                  data-state={
                    selectedAccounts.includes(account.id) && 'selected'
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedAccounts.includes(account.id)}
                      onCheckedChange={(checked) => {
                        setSelectedAccounts(
                          checked
                            ? [...selectedAccounts, account.id]
                            : selectedAccounts.filter(
                                (id) => id !== account.id
                              )
                        );
                      }}
                      aria-label="Selecionar linha"
                    />
                  </TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.senha}</TableCell>
                  <TableCell>{account.tela}</TableCell>
                  <TableCell>{account.pin}</TableCell>
                  <TableCell>{account.remetente}</TableCell>
                  <TableCell>{account.categoria}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        account.status === 'Vendido'
                          ? 'default'
                          : account.status === 'Caida'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className={cn(
                        account.status === 'Vendido' &&
                          'bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400',
                        account.status === 'Estoque' &&
                          'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
                        account.status === 'Caida' &&
                          'bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400',
                        'border-none'
                      )}
                    >
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{account.observacao}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyAccount(account)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingAccount(account);
                        setIsEditSheetOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletionTarget(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  Nenhuma conta encontrada.
                </TableCell>
              </TableRow>
            )}
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
              Essa ação não pode ser desfeita. Isso irá apagar permanentemente{' '}
              {deletionTarget === 'selected'
                ? 'as contas selecionadas'
                : 'esta conta'}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletionTarget === 'selected') {
                  handleDeleteSelectedAccounts();
                } else if (deletionTarget) {
                  handleRemoveAccount(deletionTarget as string);
                }
              }}
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar conta</SheetTitle>
            <SheetDescription>Atualize os dados da conta.</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-categoria" className="text-right">
                Categoria
              </Label>
              <Select
                value={editedCategoria}
                onValueChange={setEditedCategoria}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <Select
                value={editedStatus}
                onValueChange={(value) => setEditedStatus(value as Status)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                E-mail
              </Label>
              <Input
                id="edit-email"
                placeholder="email@exemplo.com"
                className="col-span-3"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-senha" className="text-right">
                Senha
              </Label>
              <Input
                id="edit-senha"
                placeholder="Sua senha"
                className="col-span-3"
                value={editedSenha}
                onChange={(e) => setEditedSenha(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-tela" className="text-right">
                Tela
              </Label>
              <Input
                id="edit-tela"
                placeholder="Ex: Perfil 1"
                className="col-span-3"
                value={editedTela}
                onChange={(e) => setEditedTela(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-pin" className="text-right">
                PIN
              </Label>
              <Input
                id="edit-pin"
                placeholder="Ex: 1234"
                className="col-span-3"
                value={editedPin}
                onChange={(e) => setEditedPin(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-remetente" className="text-right">
                Remetente
              </Label>
              <Input
                id="edit-remetente"
                placeholder="Nome do remetente"
                className="col-span-3"
                value={editedRemetente}
                onChange={(e) => setEditedRemetente(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-observacao" className="text-right">
                Observação
              </Label>
              <Textarea
                id="edit-observacao"
                placeholder="Qualquer observação"
                className="col-span-3"
                value={editedObservacao}
                onChange={(e) => setEditedObservacao(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdateAccount} className="w-full">
              Salvar alterações
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
