
import React, { useState, useEffect } from 'react';
import { Clock, MessageSquareText, SendHorizontal, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { tasksService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import { Textarea } from '@/components/ui/textarea';
import FormateDateTime from '@/components/ui/FormateDateTime';



interface TaskCommentsProps {
  taskId: number;
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const TaskComments = ({ taskId, onClose, onElementClick, isJuliaActive }: TaskCommentsProps) => {
  const [commentsList, setCommentsList] = useState([]);
  const [newComment, setNewComment] = useState('');

 
  const fetchComments = async () => {
    try {
      const response = await tasksService.getTaskComments(taskId);
      if (response.status == 200 || response.status == 201) {
        setCommentsList(response.data.comments);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível buscar os Comentários", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível buscar os Comentários", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Comments:', error);
        showErrorAlert('Erro ao buscar os Comentários', formatAxiosError(error));
    }
  };
  
  useEffect(() => {
    fetchComments();
  }, []);

  const handleNewComment = async() => {
    try {
      const response = await tasksService.addTaskComment(taskId, newComment);
      if (response.status == 200 || response.status == 201) {
        setNewComment('');
        fetchComments();
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível gravar Comentário", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível gravar Comentário", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to save Comments:', error);
        showErrorAlert('Erro ao gravar Comentários', formatAxiosError(error));
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Visualização dos comentários da tarefa!")}
              className={`flex items-center ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              <MessageSquareText size={24} className="mr-2" />
              Comentários da Tarefa
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4">
            {commentsList?.length
                ? commentsList.map((comment) => (

              <div key={comment.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        <div className="flex items-center space-x-1 text-gray-600" >
                          <User size={16} />
                          { comment.user && (
                            <span className="text-sm">{comment.user.first_name}{' '}{comment.user.last_name}</span>
                          )}
                          { comment.user_id && comment.user == null && (
                            <span className="text-sm">{comment.user_id}</span>
                          )}
                       </div>
                      </h4>
                      <p className="text-sm text-gray-600">{comment.content}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <div className="flex items-center space-x-1 text-gray-600" title="Data/Hora">
                          <Clock size={16} />
                          <span className="text-sm">{FormateDateTime(comment.created_at)}</span>
                        </div>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            ))
            : 
              <div className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h4 className="font-semibold text-gray-900">Não há Comentários</h4>
                  </div>
                </div>
              </div>
            }
            <div>
              <div className="grid grid-cols-[90%_10%] gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Novo Comentário"
                />
                <Button
                  title="Adicionar comentário"
                  className="bg-white-200 hover:bg-gray-50 text-black-200"
                  onClick={(e) => handleNewComment()}>
                  <SendHorizontal size={24} />
                </Button>
              </div>
            </div>
        </div> 
      </DialogContent>
    </Dialog>
  );
};

export default TaskComments;
