from django.core.management.base import BaseCommand
from fundos.models import Fundo, Relatorio, FundoRelatorio
import csv
import os


class Command(BaseCommand):
    help = 'Carrega dados de exemplo dos fundos a partir do CSV fornecido'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--csv-file',
            type=str,
            help='Caminho para o arquivo CSV com os dados dos fundos',
            default='/app/dados-ps-estagio-20250703.csv'
        )
    
    def handle(self, *args, **options):
        csv_file = options['csv_file']
        
        if not os.path.exists(csv_file):
            self.stdout.write(
                self.style.ERROR(f'Arquivo CSV não encontrado: {csv_file}')
            )
            return
        
        # Primeiro, criar os relatórios baseados nos dados do CSV
        self.create_relatorios()
        
        # Depois, carregar os fundos
        self.load_fundos_from_csv(csv_file)
    
    def create_relatorios(self):
        """
        Cria os relatórios baseados nos dados conhecidos.
        """
        relatorios_data = [
            {'nome': 'RV Int\'l USD', 'descricao': 'Relatório de Renda Variável Internacional USD'},
            {'nome': 'MM Int\'l', 'descricao': 'Relatório de Multimercados Internacional'},
            {'nome': 'Multimercados', 'descricao': 'Relatório de Multimercados'},
        ]
        
        for relatorio_data in relatorios_data:
            relatorio, created = Relatorio.objects.get_or_create(
                nome=relatorio_data['nome'],
                defaults={'descricao': relatorio_data['descricao']}
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Relatório criado: {relatorio.nome}')
                )
    
    def load_fundos_from_csv(self, csv_file):
        """
        Carrega os fundos a partir do arquivo CSV.
        """
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                try:
                    # Criar ou atualizar o fundo
                    fundo_data = {
                        'st_cnpj_fundo': row['ST_CNPJ_FUNDO'],
                        'st_classe_fundo': row['ST_CLASSE_FUNDO'],
                        'st_estrategia_fundo': row['ST_ESTRATEGIA_FUNDO'],
                        'st_obs_fundo': row['ST_OBS_FUNDO'] if row['ST_OBS_FUNDO'] else None,
                    }
                    
                    # Campos opcionais do fundo master
                    if row['COD_QUANTUM_FUNDOMASTER']:
                        fundo_data['cod_quantum_fundomaster'] = int(row['COD_QUANTUM_FUNDOMASTER'])
                    
                    if row['ST_CNPJ_FUNDOMASTER']:
                        fundo_data['st_cnpj_fundomaster'] = row['ST_CNPJ_FUNDOMASTER']
                    
                    # Criar ou atualizar o fundo
                    fundo, created = Fundo.objects.update_or_create(
                        st_cnpj_fundo=row['ST_CNPJ_FUNDO'],
                        defaults=fundo_data
                    )
                    
                    # Processar relatórios
                    relatorios_nomes = []
                    if row['RELATORIOS']:
                        relatorios_nomes = [nome.strip() for nome in row['RELATORIOS'].split(';')]
                    
                    # Limpar associações existentes
                    FundoRelatorio.objects.filter(fundo=fundo).delete()
                    
                    # Criar novas associações
                    for relatorio_nome in relatorios_nomes:
                        if relatorio_nome:
                            try:
                                relatorio = Relatorio.objects.get(nome=relatorio_nome)
                                FundoRelatorio.objects.create(fundo=fundo, relatorio=relatorio)
                            except Relatorio.DoesNotExist:
                                self.stdout.write(
                                    self.style.WARNING(f'Relatório não encontrado: {relatorio_nome}')
                                )
                    
                    action = 'criado' if created else 'atualizado'
                    self.stdout.write(
                        self.style.SUCCESS(f'Fundo {action}: {fundo.st_cnpj_fundo}')
                    )
                    
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'Erro ao processar linha {row}: {str(e)}')
                    )
        
        self.stdout.write(
            self.style.SUCCESS('Carregamento de dados concluído!')
        )

