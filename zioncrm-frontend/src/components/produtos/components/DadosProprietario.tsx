
import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { DadosProprietarioProps } from '../types/cadastro-fornecedor.types';

const DadosProprietario = ({ formData, setFormData, onElementClick, isJuliaActive }: DadosProprietarioProps) => {
  return (
    <div className="space-y-4">
      <h3 
        onClick={(e) => onElementClick(e, "Informações sobre o proprietário ou responsável legal da empresa!")}
        className={`text-lg font-semibold text-gray-900 ${isJuliaActive ? 'cursor-help' : ''}`}
      >
        Dados do Proprietário
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label 
            onClick={(e) => onElementClick(e, "Nome completo do proprietário ou responsável!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            Nome do Dono/Responsável
          </Label>
          <Input
            value={formData.nomeDono}
            onChange={(e) => setFormData({...formData, nomeDono: e.target.value})}
            placeholder="Nome completo"
          />
        </div>

        <div>
          <Label 
            onClick={(e) => onElementClick(e, "CPF do proprietário ou responsável!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            CPF do Dono/Responsável
          </Label>
          <Input
            value={formData.cpfDono}
            onChange={(e) => setFormData({...formData, cpfDono: e.target.value})}
            placeholder="000.000.000-00"
          />
        </div>
      </div>
    </div>
  );
};

export default DadosProprietario;
