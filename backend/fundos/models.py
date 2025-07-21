from django.db import models
from django.core.validators import RegexValidator
import re


class Fundo(models.Model):
    cnpj_validator = RegexValidator(
        regex=r'^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$',
        message='CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX'
    )

    id_fundo = models.AutoField(primary_key=True, verbose_name='ID do Fundo')
    st_cnpj_fundo = models.CharField(
        max_length=18,
        unique=True,
        validators=[cnpj_validator],
        verbose_name='CNPJ do Fundo'
    )
    st_classe_fundo = models.CharField(
        max_length=100,
        verbose_name='Classe ANBIMA do Fundo'
    )
    st_estrategia_fundo = models.TextField(
        verbose_name='Estratégia de Investimento'
    )

    st_obs_fundo = models.TextField(
        blank=True,
        null=True,
        verbose_name='Observações Gerais'
    )

    cod_quantum_fundomaster = models.IntegerField(
        blank=True,
        null=True,
        verbose_name='Código do Fundo Master'
    )
    st_cnpj_fundomaster = models.CharField(
        max_length=18,
        blank=True,
        null=True,
        validators=[cnpj_validator],
        verbose_name='CNPJ do Fundo Master'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Fundo'
        verbose_name_plural = 'Fundos'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.id_fundo} - {self.st_cnpj_fundo}"

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.st_cnpj_fundo and not self._validar_cnpj(self.st_cnpj_fundo):
            raise ValidationError({'st_cnpj_fundo': 'CNPJ inválido'})

        if self.st_cnpj_fundomaster and not self._validar_cnpj(self.st_cnpj_fundomaster):
            raise ValidationError(
                {'st_cnpj_fundomaster': 'CNPJ do fundo master inválido'})

        if self.cod_quantum_fundomaster and not self.st_cnpj_fundomaster:
            raise ValidationError({
                'st_cnpj_fundomaster': 'CNPJ do fundo master é obrigatório quando código do fundo master é fornecido'
            })

    def _validar_cnpj(self, cnpj):
        cnpj_numeros = re.sub(r'[^0-9]', '', cnpj)

        if len(cnpj_numeros) != 14:
            return False

        if cnpj_numeros == cnpj_numeros[0] * 14:
            return False

        soma = 0
        peso = 5
        for i in range(12):
            soma += int(cnpj_numeros[i]) * peso
            peso -= 1
            if peso < 2:
                peso = 9

        resto = soma % 11
        digito1 = 0 if resto < 2 else 11 - resto

        soma = 0
        peso = 6
        for i in range(13):
            soma += int(cnpj_numeros[i]) * peso
            peso -= 1
            if peso < 2:
                peso = 9

        resto = soma % 11
        digito2 = 0 if resto < 2 else 11 - resto

        return int(cnpj_numeros[12]) == digito1 and int(cnpj_numeros[13]) == digito2


class Relatorio(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True, null=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Relatório'
        verbose_name_plural = 'Relatórios'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class FundoRelatorio(models.Model):
    fundo = models.ForeignKey(
        Fundo, on_delete=models.CASCADE, related_name='relatorios')
    relatorio = models.ForeignKey(Relatorio, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('fundo', 'relatorio')
        verbose_name = 'Fundo-Relatório'
        verbose_name_plural = 'Fundos-Relatórios'

    def __str__(self):
        return f"{self.fundo} - {self.relatorio}"
