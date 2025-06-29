from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.analytics_service import AnalyticsService

analytics_api = Blueprint('analytics_api', __name__)

@analytics_api.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    user_id = get_jwt_identity()
    stats = AnalyticsService.get_dashboard_stats(user_id)
    return jsonify(stats)

@analytics_api.route('/sales', methods=['GET'])
@jwt_required()
def get_sales_analytics():
    user_id = get_jwt_identity()
    days = request.args.get('days', default=30, type=int)
    analytics = AnalyticsService.get_sales_analytics(user_id, days)
    return jsonify({'sales_data': analytics})