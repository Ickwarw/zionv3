
import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { User, Phone, Mail, Calendar, DollarSign, MapPin } from 'lucide-react';
import { Lead } from '../types/leads.types';

interface LeadsKanbanProps {
  leads: Lead[];
  onStatusChange: (leadId: number, newStatus: string) => void;
  onLeadClick: (lead: Lead) => void;
  isJuliaActive?: boolean;
  onElementClick?: (event: React.MouseEvent, message: string) => void;
}

const statusColumns = [
  { id: 1, title: 'Novos Leads', color: 'bg-blue-50 border-blue-200', headerColor: 'bg-blue-500' },
  { id: 2, title: 'Qualificados', color: 'bg-yellow-50 border-yellow-200', headerColor: 'bg-yellow-500' },
  { id: 3, title: 'Negociação', color: 'bg-orange-50 border-orange-200', headerColor: 'bg-orange-500' },
  { id: 4, title: 'Fechados', color: 'bg-green-50 border-green-200', headerColor: 'bg-green-500' },
  { id: 5, title: 'Perdidos', color: 'bg-red-50 border-red-200', headerColor: 'bg-red-500' }
];

const LeadsKanban: React.FC<LeadsKanbanProps> = ({ 
  leads, 
  onStatusChange, 
  onLeadClick, 
  isJuliaActive, 
  onElementClick 
}) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const leadId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId;
    
    onStatusChange(leadId, newStatus);
  };

  const getLeadsByStatus = (status: number) => {
    return leads.filter(lead => lead.status_id === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className={`${isJuliaActive ? 'cursor-help' : ''}`}
      onClick={(e) => onElementClick?.(e, "Este é o quadro Kanban de leads! Você pode arrastar os leads entre as colunas para alterar seu status.")}
    >
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
                    className={`min-h-[500px] p-4 ${column.color} rounded-b-xl border-2 ${
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
                            onClick={() => onLeadClick(lead)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900 truncate">{lead.name}</h4>
                              {/* <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.prioridade)}`}>
                                {lead.prioridade}
                              </span> */}
                            </div>
                            
                            <div className="space-y-2 text-sm text-gray-600">
                              {lead.company && (
                                <div className="flex items-center space-x-2">
                                  <User size={14} />
                                  <span className="truncate">{lead.company}</span>
                                </div>
                              )}
                              
                              {lead.phone && (
                                <div className="flex items-center space-x-2">
                                  <Phone size={14} />
                                  <span>{lead.phone}</span>
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
                                  <DollarSign size={14} />
                                  <span>R$ {lead.value.toLocaleString()}</span>
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
                                <span>Responsável: {lead.assigned_to}</span>
                                <span>{new Date(lead.created_at).toLocaleDateString()}</span>
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
