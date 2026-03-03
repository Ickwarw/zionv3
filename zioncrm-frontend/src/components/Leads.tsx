
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LeadsHeader from './leads/components/LeadsHeader';
import LeadsKanban from './leads/components/LeadsKanban';
import LeadsTable from './leads/components/LeadsTable';
import LeadModal from './leads/components/LeadModal';
import DetailedProgressBar from './leads/components/DetailedProgressBar';
import LeadsSearch from './leads/components/LeadsSearch';
import { Lead, LeadDepartment, LeadStatus } from './leads/types/leads.types';
import { useJulia } from './tarefas/hooks/useJulia';
import JuliaControls from './tarefas/components/JuliaControls';
import { leadsService } from '@/services/api';
import { showWarningAlert } from './ui/alert-dialog-warning';
import { showErrorAlert } from './ui/alert-dialog-error';
import { formatAxiosError } from './ui/formatResponseError';
import NewLeadModal from './leads/components/NewLeadModal';
import LeadDetails from './leads/components/LeadDetails';
import LeadFilter from './leads/components/LeadFilter';
import LeadActivities from './leads/components/LeadActivities';

const Leads = () => {
  const [leadList, setLeadList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [departmentSelected, setDepartmentSelected] = useState(null);
  const [statusList, setStatusList] = useState([]);
  const [statusSelected, setStatusSelected] = useState(null);
  
  const [editMode, setEditMode] = useState(false);
  const { isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [leadSelecionado, setLeadSelecionado] = useState<Lead | null>(null);
  const [showNovoLeadModal, setShowNovoLeadModal] = useState(false);
  // const [activeTab, setActiveTab] = useState<'marketing' | 'vendas' | 'posvenda'>('marketing');
  // const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [leadFilter, setLeadFilter] = useState({});
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] =  useState(0);
  const [totalLeads, setTotalLeads] =  useState(0);
  const [search, setSearch] =  useState('');
  const [leadSelectedActivities, setLeadSelectedActivities] = useState(null);

  const {
    isJuliaActive,
    juliaMessage,
    juliaPosition,
    showJuliaBubble,
    handleJuliaToggle,
    handleElementClick,
    handleCloseBubble
  } = useJulia();

  const fetchDepartments = async () => {
    try {
      const response = await leadsService.getLeadDepartments();
      if (response.status == 200 || response.status == 201) {
         setDepartmentList(response.data.departments);
        if (response.data.departments.length > 0) {
          setDepartmentSelected(response.data.departments[0]);
        }
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível obter os Setores", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível obter os Setores", response.data,null);
        }
      }
    } catch (error) {
      console.error('Failed to get Departments:', error);
      showErrorAlert('Erro ao obter os Setores', formatAxiosError(error));
    }
  };

  const fetchStatus = async () => {
    if (departmentSelected == null) return;
    try {
      const response = await leadsService.getLeadDepartmentStatuses(departmentSelected.id);
      if (response.status == 200 || response.status == 201) {
          setStatusList(response.data.statuses);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível obter os Status", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível obter os Status", response.data,null);
        }
      }
    } catch (error) {
      console.error('Failed to get Status:', error);
      showErrorAlert('Erro ao obter os Status', formatAxiosError(error));
    }
  };

  const fetchLeads = async (params: any) => {
    if (departmentSelected == null) return;
    try {
      let filter = {
        ...params,
        department_id: departmentSelected.id,
        page: currentPage,
        per_page: itemsPerPage
      }
      const response = await leadsService.getLeads(filter);
      if (response.status == 200 || response.status == 201) {
         setLeadList(response.data.leads);
         setTotalPages(response.data.pages);
         setTotalLeads(response.data.total)
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível obter as Leads", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível obter as Leads", response.data,null);
        }
      }
    } catch (error) {
      console.error('Failed to get Leads:', error);
      showErrorAlert('Erro ao obter as Leads', formatAxiosError(error));
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchStatus();
      fetchLeads(leadFilter);
    };
     run();
  }, [departmentSelected]);

  useEffect(() => {
    const run = async () => {
      fetchLeads(leadFilter);
      // applyFilter();
    };

    run();
  }, [currentPage]);

  const handleLeadClick = (lead: Lead) => {
    setLeadSelecionado(lead);
  };

  const handleSaveNovoLead = () => {
    console.log('Novo lead');
    setShowNovoLeadModal(false);
    fetchLeads(leadFilter);
  };

  const handleStatusChange = () => {
    console.log('Status change:');
    fetchLeads(leadFilter);
  };

  const handleStatusClick = (status: LeadStatus) => {
    setStatusSelected(status);
  };

  const handleTabChange = (department: LeadDepartment) => {
    setDepartmentSelected(department);
    setStatusSelected(null);
  };

  const handleLeadEditClick = (lead: Lead) => {
    setEditMode(true);
    setLeadSelecionado(lead);
  };

  const handleLeadEditClose = () => {
    setEditMode(false);
    setLeadSelecionado(null);
    fetchLeads(leadFilter);
  };

  const filteredLeads = search && search.trim() != '' 
    ? leadList.filter(lead => 
          lead.name.toLowerCase().includes(search.toLowerCase()) || 
          (lead.email != null && lead.email.toLowerCase().includes(search.toLowerCase())) ||
          (lead.phone != null && lead.phone.toLowerCase().includes(search.toLowerCase())) ||
          (lead.company != null && lead.company.toLowerCase().includes(search.toLowerCase())) ||
          (lead.position != null && lead.position.toLowerCase().includes(search.toLowerCase())) ||
          (lead.address != null && lead.address.toLowerCase().includes(search.toLowerCase())) ||
          (lead.city != null && lead.city.toLowerCase().includes(search.toLowerCase())) ||
          (lead.state != null && lead.state.toLowerCase().includes(search.toLowerCase())) ||
          (lead.zip_code != null && lead.zip_code.toLowerCase().includes(search.toLowerCase())) ||
          (lead.country != null && lead.country.toLowerCase().includes(search.toLowerCase())) ||
          (lead.status_id != null && lead.status.name.toLowerCase().includes(search.toLowerCase())) ||
          (lead.source_id != null && lead.source.name.toLowerCase().includes(search.toLowerCase())) ||
          (lead.assigned_to != null && lead.assigned_user.name.toLowerCase().includes(search.toLowerCase()))        
      )
    : leadList;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Faça login para acessar o sistema de leads.</p>
        </div>
      </div>
    );
  }

  const applyFilter = (filter) => {
    console.log("applyFilter: ", filter);
    setLeadFilter(filter);
    setShowFilter(false);
    fetchLeads(filter);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <JuliaControls
        isJuliaActive={isJuliaActive}
        onJuliaToggle={handleJuliaToggle}
        showJuliaBubble={showJuliaBubble}
        juliaMessage={juliaMessage}
        juliaPosition={juliaPosition}
        onCloseBubble={handleCloseBubble}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        <LeadsHeader
          onNewLead={() => setShowNovoLeadModal(true)}
          onElementClick={handleElementClick}
          isJuliaActive={isJuliaActive}
          setViewMode={setViewMode}
          viewMode={viewMode}
          setShowFilter={setShowFilter}
        />

        { statusList && departmentList && (
          <DetailedProgressBar
            activeTab={departmentSelected}
            selectedStatus={statusSelected}
            departmentList={departmentList}
            statusList={statusList}
            onStatusClick={handleStatusClick}
            onTabChange={handleTabChange}
          />
        )}

        <LeadsSearch
          currentLeadsCount={totalLeads}
          setSearch={setSearch}
          search={search}
          onElementClick={handleElementClick}
          isJuliaActive={isJuliaActive}
        />

        {viewMode === 'kanban' ? (
          <LeadsKanban
            leads={filteredLeads}
            onLeadClick={handleLeadClick}
            onStatusChange={handleStatusChange}
            onLeadActivityClick={setLeadSelectedActivities}
            isJuliaActive={isJuliaActive}
            onElementClick={handleElementClick}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalItens={totalLeads}
            statusList={statusList}
          />
        ) : (
          <LeadsTable
            leads={filteredLeads}
            activeTab={departmentSelected}
            onLeadClick={handleLeadClick}
            onLeadEditClick={handleLeadEditClick}
            onLeadActivityClick={setLeadSelectedActivities}
            isJuliaActive={isJuliaActive}
            onLeadUpdate={() => fetchLeads(leadFilter)}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalItens={totalLeads}
          />
        )}
      </div>

      {/* {leadSelecionado && (
        <LeadModal
          isOpen={true}
          onClose={() => setLeadSelecionado(null)}
          lead={leadSelecionado}
        />
      )} */}

      {leadSelecionado && (
        <LeadDetails
          editMode={editMode}
          departmentList={departmentList}
          isJuliaActive={isJuliaActive}
          onElementClick={handleElementClick}
          onClose={handleLeadEditClose}
          lead={leadSelecionado}
        />
      )}

      { showNovoLeadModal && (
        <NewLeadModal
          isOpen={showNovoLeadModal}
          departmentList={departmentList}
          onClose={() => setShowNovoLeadModal(false)}
          onSave={handleSaveNovoLead}
        />
      )}

      { showFilter && (
        <LeadFilter
          isJuliaActive={isJuliaActive}
          oldFilter={leadFilter}
          onApply={applyFilter}
          onCancel={() => setShowFilter(false)}
          onElementClick={handleElementClick}
          isOpen={showFilter}
        />
      )}
      { leadSelectedActivities && (
        <LeadActivities
          isJuliaActive={isJuliaActive}
          leadId={leadSelectedActivities.id}
          onClose={() => setLeadSelectedActivities(null)}
          onElementClick={handleElementClick}
        />
      )}
    </div>
  );
};

export default Leads;
