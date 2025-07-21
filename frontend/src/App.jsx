import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { toast } from 'sonner';
import FundosList from './components/FundosList';
import FundoForm from './components/FundoForm';
import FundoDetails from './components/FundoDetails';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import { Building2, Database, Loader2 } from 'lucide-react';
import apiService from './services/api';
import './App.css';

const VIEWS = {
  LIST: 'list',
  FORM: 'form',
  DETAILS: 'details'
};

function App() {
  const [currentView, setCurrentView] = useState(VIEWS.LIST);
  const [selectedFundo, setSelectedFundo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      await apiService.getRelatorios();
      setApiStatus('connected');
    } catch (error) {
      console.error('Erro ao conectar com a API:', error);
      setApiStatus('error');
    }
  };

  const handleNewFundo = () => {
    setSelectedFundo(null);
    setCurrentView(VIEWS.FORM);
  };

  const handleEditFundo = (fundo) => {
    setSelectedFundo(fundo);
    setCurrentView(VIEWS.FORM);
  };

  const handleViewFundo = async (fundo) => {
    setIsLoading(true);
    try {
      const detailedFundo = await apiService.getFundo(fundo.id_fundo);
      setSelectedFundo(detailedFundo);
      setCurrentView(VIEWS.DETAILS);
    } catch (error) {
      console.error('Erro ao carregar detalhes do fundo:', error);
      toast.error("Não foi possível carregar os detalhes do fundo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFundo = async (fundoData) => {
    setIsLoading(true);
    try {
      if (selectedFundo) {
        // Atualizar fundo existente
        await apiService.updateFundo(selectedFundo.id_fundo, fundoData);
      toast.success("Fundo atualizado com sucesso!");
      } else {
        // Criar novo fundo
        await apiService.createFundo(fundoData);
        toast.success("Fundo cadastrado com sucesso!");
      }
      
      setCurrentView(VIEWS.LIST);
      setSelectedFundo(null);
    } catch (error) {
      console.error('Erro ao salvar fundo:', error);
      
      // Tratar erros de validação do backend
      if (error.message && typeof error.message === 'object') {
        const errorMessages = Object.values(error.message).flat();
        toast.error(`Erro de validação: ${errorMessages.join(', ')}`);
      } else {
        toast.error(error.message || "Erro ao salvar fundo");
      }
      throw error; // Re-throw para que o formulário possa lidar com o erro
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentView(VIEWS.LIST);
    setSelectedFundo(null);
  };

  const handleBackToList = () => {
    setCurrentView(VIEWS.LIST);
    setSelectedFundo(null);
  };

  // Verificação de conexão com a API
  if (apiStatus === 'checking') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-center text-muted-foreground">
                Verificando conexão com a API...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (apiStatus === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Database className="w-12 h-12 text-red-500" />
              <div className="text-center space-y-2">
                <h2 className="text-lg font-semibold">Erro de Conexão</h2>
                <p className="text-sm text-muted-foreground">
                  Não foi possível conectar com a API do backend. 
                  Verifique se o servidor está rodando.
                </p>
              </div>
              <Button onClick={checkApiConnection} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Outliers</h1>
              <p className="text-sm text-muted-foreground">
                Sistema de Cadastro de Fundos
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading && (
          <Alert className="mb-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            <AlertDescription>
              Processando...
            </AlertDescription>
          </Alert>
        )}

        {currentView === VIEWS.LIST && (
          <FundosList
            onEdit={handleEditFundo}
            onView={handleViewFundo}
            onNew={handleNewFundo}
          />
        )}

        {currentView === VIEWS.FORM && (
          <FundoForm
            fundo={selectedFundo}
            onSave={handleSaveFundo}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}

        {currentView === VIEWS.DETAILS && (
          <FundoDetails
            fundo={selectedFundo}
            onEdit={handleEditFundo}
            onBack={handleBackToList}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Desafio Técnico - Estágio em Dados Outliers 2025
            </p>
            <p className="mt-1">
              Sistema desenvolvido com Django REST Framework + React + TypeScript
            </p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

export default App;

