from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'clases'

# ── Root router: clases ────────────────────────────────────────────────────────
clases_router = DefaultRouter()
clases_router.register(r'', views.ClaseViewSet, basename='clase')

# ── Progreso ───────────────────────────────────────────────────────────────────
progress_router = DefaultRouter()
progress_router.register(r'', views.LessonProgressViewSet, basename='progress')

# ── Documentos (standalone: retrieve / destroy) ────────────────────────────────
documents_router = DefaultRouter()
documents_router.register(r'documents', views.LessonDocumentViewSet, basename='document')

urlpatterns = [
    # Lección individual
    path('lessons/<int:pk>/', views.LessonDetailView.as_view(), name='lesson-detail'),

    # Documentos anidados: GET/POST  /api/clases/lessons/<lesson_pk>/documents/
    path(
        'lessons/<int:lesson_pk>/documents/',
        views.LessonDocumentViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='lesson-documents',
    ),

    # Documento individual: GET / DELETE  /api/clases/documents/<pk>/
    path(
        'documents/<int:pk>/',
        views.LessonDocumentViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}),
        name='document-detail',
    ),

    # Progreso: /api/clases/progress/
    path('progress/', include(progress_router.urls)),

    # Clases — al final para no interceptar rutas anteriores
    path('', include(clases_router.urls)),
]