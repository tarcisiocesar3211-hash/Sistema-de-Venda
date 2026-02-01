'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, parseISO } from 'date-fns';

type Payment = {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: string;
  date: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const storedPayments = localStorage.getItem('payments');
    if (storedPayments) {
      const parsedPayments: Payment[] = JSON.parse(storedPayments);
      const sortedPayments = parsedPayments.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setPayments(sortedPayments);
    }
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Dashboard de Entradas
        </h2>
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
    </div>
  );
}
