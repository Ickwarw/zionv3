
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { configService } from '@/services/api';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { formatAxiosError } from '../ui/formatResponseError';
import { confService } from './service/confService';
import { showSuccessAlert } from '../ui/alert-dialog-success';

const ConfiguracoesGerais = () => {
  const [configList, setConfigList]  = useState([]);
  const [companyNameId, setCompanyNameId] = useState(null);
  const [gmtId, setGmtId] = useState(null);
  const [currencyId, setCurrencyId] = useState(null);
  const [formData, setFormData] = useState({
    company_name: null,
    gmt: null,
    currency: null,
  });

  const {
    handleSaveConfig
  } = confService();

  const handleSave = () => {
    handleSaveConfig(companyNameId, 'general.company_name', formData.company_name);
    handleSaveConfig(currencyId, 'general.currency', formData.currency);
    handleSaveConfig(gmtId, 'general.gmt', formData.gmt);
    showSuccessAlert("Configurações Salvas", "Configurações salvas com sucesso",null);
  };

  const fullFillConf = async (confList) => {
    let company = null;
    let currency = null;
    let gmt = null;
    confList.map((conf) => {
      if (conf.key == "general.company_name") {
        company = conf.value;
        setCompanyNameId(conf.id);
      } else if (conf.key == "general.currency") {
        currency = conf.value;
        setCurrencyId(conf.id);
      } else if (conf.key == "general.gmt") {
       setGmtId(conf.id);
        gmt = conf.value;
      }
    });
    if (company == null) {
      company = '';
    }
    if (currency == null) {
      currency = 'BRL';
    }
    if (gmt == null) {
      gmt = 'UTC-3';
    }
    setFormData({
      company_name: company,
      currency: currency,
      gmt: gmt
    });
  };

  const getGeneralConf = async () => {
    try {
      const response = await configService.getConfigsByGroup("general");
      if (response.status == 200) {
          setConfigList(response.data.configs);
          await fullFillConf(response.data.configs);
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
    getGeneralConf();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Configurações Gerais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
            <Input
              id="nomeEmpresa"
              value={formData.company_name}
              onChange={(e) => setFormData({...formData, company_name: e.target.value})}
            />
          </div>
          
          {/* <div>
            <Label htmlFor="fusoHorario">Fuso Horário</Label>
            <Select value={formData.gmt} onValueChange={(value) => setFormData({...formData, gmt: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC-3">UTC-3 (Brasília)</SelectItem>
                <SelectItem value="UTC-2">UTC-2 (Fernando de Noronha)</SelectItem>
                <SelectItem value="UTC-4">UTC-4 (Manaus)</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          {/* <div>
            <Label htmlFor="moeda">Moeda</Label>
            <Select value={formData.moeda} onValueChange={(value) => setFormData({...formData, moeda: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Real (BRL)</SelectItem>
                <SelectItem value="USD">Dólar (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesGerais;
