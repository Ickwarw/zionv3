
import React from 'react';
import { Progress } from '../../ui/progress';
import { LeadDepartment, LeadStatus } from '../types/leads.types';
import { getTextColorForBackground } from '@/lib/utils';

interface DetailedProgressBarProps {
  activeTab: LeadDepartment;
  departmentList: LeadDepartment[];
  statusList: LeadStatus[];
  selectedStatus: LeadStatus | null;
  onStatusClick: (status: LeadStatus) => void;
  onTabChange: (department: LeadDepartment) => void;
}

const DetailedProgressBarOld = ({ activeTab, selectedStatus, departmentList, statusList, onStatusClick, onTabChange }: DetailedProgressBarProps) => {
 
  const getColumnHeaderStyle = (color) => {
    return {
      color: getTextColorForBackground(color),
      backgroundColor: color,
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Funil Detalhado de Leads</h3>
      
      {/* Tab Selector */}
      <div className="flex space-x-4 mb-6">
        {departmentList?.length
                ? departmentList.map((department) => (
          <button
            onClick={() => onTabChange(department)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab != null && activeTab.id === department.id
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            <span>{department.name} ({department.status_count} etapas)</span>
          </button>
        )) :
          <div className="font-mono text-sm">
            <div className="font-medium text-gray-900">Nenhum Setor encontrado</div>
          </div>
        }
      </div>

      {/* Detailed Progress Steps */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {statusList?.length
          ? statusList.map((status, index) => (
          <button
            key={status.id}
            onClick={() => onStatusClick(status)}
            style={getColumnHeaderStyle(status.color)} 
            className={`p-3 rounded-lg text-center transition-all duration-300 border-2 ${
              selectedStatus != null && selectedStatus.id === status.id
                ? `${status.color} text-white border-gray-800 shadow-lg scale-105`
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div 
              style={selectedStatus != null && selectedStatus.id === status.id ? { backgroundColor: `${status.color}`, color: 'black'} 
                 : getColumnHeaderStyle(status.color)} 
              className={`w-6 h-6 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold ${
              selectedStatus != null && selectedStatus.id === status.id ? 'bg-white text-gray-800' : ' text-white'
            }`}>
              {index + 1}
            </div>
            <div className="text-xs font-medium leading-tight">{status?.name}</div>
          </button>
        )) :
          <div className="font-mono text-sm">
            <div className="font-medium text-gray-900">Nenhum Status encontrado</div>
          </div>
        }
      </div>

      {/* Reset Filter Button */}
      {selectedStatus && (
        <div className="mt-4 text-center">
          <button
            onClick={() => onStatusClick(null)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Mostrar Todos os Status
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailedProgressBarOld;
