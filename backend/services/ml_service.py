import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers import pipeline
from app import db
from models.traffic_data import TrafficData
from models.system_log import SystemLog
from models.alert import Alert

# Initialize tokenizer and model (lazy loading)
tokenizer = None
model = None

def load_model():
    """Load the transformer model and tokenizer"""
    global tokenizer, model
    
    # Check if model is already loaded
    if tokenizer is not None and model is not None:
        return
    
    # Get model path from environment or use default
    model_path = os.getenv('MODEL_PATH', 'distilbert-base-uncased')
    
    try:
        # Load tokenizer and model
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        model = AutoModelForSequenceClassification.from_pretrained(model_path)
        
        print(f"Model loaded successfully from {model_path}")
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        # Fallback to a simpler model if custom model fails
        tokenizer = AutoTokenizer.from_pretrained('distilbert-base-uncased')
        model = AutoModelForSequenceClassification.from_pretrained('distilbert-base-uncased')

def analyze_network_traffic(traffic_data):
    """
    Analyze network traffic data for anomalies
    
    Args:
        traffic_data (dict): Dictionary containing traffic data
        
    Returns:
        tuple: (is_anomalous, anomaly_score, anomaly_type)
    """
    # Simple rule-based detection for now
    # In a real implementation, this would use the transformer model
    
    # Convert traffic data to string for analysis
    traffic_str = json.dumps(traffic_data)
    
    # Example rules (in a real system, these would be more sophisticated)
    is_anomalous = False
    anomaly_score = 0.0
    anomaly_type = None
    
    # Check for common suspicious ports
    suspicious_ports = [22, 23, 25, 445, 3389, 4444, 5900]
    
    if traffic_data.get('destination_port') in suspicious_ports:
        is_anomalous = True
        anomaly_score = 0.7
        anomaly_type = "Suspicious Port Access"
    
    # Check for unusual packet size
    if traffic_data.get('packet_size', 0) > 10000:
        is_anomalous = True
        anomaly_score = 0.8
        anomaly_type = "Large Packet Size"
    
    # In a real implementation, we would use the transformer model:
    # load_model()
    # classifier = pipeline('text-classification', model=model, tokenizer=tokenizer)
    # result = classifier(traffic_str)
    # is_anomalous = result[0]['label'] == 'ANOMALOUS'
    # anomaly_score = result[0]['score']
    
    return is_anomalous, anomaly_score, anomaly_type

def analyze_system_logs(log_data):
    """
    Analyze system logs for anomalies
    
    Args:
        log_data (dict): Dictionary containing log data
        
    Returns:
        tuple: (is_anomalous, anomaly_score, anomaly_type)
    """
    # Simple rule-based detection for now
    # In a real implementation, this would use the transformer model
    
    # Convert log data to string for analysis
    log_message = log_data.get('message', '')
    
    # Example rules (in a real system, these would be more sophisticated)
    is_anomalous = False
    anomaly_score = 0.0
    anomaly_type = None
    
    # Check for common security-related keywords
    security_keywords = [
        'failed login', 'authentication failure', 'permission denied',
        'unauthorized', 'exploit', 'injection', 'overflow', 'attack',
        'malware', 'virus', 'trojan', 'ransomware', 'breach'
    ]
    
    for keyword in security_keywords:
        if keyword.lower() in log_message.lower():
            is_anomalous = True
            anomaly_score = 0.8
            anomaly_type = "Security Keyword Detected"
            break
    
    # Check for error patterns
    error_keywords = ['error', 'exception', 'fail', 'critical', 'fatal']
    
    if not is_anomalous:
        for keyword in error_keywords:
            if keyword.lower() in log_message.lower():
                is_anomalous = True
                anomaly_score = 0.6
                anomaly_type = "Error Pattern Detected"
                break
    
    # In a real implementation, we would use the transformer model:
    # load_model()
    # classifier = pipeline('text-classification', model=model, tokenizer=tokenizer)
    # result = classifier(log_message)
    # is_anomalous = result[0]['label'] == 'ANOMALOUS'
    # anomaly_score = result[0]['score']
    
    return is_anomalous, anomaly_score, anomaly_type

def predict_threats(hours=24):
    """
    Predict potential threats based on historical data
    
    Args:
        hours (int): Number of hours to predict ahead
        
    Returns:
        list: List of predicted threats
    """
    # Get historical data
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=7)  # Use last 7 days of data
    
    # Get traffic data
    traffic_data = TrafficData.query.filter(
        TrafficData.timestamp >= start_time,
        TrafficData.timestamp <= end_time
    ).all()
    
    # Get system logs
    system_logs = SystemLog.query.filter(
        SystemLog.timestamp >= start_time,
        SystemLog.timestamp <= end_time
    ).all()
    
    # Get alerts
    alerts = Alert.query.filter(
        Alert.created_at >= start_time,
        Alert.created_at <= end_time
    ).all()
    
    # In a real implementation, this would use more sophisticated ML techniques
    # For now, we'll use a simple heuristic approach
    
    # Count anomalies by source IP
    ip_anomaly_count = {}
    for td in traffic_data:
        if td.is_anomalous:
            if td.source_ip not in ip_anomaly_count:
                ip_anomaly_count[td.source_ip] = 0
            ip_anomaly_count[td.source_ip] += 1
    
    # Identify potential threats
    potential_threats = []
    
    # IPs with multiple anomalies
    for ip, count in ip_anomaly_count.items():
        if count >= 3:  # Threshold for suspicious activity
            threat_level = "medium"
            if count >= 10:
                threat_level = "high"
            
            potential_threats.append({
                "source": "network",
                "target": ip,
                "threat_type": "Suspicious Activity",
                "confidence": min(count / 20, 0.95),  # Cap at 95%
                "threat_level": threat_level,
                "details": f"IP {ip} has shown {count} anomalous activities in the past 7 days"
            })
    
    # Look for patterns in system logs
    host_error_count = {}
    for log in system_logs:
        if log.is_anomalous:
            if log.host not in host_error_count:
                host_error_count[log.host] = 0
            host_error_count[log.host] += 1
    
    # Hosts with multiple anomalies
    for host, count in host_error_count.items():
        if count >= 5:  # Threshold for suspicious activity
            threat_level = "medium"
            if count >= 15:
                threat_level = "high"
            
            potential_threats.append({
                "source": "system",
                "target": host,
                "threat_type": "System Anomalies",
                "confidence": min(count / 30, 0.9),  # Cap at 90%
                "threat_level": threat_level,
                "details": f"Host {host} has shown {count} anomalous log entries in the past 7 days"
            })
    
    return potential_threats
