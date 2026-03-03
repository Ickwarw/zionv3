
import React, { useState } from 'react';
import TarefasHeader from './components/TarefasHeader';
import TarefasStats from './components/TarefasStats';
import TarefasContent from './components/TarefasContent';
import JuliaControls from './components/JuliaControls';
import NovaTarefaModal from './components/NovaTarefaModal';
import { useTarefas } from './hooks/useTarefas';
import { useJulia } from './hooks/useJulia';
import { useTarefasMain } from './hooks/useTarefasMain';
import { Task } from './types/tarefas.types';
import TaskDetails from './components/TaskDetails';
import TaskComments from './components/TaskComments';
import TaskFilter from './components/TaskFilter';

const Tarefas = () => {
  const [activeTab, setActiveTab] = useState('todas');
  const [showNovaTarefa, setShowNovaTarefa] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedTask, setSelectedTask] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [taskFilter, setTaskFilter] = useState({});
  const [showFilter, setShowFilter] = useState(false);
  
  const {
    tasks,
    filterTask,
    refreshData
  } = useTarefas();

  const {
    isJuliaActive,
    juliaMessage,
    juliaPosition,
    showJuliaBubble,
    handleJuliaToggle,
    handleElementClick,
    handleCloseBubble
  } = useJulia();

  const displayedTarefas = activeTab === 'todas' ? tasks : filterTask(activeTab);

  const handleNovaTarefaClick = () => {
    setShowNovaTarefa(true);
  };

  const handleCloseNovaTarefa = () => {
    setShowNovaTarefa(false);
  };

  const handleNovaTarefa = () => {
    setShowNovaTarefa(false);
    refreshData(taskFilter);
  };


  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleTaskEditClick = (task) => {
    setEditMode(true);
    setSelectedTask(task);
  };

  const handleCloseTask = () => {
    setEditMode(false);
    setSelectedTask(false);
    setTaskId(null);
  };

  const onTaskComments = (taskId) => {
    setTaskId(taskId);
  }

  const applyFilter = (filter) => {
    console.log("applyFilter: ", filter);
    setTaskFilter(filter);
    setShowFilter(false);
    refreshData(filter);
  }

  return (
    <div className="p-6 space-y-6">
      <JuliaControls
        isJuliaActive={isJuliaActive}
        onJuliaToggle={handleJuliaToggle}
        showJuliaBubble={showJuliaBubble}
        juliaMessage={juliaMessage}
        juliaPosition={juliaPosition}
        onCloseBubble={handleCloseBubble}
      />

      <TarefasHeader
        viewMode={viewMode}
        setShowFilter={setShowFilter}
        setViewMode={setViewMode}
        onNovaTarefa={handleNovaTarefaClick}
        onElementClick={handleElementClick}
        isJuliaActive={isJuliaActive}
      />

      <TarefasContent
        viewMode={viewMode}
        tarefas={displayedTarefas}
        onTaskUpdate={() => refreshData(taskFilter)}
        onTaskClick={handleTaskClick}
        onTaskEditClick={handleTaskEditClick}
        isJuliaActive={isJuliaActive}
        onElementClick={handleElementClick}
        onTaskComments={onTaskComments}
      />

       <TarefasStats
        onElementClick={handleElementClick}
        isJuliaActive={isJuliaActive}
      />

      {showNovaTarefa && (
        <NovaTarefaModal
          isOpen={showNovaTarefa}
          onClose={handleCloseNovaTarefa}
          onSave={handleNovaTarefa}
          isJuliaActive={isJuliaActive}
          onElementClick={handleElementClick}
        />
      )}

      {selectedTask && (
        <TaskDetails
          editMode={editMode}
          onClose={handleCloseTask}
          onTaskUpdate={() => refreshData(taskFilter)}
          task={selectedTask}
          isJuliaActive={isJuliaActive}
          onElementClick={handleElementClick}
        />
      )}

      {taskId && (
        <TaskComments
          taskId={taskId}
          onClose={handleCloseTask}
          isJuliaActive={isJuliaActive}
          onElementClick={handleElementClick}
        />
      )}

       {showFilter && (
        <TaskFilter
          isOpen={showFilter}
          onApply={applyFilter}
          oldFilter={taskFilter}
          onCancel={() => setShowFilter(false)}
          isJuliaActive={isJuliaActive}
          onElementClick={handleElementClick}
        />
      )}
    </div>
  );
};

export default Tarefas;
