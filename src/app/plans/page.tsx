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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { plans as initialPlans } from '@/lib/data';
import { PlusCircle, Trash2 } from 'lucide-react';

type Plan = {
  id: string;
  name: string;
  price: string;
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');

  useEffect(() => {
    try {
      const storedPlans = localStorage.getItem('plans');
      if (storedPlans) {
        setPlans(JSON.parse(storedPlans));
      } else {
        setPlans(initialPlans);
        localStorage.setItem('plans', JSON.stringify(initialPlans));
      }
    } catch (error) {
      setPlans(initialPlans);
    }
  }, []);

  const handleRemovePlan = (id: string) => {
    const updatedPlans = plans.filter((plan) => plan.id !== id);
    setPlans(updatedPlans);
    localStorage.setItem('plans', JSON.stringify(updatedPlans));
  };

  const handleAddPlan = () => {
    if (!newPlanName || !newPlanPrice) return;

    const newPlan = {
      id: `plan_${Date.now()}`,
      name: newPlanName,
      price: newPlanPrice,
    };

    const updatedPlans = [...plans, newPlan];
    setPlans(updatedPlans);
    localStorage.setItem('plans', JSON.stringify(updatedPlans));
    setNewPlanName('');
    setNewPlanPrice('');
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Planos
        </h2>
        <div className="flex items-center space-x-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Plano
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Adicionar um novo plano</SheetTitle>
                <SheetDescription>
                  Preencha o formulário abaixo para adicionar um novo plano.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    placeholder="Plano Básico"
                    className="col-span-3"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Preço
                  </Label>
                  <Input
                    id="price"
                    placeholder="R$ 49,90/mês"
                    className="col-span-3"
                    value={newPlanPrice}
                    onChange={(e) => setNewPlanPrice(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddPlan} className="w-full">
                  Salvar plano
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
              <TableHead>ID do Plano</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.id}</TableCell>
                <TableCell>{plan.name}</TableCell>
                <TableCell>{plan.price}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePlan(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
