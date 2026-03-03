
import React, { useState, useEffect } from 'react';
import { X, Printer } from 'lucide-react';
import { Button } from '../../ui/button';
import { QRCodeModalProps } from '../types/cadastro-produto.types';
// import QRCode from 'qrcode';
import { productsService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';

const QRCodeModal = ({ isOpen, onClose, formData }: QRCodeModalProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  if (!isOpen) return null;

  const imprimirQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>QR Code - ${formData.name}</title></head>
          <body style="text-align: center; padding: 20px;">
            <h2>${formData.name}</h2>
            <p>SKU: ${formData.sku} | Categoria: ${formData.category}</p>
            <img src="${qrCodeUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
            <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // const gerarQRCode = async () => {
  //   try {
  //     const productData = {
  //       id: formData.id,
  //       name: formData.name,
  //       sku: formData.sku,
  //       supplier: formData.supplier,
  //       category: formData.category,
  //       url: `${window.location.origin}/produto/${Date.now()}`
  //     };
      
  //     const qrString = await QRCode.toDataURL(JSON.stringify(productData));
  //     setQrCodeUrl(qrString);
  //   } catch (error) {
  //     console.error('Erro ao gerar QR Code:', error);
  //   }
  // };

  const getQRCode = async () => {
    try {
      const response = await productsService.getProductQRCode(formData.id);
      if (response.status == 200) {
        setQrCodeUrl("data:image/png;base64, "+response.data.qr_code);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível obter o QR Code do Produto", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível obter o QR Code do Produto", response.data,null);
        }
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
      showErrorAlert('Erro ao carregar a lista de Categorias', formatAxiosError(error));
    }
  }
 

  useEffect(() => {
    getQRCode();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">QR Code Gerado</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        
        <div className="text-center space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <img src={qrCodeUrl} alt="QR Code" className="mx-auto" style={{ width: '200px', height: '200px' }} />
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>{formData.name}</strong></p>
            <p>Categoria: {formData.category}</p>
            <p>SKU: {formData.sku}</p>
          </div>

          <div className="flex space-x-3">
            <Button onClick={imprimirQRCode} className="flex-1">
              <Printer size={16} className="mr-2" />
              Imprimir
            </Button>
            <Button onClick={onClose} className="flex-1">
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
