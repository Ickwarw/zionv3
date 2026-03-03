import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { logsService } from '@/services/api';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { formatAxiosError } from '../ui/formatResponseError';

export interface CleanLogsProps {
  onYes: () => void;
  onNo: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
  showDeleteLogs: boolean;
}

const CleanLogsDialog = ({ showDeleteLogs, onYes, onNo, onElementClick, isJuliaActive }: CleanLogsProps) => {
  const [days, setDays] = useState(1);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await logsService.clearLogs(days);
      if (response.status == 200 || response.status == 201) {
        onYes();
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível apagar o Log", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível apagar o Log", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get current Transaction:', error);
        showErrorAlert('Erro ao apagar o Log', formatAxiosError(error));
    }
  };

  return (
    <>
      <Dialog open={showDeleteLogs} onOpenChange={onYes}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Formulário de filtro de produtos!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Apagar Logs
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            <div>
              <Label
                onClick={(e) => onElementClick(e, "Apagar quantidade de dias desejado de Logs!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >
                Quantidade de Dias a apagar 
              </Label>
              <Input
                type="number"
                value={days}
                min={1}
                max={10000}
                onChange={(e) => setDays(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onNo}>
              Cancelar
            </Button>
            <Button type="button" variant="outline" onClick={handleSubmit}>
              Apagar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CleanLogsDialog;




