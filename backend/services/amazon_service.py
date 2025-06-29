from sp_api.api import Catalog, Orders
from sp_api.base import SellingApiException
from models.amazon_listing import AmazonListing
from models.product import Product
from utils.database import db
from datetime import datetime

class AmazonService:
    def __init__(self, refresh_token, region="NA"):
        self.refresh_token = refresh_token
        self.region = region
        self.credentials = {
            'refresh_token': refresh_token,
            'lwa_app_id': current_app.config['AMAZON_SP_API_CLIENT_ID'],
            'lwa_client_secret': current_app.config['AMAZON_SP_API_CLIENT_SECRET'],
            'aws_access_key': current_app.config['AWS_ACCESS_KEY_ID'],
            'aws_secret_key': current_app.config['AWS_SECRET_ACCESS_KEY'],
            'region': region
        }
    
    def create_listing(self, product):
        try:
            catalog_api = Catalog(credentials=self.credentials)
            
            # Create product listing
            response = catalog_api.create_catalog_item(
                body={
                    "productType": "PRODUCT",
                    "requirements": "LISTING",
                    "attributes": {
                        "title": product.name,
                        "brand": "YourBrand",
                        "description": product.description,
                        "bullet_points": [product.description],
                        "item_package_quantity": 1
                    }
                }
            )
            
            if response.payload:
                asin = response.payload.get('asin')
                
                # Create inventory listing
                inventory_api = Inventory(credentials=self.credentials)
                inventory_response = inventory_api.put_inventory_item(
                    body={
                        "seller_sku": product.sku,
                        "quantity": product.stock
                    }
                )
                
                # Save listing information
                listing = AmazonListing(
                    user_id=product.user_id,
                    product_id=product.id,
                    asin=asin,
                    price=product.price,
                    stock=product.stock,
                    status='ACTIVE'
                )
                db.session.add(listing)
                db.session.commit()
                
                return listing.to_dict()
                
        except SellingApiException as e:
            return {'error': str(e)}
    
    def update_inventory(self, listing_id, quantity):
        try:
            listing = AmazonListing.query.get(listing_id)
            if not listing:
                return {'error': 'Listing not found'}
            
            inventory_api = Inventory(credentials=self.credentials)
            response = inventory_api.put_inventory_item(
                body={
                    "seller_sku": listing.product.sku,
                    "quantity": quantity
                }
            )
            
            listing.stock = quantity
            listing.updated_at = datetime.utcnow()
            db.session.commit()
            
            return listing.to_dict()
            
        except SellingApiException as e:
            return {'error': str(e)}
    
    def get_orders(self, created_after=None):
        try:
            orders_api = Orders(credentials=self.credentials)
            response = orders_api.get_orders(
                CreatedAfter=created_after,
                OrderStatuses=['Unshipped', 'PartiallyShipped', 'Shipped']
            )
            return response.payload
            
        except SellingApiException as e:
            return {'error': str(e)}