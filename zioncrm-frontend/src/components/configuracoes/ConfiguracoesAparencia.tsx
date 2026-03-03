
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner';
import { confService } from './service/confService';
import { formatAxiosError } from '../ui/formatResponseError';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { configService } from '@/services/api';
import { showSuccessAlert } from '../ui/alert-dialog-success';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { LabelH2 } from '../ui/label-h2';
import { LabelH3 } from '../ui/label-h3';

const ConfiguracoesAparencia = () => {
  const { currentTheme, setTheme, themes } = useTheme();
  const [themeId, setThemeId]  = useState(null);

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    toast.success('Tema alterado com sucesso!');
  };

  const {
    handleSaveConfig
  } = confService();

  const handleSave = () => {
    // toast.success('Configurações de aparência salvas! zion-theme');
    handleSaveConfig(themeId, 'appearance.zion-theme', currentTheme);
    showSuccessAlert("Configurações Salvas", "Configurações salvas com sucesso",null);
  };

  const fullFillConf = async (confList) => {
    let theme = null;
    confList.map((conf) => {
      if (conf.key == "appearance.zion-theme") {
        theme = conf.value;
        setThemeId(conf.id);
      }
    });
    setTheme(theme);
  };

  const getConf = async () => {
    try {
      const response = await configService.getConfigsByGroup("appearance");
      if (response.status == 200) {
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
    getConf();
  }, []);

  return (
    <Card className="bg-white rounded-2xl p-6 shadow-lg">
      <CardTitle>
        <LabelH2 value={"Aparência"}/>
      </CardTitle>
      <CardContent>
        <LabelH3 value={"Selecionar Tema"} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {themes.map((tema) => (
            <div
              key={tema.id}
              onClick={() => handleThemeChange(tema.id)}
              className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                currentTheme === tema.id 
                  ? 'scale-105 shadow-lg' 
                  : 'hover:scale-102'
              }`}
              style={{
                borderColor: currentTheme === tema.id ? 'var(--theme-primary)' : 'var(--theme-border)',
                backgroundColor: currentTheme === tema.id ? 'var(--theme-muted)' : 'transparent'
              }}
            >
              <div className={`w-full h-16 bg-gradient-to-r ${tema.gradient} rounded-lg mb-2`}></div>
              <p className="text-sm font-medium text-center" style={{ color: 'var(--theme-text)' }}>
                {tema.name}
              </p>
              {currentTheme === tema.id && (
                <div className="text-center mt-2">
                  <span className="text-xs px-2 py-1 rounded-full" style={{ 
                    backgroundColor: 'var(--theme-primary)', 
                    color: 'white' 
                  }}>
                    Ativo
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        
      </CardContent>
      <CardFooter className="justify-end">
          <Button 
            onClick={handleSave}
            className="hover:opacity-90"
          >
            Salvar Configurações
          </Button>
        </CardFooter>
    </Card>
  );
};

export default ConfiguracoesAparencia;
