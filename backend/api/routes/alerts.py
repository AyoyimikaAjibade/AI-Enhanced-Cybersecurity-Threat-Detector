from flask import Blueprint, jsonify, request
from datetime import datetime
from models.alert import Alert
from app import db
from services.auth_service import token_required

# Create blueprint
alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('/', methods=['GET'])
@token_required
def get_alerts(current_user):
    """Get all alerts with pagination and filtering"""
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 20)), 100)
        severity = request.args.get('severity')
        source = request.args.get('source')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = Alert.query
        
        # Apply filters if provided
        if severity:
            query = query.filter(Alert.severity == severity)
        if source:
            query = query.filter(Alert.source == source)
        if start_date:
            query = query.filter(Alert.created_at >= datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(Alert.created_at <= datetime.fromisoformat(end_date))
        
        # Get paginated results
        alerts_pagination = query.order_by(Alert.created_at.desc()).paginate(page=page, per_page=per_page)
        
        # Format response
        alerts_data = [{
            'id': alert.id,
            'title': alert.title,
            'description': alert.description,
            'severity': alert.severity,
            'source': alert.source,
            'is_resolved': alert.is_resolved,
            'created_at': alert.created_at.isoformat(),
            'updated_at': alert.updated_at.isoformat() if alert.updated_at else None
        } for alert in alerts_pagination.items]
        
        return jsonify({
            'alerts': alerts_data,
            'pagination': {
                'total': alerts_pagination.total,
                'pages': alerts_pagination.pages,
                'page': page,
                'per_page': per_page,
                'has_next': alerts_pagination.has_next,
                'has_prev': alerts_pagination.has_prev
            }
        }), 200
    
    except ValueError as e:
        return jsonify({'error': 'Invalid parameter format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@alerts_bp.route('/<int:alert_id>', methods=['GET'])
@token_required
def get_alert(current_user, alert_id):
    """Get a specific alert by ID"""
    try:
        alert = Alert.query.get(alert_id)
        
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404
        
        return jsonify({
            'id': alert.id,
            'title': alert.title,
            'description': alert.description,
            'severity': alert.severity,
            'source': alert.source,
            'is_resolved': alert.is_resolved,
            'details': alert.details,
            'created_at': alert.created_at.isoformat(),
            'updated_at': alert.updated_at.isoformat() if alert.updated_at else None
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@alerts_bp.route('/<int:alert_id>/resolve', methods=['PUT'])
@token_required
def resolve_alert(current_user, alert_id):
    """Mark an alert as resolved"""
    try:
        alert = Alert.query.get(alert_id)
        
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404
        
        # Update alert status
        alert.is_resolved = True
        alert.updated_at = datetime.utcnow()
        alert.resolved_by = current_user.id
        
        # Save changes
        db.session.commit()
        
        return jsonify({
            'message': 'Alert marked as resolved',
            'alert_id': alert.id
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@alerts_bp.route('/statistics', methods=['GET'])
@token_required
def get_alert_statistics(current_user):
    """Get alert statistics"""
    try:
        # Count alerts by severity
        high_count = Alert.query.filter_by(severity='high').count()
        medium_count = Alert.query.filter_by(severity='medium').count()
        low_count = Alert.query.filter_by(severity='low').count()
        
        # Count alerts by source
        network_count = Alert.query.filter_by(source='network').count()
        system_count = Alert.query.filter_by(source='system').count()
        application_count = Alert.query.filter_by(source='application').count()
        
        # Count resolved vs unresolved
        resolved_count = Alert.query.filter_by(is_resolved=True).count()
        unresolved_count = Alert.query.filter_by(is_resolved=False).count()
        
        return jsonify({
            'total_alerts': high_count + medium_count + low_count,
            'by_severity': {
                'high': high_count,
                'medium': medium_count,
                'low': low_count
            },
            'by_source': {
                'network': network_count,
                'system': system_count,
                'application': application_count
            },
            'by_status': {
                'resolved': resolved_count,
                'unresolved': unresolved_count
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
