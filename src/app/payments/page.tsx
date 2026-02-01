import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { payments } from '@/lib/data';
import { cn } from '@/lib/utils';

export default function PaymentsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Pagamentos
        </h2>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID da Fatura</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.invoiceId}>
                <TableCell className="font-medium">
                  {payment.invoiceId}
                </TableCell>
                <TableCell>{payment.client}</TableCell>
                <TableCell>{payment.amount}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      payment.status === 'Pago'
                        ? 'default'
                        : payment.status === 'Pendente'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className={cn(
                        payment.status === 'Pago' && 'bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400',
                        payment.status === 'Pendente' && 'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
                        payment.status === 'Atrasado' && 'bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400',
                        'border-none'
                    )}
                  >
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>{payment.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
