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

export default function DashboardPage() {
  const userAvatar = placeholderImages.find((img) => img.id === 'user-avatar');
  const [recentSales, setRecentSales] = useState<Sale[]>([]);

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
      }
    } catch (error) {
      console.error('Failed to load recent sales from localStorage', error);
      setRecentSales([]);
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
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% do mês passado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% do mês passado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% do mês passado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos Agora</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                +201 desde a última hora
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
