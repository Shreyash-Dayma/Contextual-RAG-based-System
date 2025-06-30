import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rag_project.settings')
django.setup()

# Now that Django is set up, we can import and use Django components
from django.core.management import execute_from_command_line

# Run migrations
execute_from_command_line(['manage.py', 'migrate']) 