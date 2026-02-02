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
import { format, parseISO } from 'date-fns';
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
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { SHARED_USER_ID } from '@/lib/shared-user';

type Payment = {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: string;
  date: string;
};

export default function PaymentsPage() {
  const { firestore } = useFirebase();

  const paymentsQuery = useMemoFirebase(
    () =>
      firestore ? collection(firestore, 'users', SHARED_USER_ID, 'payments') : null,
    [firestore]
  );
  const { data: paymentsData } = useCollection<Payment>(paymentsQuery);
  const payments = useMemo(() => {
    if (!paymentsData) return [];
    return [...paymentsData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [paymentsData]);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const handleDeleteAllPayments = async () => {
    if (!firestore || !paymentsQuery) return;
    const batch = writeBatch(firestore);
    const querySnapshot = await getDocs(paymentsQuery);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    setIsDeleteAlertOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Dashboard de Entradas
        </h2>
        <Button
          variant="destructive"
          onClick={() => setIsDeleteAlertOpen(true)}
          disabled={payments.length === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Apagar Tudo
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data de Pagamento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.clientName}
                  </TableCell>
                  <TableCell>{payment.clientEmail}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>
                    {format(parseISO(payment.date), 'dd/MM/yyyy')}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhum pagamento registrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <AlertDialog
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá apagar permanentemente
              todo o histórico de pagamentos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteAllPayments}
            >
              Apagar Tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
