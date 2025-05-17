from datetime import datetime
from app import db

class TrafficData(db.Model):
    """Model for storing and analyzing network traffic data"""
    __tablename__ = 'traffic_data'
    
    id = db.Column(db.Integer, primary_key=True)
    source_ip = db.Column(db.String(45), nullable=False)  # IPv6 can be up to 45 chars
    destination_ip = db.Column(db.String(45), nullable=False)
    source_port = db.Column(db.Integer)
    destination_port = db.Column(db.Integer)
    protocol = db.Column(db.String(20))  # TCP, UDP, ICMP, etc.
    packet_size = db.Column(db.Integer)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Analysis results
    is_anomalous = db.Column(db.Boolean, default=False)
    anomaly_score = db.Column(db.Float, default=0.0)  # 0.0 to 1.0
    anomaly_type = db.Column(db.String(50))  # DDoS, port scan, data exfiltration, etc.
    
    # Raw data for further analysis
    raw_data = db.Column(db.Text)  # JSON string with full packet data
    
    def __repr__(self):
        return f'<TrafficData {self.id}: {self.source_ip} -> {self.destination_ip}>'
    
    def to_dict(self):
        """Convert traffic data object to dictionary"""
        return {
            'id': self.id,
            'source_ip': self.source_ip,
            'destination_ip': self.destination_ip,
            'source_port': self.source_port,
            'destination_port': self.destination_port,
            'protocol': self.protocol,
            'packet_size': self.packet_size,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'is_anomalous': self.is_anomalous,
            'anomaly_score': self.anomaly_score,
            'anomaly_type': self.anomaly_type
        }
