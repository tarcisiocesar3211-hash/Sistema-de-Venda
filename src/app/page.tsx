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
import SalesChart from '@/components/sales-chart';
import { placeholderImages } from '@/lib/placeholder-images';
import { clients as clientsData } from '@/lib/data';
import { getMonth, getYear, parseISO, isToday, isYesterday } from 'date-fns';

type Sale = {
  id: string;
  name: string;
  email: string;
  amount: string;
};

type Payment = {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: string;
  date: string;
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

export default function DashboardPage() {
  const userAvatar = placeholderImages.find((img) => img.id === 'user-avatar');
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);
  const [salesToday, setSalesToday] = useState(0);
  const [salesChange, setSalesChange] = useState(0);
  const [dueTodayCount, setDueTodayCount] = useState(0);

  useEffect(() => {
    try {
      const storedPayments = localStorage.getItem('payments');
      if (storedPayments) {
        const payments: Payment[] = JSON.parse(storedPayments);
        const sortedPayments = payments.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const latestSales = sortedPayments.slice(0, 5).map((p) => ({
          id: p.id,
          name: p.clientName,
          email: p.clientEmail,
          amount: p.amount,
        }));
        setRecentSales(latestSales);

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
      setRecentSales([]);
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

      const dueToday = clients.filter(
        (client) => client.dueDate && isToday(parseISO(client.dueDate))
      ).length;
      setDueTodayCount(dueToday);
    } catch (error) {
      console.error('Failed to load clients from localStorage', error);
      setTotalClients(clientsData.length);
      const dueToday = clientsData.filter(
        (client) => client.dueDate && isToday(parseISO(client.dueDate))
      ).length;
      setDueTodayCount(dueToday);
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
              <CardTitle className="text-sm font-medium">Vendas (Hoje)</CardTitle>
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
              <CardTitle>Visão Geral</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <SalesChart />
            </CardContent>
          </Card>
          <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
              <CardTitle>Vendas Recentes</CardTitle>
              <CardDescription>As suas vendas mais recentes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {recentSales.length > 0 ? (
                  recentSales.map((sale) => (
                    <div className="flex items-center" key={sale.id}>
                      <Avatar className="h-9 w-9">
                        {userAvatar && (
                          <AvatarImage
                            src={userAvatar.imageUrl}
                            alt="Avatar"
                            data-ai-hint={userAvatar.imageHint}
                          />
                        )}
                        <AvatarFallback>
                          {sale.name ? sale.name.charAt(0) : ''}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {sale.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sale.email}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">{sale.amount}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma venda recente.
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
