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
import { PlusCircle, Trash2, Pencil } from 'lucide-react';

type Account = {
  id: string;
  email: string;
  senha: string;
  tela: string;
  pin: string;
  remetente: string;
  categoria: string;
};

const categories = ['Netflix', 'Disney', 'HBO', 'Spotify', 'Globoplay'];
const initialAccounts: Account[] = [];

export default function EstoquePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [deletionTarget, setDeletionTarget] = useState<string | null>(null);

  // Form states for adding
  const [newEmail, setNewEmail] = useState('');
  const [newSenha, setNewSenha] = useState('');
  const [newTela, setNewTela] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRemetente, setNewRemetente] = useState('');
  const [newCategoria, setNewCategoria] = useState('');

  // State for editing an account
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedSenha, setEditedSenha] = useState('');
  const [editedTela, setEditedTela] = useState('');
  const [editedPin, setEditedPin] = useState('');
  const [editedRemetente, setEditedRemetente] = useState('');
  const [editedCategoria, setEditedCategoria] = useState('');

  useEffect(() => {
    try {
      const storedAccounts = localStorage.getItem('accounts');
      if (storedAccounts) {
        setAccounts(JSON.parse(storedAccounts));
      } else {
        setAccounts(initialAccounts);
        localStorage.setItem('accounts', JSON.stringify(initialAccounts));
      }
    } catch (error) {
      setAccounts(initialAccounts);
    }
  }, []);

  useEffect(() => {
    if (editingAccount) {
      setEditedEmail(editingAccount.email);
      setEditedSenha(editingAccount.senha);
      setEditedTela(editingAccount.tela);
      setEditedPin(editingAccount.pin);
      setEditedRemetente(editingAccount.remetente);
      setEditedCategoria(editingAccount.categoria);
    }
  }, [editingAccount]);

  const handleAddAccount = () => {
    if (!newEmail || !newSenha || !newCategoria) {
      // Basic validation
      return;
    }

    const newAccount: Account = {
      id: `ACC${Date.now()}`,
      email: newEmail,
      senha: newSenha,
      tela: newTela,
      pin: newPin,
      remetente: newRemetente,
      categoria: newCategoria,
    };

    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));

    // Reset form
    setNewEmail('');
    setNewSenha('');
    setNewTela('');
    setNewPin('');
    setNewRemetente('');
    setNewCategoria('');
    setIsAddSheetOpen(false);
  };

  const handleRemoveAccount = (id: string) => {
    const updatedAccounts = accounts.filter((acc) => acc.id !== id);
    setAccounts(updatedAccounts);
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    setDeletionTarget(null);
  };

  const handleUpdateAccount = () => {
    if (!editingAccount || !editedEmail || !editedSenha || !editedCategoria) {
      return;
    }

    const updatedAccounts = accounts.map((account) => {
      if (account.id === editingAccount.id) {
        return {
          ...account,
          email: editedEmail,
          senha: editedSenha,
          tela: editedTela,
          pin: editedPin,
          remetente: editedRemetente,
          categoria: editedCategoria,
        };
      }
      return account;
    });

    setAccounts(updatedAccounts);
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    setIsEditSheetOpen(false);
    setEditingAccount(null);
  };

  const filteredAccounts = useMemo(() => {
    if (selectedCategory === 'Todos') {
      return accounts;
    }
    return accounts.filter((acc) => acc.categoria === selectedCategory);
  }, [accounts, selectedCategory]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Estoque
        </h2>
        <div className="flex items-center space-x-2">
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
                <Button onClick={handleAddAccount} className="w-full">
                  Salvar conta
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
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
              <TableHead>E-mail</TableHead>
              <TableHead>Senha</TableHead>
              <TableHead>Tela</TableHead>
              <TableHead>PIN</TableHead>
              <TableHead>Remetente</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.senha}</TableCell>
                  <TableCell>{account.tela}</TableCell>
                  <TableCell>{account.pin}</TableCell>
                  <TableCell>{account.remetente}</TableCell>
                  <TableCell>{account.categoria}</TableCell>
                  <TableCell className="text-right">
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
                <TableCell colSpan={7} className="h-24 text-center">
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
              Essa ação não pode ser desfeita. Isso irá apagar permanentemente
              esta conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletionTarget) {
                  handleRemoveAccount(deletionTarget);
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
            <SheetDescription>
              Atualize os dados da conta.
            </SheetDescription>
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
            <Button onClick={handleUpdateAccount} className="w-full">
              Salvar alterações
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
