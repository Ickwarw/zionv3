import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ManualForm from './components/ManualForm';
import NotaFiscalUpload from './components/NotaFiscalUpload';
import QRCodeModal from './components/QRCodeModal';
import { CadastroProdutoProps, FormData, FormDataCRUD } from './types/cadastro-produto.types';
import { productsService } from '@/services/api';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { formatAxiosError } from '../ui/formatResponseError';

const CadastroProduto = ({ onClose, onElementClick, isJuliaActive }: CadastroProdutoProps) => {
  const [showQrCode, setShowQrCode] = useState(false);
  const [formData, setFormData] = useState<FormDataCRUD>({
    id: null,
    name: '',
    description: '',
    sku: '',
    cost_price: 0,
    price: 0,
    category_id: null,
    category: '',
    supplier_id: null,
    supplier: '',
    tax_rate: 0,
    weight: 0,
    dimensions: '',
    barcode: '',
    qr_code: '',
    created_by: null,
    created_at: null,
    updated_at: null,
    quantity: 0,
    reorder_level: 5,
    reorder_quantity: 10,
    location: ''
  });

  const saveProduto = async () => {
    try {
      const response = await productsService.createProduct(formData);
      if (response.status == 200) {
        setFormData(response.data);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível atualizar o Produto", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível atualizar o Produto", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to create Product:', error);
        showErrorAlert('Erro ao atualizar o Produto', formatAxiosError(error));
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProduto();
    // await gerarQRCode();
    setShowQrCode(true);
  };

  const closeQRCode = () => {
    setShowQrCode(false);
    onClose();
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Formulário de cadastro de produtos com todas as informações necessárias!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Cadastrar Novo Produto
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="manual"
                onClick={(e) => onElementClick(e, "Cadastro manual onde você preenche todas as informações do produto!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >
                Cadastro Manual
              </TabsTrigger>
              <TabsTrigger 
                value="nota-fiscal"
                onClick={(e) => onElementClick(e, "Importação automática através do upload da nota fiscal XML!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >
                Via Nota Fiscal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-6">
              <ManualForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                onElementClick={onElementClick}
                isJuliaActive={isJuliaActive}
              />
              <div className="flex justify-end">
                <Button type="button" onClick={onClose}>
                  Cancelar
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="nota-fiscal" className="space-y-6">
              <NotaFiscalUpload
                onElementClick={onElementClick}
                isJuliaActive={isJuliaActive}
              />
            </TabsContent>
          </Tabs>
          { showQrCode &&
            <QRCodeModal
              isOpen={showQrCode}
              onClose={() => closeQRCode()}
              formData={formData}
            />
          }
        </DialogContent>
      </Dialog>

    </>
  );
};

export default CadastroProduto;
