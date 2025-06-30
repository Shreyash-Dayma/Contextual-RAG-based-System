from rest_framework import serializers
from .models import Document, Chunk, Conversation, Message
import os

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'title', 'file', 'created_at', 'processed']
        read_only_fields = ['id', 'created_at', 'processed']

class ChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chunk
        fields = ['id', 'document', 'content', 'embedding_stored', 'metadata', 'chunk_type', 'created_at']
        read_only_fields = ['id', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'role', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']

class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['id', 'title', 'created_at', 'messages']
        read_only_fields = ['id', 'created_at']

class QuerySerializer(serializers.Serializer):
    query = serializers.CharField(required=True)
    conversation_id = serializers.UUIDField(required=False, allow_null=True)

class DocumentUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
    title = serializers.CharField(required=False, allow_blank=True)
    
    def validate_file(self, value):
        """Validate that the uploaded file is a PDF or other supported format."""
        # Check file extension
        file_extension = os.path.splitext(value.name)[1].lower()
        supported_extensions = ['.pdf', '.txt', '.md', '.html', '.htm']
        
        if file_extension not in supported_extensions:
            raise serializers.ValidationError(
                f"Unsupported file format: {file_extension}. "
                f"Supported formats: {', '.join(supported_extensions)}"
            )
            
        # Check file size (max 20MB)
        if value.size > 20 * 1024 * 1024:  # 20MB
            raise serializers.ValidationError(
                "File too large. Maximum file size is 20MB."
            )
            
        return value 