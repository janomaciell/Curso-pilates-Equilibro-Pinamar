import django_filters
from .models import Clase

class ClaseFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    difficulty = django_filters.ChoiceFilter(choices=Clase.DIFFICULTY_CHOICES)
    is_featured = django_filters.BooleanFilter()
    
    class Meta:
        model = Clase
        fields = ['difficulty', 'is_featured', 'min_price', 'max_price']