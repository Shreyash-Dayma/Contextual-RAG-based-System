import os
import fitz
import cv2
import pytesseract
import numpy as np
from PIL import Image
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings  # Use HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from pymongo import MongoClient
from django.conf import settings
import logging
import io


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = MongoClient(settings.MONGODB_HOST, settings.MONGODB_PORT)
db = client[settings.MONGODB_DB]

def extract_text_from_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        return ""

def extract_images_from_pdf(pdf_path):
    images = []
    try:
        doc = fitz.open(pdf_path)
        for page_num in range(len(doc)):
            page = doc[page_num]
            image_list = page.get_images(full=True)
            for img_index, img in enumerate(image_list):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image = Image.open(io.BytesIO(image_bytes))
                images.append(image)
        doc.close()
    except Exception as e:
        logger.error(f"Error extracting images from PDF: {e}")
    return images

def extract_text_from_image(image):
    try:
        img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        text = pytesseract.image_to_string(img)
        return text
    except Exception as e:
        logger.error(f"Error extracting text from image: {e}")
        return ""

def process_document(pdf_path, filename):
    try:
        text = extract_text_from_pdf(pdf_path)
        images = extract_images_from_pdf(pdf_path)
        image_texts = [extract_text_from_image(img) for img in images]
        combined_text = text + "\n" + "\n".join(image_texts)
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_text(combined_text)
        
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vector_store = FAISS.from_texts(chunks, embeddings)
        
        document_id = str(db.documents.count_documents({}) + 1)
        vector_store_path = os.path.join(settings.VECTOR_STORE_DIR, f"{document_id}.faiss")
        vector_store.save_local(vector_store_path)
        
        # Explicitly release vector store and embeddings
        del vector_store
        del embeddings
        
        document = {
            '_id': document_id,
            'filename': filename,
            'upload_time': document_id,
            'processed': True,
            'vector_store_path': vector_store_path
        }
        db.documents.insert_one(document)
        
        logger.info(f"Processed document {document_id}: {filename}")
        return document_id
    except Exception as e:
        logger.error(f"Error processing document: {e}")
        raise

