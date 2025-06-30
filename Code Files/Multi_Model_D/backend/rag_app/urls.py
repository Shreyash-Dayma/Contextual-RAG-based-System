from django.urls import path
from . import views

urlpatterns = [
    path('documents/', views.DocumentListView.as_view(), name='get_all_documents'),
    path('documents/upload/', views.DocumentListView.as_view(), name='upload_document'),
    path('documents/<str:id>/', views.DocumentDetailView.as_view(), name='get_document_by_id'),
    path('documents/<str:id>/delete/', views.DocumentDetailView.as_view(), name='delete_document'),
    path('conversations/', views.ConversationListView.as_view(), name='get_all_conversations'),
    path('conversations/create/', views.ConversationListView.as_view(), name='create_conversation'),
    path('conversations/<str:id>/', views.ConversationDetailView.as_view(), name='get_conversation_by_id'),
    path('conversations/<str:id>/delete/', views.ConversationDetailView.as_view(), name='delete_conversation'),
    path('query/', views.QueryView.as_view(), name='query'),
]