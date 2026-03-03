
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { ContatosGerenciamentoProps, Contact } from '../types/cadastro-fornecedor.types';

const ContatosGerenciamento = ({ contatos, setContatos, onElementClick, isJuliaActive }: ContatosGerenciamentoProps) => {
  const adicionarContato = () => {
    const novoContato: Contact = {
      id: Date.now(),
      name: '',
      position: '',
      phone: '',
      email: ''
    };
    setContatos([...contatos, novoContato]);
  };

  const removerContato = (id: number) => {
    if (contatos.length > 1) {
      setContatos(contatos.filter(contato => contato.id !== id));
    }
  };

  const atualizarContato = (id: number, campo: string, valor: string) => {
    setContatos(contatos.map(contato => 
      contato.id === id ? { ...contato, [campo]: valor } : contato
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 
          onClick={(e) => onElementClick(e, "Lista de contatos organizados por setor da empresa!")}
          className={`text-lg font-semibold text-gray-900 ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          Contatos por Setor
        </h3>
        <Button 
          type="button" 
          onClick={(e) => {
            onElementClick(e, "Adicionar um novo contato para o fornecedor!");
            adicionarContato();
          }}
          size="sm"
          className={isJuliaActive ? 'cursor-help' : ''}
        >
          <Plus size={16} className="mr-2" />
          Adicionar Contato
        </Button>
      </div>

      {contatos.map((contato, index) => (
        <div key={contato.id} className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-900">Contato {index + 1}</h4>
            {contatos.length > 1 && (
              <Button
                type="button"
                onClick={() => removerContato(contato.id)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-sm">Nome do Contato</Label>
              <Input
                value={contato.name}
                onChange={(e) => atualizarContato(contato.id, 'name', e.target.value)}
                placeholder="Nome completo"
              />
            </div>

            <div>
              <Label className="text-sm">Cargo</Label>
              <Input
                value={contato.position}
                onChange={(e) => atualizarContato(contato.id, 'position', e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm">Telefone</Label>
              <Input
                type="tel"
                pattern="([0-9]{2})[0-9]{4}-[0-9]{3}-[0-9]{4}"
                value={contato.phone}
                onChange={(e) => atualizarContato(contato.id, 'phone', e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm">Email</Label>
              <Input
                type="email"
                value={contato.email}
                onChange={(e) => atualizarContato(contato.id, 'email', e.target.value)}
                placeholder="contato@empresa.com"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContatosGerenciamento;
