
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pymongo import MongoClient
from django.conf import settings
import os
import logging
from .processors import process_document, process_query, cleanup_resources

# Define logger
logger = logging.getLogger(__name__)

client = MongoClient(settings.MONGODB_HOST, settings.MONGODB_PORT)
db = client[settings.MONGODB_DB]

class DocumentListView(APIView):
    http_method_names = ['get', 'post']

    def get(self, request):
        try:
            documents = list(db.documents.find({}, {'_id': 1, 'filename': 1, 'upload_time': 1, 'processed': 1}))
            for doc in documents:
                doc['id'] = str(doc['_id'])
                del doc['_id']
            logger.info(f"Fetched {len(documents)} documents")
            return Response(documents)
        except Exception as e:
            logger.error(f"Error fetching documents: {e}")
            return Response({'error': 'Failed to fetch documents'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            if 'file' not in request.FILES:
                logger.error("No file provided in request")
                return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
            
            file = request.FILES['file']
            if not file.name.endswith('.pdf'):
                logger.error(f"Invalid file type: {file.name}")
                return Response({'error': 'Only PDF files are supported'}, status=status.HTTP_400_BAD_REQUEST)
            
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
            file_path = os.path.join(settings.UPLOAD_DIR, file.name)
            with open(file_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            
            document_id = process_document(file_path, file.name)
            logger.info(f"Uploaded document {document_id}: {file.name}")
            return Response({'id': document_id, 'filename': file.name, 'upload_time': document_id, 'processed': True})
        except Exception as e:
            logger.error(f"Error uploading document: {e}")
            return Response({'error': f'Failed to upload document: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DocumentDetailView(APIView):
    http_method_names = ['get', 'delete']

    def get(self, request, id):
        document = db.documents.find_one({'_id': id})
        if not document:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
        document['id'] = str(document['_id'])
        del document['_id']
        return Response(document)

    def delete(self, request, id):
        try:
            document = db.documents.find_one({'_id': id})
            if not document:
                return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Clean up all resources first
            cleanup_resources(id)
            
            # Only delete from database if cleanup was successful
            db.documents.delete_one({'_id': id})
            logger.info(f"Deleted document {id} from database")
            
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error during document deletion: {e}")
            return Response(
                {'error': f'Failed to delete document: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ConversationListView(APIView):
    http_method_names = ['get', 'post']

    def get(self, request):
        try:
            conversations = list(db.conversations.find({}, {'_id': 1, 'documentId': 1}))
            for conv in conversations:
                conv['id'] = str(conv['_id'])
                del conv['_id']
            logger.info(f"Fetched {len(conversations)} conversations")
            return Response(conversations)
        except Exception as e:
            logger.error(f"Error fetching conversations: {e}")
            return Response({'error': 'Failed to fetch conversations'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            document_id = request.data.get('documentId')
            if not document_id:
                logger.error("No documentId provided in request")
                return Response({'error': 'documentId is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Convert document_id to string to match MongoDB _id
            document = db.documents.find_one({'_id': str(document_id)})
            if not document:
                logger.error(f"Document not found for ID: {document_id}")
                return Response({'error': f'Document not found for ID: {document_id}'}, status=status.HTTP_404_NOT_FOUND)
            
            # Check if conversation already exists for this document
            existing_conversation = db.conversations.find_one({'documentId': str(document_id)})
            if existing_conversation:
                logger.info(f"Conversation already exists for document {document_id}")
                return Response({'id': str(existing_conversation['_id']), 'documentId': document_id})
            
            conversation_id = str(db.conversations.count_documents({}) + 1)
            conversation = {
                '_id': conversation_id,  # Use unique conversation_id
                'documentId': str(document_id),
                'created_at': conversation_id
            }
            db.conversations.insert_one(conversation)
            logger.info(f"Created conversation {conversation_id} for document {document_id}")
            return Response({'id': conversation_id, 'documentId': document_id})
        except Exception as e:
            logger.error(f"Error creating conversation: {e}")
            return Response({'error': f'Failed to create conversation: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ConversationDetailView(APIView):
    http_method_names = ['get', 'delete']

    def get(self, request, id):
        conversation = db.conversations.find_one({'_id': id})
        if not conversation:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
        conversation['id'] = str(conversation['_id'])
        del conversation['_id']
        return Response(conversation)

    def delete(self, request, id):
        conversation = db.conversations.find_one({'_id': id})
        if not conversation:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
        db.conversations.delete_one({'_id': id})
        return Response(status=status.HTTP_204_NO_CONTENT)

class QueryView(APIView):
    http_method_names = ['post']

    def post(self, request):
        try:
            query = request.data.get('query')
            document_id = str(request.data.get('documentId', ''))
            
            if not query or not document_id:
                logger.error(f"Missing query or documentId: query={query}, documentId={document_id}")
                return Response({'error': 'Query and documentId are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Find document with string ID
            document = db.documents.find_one({'_id': document_id})
            if not document:
                logger.error(f"Document not found for ID: {document_id}")
                return Response({'error': f'Document not found for ID: {document_id}'}, status=status.HTTP_404_NOT_FOUND)
            
            vector_store_path = document.get('vector_store_path')
            if not vector_store_path or not os.path.exists(vector_store_path):
                logger.error(f"Vector store not found for document {document_id}")
                return Response({'error': 'Vector store not found'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Process query using processors.py
            result = process_query(query, vector_store_path)
            logger.info(f"Processed query for document {document_id}: {query}")
            
            # Return complete response including query_type
            return Response({
                'answer': result.get('answer', 'No response generated'),
                'sources': result.get('sources', []),
                'query_type': result.get('query_type', 'general')
            })
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return Response(
                {'error': f'Failed to process query: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )