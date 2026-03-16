'use client';

import { useState } from 'react';
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
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import {
  useFirebase,
  useCollection,
  useMemoFirebase,
  setDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
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

type Category = {
  id: string;
  name: string;
};

export default function CategoriesPage() {
  const { firestore } = useFirebase();

  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories } = useCollection<Category>(categoriesQuery);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [deletionTarget, setDeletionTarget] = useState<string | null>(null);

  const openSheetForNew = () => {
    setEditingCategory(null);
    setCategoryName('');
    setIsSheetOpen(true);
  };

  const openSheetForEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsSheetOpen(true);
  };

  const handleSaveCategory = () => {
    if (!categoryName || !firestore) return;

    if (editingCategory) {
      // Update existing category
      const categoryRef = doc(firestore, 'categories', editingCategory.id);
      setDocumentNonBlocking(categoryRef, { name: categoryName }, { merge: true });
    } else {
      // Add new category
      const newCategoryId = `cat_${Date.now()}`;
      const newCategory = {
        name: categoryName,
      };
      const categoryRef = doc(firestore, 'categories', newCategoryId);
      setDocumentNonBlocking(categoryRef, newCategory, { merge: true });
    }

    setIsSheetOpen(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  const handleDeleteCategory = () => {
    if (!deletionTarget || !firestore) return;
    const categoryRef = doc(firestore, 'categories', deletionTarget);
    deleteDocumentNonBlocking(categoryRef);
    setDeletionTarget(null);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Categorias
        </h2>
        <div className="flex items-center space-x-2">
          <Button onClick={openSheetForNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Categoria
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground">
        Gerencie as categorias de serviços para o seu estoque.
      </p>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Categoria</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openSheetForEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletionTarget(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingCategory ? 'Editar Categoria' : 'Adicionar Nova Categoria'}</SheetTitle>
            <SheetDescription>
              {editingCategory ? 'Altere o nome da categoria.' : 'Crie uma nova categoria para seus produtos em estoque.'}
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                placeholder="Ex: Netflix"
                className="col-span-3"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveCategory} className="w-full">
              Salvar
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={deletionTarget !== null}
        onOpenChange={(open) => !open && setDeletionTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá apagar permanentemente a categoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteCategory}
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
