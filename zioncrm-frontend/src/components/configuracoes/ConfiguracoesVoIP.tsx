
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { configService } from '@/services/api';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { formatAxiosError } from '../ui/formatResponseError';
import { confService } from './service/confService';
import { showSuccessAlert } from '../ui/alert-dialog-success';
import { voipService } from '@/services/api';

const ConfiguracoesVoIP = () => {
  const [configList, setConfigList]  = useState([]);
  const [servidorSipId, setServidorSipId] = useState(null);
  const [portaSipId, setPortaSipId] = useState(null);
  const [usuarioSipId, setUsuarioSipId] = useState(null);
  const [senhaSipId, setSenhaSipId] = useState(null);
  const [codecAudioId, setCodecAudioId] = useState(null);
  const [qualidadeAudioId, setQualidadeAudioId] = useState(null);
  const [wsPathId, setWsPathId] = useState(null);
  
  const [formData, setFormData] = useState({
    servidorSip: null,
    portaSip: null,
    usuarioSip: null,
    senhaSip: null,
    wsPath: null,
    codecAudio: null,
    qualidadeAudio: null
  });

  const {
    handleSaveConfig
  } = confService();

  const handleSave = () => {
    // console.log('Configurações VoIP salvas:', formData);
    handleSaveConfig(servidorSipId, 'voip.server', formData.servidorSip);
    handleSaveConfig(portaSipId, 'voip.port', formData.portaSip);
    handleSaveConfig(usuarioSipId, 'voip.user', formData.usuarioSip);
    handleSaveConfig(senhaSipId, 'voip.pass', formData.senhaSip);
    handleSaveConfig(wsPathId, 'voip.ws_path', formData.wsPath);
    handleSaveConfig(codecAudioId, 'voip.codec', formData.codecAudio);
    handleSaveConfig(qualidadeAudioId, 'voip.quality', formData.qualidadeAudio);
    saveVoipExtension();
  };

  const saveVoipExtension = async () => {
    if (!formData.usuarioSip || String(formData.usuarioSip).trim() === '') {
      showWarningAlert('Ramal obrigatório', 'Informe o Usuário SIP/Ramal para salvar a extensão.', null);
      return;
    }

    try {
      await voipService.createExtension({
        extension_number: formData.usuarioSip,
        password: formData.senhaSip,
        display_name: formData.usuarioSip,
        sip_server: formData.servidorSip
      });
      showSuccessAlert("Configurações Salvas", "Configurações salvas com sucesso",null);
    } catch (error) {
      showErrorAlert('Erro ao salvar extensão VoIP', formatAxiosError(error));
    }
  };

  const fullFillConf = async (confList) => {
    let server = null;
    let port = null;
    let user = null;
    let pass = null;
    let wsPath = null;
    let codec = null;
    let quality = null;
    confList.map((conf) => {
      if (conf.key == "voip.server") {
        server = conf.value;
        setServidorSipId(conf.id);
      } else if (conf.key == "voip.port") {
        port = conf.value;
        setPortaSipId(conf.id);
      } else if (conf.key == "voip.user") {
        setUsuarioSipId(conf.id);
        user = conf.value;
      } else if (conf.key == "voip.pass") {
        setSenhaSipId(conf.id);
        pass = conf.value;
      } else if (conf.key == "voip.ws_path") {
        setWsPathId(conf.id);
        wsPath = conf.value;
      } else if (conf.key == "voip.codec") {
        setCodecAudioId(conf.id);
        codec = conf.value;
      } else if (conf.key == "voip.quality") {
        setQualidadeAudioId(conf.id);
        quality = conf.value;
      }
    });
    setFormData({
      servidorSip: server,
      portaSip: port ? port : '5060',
      usuarioSip: user,
      senhaSip: pass,
      wsPath: wsPath ? wsPath : '/ws',
      codecAudio: codec ? codec : 'G.711',
      qualidadeAudio: quality ? quality : 'Alta'
    });
  };

  const getConf = async () => {
      try {
        const response = await configService.getConfigsByGroup("voip");
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

  const getVoipExtension = async () => {
    try {
      const response = await voipService.getExtension();
      if (response.status === 200 && response.data) {
        const extension = response.data;
        setFormData((prev) => ({
          ...prev,
          servidorSip: extension.sip_server || prev.servidorSip,
          usuarioSip: extension.extension_number || prev.usuarioSip,
          senhaSip: prev.senhaSip,
          wsPath: prev.wsPath || '/ws'
        }));
      }
    } catch {
      // extensão ainda não cadastrada para o usuário
    }
  };
  
    useEffect(() => {
      getConf();
      getVoipExtension();
    }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Configurações VoIP</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="servidorSip">Servidor SIP</Label>
          <Input
            id="servidorSip"
            placeholder="sip.example.com"
            value={formData.servidorSip}
            onChange={(e) => setFormData({...formData, servidorSip: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="portaSip">Porta SIP</Label>
          <Input
            id="portaSip"
            type="number"
            value={formData.portaSip}
            onChange={(e) => setFormData({...formData, portaSip: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="usuarioSip">Usuário SIP</Label>
          <Input
            id="usuarioSip"
            placeholder="usuario@sip.com"
            value={formData.usuarioSip}
            onChange={(e) => setFormData({...formData, usuarioSip: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="senhaSip">Senha SIP</Label>
          <Input
            id="senhaSip"
            type="password"
            placeholder="••••••••"
            value={formData.senhaSip}
            onChange={(e) => setFormData({...formData, senhaSip: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="wsPath">Path WebSocket SIP</Label>
          <Input
            id="wsPath"
            placeholder="/ws"
            value={formData.wsPath}
            onChange={(e) => setFormData({...formData, wsPath: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="codecAudio">Codec de Áudio</Label>
          <Select value={formData.codecAudio} onValueChange={(value) => setFormData({...formData, codecAudio: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="G.711">G.711 (PCMU)</SelectItem>
              <SelectItem value="G.722">G.722</SelectItem>
              <SelectItem value="G.729">G.729</SelectItem>
              <SelectItem value="Opus">Opus</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="qualidadeAudio">Qualidade de Áudio</Label>
          <Select value={formData.qualidadeAudio} onValueChange={(value) => setFormData({...formData, qualidadeAudio: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Alta">Alta</SelectItem>
              <SelectItem value="Média">Média</SelectItem>
              <SelectItem value="Baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <Button onClick={handleSave}>Salvar Configurações</Button>
      </div>
    </div>
  );
};

export default ConfiguracoesVoIP;
