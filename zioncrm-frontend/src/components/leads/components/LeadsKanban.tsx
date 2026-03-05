
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { User, Phone, Mail, DollarSign, MapPin, Info, Activity } from 'lucide-react';
import { Lead, LeadStatus } from '../types/leads.types';
import { leadsDashAgentService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import FormateCurrency from '@/components/ui/FormateCurrency';
import FormateDateTime from '@/components/ui/FormateDateTime';
import { generateVariation, getTextColorForBackground } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPage, PaginationPrevious } from '@/components/ui/pagination';
import { Label } from '@/components/ui/label';

interface LeadsKanbanProps {
  leads: Lead[];
  onStatusChange: () => void;
  onLeadClick: (lead: Lead) => void;
  isJuliaActive?: boolean;
  onElementClick?: (event: React.MouseEvent, message: string) => void;
  setCurrentPage: (page: any) => void;
  currentPage: number;
  totalPages: number;
  totalItens: number;
  // statusList: LeadStatus[];
  // onLeadActivityClick: (lead: Lead) => void;
}


const statusColumns = [
  { id: 'NovaLead', title: 'Novos Leads', color: 'bg-blue-50 border-blue-200', headerColor: 'bg-blue-500' },
  { id: 'Ruim', title: 'Ruim', color: 'bg-yellow-50 border-yellow-200', headerColor: 'bg-yellow-500' },
  { id: 'Fria', title: 'Fria', color: 'bg-gray-50 border-gray-200', headerColor: 'bg-gray-500' },
  { id: 'Morna', title: 'Morna', color: 'bg-green-50 border-green-200', headerColor: 'bg-green-500' },
  { id: 'Quente', title: 'Quente', color: 'bg-orange-50 border-orange-200', headerColor: 'bg-orange-500' },
  { id: 'MuitoQuente', title: 'Muito Quente', color: 'bg-purple-50 border-purple-200', headerColor: 'bg-purple-500' },
  { id: 'Queimando', title: 'Queimando', color: 'bg-red-50 border-red-200', headerColor: 'bg-red-500' }
];

