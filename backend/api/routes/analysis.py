from flask import Blueprint, jsonify, request
import json
from datetime import datetime, timedelta
from models.traffic_data import TrafficData
from models.system_log import SystemLog
from models.alert import Alert
from app import db
from services.auth_service import token_required
from services.ml_service import analyze_network_traffic, analyze_system_logs, predict_threats

# Create blueprint
analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/network-traffic', methods=['POST'])
@token_required
def analyze_traffic(current_user):
    """Analyze network traffic data for anomalies"""
    try:
        data = request.get_json()
        
        if not data or not isinstance(data, list):
            return jsonify({'error': 'Invalid data format. Expected a list of traffic records'}), 400
        
        # Process and analyze each traffic record
        results = []
        alerts = []
        
        for record in data:
            # Save traffic data to database
            traffic_data = TrafficData(
                source_ip=record.get('source_ip'),
                destination_ip=record.get('destination_ip'),
                source_port=record.get('source_port'),
                destination_port=record.get('destination_port'),
                protocol=record.get('protocol'),
                packet_size=record.get('packet_size'),
                timestamp=datetime.fromisoformat(record.get('timestamp')) if record.get('timestamp') else datetime.utcnow(),
                raw_data=json.dumps(record)
            )
            
            # Analyze traffic data
            is_anomalous, anomaly_score, anomaly_type = analyze_network_traffic(record)
            
            # Update traffic data with analysis results
            traffic_data.is_anomalous = is_anomalous
            traffic_data.anomaly_score = anomaly_score
            traffic_data.anomaly_type = anomaly_type
            
            # Save to database
            db.session.add(traffic_data)
            
            # Create alert for anomalous traffic
            if is_anomalous and anomaly_score > 0.7:  # High confidence anomaly
                alert = Alert(
                    title=f"Network Anomaly Detected: {anomaly_type}",
                    description=f"Suspicious traffic detected from {record.get('source_ip')} to {record.get('destination_ip')}",
                    severity="high" if anomaly_score > 0.9 else "medium",
                    source="network",
                    details=json.dumps({
                        "traffic_id": traffic_data.id,
                        "anomaly_score": anomaly_score,
                        "anomaly_type": anomaly_type,
                        "source_ip": record.get('source_ip'),
                        "destination_ip": record.get('destination_ip'),
                        "protocol": record.get('protocol'),
                        "timestamp": record.get('timestamp')
                    })
                )
                db.session.add(alert)
                alerts.append({
                    "title": alert.title,
                    "severity": alert.severity,
                    "anomaly_score": anomaly_score
                })
            
            results.append({
                "id": traffic_data.id,
                "is_anomalous": is_anomalous,
                "anomaly_score": anomaly_score,
                "anomaly_type": anomaly_type if is_anomalous else None
            })
        
        # Commit all changes to database
        db.session.commit()
        
        return jsonify({
            "message": f"Analyzed {len(data)} traffic records",
            "anomalies_detected": sum(1 for r in results if r["is_anomalous"]),
            "alerts_generated": len(alerts),
            "results": results
        }), 200
    
    except KeyError as e:
        db.session.rollback()
        return jsonify({'error': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@analysis_bp.route('/system-logs', methods=['POST'])
@token_required
def analyze_logs(current_user):
    """Analyze system logs for anomalies"""
    try:
        data = request.get_json()
        
        if not data or not isinstance(data, list):
            return jsonify({'error': 'Invalid data format. Expected a list of log entries'}), 400
        
        # Process and analyze each log entry
        results = []
        alerts = []
        
        for log_entry in data:
            # Save log entry to database
            system_log = SystemLog(
                log_level=log_entry.get('log_level'),
                source=log_entry.get('source'),
                message=log_entry.get('message'),
                timestamp=datetime.fromisoformat(log_entry.get('timestamp')) if log_entry.get('timestamp') else datetime.utcnow(),
                host=log_entry.get('host'),
                raw_data=json.dumps(log_entry)
            )
            
            # Analyze log entry
            is_anomalous, anomaly_score, anomaly_type = analyze_system_logs(log_entry)
            
            # Update log entry with analysis results
            system_log.is_anomalous = is_anomalous
            system_log.anomaly_score = anomaly_score
            system_log.anomaly_type = anomaly_type
            
            # Save to database
            db.session.add(system_log)
            
            # Create alert for anomalous log
            if is_anomalous and anomaly_score > 0.7:  # High confidence anomaly
                alert = Alert(
                    title=f"System Log Anomaly: {anomaly_type}",
                    description=f"Suspicious log entry detected from {log_entry.get('source')} on {log_entry.get('host')}",
                    severity="high" if anomaly_score > 0.9 else "medium",
                    source="system",
                    details=json.dumps({
                        "log_id": system_log.id,
                        "anomaly_score": anomaly_score,
                        "anomaly_type": anomaly_type,
                        "message": log_entry.get('message'),
                        "source": log_entry.get('source'),
                        "host": log_entry.get('host'),
                        "timestamp": log_entry.get('timestamp')
                    })
                )
                db.session.add(alert)
                alerts.append({
                    "title": alert.title,
                    "severity": alert.severity,
                    "anomaly_score": anomaly_score
                })
            
            results.append({
                "id": system_log.id,
                "is_anomalous": is_anomalous,
                "anomaly_score": anomaly_score,
                "anomaly_type": anomaly_type if is_anomalous else None
            })
        
        # Commit all changes to database
        db.session.commit()
        
        return jsonify({
            "message": f"Analyzed {len(data)} log entries",
            "anomalies_detected": sum(1 for r in results if r["is_anomalous"]),
            "alerts_generated": len(alerts),
            "results": results
        }), 200
    
    except KeyError as e:
        db.session.rollback()
        return jsonify({'error': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@analysis_bp.route('/predict-threats', methods=['GET'])
@token_required
def get_threat_predictions(current_user):
    """Get threat predictions based on historical data"""
    try:
        # Get time range from query parameters (default to next 24 hours)
        hours = min(int(request.args.get('hours', 24)), 168)  # Max 7 days
        
        # Get predictions
        predictions = predict_threats(hours)
        
        return jsonify({
            "prediction_period": f"Next {hours} hours",
            "predictions": predictions
        }), 200
    
    except ValueError as e:
        return jsonify({'error': 'Invalid parameter format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
