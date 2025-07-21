// Validação de CNPJ
export const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;
  
  // Remove formatação
  const cnpjNumbers = cnpj.replace(/[^\d]/g, '');
  
  if (cnpjNumbers.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (cnpjNumbers === cnpjNumbers[0].repeat(14)) return false;
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpjNumbers[i]) * weight;
    weight--;
    if (weight < 2) weight = 9;
  }
  
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  // Calcula o segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpjNumbers[i]) * weight;
    weight--;
    if (weight < 2) weight = 9;
  }
  
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica se os dígitos calculados conferem com os informados
  return parseInt(cnpjNumbers[12]) === digit1 && parseInt(cnpjNumbers[13]) === digit2;
};

// Formatação de CNPJ
export const formatCNPJ = (cnpj) => {
  if (!cnpj) return '';
  
  const cnpjNumbers = cnpj.replace(/[^\d]/g, '');
  
  if (cnpjNumbers.length <= 2) return cnpjNumbers;
  if (cnpjNumbers.length <= 5) return cnpjNumbers.replace(/(\d{2})(\d+)/, '$1.$2');
  if (cnpjNumbers.length <= 8) return cnpjNumbers.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
  if (cnpjNumbers.length <= 12) return cnpjNumbers.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
  return cnpjNumbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
};

// Validação de formulário de fundo
export const validateFundoForm = (data) => {
  const errors = {};
  
  // CNPJ do fundo é obrigatório
  if (!data.st_cnpj_fundo) {
    errors.st_cnpj_fundo = 'CNPJ do fundo é obrigatório';
  } else if (!validateCNPJ(data.st_cnpj_fundo)) {
    errors.st_cnpj_fundo = 'CNPJ inválido';
  }
  
  // Classe do fundo é obrigatória
  if (!data.st_classe_fundo) {
    errors.st_classe_fundo = 'Classe do fundo é obrigatória';
  }
  
  // Estratégia do fundo é obrigatória
  if (!data.st_estrategia_fundo) {
    errors.st_estrategia_fundo = 'Estratégia do fundo é obrigatória';
  }
  
  // Se código do fundo master for fornecido, CNPJ master deve ser fornecido
  if (data.cod_quantum_fundomaster && !data.st_cnpj_fundomaster) {
    errors.st_cnpj_fundomaster = 'CNPJ do fundo master é obrigatório quando código do fundo master é fornecido';
  }
  
  // Validar CNPJ do fundo master se fornecido
  if (data.st_cnpj_fundomaster && !validateCNPJ(data.st_cnpj_fundomaster)) {
    errors.st_cnpj_fundomaster = 'CNPJ do fundo master inválido';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

