import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { leadsService, tasksService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Tag from '@/components/ui/tag';

export interface LeadFilterProps {
  onApply: (filter) => void;
  onCancel: () => void;
  isOpen: boolean;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
  oldFilter: any;
}

const LeadFilter = ({ isOpen, onApply, onCancel, onElementClick, isJuliaActive, oldFilter }: LeadFilterProps) => {
  const [sourceList, setSourceList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [formData, setFormData] = useState({
    status_id: oldFilter.status_id,
    source_id: oldFilter.source_id,
    assigned_to: oldFilter.assigned_to,
    search: oldFilter.search
  });

  const fetchStatuses = async () => {
    try {
      const response = await leadsService.getLeadStatuses();
      if (response.status == 200 || response.status == 201) {
        setStatusList(response.data.statuses);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível buscar os Status", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível buscar os Status", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Status:', error);
        showErrorAlert('Erro ao buscar os Status', formatAxiosError(error));
    }
  };
 
  const fetchSources = async () => {
    try {
      const response = await leadsService.getLeadSources();
      if (response.status == 200 || response.status == 201) {
        setSourceList(response.data.sources);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível buscar as Origens", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível buscaras Origens", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get sources:', error);
        showErrorAlert('Erro ao buscar as Origens', formatAxiosError(error));
    }
  };

  useEffect(() => {
    fetchStatuses();
    fetchSources();
  }, []);

  const handleSubmit = () => {
    let param = {}
    if (formData.status_id != null && formData.status_id != '') {
      param = {...param, status_id : formData.status_id};
    }
    if (formData.source_id != null && formData.source_id != '') {
      param = {...param, source_id : formData.source_id};
    }
    if (formData.assigned_to != null && formData.assigned_to != '') {
      param = {...param, assigned_to : formData.assigned_to};
    }
    if (formData.search != null && formData.search.trim() != '') {
      param = {...param, search : formData.search};
    }
    onApply(param);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onApply}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Filtro de Leads!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Filtro de Leads
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

            <div>
              <Label
                onClick={(e) => onElementClick(e, "Status da Lead!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >Status</Label>
              <Select
                value={formData.status_id || null}
                onValueChange={(value) => setFormData(formData => ({ 
                  ...formData, 
                  status_id: value.toString()
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {statusList.map((status) => (
                    <SelectItem key={status.id} value={status.id.toString()}>
                      <Tag
                        backgroundColor={status.color}
                        name={status.name}
                      />
                    </SelectItem>
                  ))
                }
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                onClick={(e) => onElementClick(e, "Origem da Lead!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >Origem</Label>
              <Select
                value={formData.source_id || null}
                onValueChange={(value) => setFormData(formData => ({ 
                  ...formData, 
                  source_id: value.toString()
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a Origem" />
                </SelectTrigger>
                <SelectContent>
                  {sourceList.map((source) => (
                    <SelectItem key={source.id} value={source.id.toString()}>
                      {source.name}
                    </SelectItem>
                  ))
                }
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                onClick={(e) => onElementClick(e, "Responsável da Lead!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >Responsável</Label>
              <Select
                value={formData.assigned_to || null}
                onValueChange={(value) => setFormData(formData => ({ 
                  ...formData, 
                  assigned_to: value.toString()
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {userList.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.first_name}{' '}{user.last_name}
                    </SelectItem>
                  ))
                }
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label 
                onClick={(e) => onElementClick(e, "Pesquisa o texto no nome, telefone, endereço e/ou na empresa da LEad!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >
                Buscar no texto na Lead
              </Label>
              <Input
                value={formData.search}
                onChange={(e) => setFormData({...formData, search: e.target.value})}
                placeholder="Buscar"
                required
              />
            </div>

          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit}>
              Aplica Filtro
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default LeadFilter;