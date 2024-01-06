from application.data.models import Category
from main import cache

@cache.cached(timeout=50, key_prefix='get_categories')
def get_categories():
    category=Category.query.all()
    return category