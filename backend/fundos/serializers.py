from rest_framework import serializers
from .models import Fundo, Relatorio, FundoRelatorio


class RelatorioSerializer(serializers.ModelSerializer):

    class Meta:
        model = Relatorio
        fields = ['id', 'nome', 'descricao', 'ativo']


class FundoRelatorioSerializer(serializers.ModelSerializer):

    relatorio = RelatorioSerializer(read_only=True)
    relatorio_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = FundoRelatorio
        fields = ['relatorio', 'relatorio_id']


class FundoSerializer(serializers.ModelSerializer):

    relatorios = FundoRelatorioSerializer(many=True, read_only=True)
    relatorios_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True
    )

    class Meta:
        model = Fundo
        fields = [
            'id_fundo',
            'st_cnpj_fundo',
            'st_classe_fundo',
            'st_estrategia_fundo',
            'st_obs_fundo',
            'cod_quantum_fundomaster',
            'st_cnpj_fundomaster',
            'relatorios',
            'relatorios_ids',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id_fundo', 'created_at', 'updated_at']

    def validate_st_cnpj_fundo(self, value):

        if not value:
            raise serializers.ValidationError("CNPJ do fundo é obrigatório.")

        if self.instance:

            if Fundo.objects.filter(st_cnpj_fundo=value).exclude(id_fundo=self.instance.id_fundo).exists():
                raise serializers.ValidationError(
                    "Já existe um fundo com este CNPJ.")
        else:

            if Fundo.objects.filter(st_cnpj_fundo=value).exists():
                raise serializers.ValidationError(
                    "Já existe um fundo com este CNPJ.")

        return value

    def validate_relatorios_ids(self, value):

        if value:

            existing_ids = set(Relatorio.objects.filter(
                id__in=value, ativo=True).values_list('id', flat=True))
            provided_ids = set(value)

            if not provided_ids.issubset(existing_ids):
                invalid_ids = provided_ids - existing_ids
                raise serializers.ValidationError(
                    f"Relatórios com IDs {list(invalid_ids)} não existem ou estão inativos.")

        return value

    def validate(self, attrs):

        cod_quantum = attrs.get('cod_quantum_fundomaster')
        cnpj_master = attrs.get('st_cnpj_fundomaster')

        if cod_quantum and not cnpj_master:
            raise serializers.ValidationError({
                'st_cnpj_fundomaster': 'CNPJ do fundo master é obrigatório quando código do fundo master é fornecido.'
            })

        return attrs

    def create(self, validated_data):

        relatorios_ids = validated_data.pop('relatorios_ids', [])
        fundo = Fundo.objects.create(**validated_data)

        for relatorio_id in relatorios_ids:
            FundoRelatorio.objects.create(
                fundo=fundo, relatorio_id=relatorio_id)

        return fundo

    def update(self, instance, validated_data):

        relatorios_ids = validated_data.pop('relatorios_ids', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if relatorios_ids is not None:

            FundoRelatorio.objects.filter(fundo=instance).delete()

            for relatorio_id in relatorios_ids:
                FundoRelatorio.objects.create(
                    fundo=instance, relatorio_id=relatorio_id)

        return instance


class FundoListSerializer(serializers.ModelSerializer):

    relatorios_nomes = serializers.SerializerMethodField()

    class Meta:
        model = Fundo
        fields = [
            'id_fundo',
            'st_cnpj_fundo',
            'st_classe_fundo',
            'st_estrategia_fundo',
            'cod_quantum_fundomaster',
            'st_cnpj_fundomaster',
            'relatorios_nomes',
            'created_at'
        ]

    def get_relatorios_nomes(self, obj):

        return [fr.relatorio.nome for fr in obj.relatorios.all()]
