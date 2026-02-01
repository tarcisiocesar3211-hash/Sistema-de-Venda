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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { clients as clientsData, plans as initialPlans } from '@/lib/data';
import { PlusCircle, Trash2, Pencil, RefreshCcw, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addDays, format, parseISO, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

type Payment = {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: string;
  date: string;
};

export default function ClientsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const { toast } = useToast();

  // State for adding a new client
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientPlanId, setNewClientPlanId] = useState('');
  const [newClientDueDate, setNewClientDueDate] = useState<string>('');
  const [dueDateType, setDueDateType] = useState<'automatico' | 'manual'>(
    'automatico'
  );
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  // State for editing a client
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editedClientName, setEditedClientName] = useState('');
  const [editedClientEmail, setEditedClientEmail] = useState('');
  const [editedClientPhone, setEditedClientPhone] = useState('');
  const [editedClientPlanId, setEditedClientPlanId] = useState('');
  const [editedClientDueDate, setEditedClientDueDate] = useState<string>('');
  const [editedDueDateType, setEditedDueDateType] = useState<
    'automatico' | 'manual'
  >('automatico');
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [deletionTarget, setDeletionTarget] = useState<
    string | 'selected' | null
  >(null);

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

    try {
      const storedPayments = localStorage.getItem('payments');
      if (storedPayments) {
        setPayments(JSON.parse(storedPayments));
      }
    } catch (error) {
      setPayments([]);
    }
  }, []);

  useEffect(() => {
    if (editingClient) {
      setEditedClientName(editingClient.name);
      setEditedClientEmail(editingClient.email);
      setEditedClientPhone(editingClient.phone);
      setEditedClientPlanId(editingClient.planId);
      if (editingClient.dueDate) {
        setEditedClientDueDate(
          format(parseISO(editingClient.dueDate), 'yyyy-MM-dd')
        );
        setEditedDueDateType('manual');
      } else {
        setEditedClientDueDate('');
        setEditedDueDateType('automatico');
      }
    }
  }, [editingClient]);

  const handleAddClient = () => {
    if (!newClientName || !newClientEmail || !newClientPlanId) return;

    let dueDate: Date;
    if (dueDateType === 'automatico') {
      dueDate = addDays(new Date(), 30);
    } else {
      if (!newClientDueDate) {
        return;
      }
      dueDate = parseISO(newClientDueDate);
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

    const plan = plans.find((p) => p.id === newClient.planId);
    const newPayment: Payment = {
      id: `PAY${Date.now()}`,
      clientName: newClient.name,
      clientEmail: newClient.email,
      amount: plan ? plan.price : 'N/A',
      date: new Date().toISOString(),
    };
    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    localStorage.setItem('payments', JSON.stringify(updatedPayments));

    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientPlanId('');
    setNewClientDueDate('');
    setDueDateType('automatico');
    setIsAddSheetOpen(false);
  };

  const handleRemoveClient = (id: string) => {
    const updatedClients = clients.filter((client) => client.id !== id);
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };

  const handleUpdateClient = () => {
    if (
      !editingClient ||
      !editedClientName ||
      !editedClientEmail ||
      !editedClientPlanId
    )
      return;

    let dueDate: Date;
    if (editedDueDateType === 'automatico') {
      dueDate = addDays(new Date(), 30);
    } else {
      if (!editedClientDueDate) {
        return;
      }
      dueDate = parseISO(editedClientDueDate);
    }

    const updatedClients = clients.map((client) => {
      if (client.id === editingClient.id) {
        return {
          ...client,
          name: editedClientName,
          email: editedClientEmail,
          phone: editedClientPhone,
          planId: editedClientPlanId,
          dueDate: dueDate.toISOString(),
        };
      }
      return client;
    });

    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    setIsEditSheetOpen(false);
    setEditingClient(null);
  };

  const handleRenewClient = (id: string) => {
    const clientToRenew = clients.find((c) => c.id === id);
    if (!clientToRenew) return;

    const updatedClients = clients.map((client) => {
      if (client.id === id) {
        return {
          ...client,
          dueDate: addDays(new Date(), 30).toISOString(),
        };
      }
      return client;
    });
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));

    const plan = plans.find((p) => p.id === clientToRenew.planId);
    const newPayment: Payment = {
      id: `PAY${Date.now()}`,
      clientName: clientToRenew.name,
      clientEmail: clientToRenew.email,
      amount: plan ? plan.price : 'N/A',
      date: new Date().toISOString(),
    };
    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    localStorage.setItem('payments', JSON.stringify(updatedPayments));
  };

  const getStatus = (
    dueDate: string
  ): { text: string; type: 'Vencido' | 'Vence Hoje' | 'Pago' } => {
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
      formattedDueDate: client.dueDate
        ? format(parseISO(client.dueDate), 'dd/MM/yyyy')
        : 'N/A',
      statusText: statusInfo.text,
      statusType: statusInfo.type,
    };
  });

  const handleRenewSelected = () => {
    if (selectedClients.length === 0) return;

    let updatedClients = [...clients];
    const newPayments: Payment[] = [];

    updatedClients = updatedClients.map((client) => {
      if (selectedClients.includes(client.id)) {
        const plan = plans.find((p) => p.id === client.planId);
        const newPayment: Payment = {
          id: `PAY${Date.now()}_${client.id}`,
          clientName: client.name,
          clientEmail: client.email,
          amount: plan ? plan.price : 'N/A',
          date: new Date().toISOString(),
        };
        newPayments.push(newPayment);

        return {
          ...client,
          dueDate: addDays(new Date(), 30).toISOString(),
        };
      }
      return client;
    });

    const updatedPayments = [...payments, ...newPayments];

    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    setPayments(updatedPayments);
    localStorage.setItem('payments', JSON.stringify(updatedPayments));

    setSelectedClients([]);
  };

  const handleDeleteSelected = () => {
    if (selectedClients.length === 0) return;

    const updatedClients = clients.filter(
      (client) => !selectedClients.includes(client.id)
    );
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    setSelectedClients([]);
  };

  const handleCopyEmails = () => {
    if (selectedClients.length === 0) return;

    const emailsToCopy = clients
      .filter((client) => selectedClients.includes(client.id))
      .map((client) => client.email)
      .join(', ');

    navigator.clipboard.writeText(emailsToCopy).then(() => {
      toast({
        title: 'E-mails copiados!',
        description:
          'Os e-mails dos clientes selecionados foram copiados para a área de transferência.',
      });
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Clientes
        </h2>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={selectedClients.length === 0}>
                Ações em Massa
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleCopyEmails}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar E-mails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRenewSelected}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Renovar Selecionados
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeletionTarget('selected')}
                className="text-red-500 hover:text-red-500 focus:text-red-500"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Apagar Selecionados
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cliente
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Adicionar um novo cliente</SheetTitle>
                <SheetDescription>
                  Preencha o formulário abaixo para adicionar um novo cliente
                  aos seus registros.
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
                    <Input
                      id="dueDate"
                      type="date"
                      className="col-span-3"
                      value={newClientDueDate}
                      onChange={(e) => setNewClientDueDate(e.target.value)}
                    />
                  </div>
                )}

                <Button onClick={handleAddClient} className="w-full">
                  Salvar cliente
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          {/* Edit Client Sheet */}
          <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Editar cliente</SheetTitle>
                <SheetDescription>
                  Atualize as informações do cliente abaixo.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="edit-name"
                    className="col-span-3"
                    value={editedClientName}
                    onChange={(e) => setEditedClientName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">
                    E-mail
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    className="col-span-3"
                    value={editedClientEmail}
                    onChange={(e) => setEditedClientEmail(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phone" className="text-right">
                    Telefone
                  </Label>
                  <Input
                    id="edit-phone"
                    className="col-span-3"
                    value={editedClientPhone}
                    onChange={(e) => setEditedClientPhone(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-plan" className="text-right">
                    Plano
                  </Label>
                  <Select
                    value={editedClientPlanId}
                    onValueChange={setEditedClientPlanId}
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
                    value={editedDueDateType}
                    onValueChange={(value) =>
                      setEditedDueDateType(value as 'automatico' | 'manual')
                    }
                    className="col-span-3 flex items-center space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="automatico" id="edit-automatico" />
                      <Label htmlFor="edit-automatico">
                        Automático (30 dias)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="edit-manual" />
                      <Label htmlFor="edit-manual">Manual</Label>
                    </div>
                  </RadioGroup>
                </div>

                {editedDueDateType === 'manual' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-dueDate" className="text-right">
                      Data
                    </Label>
                    <Input
                      id="edit-dueDate"
                      type="date"
                      className="col-span-3"
                      value={editedClientDueDate}
                      onChange={(e) => setEditedClientDueDate(e.target.value)}
                    />
                  </div>
                )}
                <Button onClick={handleUpdateClient} className="w-full">
                  Salvar alterações
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
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedClients.length === clients.length &&
                    clients.length > 0
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedClients(clients.map((c) => c.id));
                    } else {
                      setSelectedClients([]);
                    }
                  }}
                  aria-label="Selecionar todos"
                />
              </TableHead>
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
              <TableRow
                key={client.id}
                data-state={selectedClients.includes(client.id) && 'selected'}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedClients.includes(client.id)}
                    onCheckedChange={(checked) => {
                      setSelectedClients(
                        checked
                          ? [...selectedClients, client.id]
                          : selectedClients.filter((id) => id !== client.id)
                      );
                    }}
                    aria-label="Selecionar linha"
                  />
                </TableCell>
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
                    onClick={() => {
                      setEditingClient(client as Client);
                      setIsEditSheetOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRenewClient(client.id)}
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletionTarget(client.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog
        open={deletionTarget !== null}
        onOpenChange={(open) => !open && setDeletionTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá apagar permanentemente{' '}
              {deletionTarget === 'selected'
                ? 'os clientes selecionados'
                : 'este cliente'}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletionTarget === 'selected') {
                  handleDeleteSelected();
                } else if (deletionTarget) {
                  handleRemoveClient(deletionTarget);
                }
                setDeletionTarget(null);
              }}
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
