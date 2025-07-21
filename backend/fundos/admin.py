from django.contrib import admin
from .models import Fundo, Relatorio, FundoRelatorio


@admin.register(Relatorio)
class RelatorioAdmin(admin.ModelAdmin):
    list_display = ['nome', 'ativo']
    list_filter = ['ativo']
    search_fields = ['nome']
    ordering = ['nome']


class FundoRelatorioInline(admin.TabularInline):
    model = FundoRelatorio
    extra = 1


@admin.register(Fundo)
class FundoAdmin(admin.ModelAdmin):
    list_display = [
        'id_fundo',
        'st_cnpj_fundo',
        'st_classe_fundo',
        'st_estrategia_fundo',
        'cod_quantum_fundomaster',
        'created_at'
    ]
    list_filter = ['st_classe_fundo', 'created_at']
    search_fields = [
        'st_cnpj_fundo',
        'st_classe_fundo',
        'st_estrategia_fundo',
        'st_obs_fundo'
    ]
    ordering = ['-created_at']
    readonly_fields = ['id_fundo', 'created_at', 'updated_at']
    inlines = [FundoRelatorioInline]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': (
                'id_fundo',
                'st_cnpj_fundo',
                'st_classe_fundo',
                'st_estrategia_fundo',
                'st_obs_fundo'
            )
        }),
        ('Fundo Master', {
            'fields': (
                'cod_quantum_fundomaster',
                'st_cnpj_fundomaster'
            ),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

