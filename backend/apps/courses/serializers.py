from rest_framework import serializers
from django.conf import settings
from .models import Course, Module, Lesson, LessonProgress, LessonDocument


# ── Helpers ────────────────────────────────────────────────────────────────────

def _make_absolute_url(url, request=None):
    """
    Convierte una URL en absoluta.
    - Si ya es absoluta (R2, S3, CDN...) la devuelve sin tocarla.
    - Si es relativa, usa BACKEND_URL o request para construirla.
    """
    if not url:
        return None
    # URL ya absoluta → devolver directo (evita concatenar ngrok + R2)
    if url.startswith('http://') or url.startswith('https://'):
        return url
    # URL relativa → construir absoluta
    if hasattr(settings, 'BACKEND_URL') and settings.BACKEND_URL:
        return f"{settings.BACKEND_URL.rstrip('/')}{url}"
    if request:
        return request.build_absolute_uri(url)
    return url


# ── Document serializer ────────────────────────────────────────────────────────

class LessonDocumentSerializer(serializers.ModelSerializer):
    file_url  = serializers.SerializerMethodField()
    name      = serializers.ReadOnlyField()
    file_type = serializers.ReadOnlyField()

    class Meta:
        model  = LessonDocument
        fields = ('id', 'lesson', 'title', 'name', 'file_type', 'file', 'file_url', 'created_at')
        read_only_fields = ('id', 'created_at', 'file_url', 'name', 'file_type')
        extra_kwargs = {'file': {'write_only': True}}

    def get_file_url(self, obj):
        if not obj.file:
            return None
        return _make_absolute_url(obj.file.url, self.context.get('request'))


# ── Lesson serializers ─────────────────────────────────────────────────────────

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Lesson
        fields = ('id', 'title', 'description', 'lesson_type', 'duration_minutes', 'order', 'is_preview')


class LessonDetailSerializer(serializers.ModelSerializer):
    video_url = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()

    class Meta:
        model  = Lesson
        fields = (
            'id', 'title', 'description', 'lesson_type',
            'video_id', 'video_url', 'duration_minutes',
            'order', 'is_preview', 'documents',
        )

    def get_video_url(self, obj):
        request = self.context.get('request')
        if obj.is_preview or (request and request.user.is_authenticated):
            return obj.video_id
        return None

    def get_documents(self, obj):
        docs = obj.documents.all()
        return LessonDocumentSerializer(docs, many=True, context=self.context).data


# ── Module / Course serializers ────────────────────────────────────────────────

class ModuleSerializer(serializers.ModelSerializer):
    lessons       = LessonSerializer(many=True, read_only=True)
    lessons_count = serializers.SerializerMethodField()

    class Meta:
        model  = Module
        fields = ('id', 'title', 'description', 'order', 'lessons', 'lessons_count')

    def get_lessons_count(self, obj):
        return obj.lessons.count()


class CourseListSerializer(serializers.ModelSerializer):
    total_lessons  = serializers.ReadOnlyField()
    total_students = serializers.ReadOnlyField()
    cover_image    = serializers.SerializerMethodField()

    class Meta:
        model  = Course
        fields = (
            'id', 'title', 'slug', 'short_description', 'cover_image', 'price',
            'difficulty', 'duration_hours', 'total_lessons', 'total_students',
            'is_featured', 'created_at',
        )

    def get_cover_image(self, obj):
        if not obj.cover_image:
            return None
        return _make_absolute_url(obj.cover_image.url, self.context.get('request'))


class CourseDetailSerializer(serializers.ModelSerializer):
    modules        = ModuleSerializer(many=True, read_only=True)
    total_lessons  = serializers.ReadOnlyField()
    total_students = serializers.ReadOnlyField()
    has_access     = serializers.SerializerMethodField()
    cover_image    = serializers.SerializerMethodField()

    class Meta:
        model  = Course
        fields = (
            'id', 'title', 'slug', 'description', 'short_description', 'cover_image',
            'price', 'difficulty', 'duration_hours', 'modules', 'total_lessons',
            'total_students', 'is_featured', 'has_access', 'created_at',
        )

    def get_cover_image(self, obj):
        if not obj.cover_image:
            return None
        return _make_absolute_url(obj.cover_image.url, self.context.get('request'))

    def get_has_access(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from apps.payments.models import CourseAccess
            return CourseAccess.objects.filter(
                user=request.user, course=obj, is_active=True
            ).exists()
        return False


# ── Progress serializer ────────────────────────────────────────────────────────

class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model  = LessonProgress
        fields = (
            'id', 'lesson', 'lesson_title', 'completed',
            'progress_percentage', 'last_watched_at', 'created_at',
        )
        read_only_fields = ('id', 'created_at', 'last_watched_at')