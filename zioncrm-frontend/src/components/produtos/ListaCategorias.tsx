import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { productsService } from '@/services/api';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { formatAxiosError } from '../ui/formatResponseError';

interface ListaCategoriasProps {
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
  newCategoryState: boolean;
  search: string;
}

const ListaCategorias = ({ onElementClick, isJuliaActive, search, newCategoryState }: ListaCategoriasProps) => {
  const [categoriaList, setCategoriaList] = useState([]);
  const [originalList, setOriginalList] = useState([]);

  const getCategorias = async () => {
    try {
      const response = await productsService.getProductCategories();
      setOriginalList(response.data.categories);
    } catch (error) {
        console.error('Failed to get current user:', error);
        showErrorAlert('Erro ao carregar a lista de Categorias', formatAxiosError(error), null);
    }
  }

  const applyFilter = ()  => {
    let searchTMP = search?.trim() ?? "";
    if (searchTMP !== "") {
        const lowerSearch = searchTMP.toLowerCase();
        setCategoriaList(originalList.filter((item) => 
                item.name.toLowerCase().includes(lowerSearch) || 
                (item.description != null && item.description.toLowerCase().includes(lowerSearch))
              ));
      } else {
        setCategoriaList(originalList);
      }
  }

  useEffect(() => {
    const run = async () => {
      if (!newCategoryState ) {
        await getCategorias();
        applyFilter();
      }
      applyFilter();
    };

    run();
  }, [newCategoryState]);

   useEffect(() => {
    const run = async () => {
      await getCategorias();
      setCategoriaList(originalList);
    };

    run();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (originalList == null) {
        await getCategorias();
      }
      applyFilter();
    };

    run();
  }, [search]);

  useEffect(() => {
    if (originalList != null) {
      applyFilter();
    }
  }, [originalList, search]);

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoriaList?.length
                ? categoriaList.map((categoria) => (
              <TableRow 
                key={categoria.id}
                onClick={(e) => {
                  if (isJuliaActive) {
                    onElementClick(e, `Categoria: ${categoria.name}`)
                  }
                }}
                className={`hover:bg-gray-50 cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                <TableCell className="font-mono text-sm">{categoria.name}</TableCell>
                <TableCell className="font-mono text-sm">{categoria.description}</TableCell>
              </TableRow>
            ))
          :   <TableRow 
                className="hover:bg-gray-50 cursor-pointer"
              >
                <TableCell className="font-mono text-sm">
                  <div className="font-medium text-gray-900">Nenhuma Categoria encontrada</div>
                </TableCell>
                
              </TableRow>
          }
          </TableBody>
        </Table>
      </div>

    </>
  );
};

export default ListaCategorias;
