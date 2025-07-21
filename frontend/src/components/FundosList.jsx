import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import apiService from '../services/api';

const FundosList = ({ onEdit, onView, onNew }) => {
  const [fundos, setFundos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null
  });

  useEffect(() => {
    loadFundos();
  }, []);

  const loadFundos = async (search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const params = search ? { search } : {};
      const response = await apiService.getFundos(params);
      
      setFundos(response.results || response);
      setPagination({
        count: response.count || 0,
        next: response.next,
        previous: response.previous
      });
    } catch (error) {
      console.error('Erro ao carregar fundos:', error);
      setError('Erro ao carregar a lista de fundos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadFundos(searchTerm);
  };

  const handleDelete = async (fundo) => {
    if (!window.confirm(`Tem certeza que deseja excluir o fundo ${fundo.st_cnpj_fundo}?`)) {
      return;
    }

    try {
      await apiService.deleteFundo(fundo.id_fundo);
      loadFundos(searchTerm); // Recarregar a lista
    } catch (error) {
      console.error('Erro ao excluir fundo:', error);
      setError('Erro ao excluir o fundo');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Carregando fundos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com busca e botão novo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Fundos Cadastrados</h2>
          <p className="text-muted-foreground">
            {pagination.count} {pagination.count === 1 ? 'fundo encontrado' : 'fundos encontrados'}
          </p>
        </div>
        
        <Button onClick={onNew} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Fundo
        </Button>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Buscar por CNPJ, classe, estratégia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Mensagem de erro */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Lista de fundos */}
      <div className="grid gap-4">
        {fundos.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum fundo encontrado para a busca realizada.' : 'Nenhum fundo cadastrado ainda.'}
              </p>
              {!searchTerm && (
                <Button onClick={onNew} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Fundo
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          fundos.map((fundo) => (
            <Card key={fundo.id_fundo} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {fundo.st_cnpj_fundo}
                    </CardTitle>
                    <CardDescription>
                      ID: {fundo.id_fundo} • {fundo.st_classe_fundo}
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(fundo)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(fundo)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(fundo)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estratégia:</p>
                    <p className="text-sm">{fundo.st_estrategia_fundo}</p>
                  </div>
                  
                  {fundo.cod_quantum_fundomaster && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fundo Master:</p>
                      <p className="text-sm">
                        {fundo.cod_quantum_fundomaster} - {fundo.st_cnpj_fundomaster}
                      </p>
                    </div>
                  )}
                  
                  {fundo.relatorios_nomes && fundo.relatorios_nomes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Relatórios:</p>
                      <div className="flex flex-wrap gap-1">
                        {fundo.relatorios_nomes.map((relatorio, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {relatorio}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Cadastrado em: {new Date(fundo.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FundosList;

