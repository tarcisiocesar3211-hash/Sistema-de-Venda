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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
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
import { format, parseISO } from 'date-fns';
import {
  useFirebase,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { SHARED_USER_ID } from '@/lib/shared-user';

type Invoice = {
  invoice: string;
  ownerId: string;
  clientName: string;
  parcela?: string;
  amount: string;
  status: 'Pago' | 'Pendente' | 'Atrasado';
  dueDate: string;
};

export default function InvoicesPage() {
  const { firestore } = useFirebase();

  const invoicesQuery = useMemoFirebase(
    () =>
      firestore ? collection(firestore, 'users', SHARED_USER_ID, 'invoices') : null,
    [firestore]
  );
  const { data: invoicesData } = useCollection<Invoice>(invoicesQuery);
  const invoices = useMemo(() => {
    if (!invoicesData) return [];
    return [...invoicesData].sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );
  }, [invoicesData]);

  const [deletionTarget, setDeletionTarget] = useState<string | null>(null);

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [newDebtor, setNewDebtor] = useState('');
  const [newParcela, setNewParcela] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newStatus, setNewStatus] = useState<
    'Pago' | 'Pendente' | 'Atrasado' | ''
  >('');
  const [newDueDate, setNewDueDate] = useState('');

  const handleAddInvoice = () => {
    if (!newDebtor || !newAmount || !newStatus || !newDueDate || !firestore) return;

    const newInvoiceId = `INV${Date.now()}`;
    const newInvoice: Omit<Invoice, 'invoice'> & { invoice: string } = {
      invoice: newInvoiceId,
      ownerId: SHARED_USER_ID,
      clientName: newDebtor,
      parcela: newParcela,
      amount: newAmount,
      status: newStatus as 'Pago' | 'Pendente' | 'Atrasado',
      dueDate: newDueDate,
    };
    
    const invoiceRef = doc(firestore, 'users', SHARED_USER_ID, 'invoices', newInvoiceId);
    setDocumentNonBlocking(invoiceRef, newInvoice, {merge: true});


    setNewDebtor('');
    setNewParcela('');
    setNewAmount('');
    setNewStatus('');
    setNewDueDate('');
    setIsAddSheetOpen(false);
  };

  const handleRemoveInvoice = (invoiceId: string) => {
    if(!firestore) return;
    const invoiceRef = doc(firestore, 'users', SHARED_USER_ID, 'invoices', invoiceId);
    deleteDocumentNonBlocking(invoiceRef);
    setDeletionTarget(null);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Faturas
        </h2>
        <div className="flex items-center space-x-2">
          <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Criar Fatura
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Criar uma nova fatura</SheetTitle>
                <SheetDescription>
                  Preencha o formulário abaixo para adicionar uma nova fatura.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="devedor" className="text-right">
                    Devedor
                  </Label>
                  <Input
                    id="devedor"
                    placeholder="Nome do cliente"
                    className="col-span-3"
                    value={newDebtor}
                    onChange={(e) => setNewDebtor(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parcela" className="text-right">
                    Parcela
                  </Label>
                  <Input
                    id="parcela"
                    placeholder="Opcional"
                    className="col-span-3"
                    value={newParcela}
                    onChange={(e) => setNewParcela(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="valor" className="text-right">
                    Valor
                  </Label>
                  <Input
                    id="valor"
                    placeholder="R$ 0,00"
                    className="col-span-3"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={newStatus}
                    onValueChange={(value) =>
                      setNewStatus(value as 'Pago' | 'Pendente' | 'Atrasado')
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Atrasado">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right">
                    Data de Pagamento
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    className="col-span-3"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddInvoice} className="w-full">
                  Salvar fatura
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fatura #</TableHead>
              <TableHead>Nome do Cliente</TableHead>
              <TableHead>Parcela</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Pagamento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.invoice}>
                <TableCell className="font-medium">{invoice.invoice}</TableCell>
                <TableCell>{invoice.clientName}</TableCell>
                <TableCell>{invoice.parcela || 'N/A'}</TableCell>
                <TableCell>{invoice.amount}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invoice.status === 'Pago'
                        ? 'default'
                        : invoice.status === 'Pendente'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className={cn(
                      invoice.status === 'Pago' &&
                        'bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400',
                      invoice.status === 'Pendente' &&
                        'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
                      invoice.status === 'Atrasado' &&
                        'bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400',
                      'border-none'
                    )}
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(parseISO(invoice.dueDate), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      /* Lógica de edição aqui */
                    }}
                    disabled
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletionTarget(invoice.invoice)}
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
              Essa ação não pode ser desfeita. Isso irá apagar permanentemente
              esta fatura.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletionTarget) {
                  handleRemoveInvoice(deletionTarget);
                }
              }}
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
