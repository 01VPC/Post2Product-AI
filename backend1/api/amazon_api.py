# api/amazon_api.py
import boto3
from sp_api.api import Products, Orders, Reports, Feeds
from sp_api.base import Marketplaces
from sp_api.base.credential_provider import CredentialProvider
from flask import current_app
import json
from datetime import datetime, timedelta
from models.product import Product
from models.sale import Sale
from utils.database import db

class AmazonAPI:
    def __init__(self, access_key=None, secret_key=None, seller_id=None, marketplace_id=None, refresh_token=None):
        self.access_key = access_key or current_app.config['AMAZON_ACCESS_KEY']
        self.secret_key = secret_key or current_app.config['AMAZON_SECRET_KEY']
        self.seller_id = seller_id or current_app.config['AMAZON_SELLER_ID']
        self.marketplace_id = marketplace_id or current_app.config['AMAZON_MARKETPLACE_ID']
        self.refresh_token = refresh_token or current_app.config['AMAZON_REFRESH_TOKEN']
        
        # Set up credentials
        self.credentials = CredentialProvider(
            access_key=self.access_key,
            secret_key=self.secret_key,
            refresh_token=self.refresh_token,
        )
        
        # Set marketplace (US by default)
        self.marketplace = Marketplaces.US
        
    def create_product_listing(self, product):
        """Create a new product listing on Amazon"""
        try:
            # Create product feed
            feed_content = self._create_product_feed(product)
            
            # Submit feed
            feeds_api = Feeds(credentials=self.credentials, marketplace=self.marketplace)
            feed_response = feeds_api.submit_feed(
                feed_type='POST_PRODUCT_DATA',
                file_content=feed_content,
                content_type='text/xml'
            )
            
            # Return feed id to track progress
            return {
                'feed_id': feed_response.feed_id,
                'status': 'submitted'
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _create_product_feed(self, product):
        """Create XML product feed for Amazon listing"""
        xml_template = f"""<?xml version="1.0" encoding="UTF-8"?>
        <AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd">
            <Header>
                <DocumentVersion>1.01</DocumentVersion>
                <MerchantIdentifier>{self.seller_id}</MerchantIdentifier>
            </Header>
            <MessageType>Product</MessageType>
            <Message>
                <MessageID>1</MessageID>
                <OperationType>Update</OperationType>
                <Product>
                    <SKU>{product.sku}</SKU>
                    <StandardProductID>
                        <Type>ASIN</Type>
                        <Value>{product.amazon_asin if product.amazon_asin else ''}</Value>
                    </StandardProductID>
                    <ProductTaxCode>A_GEN_NOTAX</ProductTaxCode>
                    <DescriptionData>
                        <Title>{product.title}</Title>
                        <Description>{product.description}</Description>
                        <BulletPoint>Sourced from Instagram</BulletPoint>
                        <BulletPoint>High quality product</BulletPoint>
                        <ItemDimensions>
                            <Weight unitOfMeasure="LB">1</Weight>
                        </ItemDimensions>
                        <MSRP currency="USD">{product.price}</MSRP>
                    </DescriptionData>
                    <ProductData>
                        <Generic>
                            <Manufacturer>Post2ProductAI</Manufacturer>
                        </Generic>
                    </ProductData>
                </Product>
            </Message>
        </AmazonEnvelope>
        """
        return xml_template
    
    def get_inventory(self, skus=None):
        """Get inventory for products"""
        try:
            products_api = Products(credentials=self.credentials, marketplace=self.marketplace)
            
            if skus:
                inventory_response = products_api.get_inventory_summary(sku_list=skus)
            else:
                inventory_response = products_api.get_inventory_summary()
                
            return inventory_response.payload
        except Exception as e:
            return {'error': str(e)}
    
    def update_inventory(self, sku, quantity):
        """Update inventory for a product"""
        try:
            # Create inventory feed
            feed_content = self._create_inventory_feed(sku, quantity)
            
            # Submit feed
            feeds_api = Feeds(credentials=self.credentials, marketplace=self.marketplace)
            feed_response = feeds_api.submit_feed(
                feed_type='POST_INVENTORY_AVAILABILITY_DATA',
                file_content=feed_content,
                content_type='text/xml'
            )
            
            return {
                'feed_id': feed_response.feed_id,
                'status': 'submitted'
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _create_inventory_feed(self, sku, quantity):
        """Create XML inventory feed"""
        xml_template = f"""<?xml version="1.0" encoding="UTF-8"?>
        <AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd">
            <Header>
                <DocumentVersion>1.01</DocumentVersion>
                <MerchantIdentifier>{self.seller_id}</MerchantIdentifier>
            </Header>
            <MessageType>Inventory</MessageType>
            <Message>
                <MessageID>1</MessageID>
                <OperationType>Update</OperationType>
                <Inventory>
                    <SKU>{sku}</SKU>
                    <Quantity>{quantity}</Quantity>
                    <FulfillmentLatency>1</FulfillmentLatency>
                </Inventory>
            </Message>
        </AmazonEnvelope>
        """
        return xml_template
    
    def get_orders(self, days_back=7):
        """Get orders from the last X days"""
        try:
            orders_api = Orders(credentials=self.credentials, marketplace=self.marketplace)
            
            # Calculate date X days back
            start_date = (datetime.utcnow() - timedelta(days=days_back)).isoformat()
            
            orders_response = orders_api.get_orders(CreatedAfter=start_date)
            return orders_response.payload
        except Exception as e:
            return {'error': str(e)}
    
    def sync_sales(self, user_id, days_back=7):
        """Sync Amazon sales to database"""
        orders_data = self.get_orders(days_back)
        
        if 'error' in orders_data:
            return orders_data
        
        synced_sales = []
        
        for order in orders_data.get('Orders', []):
            # Get order items
            try:
                orders_api = Orders(credentials=self.credentials, marketplace=self.marketplace)
                order_items = orders_api.get_order_items(order['AmazonOrderId']).payload
                
                for item in order_items.get('OrderItems', []):
                    # Find the product by SKU
                    product = Product.query.filter_by(user_id=user_id, sku=item['SellerSKU']).first()
                    
                    if product:
                        # Check if sale already exists
                        existing_sale = Sale.query.filter_by(
                            user_id=user_id,
                            product_id=product.id,
                            order_id=order['AmazonOrderId'],
                            platform='amazon'
                        ).first()
                        
                        if not existing_sale:
                            # Create new sale
                            sale = Sale(
                                product_id=product.id,
                                user_id=user_id,
                                platform='amazon',
                                quantity=int(item['QuantityOrdered']),
                                sale_price=float(item['ItemPrice']['Amount']),
                                order_id=order['AmazonOrderId'],
                                sale_date=datetime.fromisoformat(order['PurchaseDate'].replace('Z', '+00:00'))
                            )
                            db.session.add(sale)
                            synced_sales.append(sale)
                            
                            # Update inventory count
                            product.inventory_count -= int(item['QuantityOrdered'])
            except Exception as e:
                continue
        
        if synced_sales:
            db.session.commit()
            
        return {'synced_sales': len(synced_sales)}