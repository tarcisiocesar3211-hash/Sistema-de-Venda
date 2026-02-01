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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clients as clientsData, plans as initialPlans } from '@/lib/data';
import { PlusCircle, Trash2 } from 'lucide-react';

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
};

export default function ClientsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientPlanId, setNewClientPlanId] = useState('');

  useEffect(() => {
    try {
      const storedPlans = localStorage.getItem('plans');
      if (storedPlans) {
        setPlans(JSON.parse(storedPlans));
      } else {
        setPlans(initialPlans);
      }
    } catch (error) {
      setPlans(initialPlans);
    }

    try {
      const storedClients = localStorage.getItem('clients');
      if (storedClients) {
          setClients(JSON.parse(storedClients));
      } else {
          setClients(clientsData);
          localStorage.setItem('clients', JSON.stringify(clientsData));
      }
    } catch (error) {
        setClients(clientsData);
    }
  }, []);

  const handleAddClient = () => {
    if (!newClientName || !newClientEmail || !newClientPlanId) return;

    const newClient: Client = {
      id: `CLT${Date.now()}`,
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone,
      planId: newClientPlanId,
    };

    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));

    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientPlanId('');
  };

  const handleRemoveClient = (id: string) => {
    const updatedClients = clients.filter((client) => client.id !== id);
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };

  const clientsWithPlanNames = clients.map(client => {
    const plan = plans.find(p => p.id === client.planId);
    return {
        ...client,
        planName: plan ? plan.name : 'N/A',
    }
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Clientes
        </h2>
        <div className="flex items-center space-x-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cliente
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Adicionar um novo cliente</SheetTitle>
                <SheetDescription>
                  Preencha o formulário abaixo para adicionar um novo cliente aos seus registros.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input id="name" placeholder="Acme Inc." className="col-span-3" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    E-mail
                  </Label>
                  <Input id="email" type="email" placeholder="contact@acme.com" className="col-span-3" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Telefone
                  </Label>
                  <Input id="phone" placeholder="123-456-7890" className="col-span-3" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="plan" className="text-right">
                    Plano
                  </Label>
                  <Select value={newClientPlanId} onValueChange={setNewClientPlanId}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddClient} className="w-full">Salvar cliente</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID do Cliente</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientsWithPlanNames.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.id}</TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.planName}</TableCell>
                <TableCell className="text-right">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveClient(client.id)}
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
