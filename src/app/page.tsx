'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DollarSign, Users, CreditCard, Activity } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';
import {
  clients as clientsData,
  invoices as initialInvoices,
  plans as initialPlans,
} from '@/lib/data';
import {
  getMonth,
  getYear,
  parseISO,
  isToday,
  isYesterday,
  differenceInDays,
  format,
} from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Sale = {
  id: string;
  name: string;
  email: string;
  amount: string;
  planName: string;
};

type Payment = {
  id: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  amount: string;
  date: string;
};

type Plan = {
  id: string;
  name: string;
  price: string;
};

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  planId: string;
  dueDate: string;
  tela?: string;
  pin?: string;
};

type Invoice = {
  invoice: string;
  clientName: string;
  parcela?: string;
  amount: string;
  status: 'Pago' | 'Pendente' | 'Atrasado';
  dueDate: string;
};

type OpenDueClient = Client & {
  statusText: string;
  statusType: 'Vencido' | 'Vence Hoje' | 'Pago';
  planName: string;
  planPrice: string;
};

export default function DashboardPage() {
  const userAvatar = placeholderImages.find((img) => img.id === 'user-avatar');
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);
  const [salesToday, setSalesToday] = useState(0);
  const [salesChange, setSalesChange] = useState(0);
  const [dueTodayCount, setDueTodayCount] = useState(0);
  const [openDues, setOpenDues] = useState<OpenDueClient[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);

  const getStatus = (
    dueDate: string
  ): {
    text: string;
    type: 'Vencido' | 'Vence Hoje' | 'Pago';
  } => {
    if (!dueDate) return { text: '', type: 'Pago' };

    const date = parseISO(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDateMidnight = new Date(date);
    dueDateMidnight.setHours(0, 0, 0, 0);

    const daysDiff = differenceInDays(dueDateMidnight, today);

    if (daysDiff < 0) {
      return { text: `Vencido há ${-daysDiff} dia(s)`, type: 'Vencido' };
    }
    if (daysDiff === 0) {
      return { text: 'Vence hoje', type: 'Vence Hoje' };
    }

    if (daysDiff > 0) {
      return { text: `Faltam ${daysDiff} dia(s)`, type: 'Pago' };
    }

    return { text: '', type: 'Pago' };
  };

  useEffect(() => {
    try {
      const storedPayments = localStorage.getItem('payments');
      if (storedPayments) {
        const payments: Payment[] = JSON.parse(storedPayments);
        const now = new Date();
        const currentMonth = getMonth(now);
        const currentYear = getYear(now);
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevMonthYear =
          currentMonth === 0 ? currentYear - 1 : currentYear;

        let currentMonthRevenue = 0;
        let lastMonthRevenue = 0;
        let total = 0;
        let todaySalesValue = 0;
        let yesterdaySalesValue = 0;

        payments.forEach((p) => {
          const paymentDate = parseISO(p.date);
          const amountString = p.amount.replace(/[^\d,]/g, '').replace(',', '.');
          const amount = parseFloat(amountString);

          if (!isNaN(amount)) {
            total += amount;
            const paymentMonth = getMonth(paymentDate);
            const paymentYear = getYear(paymentDate);

            if (paymentYear === currentYear && paymentMonth === currentMonth) {
              currentMonthRevenue += amount;
            } else if (
              paymentYear === prevMonthYear &&
              paymentMonth === prevMonth
            ) {
              lastMonthRevenue += amount;
            }

            if (isToday(paymentDate)) {
              todaySalesValue += amount;
            } else if (isYesterday(paymentDate)) {
              yesterdaySalesValue += amount;
            }
          }
        });

        setTotalRevenue(total);

        if (lastMonthRevenue > 0) {
          const change =
            ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
          setRevenueChange(change);
        } else if (currentMonthRevenue > 0) {
          setRevenueChange(100);
        } else {
          setRevenueChange(0);
        }

        setSalesToday(todaySalesValue);
        if (yesterdaySalesValue > 0) {
          const change =
            ((todaySalesValue - yesterdaySalesValue) / yesterdaySalesValue) *
            100;
          setSalesChange(change);
        } else if (todaySalesValue > 0) {
          setSalesChange(100);
        } else {
          setSalesChange(0);
        }
      }
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      setTotalRevenue(0);
      setRevenueChange(0);
      setSalesToday(0);
      setSalesChange(0);
    }

    try {
      const storedClients = localStorage.getItem('clients');
      const clients: Client[] = storedClients
        ? JSON.parse(storedClients)
        : clientsData;
      setTotalClients(clients.length);

      const storedPlans = localStorage.getItem('plans');
      const plans: Plan[] = storedPlans
        ? JSON.parse(storedPlans)
        : initialPlans;

      const storedPayments = localStorage.getItem('payments');
      if (storedPayments) {
        const payments: Payment[] = JSON.parse(storedPayments);
        const sortedPayments = payments.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const latestSales = sortedPayments.slice(0, 5).map((p) => {
          const client = p.clientId
            ? clients.find((c) => c.id === p.clientId)
            : undefined;
          const plan = client
            ? plans.find((pl) => pl.id === client.planId)
            : undefined;
          return {
            id: p.id,
            name: p.clientName,
            email: p.clientEmail,
            amount: p.amount,
            planName: plan ? plan.name : 'N/A',
          };
        });
        setRecentSales(latestSales);
      } else {
        setRecentSales([]);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dueToday = clients.filter(
        (client) => client.dueDate && isToday(parseISO(client.dueDate))
      ).length;
      setDueTodayCount(dueToday);

      const openDuesClients = clients
        .filter((client) => {
          if (!client.dueDate) return false;
          const dueDate = parseISO(client.dueDate);
          const dueDateMidnight = new Date(dueDate);
          dueDateMidnight.setHours(0, 0, 0, 0);
          const daysDiff = differenceInDays(dueDateMidnight, today);
          return daysDiff <= 0;
        })
        .map((client) => {
          const status = getStatus(client.dueDate);
          const plan = plans.find((p) => p.id === client.planId);
          return {
            ...client,
            statusText: status.text,
            statusType: status.type,
            planName: plan ? plan.name : 'N/A',
            planPrice: plan ? plan.price : 'N/A',
          };
        })
        .sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );

      setOpenDues(openDuesClients);
    } catch (error) {
      console.error('Failed to load clients from localStorage', error);
      setTotalClients(clientsData.length);

      const storedPlans = localStorage.getItem('plans');
      const plans: Plan[] = storedPlans
        ? JSON.parse(storedPlans)
        : initialPlans;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueToday = clientsData.filter(
        (client) => client.dueDate && isToday(parseISO(client.dueDate))
      ).length;
      setDueTodayCount(dueToday);

      const openDuesClients = clientsData
        .filter((client) => {
          if (!client.dueDate) return false;
          const dueDate = parseISO(client.dueDate);
          const dueDateMidnight = new Date(dueDate);
          dueDateMidnight.setHours(0, 0, 0, 0);
          const daysDiff = differenceInDays(dueDateMidnight, today);
          return daysDiff <= 0;
        })
        .map((client) => {
          const status = getStatus(client.dueDate);
          const plan = plans.find((p) => p.id === client.planId);
          return {
            ...client,
            statusText: status.text,
            statusType: status.type,
            planName: plan ? plan.name : 'N/A',
            planPrice: plan ? plan.price : 'N/A',
          };
        })
        .sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );

      setOpenDues(openDuesClients);
    }

    try {
      const storedInvoices = localStorage.getItem('invoices');
      const invoices: Invoice[] = storedInvoices
        ? JSON.parse(storedInvoices)
        : initialInvoices;

      const pending = invoices.filter(
        (invoice) => invoice.status === 'Pendente'
      );
      setPendingInvoices(pending);
    } catch (error) {
      console.error('Failed to load invoices from localStorage', error);
      setPendingInvoices([]);
    }
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">
        Painel
      </h2>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalRevenue.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-xs text-muted-foreground">
                {revenueChange >= 0 ? '+' : ''}
                {revenueChange.toFixed(1).replace('.', ',')}% do mês passado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
              <p className="text-xs text-muted-foreground">
                Total de clientes registrados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vendas (Hoje)
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {salesToday.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-xs text-muted-foreground">
                {salesChange >= 0 ? '+' : ''}
                {salesChange.toFixed(1).replace('.', ',')}% de ontem
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vencendo Hoje
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dueTodayCount}</div>
              <p className="text-xs text-muted-foreground">
                Total de clientes com vencimento hoje
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Vencimento em Aberto</CardTitle>
              <CardDescription>
                Clientes com vencimentos hoje ou em atraso.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {openDues.length > 0 ? (
                  <>
                    <div className="grid grid-cols-12 items-center gap-4 text-xs font-medium text-muted-foreground border-b pb-2">
                      <div className="col-span-2">Nome</div>
                      <div className="col-span-3">E-mail</div>
                      <div className="col-span-2">Telefone</div>
                      <div className="col-span-1">Plano</div>
                      <div className="col-span-2">Valor</div>
                      <div className="col-span-2 text-right">Status</div>
                    </div>
                    <div className="space-y-4">
                      {openDues.map((client) => (
                        <div
                          className="grid grid-cols-12 items-center gap-4"
                          key={client.id}
                        >
                          <p className="col-span-2 text-sm font-medium leading-none truncate">
                            {client.name}
                          </p>
                          <p className="col-span-3 text-sm text-muted-foreground truncate">
                            {client.email}
                          </p>
                          <p className="col-span-2 text-sm text-muted-foreground truncate">
                            {client.phone}
                          </p>
                          <p className="col-span-1 text-sm text-muted-foreground truncate">
                            {client.planName}
                          </p>
                          <p className="col-span-2 text-sm text-muted-foreground truncate">
                            {client.planPrice}
                          </p>
                          <div className="col-span-2 font-medium text-right">
                            <Badge
                              variant={
                                client.statusType === 'Vencido'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className={cn(
                                client.statusType === 'Vence Hoje' &&
                                  'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
                                client.statusType === 'Vencido' &&
                                  'bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400',
                                'border-none'
                              )}
                            >
                              {client.statusText}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum vencimento em aberto.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
              <CardTitle>Vendas Recentes</CardTitle>
              <CardDescription>As suas vendas mais recentes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSales.length > 0 ? (
                  <>
                    <div className="grid grid-cols-8 items-center gap-4 text-xs font-medium text-muted-foreground border-b pb-2">
                      <div className="col-span-2">Nome</div>
                      <div className="col-span-3">E-mail</div>
                      <div className="col-span-1">Plano</div>
                      <div className="col-span-2 text-right">Valor</div>
                    </div>
                    <div className="space-y-4">
                      {recentSales.map((sale) => (
                        <div
                          className="grid grid-cols-8 items-center gap-4"
                          key={sale.id}
                        >
                          <p className="col-span-2 text-sm font-medium leading-none truncate">
                            {sale.name}
                          </p>
                          <p className="col-span-3 text-sm text-muted-foreground truncate">
                            {sale.email}
                          </p>
                          <p className="col-span-1 text-sm text-muted-foreground truncate">
                            {sale.planName}
                          </p>
                          <div className="col-span-2 font-medium text-right">
                            {sale.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma venda recente.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Faturas Pendentes</CardTitle>
              <CardDescription>Faturas aguardando pagamento.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {pendingInvoices.length > 0 ? (
                  pendingInvoices.map((invoice) => (
                    <div className="flex items-center" key={invoice.invoice}>
                      <Avatar className="h-9 w-9">
                        {userAvatar && (
                          <AvatarImage
                            src={userAvatar.imageUrl}
                            alt="Avatar"
                            data-ai-hint={userAvatar.imageHint}
                          />
                        )}
                        <AvatarFallback>
                          {invoice.clientName
                            ? invoice.clientName.charAt(0)
                            : ''}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {invoice.clientName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vencimento:{' '}
                          {format(parseISO(invoice.dueDate), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        {invoice.amount}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma fatura pendente.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
