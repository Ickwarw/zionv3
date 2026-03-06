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

const ConfiguracoesVoIP = () => {
  const [servidorSipId, setServidorSipId] = useState<number | null>(null);
  const [portaSipId, setPortaSipId] = useState<number | null>(null);
  const [codecAudioId, setCodecAudioId] = useState<number | null>(null);
  const [qualidadeAudioId, setQualidadeAudioId] = useState<number | null>(null);
  const [wsPathId, setWsPathId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    servidorSip: '',
    portaSip: '8088',
    wsPath: '/ws',
    codecAudio: 'G.711',
    qualidadeAudio: 'Alta'
  });

  const { handleSaveConfig } = confService();

  const handleSave = () => {
    handleSaveConfig(servidorSipId, 'voip.server', formData.servidorSip);
    handleSaveConfig(portaSipId, 'voip.port', formData.portaSip);
    handleSaveConfig(wsPathId, 'voip.ws_path', formData.wsPath);
    handleSaveConfig(codecAudioId, 'voip.codec', formData.codecAudio);
    handleSaveConfig(qualidadeAudioId, 'voip.quality', formData.qualidadeAudio);
    showSuccessAlert('Configurações Salvas', 'Configurações salvas com sucesso', null);
  };

  const fullFillConf = (confList: any[]) => {
    let server = '';
    let port = '8088';
    let wsPath = '/ws';
    let codec = 'G.711';
    let quality = 'Alta';

    confList.forEach((conf) => {
      if (conf.key === 'voip.server') {
        server = conf.value || '';
        setServidorSipId(conf.id);
      } else if (conf.key === 'voip.port') {
        port = conf.value || '8088';
        setPortaSipId(conf.id);
      } else if (conf.key === 'voip.ws_path') {
        wsPath = conf.value || '/ws';
        setWsPathId(conf.id);
      } else if (conf.key === 'voip.codec') {
        codec = conf.value || 'G.711';
        setCodecAudioId(conf.id);
      } else if (conf.key === 'voip.quality') {
        quality = conf.value || 'Alta';
        setQualidadeAudioId(conf.id);
      }
    });

    setFormData({
      servidorSip: server,
      portaSip: port,
      wsPath,
      codecAudio: codec,
      qualidadeAudio: quality
    });
  };

  const getConf = async () => {
    try {
      const response = await configService.getConfigsByGroup('voip');
      if (response.status === 200) {
        fullFillConf(response.data.configs || []);
      } else if (response.status === 400) {
        showWarningAlert('Não foi possível carregar as configurações', response.data?.message || response.data, null);
      }
    } catch (error) {
      console.error('Failed to get VoIP config:', error);
      showErrorAlert('Erro ao carregar as configurações', formatAxiosError(error));
    }
  };

  useEffect(() => {
    getConf();
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
            onChange={(e) => setFormData({ ...formData, servidorSip: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="portaSip">Porta SIP</Label>
          <Input
            id="portaSip"
            type="number"
            value={formData.portaSip}
            onChange={(e) => setFormData({ ...formData, portaSip: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="wsPath">Path WebSocket SIP</Label>
          <Input
            id="wsPath"
            placeholder="/ws"
            value={formData.wsPath}
            onChange={(e) => setFormData({ ...formData, wsPath: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="codecAudio">Codec de Áudio</Label>
          <Select value={formData.codecAudio} onValueChange={(value) => setFormData({ ...formData, codecAudio: value })}>
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
          <Select value={formData.qualidadeAudio} onValueChange={(value) => setFormData({ ...formData, qualidadeAudio: value })}>
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
