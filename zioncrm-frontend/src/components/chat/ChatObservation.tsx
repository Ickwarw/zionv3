
import { useState } from 'react';
import { Save, X, MessageSquareText, Pencil, Ban } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { chatService } from '@/services/api';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { formatAxiosError } from '../ui/formatResponseError';
import { Textarea } from '../ui/textarea';


interface ChatObservationProps {
  observation: string;
  chatId: number;
  canEdit: boolean;
  onClose: () => void;
  // onElementClick: (event: React.MouseEvent, message: string) => void;
  // isJuliaActive: boolean;
}

const ChatObservation = ({ observation, chatId, canEdit = false, onClose }: ChatObservationProps) => {
  const [localObservation, setLocalObservation] = useState(observation);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: chatId,
    observation: observation
  });


  const handleSave = async () => {
    try {
      const response = await chatService.setChannelObservation(formData.id, formData.observation);
      if (response.status == 200) {
        setFormData({
          id: response.data.chatId,
          observation: response.data.observation
        });
        setLocalObservation(response.data.observation);
        setIsEditing(false);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar a Observação", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar a Observação", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to save Observation:', error);
        showErrorAlert('Erro ao Salvar a Observação', formatAxiosError(error));
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle 
              // onClick={(e) => onElementClick(e, "Visualização e edição da observação do atendimento!")}
              // className={`flex items-center ${isJuliaActive ? 'cursor-help' : ''}`}
              className={`flex items-center`}
            >
              <MessageSquareText size={24} className="mr-2" />
              {isEditing ? 'Editar Observação' : 'Visualizar Observação'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Observação do Atendimento </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {isEditing ? (
                  <Textarea
                    value={formData.observation}
                    onChange={(e) => setFormData({...formData, observation: e.target.value})}
                    placeholder="Observação do Atendimento"
                    required
                  />
                ) : (
                  <Textarea
                    className="p-2 bg-gray-50 rounded min-height-40"
                    value={localObservation}
                    disabled
                  />
                )}
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3 pt-4">
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)}>
                  <Ban size={16} className="mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save size={16} className="mr-2" />
                  Salvar
                </Button>
              </>
            ) : (
              <>
                {canEdit && (
                  <Button 
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil size={16} className="mr-2" />
                    Editar
                  </Button>
                )}
                <Button onClick={onClose}>
                  <X size={16} className="mr-2" />
                  Fechar
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatObservation;
