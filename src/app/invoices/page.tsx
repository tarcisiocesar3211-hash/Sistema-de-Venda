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
import { invoices } from '@/lib/data';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';

export default function InvoicesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Faturas
        </h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Fatura
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fatura #</TableHead>
              <TableHead>Nome do Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Vencimento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.invoice}>
                <TableCell className="font-medium">{invoice.invoice}</TableCell>
                <TableCell>{invoice.clientName}</TableCell>
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
                        invoice.status === 'Pago' && 'bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400',
                        invoice.status === 'Pendente' && 'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
                        invoice.status === 'Atrasado' && 'bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400',
                        'border-none'
                    )}
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>{invoice.dueDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
