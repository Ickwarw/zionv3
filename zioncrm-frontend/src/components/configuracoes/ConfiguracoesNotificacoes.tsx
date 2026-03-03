
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { configService } from '@/services/api';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { formatAxiosError } from '../ui/formatResponseError';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { confService } from './service/confService';

export interface User {
  first_name: string;
  last_name: string;
  email: string;
}

const ConfiguracoesNotificacoes = () => {
  const [configEmailExists, setConfigEmailExists] = useState(false);
  const [configPushExists, setConfigPushExists] = useState(false);
  const [configReportExists, setConfigReportExists] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) as User : null;
  });
  const [notificacoes, setNotificacoes] = useState({
    email: true,
    push: true,
    relatorios: false
  });

  const handleToggle = (tipo: keyof typeof notificacoes) => {
    setNotificacoes(prev => ({
      ...prev,
      [tipo]: !prev[tipo]
    }));
  };

  const {
      handleSaveConfig
    } = confService();

  const handleSave = () => {
    console.log('Configurações de notificações salvas:', notificacoes);
    handleSaveConfig(configEmailExists ? 1 : null, `notification.user.${user.email}.email`, notificacoes.email ? 'true' : 'false');
    handleSaveConfig(configPushExists ? 1 : null, `notification.user.${user.email}.push`, notificacoes.push ? 'true' : 'false');
    handleSaveConfig(configReportExists ? 1 : null, `notification.user.${user.email}.report`, notificacoes.relatorios ? 'true' : 'false');
  };

  const fullFillConf = async (configs) => {
    let email = 'email' in configs ? configs['email'] == 'true' : null;
    let push = 'push' in configs ? configs['push'] == 'true' : null;
    let report = 'report' in configs ? configs['report'] == 'true' : null;
    setConfigEmailExists('email' in configs);
    setConfigPushExists('push' in configs);
    setConfigReportExists('report' in configs);
    // confList.map((conf) => {
    //   if (conf.key == `notification.user.${user.email}.email`) {
    //     email = conf.value;
    //     emailpId(conf.id);
    //   } else if (conf.key == `notification.user.${user.email}.push`) {
    //     push = conf.value;
    //     setPushId(conf.id);
    //   } else if (conf.key == `notification.user.${user.email}.report`) {
    //     setReportId(conf.id);
    //     report = conf.value;
    //   }
    // });
    setNotificacoes({
      email: email,
      push: push,
      relatorios: report
    });
  };

  const getConf = async () => {
    try {
      const response = await configService.getNotificationSettings();
      if (response.status == 200) {
          await fullFillConf(response.data.notifications);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar as configurações", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar as configurações", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Week Config:', error);
        showErrorAlert('Erro ao carregar as configurações', formatAxiosError(error));
    }
  }

  useEffect(() => {
    getConf();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Notificações</h2>
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-notifications">Notificações por Email</Label>
            <p className="text-sm text-gray-600">Receber notificações importantes por email</p>
          </div>
          <Switch
            id="email-notifications"
            checked={notificacoes.email}
            onCheckedChange={() => handleToggle('email')}
          />
        </div>
        {/* <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="push-notifications">Notificações Push</Label>
            <p className="text-sm text-gray-600">Receber notificações no navegador</p>
          </div>
          <Switch
            id="push-notifications"
            checked={notificacoes.push}
            onCheckedChange={() => handleToggle('push')}
          />
        </div> */}
        {/* <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="weekly-reports">Relatórios Semanais</Label>
            <p className="text-sm text-gray-600">Receber resumo semanal de atividades</p>
          </div>
          <Switch
            id="weekly-reports"
            checked={notificacoes.relatorios}
            onCheckedChange={() => handleToggle('relatorios')}
          />
        </div> */}
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave}>Salvar Configurações</Button>
      </div>
    </div>
  );
};

export default ConfiguracoesNotificacoes;
