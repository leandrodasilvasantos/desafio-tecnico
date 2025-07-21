import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ArrowLeft, Edit, Calendar, Building2, FileText, Target } from 'lucide-react';

const FundoDetails = ({ fundo, onEdit, onBack }) => {
  if (!fundo) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Fundo não encontrado</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{fundo.st_cnpj_fundo}</h2>
            <p className="text-muted-foreground">ID: {fundo.id_fundo}</p>
          </div>
        </div>
        
        <Button onClick={() => onEdit(fundo)}>
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Informações Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">CNPJ do Fundo</p>
              <p className="text-lg font-mono">{fundo.st_cnpj_fundo}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Classe ANBIMA</p>
              <Badge variant="outline" className="mt-1">
                {fundo.st_classe_fundo}
              </Badge>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <Target className="w-4 h-4" />
              Estratégia de Investimento
            </p>
            <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
              {fundo.st_estrategia_fundo}
            </p>
          </div>
          
          {fundo.st_obs_fundo && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  Observações Gerais
                </p>
                <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                  {fundo.st_obs_fundo}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Fundo Master */}
      {(fundo.cod_quantum_fundomaster || fundo.st_cnpj_fundomaster) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Fundo Master
            </CardTitle>
            <CardDescription>
              Informações do fundo master associado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fundo.cod_quantum_fundomaster && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Código Quantum</p>
                  <p className="text-lg font-mono">{fundo.cod_quantum_fundomaster}</p>
                </div>
              )}
              
              {fundo.st_cnpj_fundomaster && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CNPJ do Fundo Master</p>
                  <p className="text-lg font-mono">{fundo.st_cnpj_fundomaster}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatórios */}
      {fundo.relatorios && fundo.relatorios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Relatórios Associados
            </CardTitle>
            <CardDescription>
              Lista de relatórios nos quais este fundo está incluído
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {fundo.relatorios.map((fundoRelatorio, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {fundoRelatorio.relatorio.nome}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações de Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Cadastro</p>
              <p className="text-sm">{formatDate(fundo.created_at)}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
              <p className="text-sm">{formatDate(fundo.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundoDetails;

