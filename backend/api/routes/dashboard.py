from flask import Blueprint, jsonify, request
import jwt
import os
from datetime import datetime, timedelta
from models.alert import Alert
from models.traffic_data import TrafficData
from models.system_log import SystemLog
from services.auth_service import token_required

# Create blueprint
dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
@token_required
def get_summary(current_user):
    """Get dashboard summary statistics"""
    try:
        # Get time range from query parameters (default to last 24 hours)
        time_range = request.args.get('time_range', '24h')
        
        # Calculate start time based on time range
        if time_range == '24h':
            start_time = datetime.utcnow() - timedelta(hours=24)
        elif time_range == '7d':
            start_time = datetime.utcnow() - timedelta(days=7)
        elif time_range == '30d':
            start_time = datetime.utcnow() - timedelta(days=30)
        else:
            return jsonify({'error': 'Invalid time range'}), 400
        
        # Get alert statistics
        alerts = Alert.query.filter(Alert.created_at >= start_time).all()
        high_severity = sum(1 for alert in alerts if alert.severity == 'high')
        medium_severity = sum(1 for alert in alerts if alert.severity == 'medium')
        low_severity = sum(1 for alert in alerts if alert.severity == 'low')
        
        # Get traffic statistics
        traffic_data = TrafficData.query.filter(TrafficData.timestamp >= start_time).all()
        total_traffic = len(traffic_data)
        anomalous_traffic = sum(1 for data in traffic_data if data.is_anomalous)
        
        # Get system log statistics
        system_logs = SystemLog.query.filter(SystemLog.timestamp >= start_time).all()
        total_logs = len(system_logs)
        anomalous_logs = sum(1 for log in system_logs if log.is_anomalous)
        
        return jsonify({
            'alerts': {
                'total': len(alerts),
                'high_severity': high_severity,
                'medium_severity': medium_severity,
                'low_severity': low_severity
            },
            'traffic': {
                'total': total_traffic,
                'anomalous': anomalous_traffic,
                'anomaly_rate': (anomalous_traffic / total_traffic) * 100 if total_traffic > 0 else 0
            },
            'logs': {
                'total': total_logs,
                'anomalous': anomalous_logs,
                'anomaly_rate': (anomalous_logs / total_logs) * 100 if total_logs > 0 else 0
            },
            'time_range': time_range
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/recent-alerts', methods=['GET'])
@token_required
def get_recent_alerts(current_user):
    """Get recent alerts for dashboard"""
    try:
        # Get limit from query parameters (default to 10)
        limit = min(int(request.args.get('limit', 10)), 100)
        
        # Get recent alerts
        alerts = Alert.query.order_by(Alert.created_at.desc()).limit(limit).all()
        
        return jsonify([{
            'id': alert.id,
            'title': alert.title,
            'description': alert.description,
            'severity': alert.severity,
            'source': alert.source,
            'created_at': alert.created_at.isoformat()
        } for alert in alerts]), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/threat-timeline', methods=['GET'])
@token_required
def get_threat_timeline(current_user):
    """Get threat timeline data for dashboard"""
    try:
        # Get time range from query parameters (default to last 7 days)
        days = min(int(request.args.get('days', 7)), 30)
        
        # Calculate start time
        start_time = datetime.utcnow() - timedelta(days=days)
        
        # Get alerts grouped by day
        timeline_data = []
        
        for i in range(days):
            day_start = start_time + timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            
            # Count alerts for the day by severity
            day_alerts = Alert.query.filter(
                Alert.created_at >= day_start,
                Alert.created_at < day_end
            ).all()
            
            high_count = sum(1 for alert in day_alerts if alert.severity == 'high')
            medium_count = sum(1 for alert in day_alerts if alert.severity == 'medium')
            low_count = sum(1 for alert in day_alerts if alert.severity == 'low')
            
            timeline_data.append({
                'date': day_start.strftime('%Y-%m-%d'),
                'high': high_count,
                'medium': medium_count,
                'low': low_count,
                'total': len(day_alerts)
            })
        
        return jsonify(timeline_data), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
