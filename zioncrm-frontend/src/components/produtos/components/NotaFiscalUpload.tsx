
import React, { useState, useRef } from 'react';
import { Upload, Scan } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '@/components/ui/input';

interface NotaFiscalUploadProps {
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const NotaFiscalUpload = ({ onElementClick, isJuliaActive }: NotaFiscalUploadProps) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click(); // Programmatically click the hidden input
  };

  return (
    <div className="space-y-6">
      <div 
        onClick={(e) => onElementClick(e, "Área de upload da nota fiscal XML para importação automática dos dados!")}
        className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${isJuliaActive ? 'cursor-help' : ''}`}
      >
        <Upload size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload da Nota Fiscal
        </h3>
        <p className="text-gray-500 mb-4">
          Arraste e solte o arquivo XML da nota fiscal ou clique para selecionar
        </p>
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xml"
          style={{ display: 'none' }}
        />
        <Button onClick={handleButtonClick}>
          <Upload size={20} className="mr-2" />
          Selecionar Arquivo XML
        </Button>
        <p className="text-sm text-gray-400 mt-2">
          Formatos aceitos: .xml (Nota Fiscal Eletrônica)
        </p>
      </div>

      <div 
        onClick={(e) => onElementClick(e, "Opção alternativa para escanear a nota fiscal com a câmera do dispositivo!")}
        className={`border border-gray-300 rounded-lg p-6 text-center ${isJuliaActive ? 'cursor-help' : ''}`}
      >
        <Scan size={32} className="mx-auto text-gray-600 mb-3" />
        <h4 className="font-medium text-gray-900 mb-2">
          Escanear Nota Fiscal
        </h4>
        <p className="text-sm text-gray-500 mb-3">
          Use a câmera para escanear o QR Code da nota fiscal
        </p>
        <Button size="sm">
          <Scan size={16} className="mr-2" />
          Abrir Câmera
        </Button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">
          Como funciona a importação automática:
        </h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Dados do fornecedor são extraídos e cadastrados automaticamente</li>
          <li>• Informações dos produtos são preenchidas automaticamente</li>
          <li>• Valores, datas e números de série são importados</li>
          <li>• Você pode revisar e ajustar os dados antes de finalizar</li>
        </ul>
      </div>
    </div>
  );
};

export default NotaFiscalUpload;
