
import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Scan, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import jsQR from 'jsqr';

interface ScannerQRCodeProps {
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

interface ProdutoEncontrado {
  id: number;
  name: string;
  sku: string;
  supplier: string;
  category: string;
}

const ScannerQRCode = ({ onClose, onElementClick, isJuliaActive }: ScannerQRCodeProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [produtoEncontrado, setProdutoEncontrado] = useState<ProdutoEncontrado | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    return () => {
      // Limpar stream quando componente for desmontado
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const iniciarCamera = async () => {
    try {
      setErro('');
      console.log(isScanning);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Câmera traseira no mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setTimeout(escanearQRCode, 1000); // Inicia o scan após 1 segundo
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setErro('Erro ao acessar a câmera. Verifique as permissões.');
    }
  };

  const pararCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const escanearQRCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        try {
          const productData = JSON.parse(code.data);
          // Simular busca do produto no banco de dados
          const produto: ProdutoEncontrado = {
            id: productData.id || 1,
            name: productData.name || 'Produto não identificado',
            sku: productData.sku || 'N/A',
            supplier: productData.supplier || 'N/A',
            category: productData.category || 'N/A',
          };
          
          setProdutoEncontrado(produto);
          pararCamera();
          return;
        } catch (error) {
          console.error('Erro ao processar QR Code:', error);
          setErro('QR Code inválido ou não é de um produto.');
        }
      }
    }

    // Continuar escaneando se não encontrou nada
    if (isScanning) {
      requestAnimationFrame(escanearQRCode);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle 
            onClick={(e) => onElementClick(e, "Scanner de QR Code para identificar produtos rapidamente usando a câmera!")}
            className={`flex items-center ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <Scan size={24} className="mr-2" />
            Scanner QR Code 
            <span>{isScanning}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!produtoEncontrado ? (
            <>
              <div 
                onClick={(e) => onElementClick(e, "Área de visualização da câmera para escanear QR codes dos produtos!")}
                className={`relative bg-gray-100 rounded-lg overflow-hidden ${isScanning ? 'h-80' : 'h-60'} ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                {isScanning ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      className="hidden"
                    />
                    {/* Overlay do scanner */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg animate-pulse">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <p className="text-white bg-black bg-opacity-50 rounded px-3 py-1 text-sm">
                        Posicione o QR Code dentro da área marcada
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Camera size={48} className="mb-4" />
                    <p className="text-lg mb-2">Scanner QR Code</p>
                    <p className="text-sm text-center mb-4">
                      Clique no botão abaixo para iniciar o escaneamento
                    </p>
                  </div>
                )}
              </div>

              {erro && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {erro}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Como usar:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Clique em "Iniciar Scanner" para ativar a câmera</li>
                  <li>• Posicione o QR Code do produto dentro da área marcada</li>
                  <li>• Mantenha o dispositivo estável para melhor leitura</li>
                  <li>• O produto será identificado automaticamente</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <Button onClick={onClose}>
                  Cancelar
                </Button>
                
                {!isScanning ? (
                  <Button 
                    onClick={(e) => {
                      onElementClick(e, "Ativar a câmera para começar a escanear QR codes!");
                      iniciarCamera();
                    }}
                    className={isJuliaActive ? 'cursor-help' : ''}
                  >
                    <Camera size={20} className="mr-2" />
                    Iniciar Scanner
                  </Button>
                ) : (
                  <Button 
                    onClick={(e) => {
                      onElementClick(e, "Parar o escaneamento e desativar a câmera!");
                      pararCamera();
                    }}
                    className={isJuliaActive ? 'cursor-help' : ''}
                  >
                    Parar Scanner
                  </Button>
                )}
              </div>
            </>
          ) : (
            // Resultado do scan
            <div className="space-y-6">
              <div 
                onClick={(e) => onElementClick(e, "Produto encontrado através do QR Code escaneado!")}
                className={`bg-green-50 border border-green-200 rounded-lg p-4 ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                <div className="flex items-center mb-3">
                  <Package size={24} className="text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-green-900">Produto Encontrado!</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{produtoEncontrado.name}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>SKU:</strong> {produtoEncontrado.sku}</p>
                      <p><strong>Categoria:</strong> {produtoEncontrado.category}</p>
                      <p><strong>Fornecedor:</strong> {produtoEncontrado.supplier}</p>
                    </div>
                  </div>
                  
                  {/* <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        {produtoEncontrado.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Valor:</span>
                      <span className="font-semibold text-green-600">{produtoEncontrado.valorRevenda}</span>
                    </div>
                  </div> */}
                </div>
              </div>

              <div className="flex justify-between">
                <Button 
                  onClick={() => {
                    setProdutoEncontrado(null);
                    setErro('');
                  }}
                >
                  Escanear Outro
                </Button>
                
                <div className="space-x-2">
                  <Button>
                    Ver Detalhes
                  </Button>
                  <Button onClick={onClose}>
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScannerQRCode;
