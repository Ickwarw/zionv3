import React, { useState, useEffect } from 'react';
import { Clock, MessageSquareText, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { leadsService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import FormateDateTime from '@/components/ui/FormateDateTime';

interface LeadActivitiesProps {
  leadId: number;
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const LeadActivities = ({ leadId, onClose, onElementClick, isJuliaActive }: LeadActivitiesProps) => {
  const [activityList, setActivityList] = useState([]);
 
  const fetchActivities = async () => {
    try {
      const response = await leadsService.getLeadActivities(leadId);
      if (response.status == 200 || response.status == 201) {
        setActivityList(response.data.activities);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível buscar as Atividades", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível buscar as Atividades", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Activities:', error);
        showErrorAlert('Erro ao buscar as Atividadess', formatAxiosError(error));
    }
  };
  
  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Visualização das atividades da Lead!")}
              className={`flex items-center ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              <MessageSquareText size={24} className="mr-2" />
              Atividades da Lead
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4">
            {activityList?.length
                ? activityList.map((activity) => (

              <div key={activity.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        <div className="flex items-center space-x-1 text-gray-600" >
                          <User size={16} />
                          { activity.user && (
                            <span className="text-sm">{activity.user.first_name}{' '}{activity.user.last_name}</span>
                          )}
                          { activity.user_id && activity.user == null && (
                            <span className="text-sm">{activity.user_id}</span>
                          )}
                       </div>
                      </h4>
                      <p className="text-sm text-gray-600">Tipo: {activity.activity_type}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <div className="flex items-center space-x-1 text-gray-600" title="Data/Hora">
                          <Clock size={16} />
                          <span className="text-sm">{FormateDateTime(activity.created_at)}</span>
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
                    <h4 className="font-semibold text-gray-900">Não há Atividades</h4>
                  </div>
                </div>
              </div>
            }
        </div> 
      </DialogContent>
    </Dialog>
  );
};

export default LeadActivities;
