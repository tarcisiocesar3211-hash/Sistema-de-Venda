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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle as CardTitleUI } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  PlusCircle,
  Trash2,
  Pencil,
  Copy,
  ArrowUpDown,
  Search,
  ArrowRightLeft,
  ListFilter,
  BarChart,
  History,
  AlertTriangle,
  Sparkles,
  Archive,
  Clock,
  CalendarDays,
  Upload,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  useFirebase,
  useCollection,
  useMemoFirebase,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
} from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { SHARED_USER_ID } from '@/lib/shared-user';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

const statuses = ['Disponivel', 'Vendido', 'Estoque', 'Caida', 'Pagamento'] as const;
type Status = (typeof statuses)[number];

type Account = {
  id: string;
  ownerId: string;
  email: string;
  senha: string;
  tela: string;
  pin: string;
  remetente: string;
  categoria: string;
  status: Status;
  observacao?: string;
};

type Withdrawal = {
  id: string;
  ownerId: string;
  accountId: string;
  accountEmail: string;
  categoria: string;
  generatedMessage: string;
  withdrawnAt: string;
};

type Category = {
  id: string;
  name: string;
};

type SortableKey = 'email' | 'senha' | 'tela' | 'pin' | 'remetente' | 'categoria' | 'status' | 'observacao';

type SortConfig = {
  key: SortableKey | null;
  direction: 'ascending' | 'descending';
};

// Form states for adding multiple accounts
type NewAccountForm = {
  email: string;
  senha: string;
  tela: string;
  pin: string;
  remetente: string;
  categoria: string;
  status: Status | '';
  observacao: string;
  key: number; // For stable rendering in React
};


