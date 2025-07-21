from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Fundo, Relatorio
from .serializers import FundoSerializer, FundoListSerializer, RelatorioSerializer


class FundoViewSet(viewsets.ModelViewSet):

    queryset = Fundo.objects.all().prefetch_related('relatorios__relatorio')
    serializer_class = FundoSerializer

    def get_serializer_class(self):

        if self.action == 'list':
            return FundoListSerializer
        return FundoSerializer

    def get_queryset(self):

        queryset = super().get_queryset()

        cnpj = self.request.query_params.get('cnpj', None)
        if cnpj:
            queryset = queryset.filter(st_cnpj_fundo__icontains=cnpj)

        classe = self.request.query_params.get('classe', None)
        if classe:
            queryset = queryset.filter(st_classe_fundo__icontains=classe)

        estrategia = self.request.query_params.get('estrategia', None)
        if estrategia:
            queryset = queryset.filter(
                st_estrategia_fundo__icontains=estrategia)

        relatorio = self.request.query_params.get('relatorio', None)
        if relatorio:
            queryset = queryset.filter(
                relatorios__relatorio__nome__icontains=relatorio)

        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(st_cnpj_fundo__icontains=search) |
                Q(st_classe_fundo__icontains=search) |
                Q(st_estrategia_fundo__icontains=search) |
                Q(st_obs_fundo__icontains=search)
            )

        return queryset.distinct()

    @action(detail=False, methods=['get'])
    def classes(self, request):

        classes = Fundo.objects.values_list(
            'st_classe_fundo', flat=True).distinct().order_by('st_classe_fundo')
        return Response(list(classes))

    @action(detail=False, methods=['get'])
    def estrategias(self, request):

        estrategias = Fundo.objects.values_list(
            'st_estrategia_fundo', flat=True).distinct().order_by('st_estrategia_fundo')
        return Response(list(estrategias))

    @action(detail=True, methods=['get'])
    def relatorios(self, request, pk=None):

        fundo = self.get_object()
        relatorios = [fr.relatorio for fr in fundo.relatorios.all()]
        serializer = RelatorioSerializer(relatorios, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                fundo = serializer.save()
                return Response(
                    FundoSerializer(fundo).data,
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {'error': f'Erro ao criar fundo: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):

        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial)

        if serializer.is_valid():
            try:
                fundo = serializer.save()
                return Response(FundoSerializer(fundo).data)
            except Exception as e:
                return Response(
                    {'error': f'Erro ao atualizar fundo: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RelatorioViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = Relatorio.objects.filter(ativo=True).order_by('nome')
    serializer_class = RelatorioSerializer

    def get_queryset(self):

        queryset = super().get_queryset()

        nome = self.request.query_params.get('nome', None)
        if nome:
            queryset = queryset.filter(nome__icontains=nome)

        return queryset
