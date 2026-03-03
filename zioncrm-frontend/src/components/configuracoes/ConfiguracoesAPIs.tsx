
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
import { Eye, EyeOff } from 'lucide-react';

const ConfiguracoesAPIs = () => {
  const [whatsappTokenId, setWhatsappTokenId]  = useState(null);
  const [whatsappPhoneId, setwhatsappPhoneId]  = useState(null);
  const [whatsappWebhookId, setWhatsappWebhookId]  = useState(null);
  const [whatsappVerifyTokenId, setWhatsappVerifyTokenId]  = useState(null);
  
  const [whatsappData, setWhatsappData] = useState({
    tokenAcesso: '',
    phoneNumberId: '',
    webhookUrl: '',
    tokenVerificacao: ''
  });

  const [facebookTokenId, setFacebookTokenId]  = useState(null);
  const [facebookSecretId, setFacebookSecretId]  = useState(null);
  const [facebookVerifyTokenId, setFacebookVerifyTokenId]  = useState(null);
  const [facebookWebhookId, setFacebookWebhookId]  = useState(null);
  const [facebookData, setFacebookData] = useState({
    tokenAcessoPagina: '',
    appSecret: '',
    tokenVerificacao: '',
    webhookUrl: ''
  });

  const [instagramTokenId, setInstagramTokenId]  = useState(null);
  const [instagramAccountId, setInstagramAccountId]  = useState(null);
  const [instagramVerifyTokenId, setInstagramVerifyTokenId]  = useState(null);
  const [instagramWebhookId, setInstagramWebhookId]  = useState(null);
  const [instagramData, setInstagramData] = useState({
    tokenAcesso: '',
    idContaComercial: '',
    tokenVerificacao: '',
    webhookUrl: ''
  });

  const [inputShowData, setInputShowData] = useState([]);

  const {
      handleSaveConfig
    } = confService();

  // const handleSave = () => {
  //   // console.log('Configurações Meta APIs salvas:', { whatsappData, facebookData, instagramData });
  //   handleSaveConfig(whatsappTokenId, 'whatsapp.token', whatsappData.tokenAcesso);
  //   handleSaveConfig(whatsappPhoneId, 'whatsapp.phone', whatsappData.phoneNumberId);
  //   handleSaveConfig(whatsappWebhookId, 'whatsapp.webhook', whatsappData.webhookUrl);
  //   // handleSaveConfig(whatsappVerifyTokenId, 'whatsapp.verify_token', whatsappData.tokenVerificacao);

  //   handleSaveConfig(facebookTokenId, 'facebook.token', facebookData.tokenAcessoPagina);
  //   handleSaveConfig(facebookSecretId, 'facebook.secret', facebookData.appSecret);
  //   // handleSaveConfig(facebookVerifyTokenId, 'facebook.verify_token', facebookData.tokenVerificacao);
  //   handleSaveConfig(facebookWebhookId, 'facebook.webhook', facebookData.webhookUrl);
    
  //   handleSaveConfig(instagramTokenId, 'instagram.token', instagramData.tokenAcesso);
  //   handleSaveConfig(instagramAccountId, 'instagram.account', instagramData.idContaComercial);
  //   // handleSaveConfig(instagramVerifyTokenId, 'instagram.verify_token', instagramData.tokenVerificacao);
  //   handleSaveConfig(instagramWebhookId, 'instagram.webhook', instagramData.webhookUrl);
  //   showSuccessAlert ("Configurações Salvas", "Configurações salvas com sucesso",null);
  // };

  const handleSave = () => {
    // console.log('Configurações Meta APIs salvas:', { whatsappData, facebookData, instagramData });
    let configApis = [
      { id: whatsappTokenId, key: 'whatsapp.token', value: whatsappData.tokenAcesso },
      { id: whatsappPhoneId, key: 'whatsapp.phone', value: whatsappData.phoneNumberId },
      { id: whatsappWebhookId, key: 'whatsapp.webhook', value: whatsappData.webhookUrl },
      // { id: whatsappVerifyTokenId, key: 'whatsapp.verify_token', value: whatsappData.tokenVerificacao },

      { id: facebookTokenId, key: 'facebook.token', value: facebookData.tokenAcessoPagina },
      { id: facebookSecretId, key: 'facebook.secret', value: facebookData.appSecret },
      // { id: facebookVerifyTokenId, key: 'facebook.verify_token', value: facebookData.tokenVerificacao },
      { id: facebookWebhookId, key: 'facebook.webhook', value: facebookData.webhookUrl },

      { id: instagramTokenId, key: 'instagram.token', value: instagramData.tokenAcesso },
      { id: instagramAccountId, key: 'instagram.account', value: instagramData.idContaComercial },
      // { id: instagramVerifyTokenId, key: 'instagram.verify_token', value: instagramData.tokenVerificacao },
      { id: instagramWebhookId, key: 'instagram.webhook', value: instagramData.webhookUrl },
    ];
    configApis = configApis.filter(config => config.value != null && config.value.trim() !== '');
    confService().saveConfigApis(configApis);
    showSuccessAlert ("Configurações Salvas", "Configurações salvas com sucesso",null);
  };


  const fullFillConfInstagram = async (confList) => {
    let token = null;
    let account = null;
    let tokenVerificacao = null;
    let webhookUrl = null;
    confList.map((conf) => {
      if (conf.key == "instagram.token") {
        token = conf.value;
        setInstagramTokenId(conf.id);
      } else if (conf.key == "instagram.account") {
        account = conf.value;
        setInstagramAccountId(conf.id);
      } else if (conf.key == "instagram.verify_token") {
        tokenVerificacao = conf.value;
        setInstagramVerifyTokenId(conf.id);
       } else if (conf.key == "instagram.webhook") {
        webhookUrl = conf.value;
        setInstagramWebhookId(conf.id);
      }
    });
    setInstagramData({
      tokenAcesso: token,
      idContaComercial: account,
      tokenVerificacao: tokenVerificacao,
      webhookUrl: webhookUrl
    });
  };

  const fullFillConfFacebook = async (confList) => {
    let token = null;
    let secret = null;
    let tokenVerificacao = null;
    let webhookUrl = null;
    confList.map((conf) => {
      if (conf.key == "facebook.token") {
        token = conf.value;
        setFacebookTokenId(conf.id);
      } else if (conf.key == "facebook.secret") {
        secret = conf.value;
        setFacebookSecretId(conf.id);
      } else if (conf.key == "facebook.verify_token") {
        tokenVerificacao = conf.value;
        setFacebookVerifyTokenId(conf.id);
       } else if (conf.key == "facebook.webhook") {
        webhookUrl = conf.value;
        setFacebookWebhookId(conf.id);
      }
    });
    setFacebookData({
      tokenAcessoPagina: token,
      appSecret: secret,
      tokenVerificacao: tokenVerificacao,
      webhookUrl: webhookUrl
    });
  };

  const fullFillConfWhatsapp = async (confList) => {
    let token = null;
    let phone = null;
    let webhook = null;
    let verify_token = null;
    confList.map((conf) => {
      if (conf.key == "whatsapp.token") {
        token = conf.value;
        setWhatsappTokenId(conf.id);
      } else if (conf.key == "whatsapp.phone") {
        phone = conf.value;
        setwhatsappPhoneId(conf.id);
      } else if (conf.key == "whatsapp.webhook") {
        setWhatsappWebhookId(conf.id);
        webhook = conf.value;
      } else if (conf.key == "whatsapp.verify_token") {
        setWhatsappVerifyTokenId(conf.id);
        verify_token = conf.value;
      }
    });
    setWhatsappData({
      tokenAcesso: token,
      phoneNumberId: phone,
      webhookUrl: webhook,
      tokenVerificacao: verify_token
    });
  };

  const getConf = async (group) => {
    // console.log('Carregando configurações para o grupo:', group);
    try {
      const response = await configService.getConfigsByGroup(group);
      if (response.status == 200) {
          if (group == 'whatsapp') {
            fullFillConfWhatsapp(response.data.configs);
          } else if (group == 'facebook') {
            fullFillConfFacebook(response.data.configs);
           } else if (group == 'instagram') {
            fullFillConfInstagram(response.data.configs);
          }

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
    getConf('whatsapp');
    getConf('facebook');
    getConf('instagram');
  }, []);

  const showInputSecretData = (inputId) => {
    if (inputShowData.includes(inputId)) {
      setInputShowData(inputShowData.filter(id => id !== inputId));
    } else {
      setInputShowData([...inputShowData, inputId]);
    }
  }
  
  const isInputTypePassword = (inputId) => {
    return !inputShowData.includes(inputId);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">APIs</h2>
        
        {/* WhatsApp Business API */}
        <div className="p-4 border border-gray-200 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">WhatsApp Business API</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="whatsapp-token">Token de Acesso</Label>
              <div className="relative">
                <Input
                  id="whatsapp-token"
                  type={isInputTypePassword('whatsapp-token') ? 'password' : 'text'}
                  placeholder="••••••••••••••••"
                  value={whatsappData.tokenAcesso}
                  onChange={(e) => setWhatsappData({...whatsappData, tokenAcesso: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => showInputSecretData('whatsapp-token')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {!isInputTypePassword('whatsapp-token') ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="phone-number-id">Phone Number ID</Label>
              <Input
                id="phone-number-id"
                placeholder="123456789012345"
                value={whatsappData.phoneNumberId}
                onChange={(e) => setWhatsappData({...whatsappData, phoneNumberId: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://exemplo.com/webhook"
                value={whatsappData.webhookUrl}
                onChange={(e) => setWhatsappData({...whatsappData, webhookUrl: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="token-verificacao">Token de Verificação</Label>
              <div className="relative">
                <Input
                  id="token-verificacao"
                  type={isInputTypePassword('whatsapp-token-verificacao') ? 'password' : 'text'}
                  placeholder="••••••••••••••••"
                  readOnly
                  value={whatsappData.tokenVerificacao}
                  onChange={(e) => setWhatsappData({...whatsappData, tokenVerificacao: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => showInputSecretData('whatsapp-token-verificacao')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {!isInputTypePassword('whatsapp-token-verificacao') ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Facebook Messenger API */}
        <div className="p-4 border border-gray-200 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Facebook Messenger API</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="facebook-token">Token de Acesso da Página</Label>
              <div className="relative">
                <Input
                  id="facebook-token"
                  type={isInputTypePassword('facebook-token') ? 'password' : 'text'}
                  placeholder="••••••••••••••••"
                  value={facebookData.tokenAcessoPagina}
                  onChange={(e) => setFacebookData({...facebookData, tokenAcessoPagina: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => showInputSecretData('facebook-token')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {!isInputTypePassword('facebook-token') ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="app-secret">App Secret</Label>
              <div className="relative">
                <Input
                  id="app-secret"
                  type={isInputTypePassword('facebook-app-secret') ? 'password' : 'text'}
                  placeholder="••••••••••••••••"
                  value={facebookData.appSecret}
                  onChange={(e) => setFacebookData({...facebookData, appSecret: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => showInputSecretData('facebook-app-secret')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {!isInputTypePassword('facebook-app-secret') ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://exemplo.com/webhook"
                value={facebookData.webhookUrl}
                onChange={(e) => setFacebookData({...facebookData, webhookUrl: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="token-verificacao">Token de Verificação</Label>
              <div className="relative">
                <Input
                  id="token-verificacao"
                  type={isInputTypePassword('facebook-token-verificacao') ? 'password' : 'text'}
                  placeholder="••••••••••••••••"
                  readOnly
                  value={facebookData.tokenVerificacao}
                  onChange={(e) => setFacebookData({...facebookData, tokenVerificacao: e.target.value})}
                />
                <button
                    type="button"
                    onClick={() => showInputSecretData('facebook-token-verificacao')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {!isInputTypePassword('facebook-token-verificacao') ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instagram Direct API */}
        <div className="p-4 border border-gray-200 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Instagram Direct API</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instagram-token">Token de Acesso</Label>
               <div className="relative">
                <Input
                  id="instagram-token"
                  type={isInputTypePassword('instagram-token') ? 'password' : 'text'}
                  placeholder="••••••••••••••••"
                  value={instagramData.tokenAcesso}
                  onChange={(e) => setInstagramData({...instagramData, tokenAcesso: e.target.value})}
                />
                <button
                    type="button"
                    onClick={() => showInputSecretData('instagram-token')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {!isInputTypePassword('instagram-token') ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
              </div>
            </div>
            <div>
              <Label htmlFor="conta-comercial">App Secret</Label>
              <div className="relative">
                <Input
                  id="conta-comercial"
                  type={isInputTypePassword('instagran-app-secret') ? 'password' : 'text'}
                  placeholder="••••••••••••••••"
                  value={instagramData.idContaComercial}
                  onChange={(e) => setInstagramData({...instagramData, idContaComercial: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => showInputSecretData('instagran-app-secret')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {!isInputTypePassword('instagran-app-secret') ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://exemplo.com/webhook"
                value={instagramData.webhookUrl}
                onChange={(e) => setInstagramData({...instagramData, webhookUrl: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="token-verificacao">Token de Verificação</Label>
              <div className="relative">
                <Input
                  id="token-verificacao"
                  type={isInputTypePassword('instagram-token-verificacao') ? 'password' : 'text'}
                  placeholder="••••••••••••••••"
                  readOnly
                  value={instagramData.tokenVerificacao}
                  onChange={(e) => setInstagramData({...instagramData, tokenVerificacao: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => showInputSecretData('instagram-token-verificacao')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {!isInputTypePassword('instagram-token-verificacao') ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesAPIs;
