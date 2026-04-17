from django.db import models
from django.core.validators import MinValueValidator
from apps.users.models import User

class Clase(models.Model):
    DIFFICULTY_CHOICES = [
        ('beginner', 'Principiante'),
        ('intermediate', 'Intermedio'),
        ('advanced', 'Avanzado'),
    ]

    CATEGORY_CHOICES = [
        ('pilates-mat', 'Pilates Mat'),
        ('stretching', 'Stretching'),
        ('power-pilates', 'Power Pilates'),
        ('power-workout', 'Power Workout'),
        ('hipopresivos', 'Hipopresivos'),
        ('fuerza', 'Fuerza'),
    ]

    title = models.CharField('Título', max_length=200)
    slug = models.SlugField('Slug', max_length=200, unique=True)
    category = models.CharField('Categoría', max_length=50, choices=CATEGORY_CHOICES, default='pilates-mat')
    description = models.TextField('Descripción')
    short_description = models.CharField('Descripción corta', max_length=300)
    cover_image = models.ImageField('Imagen de portada', upload_to='clases/covers/')
    price = models.DecimalField('Precio', max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    difficulty = models.CharField('Dificultad', max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    duration_hours = models.PositiveIntegerField('Duración (horas)', default=0)
    is_active = models.BooleanField('Activo', default=True)
    is_featured = models.BooleanField('Destacado', default=False)
    created_at = models.DateTimeField('Fecha de creación', auto_now_add=True)
    updated_at = models.DateTimeField('Última actualización', auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='clases_created')

    class Meta:
        db_table = 'clases'
        verbose_name = 'Clase'
        verbose_name_plural = 'Clases'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def total_lessons(self):
        return Lesson.objects.filter(module__clase=self).count()

    @property
    def total_students(self):
        from apps.payments.models import ClaseAccess
        return ClaseAccess.objects.filter(clase=self, is_active=True).count()


class Module(models.Model):
    clase = models.ForeignKey(Clase, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField('Título', max_length=200)
    description = models.TextField('Descripción', blank=True)
    order = models.PositiveIntegerField('Orden', default=0)
    created_at = models.DateTimeField('Fecha de creación', auto_now_add=True)

    class Meta:
        db_table = 'modules'
        verbose_name = 'Módulo'
        verbose_name_plural = 'Módulos'
        ordering = ['clase', 'order']
        unique_together = ['clase', 'order']

    def __str__(self):
        return f"{self.clase.title} - {self.title}"


class Lesson(models.Model):
    TYPE_VIDEO    = 'video'
    TYPE_DOCUMENT = 'document'
    LESSON_TYPE_CHOICES = [
        (TYPE_VIDEO,    'Video'),
        (TYPE_DOCUMENT, 'Documento'),
    ]

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField('Título', max_length=200)
    description = models.TextField('Descripción', blank=True)
    lesson_type = models.CharField('Tipo', max_length=20, choices=LESSON_TYPE_CHOICES, default=TYPE_VIDEO)
    video_id = models.CharField('ID del video', max_length=200, blank=True, help_text='ID del video en Cloudflare Stream')
    duration_minutes = models.PositiveIntegerField('Duración (minutos)', default=0)
    order = models.PositiveIntegerField('Orden', default=0)
    is_preview = models.BooleanField('Vista previa gratis', default=False)
    created_at = models.DateTimeField('Fecha de creación', auto_now_add=True)

    class Meta:
        db_table = 'lessons'
        verbose_name = 'Lección'
        verbose_name_plural = 'Lecciones'
        ordering = ['module', 'order']
        unique_together = ['module', 'order']

    def __str__(self):
        return f"{self.module.clase.title} - {self.module.title} - {self.title}"


class LessonProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='user_progress')
    completed = models.BooleanField('Completada', default=False)
    progress_percentage = models.PositiveIntegerField('Porcentaje de progreso', default=0)
    last_watched_at = models.DateTimeField('Última visualización', auto_now=True)
    created_at = models.DateTimeField('Fecha de inicio', auto_now_add=True)

    class Meta:
        db_table = 'lesson_progress'
        verbose_name = 'Progreso de lección'
        verbose_name_plural = 'Progresos de lecciones'
        unique_together = ['user', 'lesson']

    def __str__(self):
        return f"{self.user.email} - {self.lesson.title} - {self.progress_percentage}%"


class LessonDocument(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField('Título', max_length=200, blank=True)
    file = models.FileField('Archivo', upload_to='lessons/documents/')
    created_at = models.DateTimeField('Fecha de subida', auto_now_add=True)

    class Meta:
        db_table = 'lesson_documents'
        verbose_name = 'Documento de lección'
        verbose_name_plural = 'Documentos de lecciones'
        ordering = ['lesson', 'created_at']

    # ── computed helpers ──────────────────────────────────────────────
    @property
    def name(self):
        """Human-readable file name: use title if set, else the bare filename."""
        if self.title:
            return self.title
        import os
        return os.path.basename(self.file.name) if self.file else ''

    @property
    def file_type(self):
        """Returns a short type key used by the frontend icon helper."""
        import os
        ext = os.path.splitext(self.file.name)[1].lower() if self.file else ''
        mapping = {
            '.pdf':  'pdf',
            '.xls':  'excel', '.xlsx': 'excel',
            '.doc':  'word',  '.docx': 'word',
            '.ppt':  'ppt',   '.pptx': 'ppt',
            '.zip':  'zip',   '.rar':  'zip',  '.7z': 'zip',
            '.png':  'img',   '.jpg':  'img',  '.jpeg': 'img', '.gif': 'img', '.webp': 'img',
            '.txt':  'txt',   '.csv':  'txt',
            '.mp4':  'video', '.mkv':  'video', '.avi': 'video',
        }
        return mapping.get(ext, 'txt')

    def __str__(self):
        return f"{self.lesson.title} - {self.name}"