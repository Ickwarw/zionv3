import React, { useState, useEffect } from 'react';
import { logsService } from '@/services/api';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { formatAxiosError } from '../ui/formatResponseError';
import { Activity, BugOff, Calendar, User } from 'lucide-react';

export interface LogStatsProps {
  handleElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}


const LogStats = ({ handleElementClick, isJuliaActive }: LogStatsProps) => {
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalLogsSuccess, setTotalLogsSuccess] = useState(0);
  const [totalLogsWarning, setTotalLogsWarning] = useState(0);
  const [totalLogsInfo, setTotalLogsInfo] = useState(0);
  const [totalLogsError, setTotalLogsError] = useState(0);
  const [logsByUser, setLogsByUser] = useState([]);
  const [logsByDay, setLogsByDay] = useState([]);
 
  useEffect(() => {
    getStats();
  }, []);

  const getStats = async () => {
    try {
      const response = await logsService.getLogStatistics();
      if (response.status == 200 || response.status == 201) {
        setTotalLogs(response.data.total_logs);
        setLogsByDay(response.data.logs_by_day);
        setLogsByUser(response.data.logs_by_user);
        for (let index = 0; index < response.data.logs_by_type.length; index++) {
          const element = response.data.logs_by_type[index];
          if (element['type'] == 'error') {
            setTotalLogsError(element['count']);
          } else if (element['type'] == 'info') {
            setTotalLogsInfo(element['count']);
          } else if (element['type'] == 'success') {
            setTotalLogsSuccess(element['count']);
          } else if (element['type'] == 'warning') {
            setTotalLogsWarning(element['count']);
          }
        }
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível Obter as estatísticas de Log", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível Obter as estatísticas de Log", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get current user:', error);
        showErrorAlert('Erro ao carregar as estatísticas de Log', formatAxiosError(error));
    }
  }

  return (
    <div className="space-y-4">
      <h3>Logs por Tipo</h3>
      <div 
        onClick={(e) => handleElementClick(e, "Aqui você pode ver um resumo estatístico dos logs por tipo!")}
        className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${isJuliaActive ? 'cursor-help' : ''}`}
      >
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Logs</p>
              <p className="text-xl font-bold text-gray-900">{totalLogs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sucessos</p>
              <p className="text-xl font-bold text-green-600">{totalLogsSuccess}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 font-bold">⚠</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avisos</p>
              <p className="text-xl font-bold text-yellow-600">{totalLogsWarning}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 font-bold">✗</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Erros</p>
              <p className="text-xl font-bold text-red-600">{totalLogsError}</p>
            </div>
          </div>
        </div>
      </div>
      <h3>Logs por Usuário</h3>
      <div 
        onClick={(e) => handleElementClick(e, "Aqui você pode ver um resumo estatístico dos logs por Usuários!")}
        className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${isJuliaActive ? 'cursor-help' : ''}`}
      >
        
        {logsByUser?.length
          ? logsByUser.map((log) => (

            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{log.username}</p>
                  <p className="text-xl font-bold text-gray-900">{log.count}</p>
                </div>
              </div>
            </div>
          ))
          : <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BugOff size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Não há Logs</p>
                  <p className="text-xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
        }
      </div>
      <h3>Logs por Dia</h3>
      <div 
        onClick={(e) => handleElementClick(e, "Aqui você pode ver um resumo estatístico dos logs por Dia!")}
        className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${isJuliaActive ? 'cursor-help' : ''}`}
      >
        
        {logsByDay?.length
          ? logsByDay.map((log) => (

            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{log.day}</p>
                  <p className="text-xl font-bold text-gray-900">{log.count}</p>
                </div>
              </div>
            </div>
          ))
          : <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BugOff size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Não há Logs</p>
                  <p className="text-xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
        }
      </div>
    </div>
  );
};

export default LogStats;
