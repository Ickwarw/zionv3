
import React, { useState } from 'react';
import { Package, Plus, Search, Filter, Users, Scan, Building2, TextQuote } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import JuliaAvatar from './JuliaAvatar';
import JuliaSpeechBubble from './JuliaSpeechBubble';
import CadastroProduto from './produtos/CadastroProduto';
import CadastroFornecedor from './produtos/CadastroFornecedor';
import ListaProdutos from './produtos/ListaProdutos';
import ListaFornecedores from './produtos/ListaFornecedores';
import ScannerQRCode from './produtos/ScannerQRCode';
import ListaCategorias from './produtos/ListaCategorias';
import CadastroCategoria from './produtos/CadastroCategoria';
import { showFiltroProdutoDialog } from './produtos/FiltroProduto';
import { showFiltroFornecedorDialog } from './produtos/FiltroFornecedor';

const Produtos = () => {
  const [isJuliaActive, setIsJuliaActive] = useState(false);
  const [juliaMessage, setJuliaMessage] = useState('');
  const [juliaPosition, setJuliaPosition] = useState({ x: 0, y: 0 });
  const [showJuliaBubble, setShowJuliaBubble] = useState(false);
  const [showCadastroProduto, setShowCadastroProduto] = useState(false);
  const [showCadastroFornecedor, setShowCadastroFornecedor] = useState(false);
  const [showCadastroCategoria, setShowCadastroCategoria] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [activeTab, setActiveTab] = useState('produtos');
  const [search, setSearch] = useState("");
  const [searchProducts, setSearchProducts] = useState("");
  const [searchCategories, setSearchCategories] = useState("");
  const [filterProductCategoryId, setFilterProductCategoryId] = useState(null)
  const [filterProductSupplierId, setFilterProductSupplierId] = useState(null)
  const [filterProductOnlyLowStock, setFilterProductOnlyLowStock] = useState(false)
  const [filterProductSearch, setFilterProductSearch] = useState("")
  const [filterSupplierSearch, setFilterSupplierSearch] = useState("")
  
  
  
  const handleJuliaToggle = () => {
    setIsJuliaActive(!isJuliaActive);
    if (isJuliaActive) {
      setShowJuliaBubble(false);
    }
  };

  const handleElementClick = (event: React.MouseEvent, message: string) => {
    if (isJuliaActive) {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      setJuliaPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
      setJuliaMessage(message);
      setShowJuliaBubble(true);
    }
  };

  const handleCloseBubble = () => {
    setShowJuliaBubble(false);
  };

  const handleFilterProducts = (params) => {
    console.log("handleFilterProducts");
    if (params) {
      setFilterProductCategoryId(params.category_id); 
      setFilterProductSupplierId(params.supplier_id); 
      setFilterProductOnlyLowStock(params.low_stock); 
      setFilterProductSearch(params.search); 
      }
  }

  const filterProducts = () => {
    showFiltroProdutoDialog(
      isJuliaActive,
      handleElementClick,
      handleFilterProducts);
  }

  const filterSuppliers = () => {
    showFiltroFornecedorDialog(
      isJuliaActive,
      handleElementClick,
      handleFilterSuppliers);
  }

  const handleFilterSuppliers = (params) => {
    console.log("handleFilterSuppliers");
    if (params) {
      setFilterSupplierSearch(params.search); 
      }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Julia Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleJuliaToggle}
          className="p-3 rounded-full shadow-lg transition-all duration-300"
        >
          <JuliaAvatar isActive={isJuliaActive} isVisible={false} />
        </button>
      </div>

      {/* Julia Speech Bubble */}
      <JuliaSpeechBubble
        isVisible={showJuliaBubble}
        message={juliaMessage}
        onClose={handleCloseBubble}
        position={juliaPosition}
      />

      <div className="flex justify-between items-center">
        <div
          onClick={(e) => handleElementClick(e, "Esta é a seção de Produtos e Fornecedores onde você pode gerenciar todo o seu catálogo, fornecedores e realizar scaneamento de QR codes!")}
          className={isJuliaActive ? 'cursor-help' : ''}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Produtos & Fornecedores
          </h1>
          <p className="text-gray-600 mt-1">Gerencie produtos, fornecedores e notas fiscais</p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            onClick={(e) => {
              handleElementClick(e, "Use este scanner para escanear QR codes dos produtos e visualizar suas informações!");
              setShowScanner(true);
            }}
            className={`flex items-center space-x-2 ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <Scan size={20} />
            <span>Scanner QR</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger 
              value="produtos"
              onClick={(e) => handleElementClick(e, "Aba de produtos onde você pode visualizar, cadastrar e gerenciar todos os seus produtos!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              <Package size={20} className="mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger 
              value="fornecedores"
              onClick={(e) => handleElementClick(e, "Aba de fornecedores onde você pode cadastrar e gerenciar todos os seus fornecedores!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              <Building2 size={20} className="mr-2" />
              Fornecedores
            </TabsTrigger>
            <TabsTrigger 
              value="categorias"
              onClick={(e) => handleElementClick(e, "Aba de categorias onde você pode cadastrar as categorias dos Produtos!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              <TextQuote size={20} className="mr-2" />
              Categorias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="produtos" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div 
                  onClick={(e) => handleElementClick(e, "Use este campo para buscar produtos por nome, modelo ou código!")}
                  className={`relative ${isJuliaActive ? 'cursor-help' : ''}`}
                >
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    value={searchProducts}
                    onChange={(e) => setSearchProducts(e.target.value)}
                    placeholder="Buscar produtos na lista..."
                    className="pl-10 w-80"
                  />
                </div>
                <Button 
                  onClick={(e) => {
                    if (isJuliaActive) {
                      handleElementClick(e, "Clique aqui para aplicar filtros avançados aos produtos!")
                    } else {
                      filterProducts()
                    }
                  }}
                  className={`flex items-center space-x-2 ${isJuliaActive ? 'cursor-help' : ''}`}
                >
                  <Filter size={20} />
                  <span>Filtros</span>
                </Button>
              </div>
              
              <Button 
                onClick={(e) => {
                  handleElementClick(e, "Clique aqui para cadastrar um novo produto no sistema!");
                  setShowCadastroProduto(true);
                }}
                className={`flex items-center space-x-2 ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                <Plus size={20} />
                <span>Novo Produto</span>
              </Button>
            </div>

            <ListaProdutos 
              onElementClick={handleElementClick} 
              isJuliaActive={isJuliaActive} 
              search={searchProducts}
              newProdState={showCadastroProduto}
              filterCategory={filterProductCategoryId}
              filterSupplier={filterProductSupplierId}
              filterOnlyLowStock={filterProductOnlyLowStock}
              filterSearch={filterProductSearch}
            />
          </TabsContent>

          <TabsContent value="fornecedores" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div 
                  onClick={(e) => handleElementClick(e, "Use este campo para buscar fornecedores por CNPJ, razão social ou nome fantasia!")}
                  className={`relative ${isJuliaActive ? 'cursor-help' : ''}`}
                >
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar fornecedores..."
                    className="pl-10 w-80"
                  />
                </div>
                <Button 
                  onClick={(e) => {
                    if (isJuliaActive) {
                      handleElementClick(e, "Clique aqui para aplicar filtros aos fornecedores!")
                    } else {
                      filterSuppliers()
                    }
                  }}
                  className={`flex items-center space-x-2 ${isJuliaActive ? 'cursor-help' : ''}`}
                >
                  <Filter size={20} />
                  <span>Filtros</span>
                </Button>
              </div>
              
              <Button 
                onClick={(e) => {
                  handleElementClick(e, "Clique aqui para cadastrar um novo fornecedor!");
                  setShowCadastroFornecedor(true);
                }}
                className={`flex items-center space-x-2 ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                <Plus size={20} />
                <span>Novo Fornecedor</span>
              </Button>
            </div>

            <ListaFornecedores 
              onElementClick={handleElementClick} 
              isJuliaActive={isJuliaActive}
              newSupplierState={showCadastroFornecedor}
              search={search}
              filterSearch={filterSupplierSearch}
            />
          </TabsContent>
          <TabsContent value="categorias" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div 
                  onClick={(e) => handleElementClick(e, "Use este campo para buscar categorias")}
                  className={`relative ${isJuliaActive ? 'cursor-help' : ''}`}
                >
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    value={searchCategories}
                    onChange={(e) => setSearchCategories(e.target.value)}
                    placeholder="Buscar categorias..."
                    className="pl-10 w-80"
                  />
                </div>
              </div>
              
              <Button 
                onClick={(e) => {
                  handleElementClick(e, "Clique aqui para cadastrar um nova categoria!");
                  setShowCadastroCategoria(true);
                }}
                className={`flex items-center space-x-2 ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                <Plus size={20} />
                <span>Nova Categoria</span>
              </Button>
            </div>

            <ListaCategorias
              onElementClick={handleElementClick} 
              isJuliaActive={isJuliaActive}
              newCategoryState={showCadastroCategoria}
              search={searchCategories}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showCadastroProduto && (
        <CadastroProduto 
          onClose={() => setShowCadastroProduto(false)} 
          onElementClick={handleElementClick}
          isJuliaActive={isJuliaActive}
        />
      )}

      {showCadastroFornecedor && (
        <CadastroFornecedor 
          onClose={() => setShowCadastroFornecedor(false)} 
          onElementClick={handleElementClick}
          isJuliaActive={isJuliaActive}
        />
      )}

      {showCadastroCategoria && (
        <CadastroCategoria
          onClose={() => setShowCadastroCategoria(false)} 
          onElementClick={handleElementClick}
          isJuliaActive={isJuliaActive}
        />
      )}

      {showScanner && (
        <ScannerQRCode 
          onClose={() => setShowScanner(false)} 
          onElementClick={handleElementClick}
          isJuliaActive={isJuliaActive}
        />
      )}
    </div>
  );
};

export default Produtos;
