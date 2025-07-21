import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Save, X } from 'lucide-react';
import { formatCNPJ, validateFundoForm } from '../utils/validation';
import apiService from '../services/api';
import './FundoForm.css';

const FundoForm = ({ fundo, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    st_cnpj_fundo: '',
    st_classe_fundo: '',
    st_estrategia_fundo: '',
    st_obs_fundo: '',
    cod_quantum_fundomaster: '',
    st_cnpj_fundomaster: '',
    relatorios_ids: []
  });
  
  const [errors, setErrors] = useState({});
  const [classes, setClasses] = useState([]);
  const [estrategias, setEstrategias] = useState([]);
  const [relatorios, setRelatorios] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (fundo) {
      setFormData({
        st_cnpj_fundo: fundo.st_cnpj_fundo || '',
        st_classe_fundo: fundo.st_classe_fundo || '',
        st_estrategia_fundo: fundo.st_estrategia_fundo || '',
        st_obs_fundo: fundo.st_obs_fundo || '',
        cod_quantum_fundomaster: fundo.cod_quantum_fundomaster || '',
        st_cnpj_fundomaster: fundo.st_cnpj_fundomaster || '',
        relatorios_ids: fundo.relatorios ? fundo.relatorios.map(r => r.relatorio.id) : []
      });
    }
  }, [fundo]);

  const loadFormData = async () => {
    try {
      const [classesData, estrategiasData, relatoriosData] = await Promise.all([
        apiService.getFundoClasses(),
        apiService.getFundoEstrategias(),
        apiService.getRelatorios()
      ]);
      
      setClasses(classesData);
      setEstrategias(estrategiasData);
      setRelatorios(relatoriosData.results || relatoriosData);
    } catch (error) {
      console.error('Erro ao carregar dados do formulário:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleCNPJChange = (field, value) => {
    const formattedValue = formatCNPJ(value);
    handleInputChange(field, formattedValue);
  };

  const handleRelatorioToggle = (relatorioId) => {
    setFormData(prev => ({
      ...prev,
      relatorios_ids: prev.relatorios_ids.includes(relatorioId)
        ? prev.relatorios_ids.filter(id => id !== relatorioId)
        : [...prev.relatorios_ids, relatorioId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateFundoForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const dataToSubmit = {
        ...formData,
        cod_quantum_fundomaster: formData.cod_quantum_fundomaster ? parseInt(formData.cod_quantum_fundomaster) : null
      };

      await onSave(dataToSubmit);
    } catch (error) {
      console.error('Erro ao salvar fundo:', error);
      
      // Tratar erros de validação do backend
      if (error.message && typeof error.message === 'object') {
        setErrors(error.message);
      } else {
        setErrors({ general: error.message || 'Erro ao salvar fundo' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {fundo ? 'Editar Fundo' : 'Cadastrar Novo Fundo'}
        </CardTitle>
        <CardDescription>
          Preencha as informações do fundo de investimento
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="st_cnpj_fundo">CNPJ do Fundo *</Label>
              <Input
                id="st_cnpj_fundo"
                value={formData.st_cnpj_fundo}
                onChange={(e) => handleCNPJChange('st_cnpj_fundo', e.target.value)}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className={errors.st_cnpj_fundo ? 'border-red-500' : ''}
              />
              {errors.st_cnpj_fundo && (
                <p className="text-sm text-red-500">{errors.st_cnpj_fundo}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="st_classe_fundo">Classe ANBIMA *</Label>
              <Select
                value={formData.st_classe_fundo}
                onValueChange={(value) => handleInputChange('st_classe_fundo', value)}
              >
                <SelectTrigger className={errors.st_classe_fundo ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classe) => (
                    <SelectItem key={classe} value={classe}>
                      {classe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.st_classe_fundo && (
                <p className="text-sm text-red-500">{errors.st_classe_fundo}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="st_estrategia_fundo">Estratégia de Investimento *</Label>
            <Select
              value={formData.st_estrategia_fundo}
              onValueChange={(value) => handleInputChange('st_estrategia_fundo', value)}
            >
              <SelectTrigger className={errors.st_estrategia_fundo ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione a estratégia" />
              </SelectTrigger>
              <SelectContent>
                {estrategias.map((estrategia) => (
                  <SelectItem key={estrategia} value={estrategia}>
                    {estrategia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.st_estrategia_fundo && (
              <p className="text-sm text-red-500">{errors.st_estrategia_fundo}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="st_obs_fundo">Observações Gerais</Label>
            <Textarea
              id="st_obs_fundo"
              value={formData.st_obs_fundo}
              onChange={(e) => handleInputChange('st_obs_fundo', e.target.value)}
              placeholder="Observações sobre o fundo..."
              rows={3}
            />
          </div>

          {/* Fundo Master */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Fundo Master (Opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cod_quantum_fundomaster">Código do Fundo Master</Label>
                <Input
                  id="cod_quantum_fundomaster"
                  type="number"
                  value={formData.cod_quantum_fundomaster}
                  onChange={(e) => handleInputChange('cod_quantum_fundomaster', e.target.value)}
                  placeholder="123456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="st_cnpj_fundomaster">CNPJ do Fundo Master</Label>
                <Input
                  id="st_cnpj_fundomaster"
                  value={formData.st_cnpj_fundomaster}
                  onChange={(e) => handleCNPJChange('st_cnpj_fundomaster', e.target.value)}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className={errors.st_cnpj_fundomaster ? 'border-red-500' : ''}
                />
                {errors.st_cnpj_fundomaster && (
                  <p className="text-sm text-red-500">{errors.st_cnpj_fundomaster}</p>
                )}
              </div>
            </div>
          </div>

          {/* Relatórios */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Relatórios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {relatorios.map((relatorio) => (
                <div key={relatorio.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`relatorio-${relatorio.id}`}
                    checked={formData.relatorios_ids.includes(relatorio.id)}
                    onCheckedChange={() => handleRelatorioToggle(relatorio.id)}
                  />
                  <Label
                    htmlFor={`relatorio-${relatorio.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {relatorio.nome}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {fundo ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FundoForm;

