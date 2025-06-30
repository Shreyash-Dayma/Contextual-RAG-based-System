from django.db import models
import uuid
import os

def get_upload_path(instance, filename):
    return os.path.join('uploads', str(instance.id), filename)

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, blank=True)
    file = models.FileField(upload_to=get_upload_path)
    created_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    
    def __str__(self):
        return self.title or self.file.name
    
    def save(self, *args, **kwargs):
        if not self.title:
            self.title = os.path.basename(self.file.name)
        super().save(*args, **kwargs)

class Chunk(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    content = models.TextField()
    embedding_stored = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict)
    chunk_type = models.CharField(max_length=50, default='text')  # text, table, image
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Chunk {self.id} from {self.document}"
        
    def save(self, *args, **kwargs):
        # Convert UUIDs to strings in metadata before saving
        if isinstance(self.metadata, dict):
            for key, value in self.metadata.items():
                if isinstance(value, uuid.UUID):
                    self.metadata[key] = str(value)
        super().save(*args, **kwargs)

class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, default="New Conversation")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class Message(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.role}: {self.content[:30]}..."