const getVisiblePages = (currentPage: number, totalPages: number) => {
  const delta = 2; // páginas ao redor da atual
  const range: (number | string)[] = [];
  const rangeWithDots: (number | string)[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  let last = 0;

  for (let i of range) {
    if (last && typeof i === "number") {
      if (i - last === 2) {
        rangeWithDots.push(last + 1);
      } else if (i - last > 2) {
        rangeWithDots.push("...");
      }
    }

    rangeWithDots.push(i);
    if (typeof i === "number") last = i;
  }

  return rangeWithDots;
};

const LeadsKanban: React.FC<LeadsKanbanProps> = ({ 
  leads, 
  onStatusChange, 
  onLeadClick, 
  isJuliaActive, 
  onElementClick,
  setCurrentPage,
  currentPage,
  totalPages,
  totalItens,
  // statusList,
  // onLeadActivityClick
}) => {
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const leadId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId;
    let updatedLead = null;
    leads.map((lead) => {
      if (lead.id == leadId) {
        updatedLead = lead;
      }
    });

    try {
      let updatedToLead = {
        id: updatedLead.id,
        razao: updatedLead.razao || updatedLead.name,
        fantasia: updatedLead.fantasia || updatedLead.company,
        email: updatedLead.email,
        fone: updatedLead.fone || updatedLead.phone,
        telefone_celular: updatedLead.telefone_celular,
        telefone_comercial: updatedLead.telefone_comercial,
        endereco: updatedLead.endereco || updatedLead.address,
        numero: updatedLead.numero,
        bairro: updatedLead.bairro,
        cidade: updatedLead.cidade || updatedLead.city,
        uf: updatedLead.uf || updatedLead.state,
        cep: updatedLead.cep || updatedLead.zip_code,
        cnpj_cpf: updatedLead.cnpj_cpf,
        ie_identidade: updatedLead.ie_identidade,
        contato: updatedLead.contato,
        status_id: newStatus,
        prioridade: updatedLead.prioridade,
        origem: updatedLead.origem,
        obs: updatedLead.obs || updatedLead.notes,
        ativo: updatedLead.ativo,
        // Campos antigos para compatibilidade temporária
        name: updatedLead.razao || updatedLead.name,
        phone: updatedLead.fone || updatedLead.phone,
        company: updatedLead.fantasia || updatedLead.company,
        address: updatedLead.endereco || updatedLead.address,
        position: updatedLead.position,
        city: updatedLead.cidade || updatedLead.city,
        state: updatedLead.uf || updatedLead.state,
        zip_code: updatedLead.cep || updatedLead.zip_code,
        country: updatedLead.country,
        source_id: updatedLead.source_id != null ? Number(updatedLead.source_id) : null,
        assigned_to: updatedLead.assigned_to != null ? Number(updatedLead.assigned_to) : null,
        notes: updatedLead.obs || updatedLead.notes,
        value: updatedLead.value,
      }
      const response = await leadsDashAgentService.updateLead(updatedToLead.id, updatedToLead);
      if (response.status == 200 || response.status == 201) {
        onStatusChange();
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível Atualizar a Lead", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível Atualizar a Lead", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to update Lead:', error);
        showErrorAlert('Erro ao Atualizar a Lead', formatAxiosError(error));
    }
  };


  const getLeadsByStatus = (status: string) => {
    if (leads == null || leads == undefined) {
      return [];
    }
    return leads.filter(lead => lead.prioridade === status);
  };


  const getColumnStyle = (color) => {
    return {
      backgroundColor: `${color}`,
      borderColor: generateVariation(color, 200)
    }
  }

  const getColumnHeaderStyle = (color) => {
    let bgColor = generateVariation(color, 200);
    return {
      color: getTextColorForBackground(bgColor),
      backgroundColor: bgColor,
      borderColor: generateVariation(color, 200)
    }
  }

  return (
    <div 
      className={`${isJuliaActive ? 'cursor-help' : ''}`}
      onClick={(e) => onElementClick?.(e, "Este é o quadro Kanban de leads! Você pode arrastar os leads entre as colunas para alterar seu status.")}
    >
      {/* Paginador */}
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            />
          </PaginationItem>

          {getVisiblePages(currentPage, totalPages).map((page, index) => {
            if (typeof page !== "number") {
              return (
                <PaginationItem key={index}>
                  <span className="px-2 select-none">...</span>
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={index}>
                <PaginationPage
                  number={page}
                  isActive={currentPage === page}
                  onClick={() => setCurrentPage(page)}
                />
              </PaginationItem>
            );
          })}

          {/* {Array.from({ length: totalPages }, (_, i) => (
            <PaginationItem key={i}>
              <PaginationPage
                number={i + 1}
                isActive={currentPage === i + 1}
                onClick={() => setCurrentPage(i + 1)}
              />
            </PaginationItem>
          ))} */}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {statusColumns.map((column) => (
            <div key={column.id} className="flex flex-col">
              <div className={`${column.headerColor} text-white px-4 py-3 rounded-t-xl`}>
                <h3 className="font-semibold text-center">{column.title}</h3>
                <p className="text-center text-sm opacity-90">
                  {getLeadsByStatus(column.id).length} leads
                </p>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={getColumnStyle(column.color)} 
                    className={`min-h-[500px] p-4 rounded-b-xl border-2 ${
                      snapshot.isDraggingOver ? 'bg-opacity-80' : ''
                    }`}
                  >
                    {getLeadsByStatus(column.id).map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white rounded-xl p-4 mb-3 shadow-md cursor-pointer transition-all duration-200 ${
                              snapshot.isDragging ? 'rotate-3 shadow-xl' : 'hover:shadow-lg'
                            }`}
                            // onClick={() => onLeadClick(lead)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900 truncate" title={lead.razao || lead.name}>{lead.razao || lead.name}</h4>
                              {/* <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.prioridade)}`}>
                                {lead.prioridade}
                              </span> */}
                              <div className='grid grid-cols-2 md:grid-cols-2 gap-2'>
                                <Button
                                  title="Informações da Lead"
                                  className='bg-white-500 hover:bg-white-700 p-1 rounded-full w-4 h-4 flex items-center justify-center'
                                  onClick={() => onLeadClick(lead)}
                                >
                                  <Info size={"12"}/>
                                </Button>
                                {/* <Button
                                  title="Atividades da Leads"
                                  className='bg-white-500 hover:bg-white-700 text-blue p-1 rounded-full w-4 h-4 flex items-center justify-center'
                                  onClick={() => onLeadActivityClick(lead)}
                                >
                                  <Activity size={"12"}/>
                                </Button> */}
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-sm text-gray-600">
                              {(lead.fantasia || lead.company) && (
                                <div className="flex items-center space-x-2">
                                  <User size={14} />
                                  <span className="truncate">{lead.fantasia || lead.company}</span>
                                </div>
                              )}
                              
                              {(lead.fone || lead.telefone_celular || lead.telefone_comercial || lead.phone) && (
                                <div className="flex items-center space-x-2">
                                  <Phone size={14} />
                                  <span>{lead.fone || lead.telefone_celular || lead.telefone_comercial || lead.phone}</span>
                                </div>
                              )}
                              
                              {lead.email && (
                                <div className="flex items-center space-x-2">
                                  <Mail size={14} />
                                  <span className="truncate">{lead.email}</span>
                                </div>
                              )}

                              {lead.value && (
                                <div className="flex items-center space-x-2">
                                  {/* <DollarSign size={14} /> */}
                                  <span>{FormateCurrency(lead.value)}</span>
                                </div>
                              )}
                              
                              
                              {lead.source && (
                                <div className="flex items-center space-x-2">
                                  <MapPin size={14} />
                                  <span className="truncate">{lead.source.name}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-3 pt-2 border-t border-gray-100">
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                { lead.assigned_user && (
                                  <span>Responsável: 
                                      {lead.assigned_user.first_name}{' '}{lead.assigned_user.last_name}
                                  </span>
                                )}
                                <span>{FormateDateTime(lead.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default LeadsKanban;
