# services/listing_generator.py
import uuid
import re
from models.product import Product
from models.post import InstagramPost
from utils.database import db

class ListingGenerator:
    def __init__(self):
        pass
    
    def generate_amazon_listing_from_post(self, post, user_id):
        """Generate an Amazon listing from an Instagram post"""
        if not post or not isinstance(post, InstagramPost):
            raise ValueError("Invalid post provided")
        
        # Extract product information from the post caption
        product_info = self._extract_product_info(post.caption)
        
        # Generate a SKU
        sku = f"P2P-{user_id}-{uuid.uuid4().hex[:8]}"
        
        # Create a product
        product = Product(
            user_id=user_id,
            post_id=post.id,
            title=product_info['title'],
            description=product_info['description'],
            price=product_info['price'],
            sku=sku,
            inventory_count=product_info.get('inventory', 10)  # Default to 10 items
        )
        
        # Save to database
        db.session.add(product)
        db.session.commit()
        
        # Mark post as processed
        post.processed = True
        db.session.commit()
        
        return product
    
    def _extract_product_info(self, caption):
        """Extract product information from Instagram caption"""
        # Default values
        product_info = {
            'title': 'Instagram Product',
            'description': caption[:500] if caption else 'Product from Instagram',
            'price': 19.99,
            'inventory': 10
        }
        
        if not caption:
            return product_info
        
        # Look for title patterns like "Product: Name" or "Item: Name"
        title_match = re.search(r'(?:Product|Item|Title):\s*([^\n]+)', caption, re.IGNORECASE)
        if title_match:
            product_info['title'] = title_match.group(1).strip()
        else:
            # Use first line or first 50 characters as title
            first_line = caption.split('\n')[0].strip()
            product_info['title'] = (first_line[:50] + '...') if len(first_line) > 50 else first_line
        
        # Look for price patterns like "$19.99" or "Price: $19.99"
        price_match = re.search(r'(?:Price|Cost):\s*\$?(\d+(?:\.\d{1,2})?)', caption, re.IGNORECASE) or re.search(r'\$(\d+(?:\.\d{1,2})?)', caption)
        if price_match:
            try:
                product_info['price'] = float(price_match.group(1))
            except (ValueError, IndexError):
                pass
        
        # Look for inventory/stock patterns
        inventory_match = re.search(r'(?:Stock|Inventory|Qty|Quantity):\s*(\d+)', caption, re.IGNORECASE)
        if inventory_match:
            try:
                product_info['inventory'] = int(inventory_match.group(1))
            except (ValueError, IndexError):
                pass
                
        return product_info
    
    def update_amazon_listing(self, product, amazon_listing_id=None, amazon_asin=None):
        """Update Amazon listing information for a product"""
        if not product:
            raise ValueError("Invalid product provided")
        
        if amazon_listing_id:
            product.amazon_listing_id = amazon_listing_id
            
        if amazon_asin:
            product.amazon_asin = amazon_asin
            
        db.session.commit()
        return product