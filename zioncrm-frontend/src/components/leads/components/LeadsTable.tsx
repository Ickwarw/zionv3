
import React from 'react';
import { Users, Mail, Phone, Eye, Edit, Trash2, Activity } from 'lucide-react';
import { Lead, LeadDepartment } from '../types/leads.types';
import Tag from '@/components/ui/tag';
import FormateCurrency from '@/components/ui/FormateCurrency';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { leadsService } from '@/services/api';
import { showQuestionAlert } from '@/components/ui/alert-dialog-question';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPage, PaginationPrevious } from '@/components/ui/pagination';
import { Label } from '@/components/ui/label';

interface LeadsTableProps {
  leads: Lead[];
  activeTab: LeadDepartment;
  onLeadClick: (lead: Lead) => void;
  onLeadEditClick: (lead: Lead) => void;
  onLeadUpdate: () => void;
  setCurrentPage: (page: any) => void;
  currentPage: number;
  totalPages: number;
  isJuliaActive: boolean;
  totalItens: number;
  onLeadActivityClick: (lead: Lead) => void;
}

const LeadsTable = ({ leads, activeTab, onLeadClick, onLeadEditClick, isJuliaActive, onLeadUpdate, setCurrentPage, currentPage, totalPages, totalItens, onLeadActivityClick }: LeadsTableProps) => {

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <Users size={64} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum lead encontrado</h3>
        <p className="text-gray-600 mb-6">
          {activeTab ? (
            <span>Não há leads na categoria {activeTab?.name} no momento.</span>
          ) : <span>Não há leads no momento.</span>
          }
        </p>
      </div>
    );
  }

  const deleteLead = (lead) => {
    showQuestionAlert('Deletar Lead?',
      `Deseja realmente deletar a Lead ${lead.razao || lead.name}?`,
      lead.id,
      closeDeleteNo,
      closeDeleteYes);
  }

  const closeDeleteYes = async (leadId) => {
    console.log("closeDeleteYes");
      try {
      const response = await leadsService.deleteLead(leadId);
      if (response.status == 200) {
        onLeadUpdate();
        } else if (response.status == 400) {
          if ('message' in response.data) {
            showWarningAlert("Não foi possível deletar a Lead", response.data.message,null);
          } else {
            showWarningAlert("Não foi possível deletar a Lead", response.data,null);
          }
        }
    } catch (error) {
      console.error('Failed to get delete Lead:', error);
      showErrorAlert('Erro ao Deletar a Lead', formatAxiosError(error));
    }
  }
  
  const closeDeleteNo = () => {
    console.log("closeDeleteNo");
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Lista de Leads</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads?.length
                    ? leads.map((lead) => (
                <TableRow 
                  key={lead.id}
                  className={`hover:bg-gray-50 cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
                >
                  <TableCell className="text-gray-600">{lead.razao || lead.name}</TableCell>
                  <TableCell className="text-gray-600">{lead.fone || lead.telefone_celular || lead.telefone_comercial || lead.phone}</TableCell>
                  <TableCell className="text-gray-600">{lead.email}</TableCell>
                  <TableCell className="text-gray-600">{lead.fantasia || lead.company}</TableCell>
                  <TableCell className="text-gray-600">
                    { lead.status && (
                      <Tag
                        backgroundColor={lead.status.color}
                        name={lead.status.name}
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">{FormateCurrency(lead.value)}</TableCell>

                  <TableCell className="text-gray-600">
                    { lead.assigned_user && (
                      <span>{lead.assigned_user.first_name}{' '}{lead.assigned_user.last_name}</span>
                    )}
                    { lead.assigned_user == null && lead.assigned_to != null && (
                      <span>{lead.assigned_to}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        title="Visualizar Atividades"
                        onClick={(e) => onLeadActivityClick(lead)}
                        className={isJuliaActive ? 'cursor-help' : ''}
                      >
                        <Activity size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        title="Visualizar Detalhes"
                        onClick={(e) => onLeadClick(lead)}
                        className={isJuliaActive ? 'cursor-help' : ''}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        title="Editar"
                        onClick={(e) => onLeadEditClick(lead)}
                        className={isJuliaActive ? 'cursor-help' : ''}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        title="Excluir"
                        onClick={(e) => deleteLead(lead)}
                        className={`text-red-600 hover:text-red-800 ${isJuliaActive ? 'cursor-help' : ''}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
                : <TableRow 
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <TableCell className="font-mono text-sm">
                      <div className="font-medium text-gray-900">Nenhuma Lead encontrado</div>
                    </TableCell>
                    
                  </TableRow>
              }
            </TableBody>
          </Table>
          {/* Paginador */}
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationPage
                    number={i + 1}
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  />
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <Label>Total de Itens: {totalItens}</Label>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  );
};

export default LeadsTable;