def process_query(query, vector_store_path):
    try:
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vector_store = FAISS.load_local(vector_store_path, embeddings, allow_dangerous_deserialization=True)
        
        # Get relevant documents
        docs = vector_store.similarity_search(query, k=4)  # Increased k to get more context
        
        # Determine query type for better response formatting
        query_lower = query.lower()
        is_table_query = any(word in query_lower for word in ['table', 'list', 'data', 'rows', 'columns'])
        is_chart_query = any(word in query_lower for word in ['chart', 'graph', 'plot', 'figure', 'diagram'])
        is_numerical_query = any(word in query_lower for word in ['calculate', 'sum', 'average', 'percentage', 'total'])
        
        # Select appropriate system prompt based on query type
        if is_table_query:
            system_prompt = """You are an expert assistant analyzing PDF documents containing tables and structured data. Follow these guidelines:

1. Table Formatting:
   - Present data in markdown table format using | separators
   - Include clear, descriptive column headers
   - Align numerical data to the right
   - Use consistent decimal places for numbers
   - Add a brief title or description above the table

2. Data Organization:
   - Sort data logically (e.g., alphabetically, numerically)
   - Group related information together
   - Include units where applicable
   - Handle missing data appropriately

3. Additional Context:
   - Provide a brief introduction before the table
   - Add relevant notes or explanations after the table
   - Mention data source page numbers
   - Explain any abbreviations used

Context:
{context}

Question: {query}

Structure your response with a clear table format and necessary context."""

        elif is_chart_query:
            system_prompt = """You are an expert assistant analyzing PDF documents containing charts and visual data. Follow these guidelines:

1. Chart Description:
   - Describe the type of chart/graph (bar, line, pie, etc.)
   - Explain the axes and what they represent
   - Highlight key trends or patterns
   - Note any significant data points

2. Data Interpretation:
   - Explain what the visualization shows
   - Identify the main insights
   - Mention any outliers or unusual patterns
   - Provide relevant context from surrounding text

3. Numerical Details:
   - Include specific values for key points
   - Mention scales and units used
   - Provide ranges or averages if relevant

Context:
{context}

Question: {query}

Describe the visual elements clearly and provide meaningful insights."""

        elif is_numerical_query:
            system_prompt = """You are an expert assistant analyzing numerical data in PDF documents. Follow these guidelines:

1. Calculations:
   - Show clear step-by-step calculations
   - Use markdown table format for multiple calculations
   - Include units in all calculations
   - Round numbers appropriately

2. Data Presentation:
   - Present results in a clear, organized format
   - Use bullet points for multiple findings
   - Highlight key numbers with *bold*
   - Include confidence levels if applicable

3. Context:
   - Explain the significance of the calculations
   - Note any assumptions made
   - Cite specific pages/sections of source data

Context:
{context}

Question: {query}

Show your work clearly and explain the numerical findings."""

        else:
            system_prompt = """You are an expert assistant analyzing PDF documents. Follow these guidelines:

1. General Response Structure:
   - Start with a clear, direct answer
   - Use bullet points for multiple items
   - Mark *important terms* with asterisks for bold
   - Include specific page references

2. Data Handling:
   - Format any numbers or statistics clearly
   - Use tables for structured data
   - Include units where relevant
   - Cite specific sections

3. Clarity and Context:
   - Break long responses into sections
   - Use appropriate formatting for different data types
   - Provide relevant examples
   - Note any uncertainties

Context:
{context}

Question: {query}

Provide a well-structured, clear response."""

        # Format context with better metadata
        context = "\n\n".join([
            f"Source {i+1} (Page {doc.metadata.get('page', 'N/A')}):\n{doc.page_content}"
            for i, doc in enumerate(docs)
        ])
        
        # Format the full prompt
        full_prompt = system_prompt.format(context=context, query=query)
        
        # Create chat groq instance with adjusted parameters
        chat = ChatGroq(
            temperature=0.7,
            groq_api_key=settings.GROQ_API_KEY,
            model_name="meta-llama/llama-4-scout-17b-16e-instruct",
            max_tokens=2048  # Increased for more detailed responses
        )
        
        # Get the response
        response = chat.predict(full_prompt)
        
        # Prepare detailed sources with metadata
        sources = [{
            "content": doc.page_content,
            "metadata": {
                "page": doc.metadata.get('page', 'N/A'),
                "source": doc.metadata.get('source', 'Document'),
                "type": "text" if not any(img_ext in doc.metadata.get('source', '').lower() 
                                        for img_ext in ['.png', '.jpg', '.jpeg', '.gif']) else "image"
            }
        } for doc in docs]
        
        # Release resources
        del vector_store
        del embeddings
        
        logger.info(f"Processed query: {query}")
        return {
            'answer': response,
            'sources': sources,
            'query_type': 'table' if is_table_query else 'chart' if is_chart_query else 'numerical' if is_numerical_query else 'general'
        }
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise

def cleanup_resources(document_id: str) -> None:
    """Clean up all resources associated with a document."""
    try:
        # Delete vector store files
        vector_store_path = os.path.join(settings.VECTOR_STORE_DIR, str(document_id))
        if os.path.exists(vector_store_path):
            # Give full permissions before attempting deletion
            os.chmod(vector_store_path, 0o777)
            for filename in os.listdir(vector_store_path):
                file_path = os.path.join(vector_store_path, filename)
                try:
                    if os.path.isfile(file_path):
                        os.chmod(file_path, 0o777)
                        os.remove(file_path)
                except Exception as e:
                    logger.error(f"Error removing file {file_path}: {e}")
            try:
                os.rmdir(vector_store_path)
            except Exception as e:
                logger.error(f"Error removing directory {vector_store_path}: {e}")

        # Delete uploaded files
        upload_path = os.path.join(settings.MEDIA_ROOT, 'uploads', str(document_id))
        if os.path.exists(upload_path):
            try:
                os.chmod(upload_path, 0o777)
                for filename in os.listdir(upload_path):
                    file_path = os.path.join(upload_path, filename)
                    if os.path.isfile(file_path):
                        os.chmod(file_path, 0o777)
                        os.remove(file_path)
                os.rmdir(upload_path)
            except Exception as e:
                logger.error(f"Error cleaning up upload directory: {e}")

        logger.info(f"Successfully cleaned up resources for document {document_id}")
    except Exception as e:
        logger.error(f"Error during resource cleanup: {e}")
        raise