
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const ConfiguracoesLinguagem = () => {
  const [formData, setFormData] = useState({
    idiomaSistema: 'pt-BR',
    formatoData: 'DD/MM/AAAA',
    formatoHora: '24h',
    separadorDecimal: 'virgula'
  });

  const idiomas = [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en-US', label: 'English (United States)' },
    { value: 'es-ES', label: 'Español (España)' },
    { value: 'fr-FR', label: 'Français (France)' },
    { value: 'de-DE', label: 'Deutsch (Deutschland)' },
    { value: 'it-IT', label: 'Italiano (Italia)' },
    { value: 'ja-JP', label: '日本語 (Japan)' },
    { value: 'ko-KR', label: '한국어 (Korea)' },
    { value: 'zh-CN', label: '中文 (中国)' },
    { value: 'zh-TW', label: '中文 (台灣)' },
    { value: 'ru-RU', label: 'Русский (Россия)' },
    { value: 'ar-SA', label: 'العربية (السعودية)' },
    { value: 'hi-IN', label: 'हिन्दी (भारत)' },
    { value: 'nl-NL', label: 'Nederlands (Nederland)' },
    { value: 'sv-SE', label: 'Svenska (Sverige)' },
    { value: 'pl-PL', label: 'Polski (Polska)' },
    { value: 'tr-TR', label: 'Türkçe (Türkiye)' }
  ];

  const handleSave = () => {
    console.log('Configurações de linguagem salvas:', formData);
    // Aqui seria implementada a lógica para mudar todo o sistema
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Configurações de Linguagem</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="idioma">Idioma do Sistema</Label>
          <Select value={formData.idiomaSistema} onValueChange={(value) => setFormData({...formData, idiomaSistema: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {idiomas.map((idioma) => (
                <SelectItem key={idioma.value} value={idioma.value}>
                  {idioma.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="formatoData">Formato de Data</Label>
          <Select value={formData.formatoData} onValueChange={(value) => setFormData({...formData, formatoData: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/AAAA">DD/MM/AAAA</SelectItem>
              <SelectItem value="MM/DD/AAAA">MM/DD/AAAA</SelectItem>
              <SelectItem value="AAAA-MM-DD">AAAA-MM-DD</SelectItem>
              <SelectItem value="DD-MM-AAAA">DD-MM-AAAA</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="formatoHora">Formato de Hora</Label>
          <Select value={formData.formatoHora} onValueChange={(value) => setFormData({...formData, formatoHora: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 horas (14:30)</SelectItem>
              <SelectItem value="12h">12 horas (2:30 PM)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="separadorDecimal">Separador Decimal</Label>
          <Select value={formData.separadorDecimal} onValueChange={(value) => setFormData({...formData, separadorDecimal: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="virgula">Vírgula (1.234,56)</SelectItem>
              <SelectItem value="ponto">Ponto (1,234.56)</SelectItem>
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

export default ConfiguracoesLinguagem;
