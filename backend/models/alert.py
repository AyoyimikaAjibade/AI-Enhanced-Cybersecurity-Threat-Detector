from datetime import datetime
from app import db

class Alert(db.Model):
    """Alert model for security alerts and notifications"""
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), nullable=False)  # Options: high, medium, low
    source = db.Column(db.String(50), nullable=False)  # Options: network, system, application
    is_resolved = db.Column(db.Boolean, default=False)
    resolved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    details = db.Column(db.Text)  # JSON string with additional details
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime)
    
    # Relationships
    resolver = db.relationship('User', backref='resolved_alerts', lazy=True)
    
    def __repr__(self):
        return f'<Alert {self.id}: {self.title}>'
    
    def to_dict(self):
        """Convert alert object to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'severity': self.severity,
            'source': self.source,
            'is_resolved': self.is_resolved,
            'resolved_by': self.resolved_by,
            'details': self.details,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
