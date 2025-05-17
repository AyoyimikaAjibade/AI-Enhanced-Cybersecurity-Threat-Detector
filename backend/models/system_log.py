from datetime import datetime
from app import db

class SystemLog(db.Model):
    """Model for storing and analyzing system log entries"""
    __tablename__ = 'system_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    log_level = db.Column(db.String(20))  # INFO, WARNING, ERROR, CRITICAL, etc.
    source = db.Column(db.String(50))  # Application or service that generated the log
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    host = db.Column(db.String(100))  # Hostname or IP of the system
    
    # Analysis results
    is_anomalous = db.Column(db.Boolean, default=False)
    anomaly_score = db.Column(db.Float, default=0.0)  # 0.0 to 1.0
    anomaly_type = db.Column(db.String(50))  # Authentication failure, privilege escalation, etc.
    
    # Raw data for further analysis
    raw_data = db.Column(db.Text)  # JSON string with full log data
    
    def __repr__(self):
        return f'<SystemLog {self.id}: {self.source} - {self.log_level}>'
    
    def to_dict(self):
        """Convert system log object to dictionary"""
        return {
            'id': self.id,
            'log_level': self.log_level,
            'source': self.source,
            'message': self.message,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'host': self.host,
            'is_anomalous': self.is_anomalous,
            'anomaly_score': self.anomaly_score,
            'anomaly_type': self.anomaly_type
        }
