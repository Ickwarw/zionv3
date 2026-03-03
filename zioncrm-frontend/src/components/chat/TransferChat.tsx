
import { useEffect, useState } from 'react';
import { Save, X, Tags, Users, ArrowLeftRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { chatService, userService } from '@/services/api';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { formatAxiosError } from '../ui/formatResponseError';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { getTextColorForBackground } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';


interface TransferChatProps {
  chat: any;
  onClose: () => void;
  onTransfer: () => void;
}

const TransferChat = ({ chat, onClose, onTransfer }: TransferChatProps) => {
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const getGroups = async () => {
    try {
      const response = await userService.getGroups();
      if (response.status == 200) {
          // setGroupList(response.data.groups);
          setGroupList(response.data.groups.filter((g) => g.id !== chat.user_group_id));
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar os Grupos", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar os Grupos", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Groups:', error);
        showErrorAlert('Erro ao carregar os Grupos', formatAxiosError(error));
    }
  }

  const handleSave = async () => {
    try {
      const response = await chatService.transferChanel(chat.id, selectedGroup);
      if (response.status == 201) {
        onTransfer();
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível transferir o Atendimento", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível transferir o Atendimento", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to transfer ChatChannel:', error);
        showErrorAlert('Erro ao transferir o Atendimento', formatAxiosError(error));
    }
  }

  useEffect(() => {
    getGroups();
  }, []);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle 
              className={`flex items-center`}
            >
              <Users size={24} className="mr-2" />
              Transferência de Atendimento
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
              <div>
                <Label
                   className="space-x-3"
                >Grupo</Label>
                <Select 
                  onValueChange={(value) => setSelectedGroup(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {groupList?.length
                      ? groupList.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))
                      : <SelectItem value="0">Nenhum</SelectItem>
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={handleSave}>
              <ArrowLeftRight size={16} className="mr-2" />
              Transferir
            </Button>
            <Button onClick={onClose}>
              <X size={16} className="mr-2" />
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferChat;
