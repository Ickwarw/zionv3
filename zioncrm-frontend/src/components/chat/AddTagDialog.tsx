
import { useState } from 'react';
import { Save, X, Tags } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { chatService } from '@/services/api';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { formatAxiosError } from '../ui/formatResponseError';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { getTextColorForBackground } from '@/lib/utils';
import { Badge } from '../ui/badge';


interface AddTagDialogProps {
  tags: any[];
  onClose: () => void;
}

const AddTagDialog = ({ tags, onClose }: AddTagDialogProps) => {
  const [tagList, setTagList] = useState(tags);
  const [formData, setFormData] = useState({
    name: null,
    color: "#6b46c1"
  });

  const getTags = async () => {
    try {
      const response = await chatService.getTags()
      if (response.status == 200) {
        setTagList(response.data.tags);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar as Tags", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar as Tags", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Tags:', error);
        showErrorAlert('Erro ao carregar as Tags', formatAxiosError(error));
    }
  }

  const handleSave = async () => {
    try {
      const response = await chatService.createTag(formData);
      if (response.status == 201) {
        setFormData({
          name: null,
          color: "#6b46c1"
        });
        await getTags();
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar a Tag", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar a Tag", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to save Tag:', error);
        showErrorAlert('Erro ao Salvar a Tag', formatAxiosError(error));
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
              <Tags size={24} className="mr-2" />
              Etiquetas
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Etiquetas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nome da Tag"
                />
              </div>
              <div>
                <Label>Cor</Label>
                <Input
                  value={formData.color}
                  type="color"
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  placeholder="Cor da Tag"
                />
              </div>
            </div>
            <></>
            <Button onClick={handleSave}>
              <Save size={16} className="mr-2" />
              Salvar
            </Button>
          </div>
          <div>
            <button
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
            >
              {tagList.length === 0 ? (
                <span className="text-muted-foreground text-white">Não existe Tags cadastradas...</span>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {tagList.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                      style={{
                        backgroundColor: tag.color,// + "22"
                        borderColor: tag.color + "22", 
                        color: getTextColorForBackground(tag.color),
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </button>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3 pt-4">
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

export default AddTagDialog;
