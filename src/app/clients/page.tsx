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
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { clients as clientsData, plans as initialPlans } from '@/lib/data';
import { PlusCircle, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addDays, format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
};

export default function ClientsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientPlanId, setNewClientPlanId] = useState('');
  const [newClientDueDate, setNewClientDueDate] = useState<Date>();
  const [dueDateType, setDueDateType] = useState<'automatico' | 'manual'>(
    'automatico'
  );

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

    let dueDate: Date;
    if (dueDateType === 'automatico') {
      dueDate = addDays(new Date(), 30);
    } else {
      if (!newClientDueDate) {
        // Option to handle if manual date is not selected
        return;
      }
      dueDate = newClientDueDate;
    }

    const newClient: Client = {
      id: `CLT${Date.now()}`,
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone,
      planId: newClientPlanId,
      dueDate: dueDate.toISOString(),
    };

    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));

    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientPlanId('');
    setNewClientDueDate(undefined);
    setDueDateType('automatico');
  };

  const handleRemoveClient = (id: string) => {
    const updatedClients = clients.filter((client) => client.id !== id);
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };
  
  const getStatus = (dueDate: string): { text: string; type: 'Vencido' | 'Vence Hoje' | 'Pago' } => {
    if (!dueDate) return { text: 'N/A', type: 'Pago' };
    
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
    if (daysDiff > 0 && daysDiff <= 7) {
        return { text: `Faltam ${daysDiff} dia(s)`, type: 'Vence Hoje' };
    }
    return { text: `Faltam ${daysDiff} dia(s)`, type: 'Pago' };
  };

  const clientsWithPlanDetails = clients.map((client) => {
    const plan = plans.find((p) => p.id === client.planId);
    const statusInfo = getStatus(client.dueDate);

    return {
      ...client,
      planName: plan ? plan.name : 'N/A',
      planPrice: plan ? plan.price : 'N/A',
      formattedDueDate: client.dueDate ? format(parseISO(client.dueDate), 'dd/MM/yyyy') : 'N/A',
      statusText: statusInfo.text,
      statusType: statusInfo.type,
    };
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
                  Preencha o formulário abaixo para adicionar um novo cliente aos
                  seus registros.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    placeholder="Acme Inc."
                    className="col-span-3"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@acme.com"
                    className="col-span-3"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="123-456-7890"
                    className="col-span-3"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="plan" className="text-right">
                    Plano
                  </Label>
                  <Select
                    value={newClientPlanId}
                    onValueChange={setNewClientPlanId}
                  >
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Vencimento</Label>
                  <RadioGroup
                    value={dueDateType}
                    onValueChange={(value) =>
                      setDueDateType(value as 'automatico' | 'manual')
                    }
                    className="col-span-3 flex items-center space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="automatico" id="automatico" />
                      <Label htmlFor="automatico">Automático (30 dias)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual">Manual</Label>
                    </div>
                  </RadioGroup>
                </div>

                {dueDateType === 'manual' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dueDate" className="text-right">
                      Data
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'col-span-3 justify-start text-left font-normal',
                            !newClientDueDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newClientDueDate ? (
                            format(newClientDueDate, 'PPP', { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newClientDueDate}
                          onSelect={setNewClientDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                <Button onClick={handleAddClient} className="w-full">
                  Salvar cliente
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
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Valor do Plano</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientsWithPlanDetails.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.planName}</TableCell>
                <TableCell>{client.planPrice}</TableCell>
                <TableCell>{client.formattedDueDate}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      client.statusType === 'Vencido'
                        ? 'destructive'
                        : client.statusType === 'Vence Hoje'
                        ? 'secondary'
                        : 'default'
                    }
                    className={cn(
                      client.statusType === 'Pago' &&
                        'bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400',
                      client.statusType === 'Vence Hoje' &&
                        'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
                      client.statusType === 'Vencido' &&
                        'bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400',
                      'border-none'
                    )}
                  >
                    {client.statusText}
                  </Badge>
                </TableCell>
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