export default function EstoquePage() {
  const { firestore } = useFirebase();

  const accountsQuery = useMemoFirebase(
    () =>
      firestore
        ? collection(firestore, 'users', SHARED_USER_ID, 'accounts')
        : null,
    [firestore]
  );
  const { data: accounts } = useCollection<Account>(accountsQuery);

  const withdrawalsQuery = useMemoFirebase(
    () =>
      firestore
        ? collection(firestore, 'users', SHARED_USER_ID, 'withdrawals')
        : null,
    [firestore]
  );
  const { data: withdrawalsData } = useCollection<Withdrawal>(withdrawalsQuery);
  
  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categoriesData } = useCollection<Category>(categoriesQuery);

  const categories = useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData.map(c => c.name).sort((a,b) => a.localeCompare(b));
  }, [categoriesData]);


  const [selectedStatusTab, setSelectedStatusTab] = useState('Todos');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [deletionTarget, setDeletionTarget] = useState<
    string | 'selected' | null
  >(null);
  const { toast } = useToast();
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'ascending',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  // State for editing an account
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedSenha, setEditedSenha] = useState('');
  const [editedTela, setEditedTela] = useState('');
  const [editedPin, setEditedPin] = useState('');
  const [editedRemetente, setEditedRemetente] = useState('');
  const [editedCategoria, setEditedCategoria] = useState('');
  const [editedStatus, setEditedStatus] = useState<Status>('Estoque');
  const [editedObservacao, setEditedObservacao] = useState('');

  // State for withdraw access modal
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedServiceForWithdraw, setSelectedServiceForWithdraw] = useState('');
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const [newAccounts, setNewAccounts] = useState<NewAccountForm[]>([{ email: '', senha: '', tela: '', pin: '', remetente: '', categoria: '', status: 'Estoque', observacao: '', key: Date.now() }]);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const handleNewAccountChange = <K extends keyof Omit<NewAccountForm, 'key'>>(index: number, field: K, value: NewAccountForm[K]) => {
    const updatedAccounts = newAccounts.map((account, i) => {
      if (i === index) {
        return { ...account, [field]: value };
      }
      return account;
    });
    setNewAccounts(updatedAccounts);
  };

  const addAccountForm = () => {
    if (newAccounts.length < 7) {
      setNewAccounts([...newAccounts, { email: '', senha: '', tela: '', pin: '', remetente: '', categoria: '', status: 'Estoque', observacao: '', key: Date.now() }]);
    } else {
        toast({
            variant: 'default',
            title: 'Limite atingido',
            description: 'Você pode adicionar no máximo 7 contas por vez.',
        })
    }
  };

  const removeAccountForm = (index: number) => {
    if (newAccounts.length > 1) {
      setNewAccounts(newAccounts.filter((_, i) => i !== index));
    }
  };

  const handleAddAccounts = () => {
    if (!firestore) return;

    const validAccounts = newAccounts.filter(acc => acc.email && acc.senha && acc.categoria && acc.status);
    if (validAccounts.length === 0) {
        toast({
            variant: 'destructive',
            title: 'Nenhuma conta válida',
            description: 'Por favor, preencha os campos obrigatórios (E-mail, Senha, Categoria, Status).',
        });
        return;
    }

    const batch = writeBatch(firestore);

    validAccounts.forEach((acc, index) => {
        const newAccountId = `ACC${Date.now()}_${index}`;
        const newAccountData: Omit<Account, 'id'> = {
          ownerId: SHARED_USER_ID,
          email: acc.email,
          senha: acc.senha,
          tela: acc.tela,
          pin: acc.pin,
          remetente: acc.remetente,
          categoria: acc.categoria,
          status: acc.status as Status, // We've filtered for this
          observacao: acc.observacao,
        };
        const accountRef = doc(firestore, 'users', SHARED_USER_ID, 'accounts', newAccountId);
        batch.set(accountRef, newAccountData);
    });

    batch.commit().then(() => {
        toast({
            title: 'Contas adicionadas!',
            description: `${validAccounts.length} conta(s) foram adicionadas ao estoque.`,
        });
        setNewAccounts([{ email: '', senha: '', tela: '', pin: '', remetente: '', categoria: '', status: 'Estoque', observacao: '', key: Date.now() }]);
        setIsAddSheetOpen(false);
    }).catch(error => {
        console.error("Error adding accounts in batch: ", error);
        toast({
            variant: 'destructive',
            title: 'Erro!',
            description: 'Ocorreu um erro ao adicionar as contas.',
        });
    });
  };

  const handleImportAccounts = () => {
    if (!importText || !firestore) {
      toast({
        variant: 'default',
        title: 'Nenhum dado para importar',
        description: 'Por favor, cole os dados das contas na área de texto.',
      });
      return;
    }

    const lines = importText.trim().split('\n');
    const batch = writeBatch(firestore);
    let accountsAdded = 0;
    const errors: string[] = [];

    lines.forEach((line, index) => {
      if (!line.trim()) return; // Skip empty lines

      const fields = line.split('\t');
      const [
        email,
        senha,
        tela = '',
        pin = '',
        remetente = '',
        categoria,
        status,
        observacao = '',
      ] = fields.map(f => f.trim());

      if (!email || !senha || !categoria || !status) {
        errors.push(`Linha ${index + 1}: Campos obrigatórios (E-mail, Senha, Categoria, Status) estão faltando.`);
        return;
      }

      if (!statuses.includes(status as Status)) {
        errors.push(`Linha ${index + 1}: Status "${status}" é inválido. Valores permitidos: ${statuses.join(', ')}`);
        return;
      }

      const newAccountId = `ACC${Date.now()}_IMPORT_${index}`;
      const newAccountData: Omit<Account, 'id'> = {
        ownerId: SHARED_USER_ID,
        email,
        senha,
        tela,
        pin,
        remetente,
        categoria,
        status: status as Status,
        observacao,
      };

      const accountRef = doc(firestore, 'users', SHARED_USER_ID, 'accounts', newAccountId);
      batch.set(accountRef, newAccountData);
      accountsAdded++;
    });

    if (errors.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Erros na importação',
        description: (
          <div className="flex flex-col gap-2">
            <p>Corrija os erros e tente novamente:</p>
            <ScrollArea className="max-h-40 w-full rounded-md border p-2">
              <ul className="list-disc list-inside text-xs">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </ScrollArea>
          </div>
        ),
        duration: 15000,
      });
      return;
    }

    if (accountsAdded > 0) {
      batch.commit().then(() => {
        toast({
          title: 'Importação Concluída!',
          description: `${accountsAdded} conta(s) foram importadas com sucesso.`,
        });
        setImportText('');
        setIsImportModalOpen(false);
      }).catch(error => {
        console.error("Error importing accounts: ", error);
        toast({
          variant: 'destructive',
          title: 'Erro na Importação!',
          description: 'Ocorreu um erro ao salvar as contas no banco de dados.',
        });
      });
    } else {
      toast({
        variant: 'default',
        title: 'Nenhuma conta importada',
        description: 'Verifique se os dados inseridos estão no formato correto.',
      });
    }
  };


  const handleCategoryFilterChange = (category: string) => {
    setCategoryFilter((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const withdrawals = useMemo(() => {
    if (!withdrawalsData) return [];
    return [...withdrawalsData].sort(
        (a, b) => new Date(b.withdrawnAt).getTime() - new Date(a.withdrawnAt).getTime()
    );
  }, [withdrawalsData]);

  useEffect(() => {
    if (editingAccount) {
      setEditedEmail(editingAccount.email);
      setEditedSenha(editingAccount.senha);
      setEditedTela(editingAccount.tela);
      setEditedPin(editingAccount.pin);
      setEditedRemetente(editingAccount.remetente);
      setEditedCategoria(editingAccount.categoria);
      setEditedStatus(editingAccount.status);
      setEditedObservacao(editingAccount.observacao || '');
    }
  }, [editingAccount]);

  const handleRemoveAccount = (id: string) => {
    if (!firestore) return;
    const accountRef = doc(firestore, 'users', SHARED_USER_ID, 'accounts', id);
    deleteDocumentNonBlocking(accountRef);
    setDeletionTarget(null);
  };

  const handleUpdateAccount = () => {
    if (
      !editingAccount ||
      !editedEmail ||
      !editedSenha ||
      !editedCategoria ||
      !editedStatus ||
      !firestore
    ) {
      return;
    }

    const updatedAccountData = {
      email: editedEmail,
      senha: editedSenha,
      tela: editedTela,
      pin: editedPin,
      remetente: editedRemetente,
      categoria: editedCategoria,
      status: editedStatus,
      observacao: editedObservacao,
    };

    const accountRef = doc(
      firestore,
      'users',
      SHARED_USER_ID,
      'accounts',
      editingAccount.id
    );
    setDocumentNonBlocking(accountRef, updatedAccountData, { merge: true });

    setIsEditSheetOpen(false);
    setEditingAccount(null);
  };
  
  const handleGenerateDeliveryMessage = () => {
    if (!selectedServiceForWithdraw || !accounts || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: 'Por favor, selecione um serviço.',
      });
      return;
    }

    const availableAccounts = accounts
      .filter(
        (acc) =>
          acc.categoria === selectedServiceForWithdraw &&
          acc.status === 'Estoque'
      )
      .sort((a, b) => a.id.localeCompare(b.id));

    if (availableAccounts.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Fora de estoque!',
        description: `Nenhuma conta em estoque para ${selectedServiceForWithdraw}.`,
      });
      return;
    }

    const accountToWithdraw = availableAccounts[0];
    const textToCopy = `🔴*${accountToWithdraw.categoria}*🔴\n\n> *ACESSO:* ${accountToWithdraw.email}\n> *SENHA:* ${accountToWithdraw.senha}\n> *PERFIL PRIVADO:* ${accountToWithdraw.tela}\n> *PIN PRIVADO:* ${accountToWithdraw.pin}\n\n🚨 *Proibido altera senha da conta ou dos perfis* 🚨`;

    const batch = writeBatch(firestore);

    const accountRef = doc(firestore, 'users', SHARED_USER_ID, 'accounts', accountToWithdraw.id);
    batch.update(accountRef, { status: 'Vendido' });

    const withdrawalId = `WTH${Date.now()}`;
    const newWithdrawal: Omit<Withdrawal, 'id'> = {
        ownerId: SHARED_USER_ID,
        accountId: accountToWithdraw.id,
        accountEmail: accountToWithdraw.email,
        categoria: accountToWithdraw.categoria,
        generatedMessage: textToCopy,
        withdrawnAt: new Date().toISOString(),
    };
    const withdrawalRef = doc(firestore, 'users', SHARED_USER_ID, 'withdrawals', withdrawalId);
    batch.set(withdrawalRef, newWithdrawal);

    batch.commit().then(() => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            toast({
                title: 'Mensagem de Entrega Gerada!',
                description: 'Os dados foram copiados e o histórico de retirada foi criado.',
            });
        });
        setIsWithdrawModalOpen(false);
        setSelectedServiceForWithdraw('');
    }).catch(error => {
        console.error("Error withdrawing account: ", error);
        toast({
            variant: 'destructive',
            title: 'Erro de Retirada',
            description: 'Ocorreu um erro ao atualizar o status da conta e criar o histórico.',
        });
    });
  };


  const handleCopyAccount = (account: Account) => {
    let textToCopy = `E-mail: ${account.email} - Senha: ${account.senha} - Tela: ${account.tela} - Pin: ${account.pin}`;

    if (selectedStatusTab === 'Caida') {
        textToCopy = [
          `Categoria: ${account.categoria}`,
          `E-mail: ${account.email}`,
          `Senha: ${account.senha}`,
          `Tela: ${account.tela || 'N/A'}`,
          `PIN: ${account.pin || 'N/A'}`,
          `Remetente: ${account.remetente || 'N/A'}`,
          `Status: ${account.status}`,
          `Observação: ${account.observacao || 'N/A'}`,
        ].join('\n');
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: 'Copiado!',
        description:
          'Os dados da conta foram copiados para a área de transferência.',
      });
    });
  };

  const handleSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const searchedAccounts = useMemo(() => {
    if (!accounts) return [];
    
    let filteredAccounts = accounts;

    if (searchQuery) {
        filteredAccounts = filteredAccounts.filter(
          (acc) =>
            acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            acc.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
            acc.email.toLowerCase().endsWith(searchQuery.toLowerCase())
        );
    }
    
    if (categoryFilter.length > 0) {
        filteredAccounts = filteredAccounts.filter(acc => categoryFilter.includes(acc.categoria));
    }

    return filteredAccounts;

  }, [accounts, searchQuery, categoryFilter]);

  const tabCounts = useMemo(() => {
    if (!searchedAccounts) return { todos: 0, estoque: 0, disponiveis: 0, vendidos: 0, caida: 0 };
    return {
      todos: searchedAccounts.length,
      estoque: searchedAccounts.filter(a => a.status === 'Estoque').length,
      disponiveis: searchedAccounts.filter(a => a.status === 'Disponivel').length,
      vendidos: searchedAccounts.filter(a => a.status === 'Vendido').length,
      caida: searchedAccounts.filter(a => a.status === 'Caida' || a.status === 'Pagamento').length,
    }
  }, [searchedAccounts]);

  const filteredAndSortedAccounts = useMemo(() => {
    if (!searchedAccounts) return [];

    let currentAccounts;
    switch(selectedStatusTab) {
        case 'Estoque':
            currentAccounts = searchedAccounts.filter(acc => acc.status === 'Estoque');
            break;
        case 'Disponiveis':
            currentAccounts = searchedAccounts.filter(acc => acc.status === 'Disponivel');
            break;
        case 'Vendidos':
            currentAccounts = searchedAccounts.filter(acc => acc.status === 'Vendido');
            break;
        case 'Caida':
            currentAccounts = searchedAccounts.filter(acc => acc.status === 'Caida' || acc.status === 'Pagamento');
            break;
        default:
            currentAccounts = searchedAccounts;
            break;
    }

    const sortableAccounts = [...currentAccounts];

    if (sortConfig.key) {
      sortableAccounts.sort((a, b) => {
        const aValue = a[sortConfig.key!] ?? '';
        const bValue = b[sortConfig.key!] ?? '';
        const comparison = String(aValue).localeCompare(String(bValue));
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }

    return sortableAccounts;
  }, [searchedAccounts, selectedStatusTab, sortConfig]);

  const allVisibleSelected = useMemo(() => {
    if (filteredAndSortedAccounts.length === 0) return false;
    return filteredAndSortedAccounts.every((acc) => selectedAccounts.includes(acc.id));
  }, [filteredAndSortedAccounts, selectedAccounts]);

  const handleSelectAllVisible = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const visibleIds = filteredAndSortedAccounts.map((acc) => acc.id);
      setSelectedAccounts((prev) => [...new Set([...prev, ...visibleIds])]);
    } else {
      const visibleIds = filteredAndSortedAccounts.map((acc) => acc.id);
      setSelectedAccounts((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    }
  };
  
  const handleDeleteSelectedAccounts = () => {
    if (selectedAccounts.length === 0 || !firestore) return;

    const batch = writeBatch(firestore);
    selectedAccounts.forEach((accountId) => {
      const accountRef = doc(firestore, 'users', SHARED_USER_ID, 'accounts', accountId);
      batch.delete(accountRef);
    });

    batch.commit().then(() => {
        setSelectedAccounts([]);
        setDeletionTarget(null);
        toast({
            title: 'Contas apagadas!',
            description: 'As contas selecionadas foram removidas.',
        })
    }).catch((error) => {
        console.error('Error deleting selected accounts: ', error);
        toast({
          variant: 'destructive',
          title: 'Erro!',
          description: 'Não foi possível apagar as contas selecionadas.',
        });
    });
  };
  
  const servicesWithoutStock = useMemo(() => {
    if (!accounts || !categories) return [];
    const stockCounts = categories.reduce((acc, cat) => {
        acc[cat] = 0;
        return acc;
    }, {} as Record<string, number>);

    accounts.forEach(acc => {
        if (acc.status === 'Estoque') {
            if (stockCounts.hasOwnProperty(acc.categoria)) {
                stockCounts[acc.categoria]++;
            }
        }
    });

    return Object.entries(stockCounts)
        .filter(([_, count]) => count === 0)
        .map(([service, _]) => service);
  }, [accounts, categories]);

  const handleCopyEmails = () => {
    if (selectedAccounts.length === 0 || !accounts) return;

    const emailsToCopy = accounts
      .filter((acc) => selectedAccounts.includes(acc.id))
      .map((acc) => acc.email)
      .join(', ');

    navigator.clipboard.writeText(emailsToCopy).then(() => {
      toast({
        title: 'E-mails copiados!',
        description:
          'Os e-mails das contas selecionadas foram copiados para a área de transferência.',
      });
    });
  };

  const handleCopyAllDataForSelected = () => {
    if (selectedAccounts.length === 0 || !accounts) return;

    const accountsToCopy = accounts
      .filter((acc) => selectedAccounts.includes(acc.id));
    
    const textToCopy = accountsToCopy.map(account => [
        `Categoria: ${account.categoria}`,
        `E-mail: ${account.email}`,
        `Senha: ${account.senha}`,
        `Tela: ${account.tela || 'N/A'}`,
        `PIN: ${account.pin || 'N/A'}`,
        `Remetente: ${account.remetente || 'N/A'}`,
        `Status: ${account.status}`,
        `Observação: ${account.observacao || 'N/A'}`,
    ].join('\n')).join('\n\n---\n\n');
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: 'Copiado!',
        description:
          'Todos os dados das contas selecionadas foram copiados para a área de transferência.',
      });
    });
  };

  const stockSummaryData = useMemo(() => {
    if (!accounts || !categories) return [];

    const stockCounts = categories.reduce((acc, cat) => {
        acc[cat] = 0;
        return acc;
    }, {} as Record<string, number>);

    accounts.forEach(acc => {
        if (acc.status === 'Estoque' && stockCounts.hasOwnProperty(acc.categoria)) {
            stockCounts[acc.categoria]++;
        }
    });

    const colors = [
        'hsl(var(--chart-1))', '#82ca9d', '#ffc658', 'hsl(var(--chart-2))',
        '#a4de6c', '#d0ed57', '#ffc658', '#ff8042',
        'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'
    ];

    return Object.entries(stockCounts)
        .filter(([, count]) => count > 0)
        .map(([name, value], index) => ({
            name,
            value,
            color: colors[index % colors.length],
        }));
  }, [accounts, categories]);


  const StockSummaryModal = ({
    isOpen,
    onClose,
    data,
  }: {
    isOpen: boolean;
    onClose: () => void;
    data: { name: string; value: number; color: string }[];
  }) => {
    const totalStock = data.reduce((acc, item) => acc + item.value, 0);

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md md:max-w-2xl bg-card">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Archive className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Resumo do Estoque</DialogTitle>
                <DialogDescription>
                  Análise detalhada de assinaturas em estoque por serviço.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {totalStock > 0 ? (
              <>
                <div className="flex justify-center items-center h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend
                        iconType="circle"
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        formatter={(value) => <span className="text-foreground/80">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <Card className="bg-destructive/10 border-destructive/20 text-center">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-destructive/80">TOTAL EM ESTOQUE</p>
                    <p className="text-5xl font-bold text-destructive">{totalStock}</p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {data.map((item) => (
                    <Card key={item.name} className="p-4 shadow-sm text-center">
                      <CardHeader className="p-0 flex-row items-center justify-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}/>
                        <CardTitleUI className="text-sm font-medium">{item.name}</CardTitleUI>
                      </CardHeader>
                      <CardContent className="p-0 pt-2">
                        <p className="text-3xl font-bold">{item.value}</p>
                        <p className="text-xs text-muted-foreground">EM ESTOQUE</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-lg font-semibold">Nenhum item em estoque</p>
                <p className="text-muted-foreground">Adicione contas para ver o resumo.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={onClose} variant="destructive" className="w-full">
              Fechar Resumo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-headline">StreamStock</h2>
        <p className="text-muted-foreground">Gerencie seu estoque de acessos digitais com segurança.</p>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar e-mail, CPF ou serviço..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="pl-10 h-12"
        />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled><ArrowRightLeft /></Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={categoryFilter.length > 0 ? 'secondary' : 'outline'}
                    size="icon"
                    className="relative"
                  >
                    <ListFilter />
                    {categoryFilter.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                        {categoryFilter.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filtrar por Categoria</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {categories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={categoryFilter.includes(category)}
                      onCheckedChange={() => handleCategoryFilterChange(category)}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {categoryFilter.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setCategoryFilter([])}>
                        Limpar Filtros
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={() => setIsSummaryModalOpen(true)}><BarChart className="mr-2 h-4 w-4"/> Quantidade</Button>
              <Button variant="outline" className="border-amber-500/50 text-amber-600" disabled><History className="mr-2 h-4 w-4"/> Limpar Histórico</Button>
          </div>
          <div className="flex items-center gap-2">
            {selectedAccounts.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedAccounts.length}{' '}
                {selectedAccounts.length === 1 ? 'selecionado' : 'selecionados'}
              </span>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={selectedAccounts.length === 0}>
                  Ações em Massa
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {selectedStatusTab === 'Caida' && (
                  <DropdownMenuItem onClick={handleCopyAllDataForSelected}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Tudo
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleCopyEmails}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar E-mails
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
            <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                       Retirar Acesso
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Retirar Acesso</DialogTitle>
                        <DialogDescription>
                            Pega automaticamente a conta disponível mais antiga.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="withdraw-service">Selecione o Serviço</Label>
                            <Select value={selectedServiceForWithdraw} onValueChange={setSelectedServiceForWithdraw}>
                                <SelectTrigger id="withdraw-service">
                                    <SelectValue placeholder="Escolha..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="withdraw-purpose">Finalidade</Label>
                            <Select defaultValue="Venda Nova">
                                <SelectTrigger id="withdraw-purpose">
                                    <SelectValue placeholder="Selecione a finalidade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Venda Nova">Venda Nova</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsWithdrawModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleGenerateDeliveryMessage}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Gerar Mensagem de Entrega
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
              <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" /> Importar
              </Button>
              <Sheet open={isAddSheetOpen} onOpenChange={(isOpen) => {
                setIsAddSheetOpen(isOpen);
                if (!isOpen) {
                  // Reset to one form when closing
                  setNewAccounts([{ email: '', senha: '', tela: '', pin: '', remetente: '', categoria: '', status: 'Estoque', observacao: '', key: Date.now() }]);
                }
              }}>
                <SheetTrigger asChild>
                  <Button variant="destructive">
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Estoque
                  </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-4xl">
                  <SheetHeader>
                    <SheetTitle>Adicionar Contas em Lote</SheetTitle>
                    <SheetDescription>
                      Preencha os dados para adicionar uma ou mais contas ao estoque.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4">
                    <ScrollArea className="h-[70vh] pr-6">
                      <div className="space-y-6">
                        {newAccounts.map((account, index) => (
                          <Card key={account.key} className="p-4 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor={`categoria-${index}`}>Categoria</Label>
                                <Select value={account.categoria} onValueChange={(value) => handleNewAccountChange(index, 'categoria', value)}>
                                  <SelectTrigger id={`categoria-${index}`}><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                  <SelectContent>{categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`status-${index}`}>Status</Label>
                                <Select value={account.status} onValueChange={(value) => handleNewAccountChange(index, 'status', value as Status)}>
                                  <SelectTrigger id={`status-${index}`}><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                  <SelectContent>{statuses.map((status) => (<SelectItem key={status} value={status}>{status}</SelectItem>))}</SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`email-${index}`}>E-mail</Label>
                                <Input id={`email-${index}`} placeholder="email@exemplo.com" value={account.email} onChange={(e) => handleNewAccountChange(index, 'email', e.target.value)} />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`senha-${index}`}>Senha</Label>
                                <Input id={`senha-${index}`} placeholder="Sua senha" value={account.senha} onChange={(e) => handleNewAccountChange(index, 'senha', e.target.value)} />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`tela-${index}`}>Tela</Label>
                                <Input id={`tela-${index}`} placeholder="Ex: Perfil 1" value={account.tela} onChange={(e) => handleNewAccountChange(index, 'tela', e.target.value)} />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`pin-${index}`}>PIN</Label>
                                <Input id={`pin-${index}`} placeholder="Ex: 1234" value={account.pin} onChange={(e) => handleNewAccountChange(index, 'pin', e.target.value)} />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`remetente-${index}`}>Remetente</Label>
                                <Input id={`remetente-${index}`} placeholder="Nome do remetente" value={account.remetente} onChange={(e) => handleNewAccountChange(index, 'remetente', e.target.value)} />
                              </div>
                              <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor={`observacao-${index}`}>Observação</Label>
                                <Textarea id={`observacao-${index}`} placeholder="Qualquer observação" value={account.observacao} onChange={(e) => handleNewAccountChange(index, 'observacao', e.target.value)} />
                              </div>
                            </div>
                            {newAccounts.length > 1 && (
                              <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeAccountForm(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                      <Button variant="outline" onClick={addAccountForm}>Adicionar Outra Conta</Button>
                      <Button onClick={handleAddAccounts}>Salvar {newAccounts.length > 1 ? 'Contas' : 'Conta'}</Button>
                  </div>
                </SheetContent>
              </Sheet>
          </div>
      </div>
      
      {servicesWithoutStock.length > 0 && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-destructive">Atenção!</AlertTitle>
              <AlertDescription className="text-destructive">
                 Serviços SEM ESTOQUE:
                 <div className="flex flex-wrap gap-1 mt-1">
                   {servicesWithoutStock.map(service => <Badge key={service} variant="destructive">{service}</Badge>)}
                 </div>
              </AlertDescription>
          </Alert>
      )}

      <div className="flex justify-between items-center">
        <Tabs value={selectedStatusTab} onValueChange={setSelectedStatusTab}>
            <TabsList>
                <TabsTrigger value="Todos">Todos ({tabCounts.todos})</TabsTrigger>
                <TabsTrigger value="Estoque">Estoque ({tabCounts.estoque})</TabsTrigger>
                <TabsTrigger value="Disponiveis">Disponíveis ({tabCounts.disponiveis})</TabsTrigger>
                <TabsTrigger value="Vendidos">Vendidos ({tabCounts.vendidos})</TabsTrigger>
                <TabsTrigger value="Caida">Caída ({tabCounts.caida})</TabsTrigger>
            </TabsList>
        </Tabs>
        <Button variant="outline" onClick={() => setIsHistoryModalOpen(true)}>
          <History className="mr-2 h-4 w-4"/> Histórico
        </Button>
      </div>


      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={allVisibleSelected}
                  onCheckedChange={handleSelectAllVisible}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead><Button variant="ghost" onClick={() => handleSort('email')} className="px-0 hover:bg-transparent">E-mail<ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
              <TableHead><Button variant="ghost" onClick={() => handleSort('senha')} className="px-0 hover:bg-transparent">Senha<ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
              <TableHead><Button variant="ghost" onClick={() => handleSort('tela')} className="px-0 hover:bg-transparent">Tela<ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
              <TableHead><Button variant="ghost" onClick={() => handleSort('pin')} className="px-0 hover:bg-transparent">PIN<ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
              <TableHead><Button variant="ghost" onClick={() => handleSort('remetente')} className="px-0 hover:bg-transparent">Remetente<ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
              <TableHead><Button variant="ghost" onClick={() => handleSort('categoria')} className="px-0 hover:bg-transparent">Categoria<ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
              <TableHead><Button variant="ghost" onClick={() => handleSort('status')} className="px-0 hover:bg-transparent">Status<ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
              <TableHead><Button variant="ghost" onClick={() => handleSort('observacao')} className="px-0 hover:bg-transparent">Observação<ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedAccounts.length > 0 ? (
              filteredAndSortedAccounts.map((account) => (
                <TableRow key={account.id} data-state={selectedAccounts.includes(account.id) && 'selected'}>
                  <TableCell>
                    <Checkbox
                      checked={selectedAccounts.includes(account.id)}
                      onCheckedChange={(checked) => {
                        setSelectedAccounts(
                          checked
                            ? [...selectedAccounts, account.id]
                            : selectedAccounts.filter((id) => id !== account.id)
                        );
                      }}
                      aria-label="Selecionar linha"
                    />
                  </TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.senha}</TableCell>
                  <TableCell>{account.tela}</TableCell>
                  <TableCell>{account.pin}</TableCell>
                  <TableCell>{account.remetente}</TableCell>
                  <TableCell>{account.categoria}</TableCell>
                  <TableCell>
                    <Badge className={cn('border-none',
                        account.status === 'Disponivel' && 'bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400',
                        account.status === 'Vendido' && 'bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400',
                        account.status === 'Estoque' && 'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
                        account.status === 'Caida' && 'bg-gray-800 text-gray-100 hover:bg-gray-700 dark:bg-gray-300 dark:text-gray-900',
                        account.status === 'Pagamento' && 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400'
                      )}
                    >{account.status}</Badge>
                  </TableCell>
                  <TableCell>{account.observacao}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => handleCopyAccount(account)}>
                      <Copy className="mr-2 h-4 w-4" />
                      {selectedStatusTab === 'Caida' ? 'Copiar Tudo' : 'Copiar'}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingAccount(account); setIsEditSheetOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletionTarget(account.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">Nenhuma conta encontrada.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deletionTarget !== null} onOpenChange={(open) => !open && setDeletionTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá apagar permanentemente{' '}
              {deletionTarget === 'selected' ? 'as contas selecionadas' : 'esta conta'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletionTarget === 'selected') {
                  handleDeleteSelectedAccounts();
                } else if (deletionTarget) {
                  handleRemoveAccount(deletionTarget as string);
                }
              }}
            >Apagar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar conta</SheetTitle>
            <SheetDescription>Atualize os dados da conta.</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-categoria" className="text-right">Categoria</Label>
              <Select value={editedCategoria} onValueChange={setEditedCategoria}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                <SelectContent>{categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">Status</Label>
              <Select value={editedStatus} onValueChange={(value) => setEditedStatus(value as Status)}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione um status" /></SelectTrigger>
                <SelectContent>{statuses.map((status) => (<SelectItem key={status} value={status}>{status}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">E-mail</Label>
              <Input id="edit-email" placeholder="email@exemplo.com" className="col-span-3" value={editedEmail} onChange={(e) => setEditedEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-senha" className="text-right">Senha</Label>
              <Input id="edit-senha" placeholder="Sua senha" className="col-span-3" value={editedSenha} onChange={(e) => setEditedSenha(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-tela" className="text-right">Tela</Label>
              <Input id="edit-tela" placeholder="Ex: Perfil 1" className="col-span-3" value={editedTela} onChange={(e) => setEditedTela(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-pin" className="text-right">PIN</Label>
              <Input id="edit-pin" placeholder="Ex: 1234" className="col-span-3" value={editedPin} onChange={(e) => setEditedPin(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-remetente" className="text-right">Remetente</Label>
              <Input id="edit-remetente" placeholder="Nome do remetente" className="col-span-3" value={editedRemetente} onChange={(e) => setEditedRemetente(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-observacao" className="text-right">Observação</Label>
              <Textarea id="edit-observacao" placeholder="Qualquer observação" className="col-span-3" value={editedObservacao} onChange={(e) => setEditedObservacao(e.target.value)} />
            </div>
            <Button onClick={handleUpdateAccount} className="w-full">Salvar alterações</Button>
          </div>
        </SheetContent>
      </Sheet>
      <StockSummaryModal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} data={stockSummaryData} />
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-destructive" />
              Histórico de Retiradas
            </DialogTitle>
            <DialogDescription>
              Veja as últimas contas retiradas e as mensagens geradas.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              {withdrawals.length > 0 ? (
                withdrawals.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-destructive">{item.categoria}</p>
                        <p className="text-sm text-muted-foreground">{item.accountEmail}</p>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <CalendarDays className="h-3 w-3" />
                          <span>{format(parseISO(item.withdrawnAt), 'dd/MM/yy')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <Clock className="h-3 w-3" />
                          <span>{format(parseISO(item.withdrawnAt), 'HH:mm')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                       <Textarea
                          readOnly
                          value={item.generatedMessage}
                          className="bg-muted/50 font-mono text-xs h-40 resize-none"
                        />
                         <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => {
                                navigator.clipboard.writeText(item.generatedMessage);
                                toast({ title: 'Mensagem copiada!' });
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar Mensagem
                          </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma retirada encontrada.
                </p>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setIsHistoryModalOpen(false)} variant="destructive" className="w-full">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Importar Contas em Massa</DialogTitle>
            <DialogDescription>
              Cole os dados das contas abaixo. Cada linha representa uma conta.
              <br />
              Use a tecla <strong>TAB</strong> para separar os campos nesta ordem:
            </DialogDescription>
            <code className="text-xs font-mono p-2 bg-muted rounded-sm relative">
              E-mail<span className="text-muted-foreground mx-1">[TAB]</span>
              Senha<span className="text-muted-foreground mx-1">[TAB]</span>
              Tela<span className="text-muted-foreground mx-1">[TAB]</span>
              PIN<span className="text-muted-foreground mx-1">[TAB]</span>
              Remetente<span className="text-muted-foreground mx-1">[TAB]</span>
              Categoria<span className="text-muted-foreground mx-1">[TAB]</span>
              Status<span className="text-muted-foreground mx-1">[TAB]</span>
              Observação
            </code>
            <p className="text-xs text-muted-foreground pt-2">
              Dica: Você pode copiar e colar diretamente de uma planilha (Excel, Google Sheets).
            </p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Exemplo: conta1@email.com	senha123	Perfil 1	1111	remetente1	Netflix	Estoque	Obs 1..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="h-48 font-mono text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImportAccounts}>
              Importar Contas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
