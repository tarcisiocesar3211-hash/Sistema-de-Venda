'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
  CalendarClock,
  Clock,
  AlertCircle,
  PlusCircle,
  Circle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';
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
import {
  useFirebase,
  useCollection,
  useMemoFirebase,
  setDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { SHARED_USER_ID } from '@/lib/shared-user';
import OutflowsChart from '@/components/outflows-chart';

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

type Annotation = {
  id: string;
  ownerId: string;
  title: string;
  text: string;
  status: 'pending' | 'done';
};

type OpenDueClient = Client & {
  statusText: string;
  statusType: 'Vencido' | 'Vence Hoje' | 'Pago';
  planName: string;
  planPrice: string;
};

export default function DashboardPage() {
  const { firestore } = useFirebase();

  const clientsQuery = useMemoFirebase(
    () =>
      firestore ? collection(firestore, 'users', SHARED_USER_ID, 'clients') : null,
    [firestore]
  );
  const { data: clientsData } = useCollection<Client>(clientsQuery);

  const paymentsQuery = useMemoFirebase(
    () =>
      firestore ? collection(firestore, 'users', SHARED_USER_ID, 'payments') : null,
    [firestore]
  );
  const { data: paymentsData } = useCollection<Payment>(paymentsQuery);

  const plansQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'plans') : null),
    [firestore]
  );
  const { data: initialPlans } = useCollection<Plan>(plansQuery);

  const invoicesQuery = useMemoFirebase(
    () =>
      firestore ? collection(firestore, 'users', SHARED_USER_ID, 'invoices') : null,
    [firestore]
  );
  const { data: initialInvoices } = useCollection<Invoice>(invoicesQuery);

  const annotationsQuery = useMemoFirebase(
    () =>
      firestore ? collection(firestore, 'users', SHARED_USER_ID, 'annotations') : null,
    [firestore]
  );
  const { data: annotationsData } = useCollection<Annotation>(annotationsQuery);

  const userAvatar = placeholderImages.find((img) => img.id === 'user-avatar');
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [clientsValue, setClientsValue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);
  const [salesToday, setSalesToday] = useState(0);
  const [salesChange, setSalesChange] = useState(0);
  const [dueTodayCount, setDueTodayCount] = useState(0);
  const [dueTodayValue, setDueTodayValue] = useState(0);
  const [dueTomorrowCount, setDueTomorrowCount] = useState(0);
  const [dueTomorrowValue, setDueTomorrowValue] = useState(0);
  const [openDues, setOpenDues] = useState<OpenDueClient[]>([]);
  
  const [outflowsChartData, setOutflowsChartData] = useState<{ name: string; total: number }[]>([]);
  const [openInvoices, setOpenInvoices] = useState<Invoice[]>([]);
  const [paidInvoices, setPaidInvoices] = useState<Invoice[]>([]);

  const [pendingAnnotations, setPendingAnnotations] = useState<Annotation[]>([]);
  const [doneAnnotations, setDoneAnnotations] = useState<Annotation[]>([]);
  const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

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
    if (paymentsData) {
      const payments: Payment[] = paymentsData;
      const now = new Date();
      const currentMonth = getMonth(now);
      const currentYear = getYear(now);
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevMonthYear =
        currentMonth === 0 ? currentYear - 1 : currentYear;

      let currentMonthRevenue = 0;
      let lastMonthRevenue = 0;
      let todaySalesValue = 0;
      let yesterdaySalesValue = 0;

      payments.forEach((p) => {
        const paymentDate = parseISO(p.date);
        const amountString = p.amount.replace(/[^\d,]/g, '').replace(',', '.');
        const amount = parseFloat(amountString);

        if (!isNaN(amount)) {
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

      setTotalRevenue(currentMonthRevenue);

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
  }, [paymentsData]);

  useEffect(() => {
    const clients: Client[] = clientsData ?? [];
    const plans: Plan[] = initialPlans ?? [];

    setTotalClients(clients.length);

    let totalValue = 0;
    if (clients.length > 0 && plans.length > 0) {
      clients.forEach((client) => {
        const plan = plans.find((p) => p.id === client.planId);
        if (plan && plan.price) {
          const amountString = plan.price
            .replace(/[^\d,]/g, '')
            .replace(',', '.');
          const amount = parseFloat(amountString);
          if (!isNaN(amount)) {
            totalValue += amount;
          }
        }
      });
    }
    setClientsValue(totalValue);

    if (paymentsData) {
      const payments: Payment[] = paymentsData;
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

    const dueTodayClients = clients.filter(
      (client) => client.dueDate && isToday(parseISO(client.dueDate))
    );
    setDueTodayCount(dueTodayClients.length);

    let todayValue = 0;
    if (dueTodayClients.length > 0 && plans.length > 0) {
      dueTodayClients.forEach((client) => {
        const plan = plans.find((p) => p.id === client.planId);
        if (plan && plan.price) {
          const amountString = plan.price
            .replace(/[^\d,]/g, '')
            .replace(',', '.');
          const amount = parseFloat(amountString);
          if (!isNaN(amount)) {
            todayValue += amount;
          }
        }
      });
    }
    setDueTodayValue(todayValue);

    const dueTomorrowClients = clients.filter((client) => {
      if (!client.dueDate) return false;
      const dueDate = parseISO(client.dueDate);
      const dueDateMidnight = new Date(dueDate);
      dueDateMidnight.setHours(0, 0, 0, 0);
      return differenceInDays(dueDateMidnight, today) === 1;
    });

    setDueTomorrowCount(dueTomorrowClients.length);

    let tomorrowValue = 0;
    if (dueTomorrowClients.length > 0 && plans.length > 0) {
      dueTomorrowClients.forEach((client) => {
        const plan = plans.find((p) => p.id === client.planId);
        if (plan && plan.price) {
          const amountString = plan.price
            .replace(/[^\d,]/g, '')
            .replace(',', '.');
          const amount = parseFloat(amountString);
          if (!isNaN(amount)) {
            tomorrowValue += amount;
          }
        }
      });
    }
    setDueTomorrowValue(tomorrowValue);

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
  }, [clientsData, initialPlans, paymentsData]);

  useEffect(() => {
    const invoices: Invoice[] = initialInvoices ?? [];
    
    // --- Chart Data Calculation ---
    const now = new Date();
    const currentMonth = getMonth(now);
    const currentYear = getYear(now);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let currentMonthOutflow = 0;
    let prevMonthOutflow = 0;
    
    const allPaidInvoices = invoices.filter(inv => inv.status === 'Pago');

    allPaidInvoices.forEach(invoice => {
        try {
            const paymentDate = parseISO(invoice.dueDate);
            const amountString = invoice.amount.replace(/[^\d,]/g, '').replace(',', '.');
            const amount = parseFloat(amountString);

            if (!isNaN(amount)) {
                const paymentMonth = getMonth(paymentDate);
                const paymentYear = getYear(paymentDate);

                if (paymentYear === currentYear && paymentMonth === currentMonth) {
                    currentMonthOutflow += amount;
                } else if (paymentYear === prevMonthYear && paymentMonth === prevMonth) {
                    prevMonthOutflow += amount;
                }
            }
        } catch (e) {
            console.error("Error parsing invoice date or amount", invoice);
        }
    });

    setOutflowsChartData([
        { name: 'Mês Passado', total: prevMonthOutflow },
        { name: 'Mês Atual', total: currentMonthOutflow },
    ]);
    
    // --- Open Invoices Calculation ---
    const open = invoices
      .filter((invoice) => invoice.status === 'Pendente' || invoice.status === 'Atrasado')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
    setOpenInvoices(open);

    // --- Paid Invoices Calculation ---
    const paid = allPaidInvoices
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
      .slice(0, 5); 
    setPaidInvoices(paid);
    
  }, [initialInvoices]);

  useEffect(() => {
    if (annotationsData) {
      setPendingAnnotations(annotationsData.filter(a => a.status === 'pending'));
      setDoneAnnotations(annotationsData.filter(a => a.status === 'done'));
    }
  }, [annotationsData]);

  const handleAddAnnotation = () => {
    if (!newNoteTitle || !newNoteText || !firestore) return;

    const newAnnotationId = `ANNO${Date.now()}`;
    const newAnnotation: Omit<Annotation, 'id'> = {
      ownerId: SHARED_USER_ID,
      title: newNoteTitle,
      text: newNoteText,
      status: 'pending',
    };
    
    const annotationRef = doc(firestore, 'users', SHARED_USER_ID, 'annotations', newAnnotationId);
    setDocumentNonBlocking(annotationRef, newAnnotation, { merge: true });

    setNewNoteTitle('');
    setNewNoteText('');
    setIsNoteSheetOpen(false);
  };

  const handleToggleAnnotationStatus = (id: string, currentStatus: 'pending' | 'done') => {
    if (!firestore) return;
    const newStatus = currentStatus === 'pending' ? 'done' : 'pending';
    const annotationRef = doc(firestore, 'users', SHARED_USER_ID, 'annotations', id);
    setDocumentNonBlocking(annotationRef, { status: newStatus }, { merge: true });
  };
  
  const handleDeleteAnnotation = (id: string) => {
    if (!firestore) return;
    const annotationRef = doc(firestore, 'users', SHARED_USER_ID, 'annotations', id);
    deleteDocumentNonBlocking(annotationRef);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">
        Painel
      </h2>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-0 bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Mensal
              </CardTitle>
              <DollarSign className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalRevenue.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-xs text-white/80">
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
                Valor total: R$ {clientsValue.toFixed(2).replace('.', ',')}
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
        </div>
        <div className="grid gap-4 md:grid-cols-2">
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
                Valor total: R$ {dueTodayValue.toFixed(2).replace('.', ',')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vencimento Amanhã
              </CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dueTomorrowCount}</div>
              <p className="text-xs text-muted-foreground">
                Valor total: R$ {dueTomorrowValue.toFixed(2).replace('.', ',')}
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
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Visão Geral das Faturas</CardTitle>
              <CardDescription>
                Análise de saídas, faturas em aberto e faturas pagas.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-y-8 gap-x-4 pt-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col space-y-4">
                <h3 className="text-base font-semibold">Saídas Mensais (Faturas Pagas)</h3>
                <OutflowsChart data={outflowsChartData} />
              </div>
              <div className="flex flex-col space-y-4">
                <h3 className="text-base font-semibold">Faturas em Aberto</h3>
                <div className="space-y-4">
                  {openInvoices.length > 0 ? (
                    openInvoices.map((invoice) => (
                      <div key={invoice.invoice} className="flex items-center">
                        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", 
                          invoice.status === 'Pendente' ? 'bg-amber-500/20' : 'bg-red-500/20'
                        )}>
                          {invoice.status === 'Pendente' ? (
                             <Clock className="h-4 w-4 text-amber-500" />
                          ) : (
                             <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">{invoice.clientName}</p>
                          <p className="text-sm text-muted-foreground">{invoice.amount}</p>
                        </div>
                        <div className="ml-auto text-right">
                           <p className="text-sm font-medium">{invoice.status}</p>
                           <p className="text-sm text-muted-foreground">{format(parseISO(invoice.dueDate), 'dd/MM/yy')}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground pt-4">Nenhuma fatura em aberto.</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col space-y-4">
                <h3 className="text-base font-semibold">Últimas Faturas Pagas</h3>
                 <div className="space-y-4">
                  {paidInvoices.length > 0 ? (
                    paidInvoices.map((invoice) => (
                      <div key={invoice.invoice} className="flex items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/20">
                          <DollarSign className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">{invoice.clientName}</p>
                          <p className="text-sm text-muted-foreground">{invoice.amount}</p>
                        </div>
                        <div className="ml-auto text-right">
                           <p className="text-sm font-medium">Pago</p>
                           <p className="text-sm text-muted-foreground">{format(parseISO(invoice.dueDate), 'dd/MM/yy')}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground pt-4">Nenhuma fatura paga recentemente.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Anotações</CardTitle>
                    <CardDescription>
                        Suas anotações e tarefas rápidas.
                    </CardDescription>
                </div>
                <Sheet open={isNoteSheetOpen} onOpenChange={setIsNoteSheetOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Anotação
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Adicionar Anotação</SheetTitle>
                            <SheetDescription>
                                Crie uma nova anotação ou tarefa.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="note-title">Título</Label>
                                <Input
                                    id="note-title"
                                    placeholder="Título da anotação"
                                    value={newNoteTitle}
                                    onChange={(e) => setNewNoteTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="note-text">Texto</Label>
                                <Textarea
                                    id="note-text"
                                    placeholder="Escreva sua anotação aqui..."
                                    value={newNoteText}
                                    onChange={(e) => setNewNoteText(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleAddAnnotation} className="w-full">
                                Salvar Anotação
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Para Fazer</h3>
                    <div className="space-y-3">
                        {pendingAnnotations.length > 0 ? (
                            pendingAnnotations.map(note => (
                                <div key={note.id} className="flex items-start gap-4 rounded-lg border p-3">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleToggleAnnotationStatus(note.id, note.status)}>
                                        <Circle className="h-5 w-5" />
                                    </Button>
                                    <div className="flex-1">
                                        <p className="font-semibold">{note.title}</p>
                                        <p className="text-sm text-muted-foreground">{note.text}</p>
                                    </div>
                                     <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleDeleteAnnotation(note.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground pt-2">Nenhuma anotação pendente.</p>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Feitas</h3>
                    <div className="space-y-3">
                         {doneAnnotations.length > 0 ? (
                            doneAnnotations.map(note => (
                                <div key={note.id} className="flex items-start gap-4 rounded-lg border p-3 opacity-60">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleToggleAnnotationStatus(note.id, note.status)}>
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    </Button>
                                    <div className="flex-1">
                                        <p className="font-semibold line-through">{note.title}</p>
                                        <p className="text-sm text-muted-foreground line-through">{note.text}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleDeleteAnnotation(note.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground pt-2">Nenhuma anotação concluída.</p>
                        )}
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
