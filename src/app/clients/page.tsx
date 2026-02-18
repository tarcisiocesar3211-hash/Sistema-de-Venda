'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  PlusCircle,
  Trash2,
  Pencil,
  RefreshCcw,
  Copy,
  ArrowUpDown,
  Search,
} from 'lucide-react';
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
import {
  useFirebase,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
} from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { SHARED_USER_ID } from '@/lib/shared-user';

type Plan = {
  id: string;
  name: string;
  price: string;
};

type Client = {
  id: string;
  ownerId: string;
  name: string;
  email: string;
  phone: string;
  planId: string;
  dueDate: string;
  tela?: string;
  pin?: string;
  suporte?: boolean;
  observacao?: string;
};

type Payment = {
  id: string;
  ownerId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: string;
  date: string;
};

type SortConfig = {
  key: 'status' | 'name' | null;
  direction: 'ascending' | 'descending';
};

export default function ClientsPage() {
  const { firestore } = useFirebase();

  const plansQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'plans') : null),
    [firestore]
  );
  const { data: plans } = useCollection<Plan>(plansQuery);

  const clientsQuery = useMemoFirebase(
    () =>
      firestore ? collection(firestore, 'users', SHARED_USER_ID, 'clients') : null,
    [firestore]
  );
  const { data: clients } = useCollection<Client>(clientsQuery);

  const paymentsQuery = useMemoFirebase(
    () =>
      firestore ? collection(firestore, 'users', SHARED_USER_ID, 'payments') : null,
    [firestore]
  );
  const { data: payments } = useCollection<Payment>(paymentsQuery);

  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentView, setCurrentView] = useState<'all' | 'support'>('all');

  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientPlanId, setNewClientPlanId] = useState('');
  const [newClientTela, setNewClientTela] = useState('');
  const [newClientPin, setNewClientPin] = useState('');
  const [newClientDueDate, setNewClientDueDate] = useState<string>('');
  const [newClientSuporte, setNewClientSuporte] = useState(false);
  const [newClientObservacao, setNewClientObservacao] = useState('');
  const [dueDateType, setDueDateType] = useState<'automatico' | 'manual'>(
    'automatico'
  );
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editedClientName, setEditedClientName] = useState('');
  const [editedClientEmail, setEditedClientEmail] = useState('');
  const [editedClientPhone, setEditedClientPhone] = useState('');
  const [editedClientPlanId, setEditedClientPlanId] = useState('');
  const [editedClientTela, setEditedClientTela] = useState('');
  const [editedClientPin, setEditedClientPin] = useState('');
  const [editedClientDueDate, setEditedClientDueDate] = useState<string>('');
  const [editedClientSuporte, setEditedClientSuporte] = useState(false);
  const [editedClientObservacao, setEditedClientObservacao] = useState('');
  const [editedDueDateType, setEditedDueDateType] = useState<
    'automatico' | 'manual'
  >('automatico');
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [deletionTarget, setDeletionTarget] = useState<
    string | 'selected' | null
  >(null);

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'ascending',
  });

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  useEffect(() => {
    if (editingClient) {
      setEditedClientName(editingClient.name);
      setEditedClientEmail(editingClient.email);
      setEditedClientPhone(editingClient.phone);
      setEditedClientPlanId(editingClient.planId);
      setEditedClientTela(editingClient.tela || '');
      setEditedClientPin(editingClient.pin || '');
      setEditedClientSuporte(editingClient.suporte || false);
      setEditedClientObservacao(editingClient.observacao || '');
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
    if (!newClientName || !newClientEmail || !newClientPlanId || !firestore)
      return;

    let dueDate: Date;
    if (dueDateType === 'automatico') {
      dueDate = addDays(new Date(), 30);
    } else {
      if (!newClientDueDate) {
        return;
      }
      dueDate = parseISO(newClientDueDate);
    }

    const newClientId = `CLT${Date.now()}`;
    const newClient: Omit<Client, 'id'> = {
      ownerId: SHARED_USER_ID,
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone,
      planId: newClientPlanId,
      dueDate: dueDate.toISOString(),
      tela: newClientTela,
      pin: newClientPin,
      suporte: newClientSuporte,
      observacao: newClientObservacao,
    };

    const clientRef = doc(firestore, 'users', SHARED_USER_ID, 'clients', newClientId);
    setDocumentNonBlocking(clientRef, newClient, { merge: true });

    const plan = plans?.find((p) => p.id === newClient.planId);
    const newPaymentId = `PAY${Date.now()}`;
    const newPayment: Omit<Payment, 'id'> = {
      ownerId: SHARED_USER_ID,
      clientId: newClientId,
      clientName: newClient.name,
      clientEmail: newClient.email,
      amount: plan ? plan.price : 'N/A',
      date: new Date().toISOString(),
    };
    const paymentRef = doc(firestore, 'users', SHARED_USER_ID, 'payments', newPaymentId);
    setDocumentNonBlocking(paymentRef, newPayment, { merge: true });

    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientPlanId('');
    setNewClientTela('');
    setNewClientPin('');
    setNewClientSuporte(false);
    setNewClientObservacao('');
    setNewClientDueDate('');
    setDueDateType('automatico');
    setIsAddSheetOpen(false);
  };

  const handleRemoveClient = (id: string) => {
    if (!firestore) return;
    const clientRef = doc(firestore, 'users', SHARED_USER_ID, 'clients', id);
    deleteDocumentNonBlocking(clientRef);
  };

  const handleUpdateClient = () => {
    if (
      !editingClient ||
      !editedClientName ||
      !editedClientEmail ||
      !editedClientPlanId ||
      !firestore
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

    const updatedClientData = {
      name: editedClientName,
      email: editedClientEmail,
      phone: editedClientPhone,
      planId: editedClientPlanId,
      dueDate: dueDate.toISOString(),
      tela: editedClientTela,
      pin: editedClientPin,
      suporte: editedClientSuporte,
      observacao: editedClientObservacao,
    };

    const clientRef = doc(firestore, 'users', SHARED_USER_ID, 'clients', editingClient.id);
    setDocumentNonBlocking(clientRef, updatedClientData, { merge: true });

    setIsEditSheetOpen(false);
    setEditingClient(null);
  };

  const handleRenewClient = (id: string) => {
    if (!clients || !firestore) return;
    const clientToRenew = clients.find((c) => c.id === id);
    if (!clientToRenew) return;

    const updatedClientData = {
      dueDate: addDays(new Date(), 30).toISOString(),
    };
    const clientRef = doc(firestore, 'users', SHARED_USER_ID, 'clients', id);
    setDocumentNonBlocking(clientRef, updatedClientData, { merge: true });

    const plan = plans?.find((p) => p.id === clientToRenew.planId);
    const newPaymentId = `PAY${Date.now()}`;
    const newPayment: Omit<Payment, 'id'> = {
      ownerId: SHARED_USER_ID,
      clientId: clientToRenew.id,
      clientName: clientToRenew.name,
      clientEmail: clientToRenew.email,
      amount: plan ? plan.price : 'N/A',
      date: new Date().toISOString(),
    };
    const paymentRef = doc(firestore, 'users', SHARED_USER_ID, 'payments', newPaymentId);
    setDocumentNonBlocking(paymentRef, newPayment, { merge: true });
  };

  const getStatus = (
    dueDate: string
  ): {
    text: string;
    type: 'Vencido' | 'Vence Hoje' | 'Pago';
    daysDiff: number | null;
  } => {
    if (!dueDate) return { text: 'N/A', type: 'Pago', daysDiff: null };

    const date = parseISO(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDateMidnight = new Date(date);
    dueDateMidnight.setHours(0, 0, 0, 0);

    const daysDiff = differenceInDays(dueDateMidnight, today);

    if (daysDiff < 0) {
      return { text: `Vencido há ${-daysDiff} dia(s)`, type: 'Vencido', daysDiff };
    }
    if (daysDiff === 0) {
      return { text: 'Vence hoje', type: 'Vence Hoje', daysDiff };
    }
    if (daysDiff > 0 && daysDiff <= 7) {
      return { text: `Faltam ${daysDiff} dia(s)`, type: 'Vence Hoje', daysDiff };
    }
    return { text: `Faltam ${daysDiff} dia(s)`, type: 'Pago', daysDiff };
  };

  const handleSort = (key: 'status' | 'name') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedClients = useMemo(() => {
    if (!clients || !plans) return [];
    
    let filteredClients = searchQuery
      ? clients.filter(
          (client) =>
            client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : clients;

    if (currentView === 'support') {
      filteredClients = filteredClients.filter((client) => client.suporte);
    }

    const clientsWithPlanDetails = filteredClients.map((client) => {
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
        daysUntilDue: statusInfo.daysDiff,
      };
    });

    const sortableClients = [...clientsWithPlanDetails];

    if (sortConfig.key === 'status') {
      sortableClients.sort((a, b) => {
        const aDays = a.daysUntilDue ?? Number.MAX_SAFE_INTEGER;
        const bDays = b.daysUntilDue ?? Number.MAX_SAFE_INTEGER;

        if (aDays < bDays) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aDays > bDays) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    } else if (sortConfig.key === 'name') {
      sortableClients.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }

    return sortableClients;
  }, [clients, plans, sortConfig, searchQuery, currentView]);

  const handleRenewSelected = () => {
    if (selectedClients.length === 0 || !firestore || !clients || !plans) return;

    const batch = writeBatch(firestore);

    selectedClients.forEach(clientId => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            const clientRef = doc(firestore, 'users', SHARED_USER_ID, 'clients', clientId);
            batch.update(clientRef, { dueDate: addDays(new Date(), 30).toISOString() });

            const plan = plans.find((p) => p.id === client.planId);
            const newPaymentId = `PAY${Date.now()}_${client.id}`;
            const paymentRef = doc(firestore, 'users', SHARED_USER_ID, 'payments', newPaymentId);
            batch.set(paymentRef, {
                ownerId: SHARED_USER_ID,
                clientId: client.id,
                clientName: client.name,
                clientEmail: client.email,
                amount: plan ? plan.price : 'N/A',
                date: new Date().toISOString(),
            });
        }
    });

    batch.commit().then(() => {
        setSelectedClients([]);
    }).catch(error => {
        console.error("Error renewing selected clients: ", error);
    });
  };

  const handleDeleteSelected = () => {
    if (selectedClients.length === 0 || !firestore) return;

    const batch = writeBatch(firestore);
    selectedClients.forEach(clientId => {
        const clientRef = doc(firestore, 'users', SHARED_USER_ID, 'clients', clientId);
        batch.delete(clientRef);
    });

    batch.commit().then(() => {
        setSelectedClients([]);
        setDeletionTarget(null);
    }).catch(error => {
        console.error("Error deleting selected clients: ", error);
    });
  };

  const handleCopyEmails = () => {
    if (selectedClients.length === 0 || !clients) return;

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

  const allVisibleSelected = useMemo(() => {
    if (sortedClients.length === 0) return false;
    return sortedClients.every((client) => selectedClients.includes(client.id));
  }, [sortedClients, selectedClients]);

  const handleSelectAllVisible = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const visibleIds = sortedClients.map((client) => client.id);
      setSelectedClients((prev) => [...new Set([...prev, ...visibleIds])]);
    } else {
      const visibleIds = sortedClients.map((client) => client.id);
      setSelectedClients((prev) => prev.filter((id) => !visibleIds.includes(id)));
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Clientes
        </h2>
      </div>

      <Tabs
        value={currentView}
        onValueChange={(value) => setCurrentView(value as 'all' | 'support')}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">Todos os Clientes</TabsTrigger>
          <TabsTrigger value="support">Registro de Suporte</TabsTrigger>
        </TabsList>
        <div className="flex items-center justify-between">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, e-mail ou @domínio..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-8"
              />
            </div>
            <Button onClick={handleSearch}>Procurar</Button>
          </div>
          <div className="flex items-center space-x-2">
            {selectedClients.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedClients.length}{' '}
                {selectedClients.length === 1 ? 'selecionado' : 'selecionados'}
              </span>
            )}
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
                    <Label htmlFor="tela" className="text-right">
                      Tela
                    </Label>
                    <Input
                      id="tela"
                      placeholder="Ex: 1"
                      className="col-span-3"
                      value={newClientTela}
                      onChange={(e) => setNewClientTela(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pin" className="text-right">
                      PIN
                    </Label>
                    <Input
                      id="pin"
                      placeholder="Ex: 1234"
                      className="col-span-3"
                      value={newClientPin}
                      onChange={(e) => setNewClientPin(e.target.value)}
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
                        {plans?.map((plan) => (
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

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="suporte" className="text-right">
                      Suporte
                    </Label>
                    <div className="flex items-center space-x-2 col-span-3">
                      <Checkbox
                        id="suporte"
                        checked={newClientSuporte}
                        onCheckedChange={setNewClientSuporte as (checked: boolean | 'indeterminate') => void}
                      />
                      <Label
                        htmlFor="suporte"
                        className={cn(newClientSuporte && 'text-red-500')}
                      >
                        SIM
                      </Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="observacao" className="text-right">
                      Observação
                    </Label>
                    <Textarea
                      id="observacao"
                      placeholder="Qualquer observação"
                      className="col-span-3"
                      value={newClientObservacao}
                      onChange={(e) => setNewClientObservacao(e.target.value)}
                    />
                  </div>

                  <Button onClick={handleAddClient} className="w-full">
                    Salvar cliente
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Tabs>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allVisibleSelected}
                  onCheckedChange={handleSelectAllVisible}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="px-0 hover:bg-transparent"
                >
                  Nome
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Tela</TableHead>
              <TableHead>PIN</TableHead>
              <TableHead>Observação</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Valor do Plano</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('status')}
                  className="px-0 hover:bg-transparent"
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClients.map((client) => (
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
                <TableCell className="font-medium text-xs">
                  <div className="flex items-center gap-2">
                    {client.name}
                    {client.suporte && currentView === 'all' && (
                      <Badge variant="destructive" className="whitespace-nowrap">
                        Suporte
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs">{client.email}</TableCell>
                <TableCell className="text-xs">{client.phone}</TableCell>
                <TableCell className="text-xs">{client.tela}</TableCell>
                <TableCell className="text-xs">{client.pin}</TableCell>
                <TableCell className="text-xs">{client.observacao}</TableCell>
                <TableCell className="text-xs">{client.planName}</TableCell>
                <TableCell className="text-xs">{client.planPrice}</TableCell>
                <TableCell className="text-xs">
                  {client.formattedDueDate}
                </TableCell>
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
              <Label htmlFor="edit-tela" className="text-right">
                Tela
              </Label>
              <Input
                id="edit-tela"
                className="col-span-3"
                value={editedClientTela}
                onChange={(e) => setEditedClientTela(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-pin" className="text-right">
                PIN
              </Label>
              <Input
                id="edit-pin"
                className="col-span-3"
                value={editedClientPin}
                onChange={(e) => setEditedClientPin(e.target.value)}
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
                  {plans?.map((plan) => (
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-suporte" className="text-right">
                Suporte
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Checkbox
                  id="edit-suporte"
                  checked={editedClientSuporte}
                  onCheckedChange={setEditedClientSuporte as (checked: boolean | 'indeterminate') => void}
                />
                <Label
                  htmlFor="edit-suporte"
                  className={cn(editedClientSuporte && 'text-red-500')}
                >
                  SIM
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-observacao" className="text-right">
                Observação
              </Label>
              <Textarea
                id="edit-observacao"
                placeholder="Qualquer observação"
                className="col-span-3"
                value={editedClientObservacao}
                onChange={(e) => setEditedClientObservacao(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdateClient} className="w-full">
              Salvar alterações
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <AlertDialog
        open={deletionTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletionTarget(null);
          }
        }}
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
