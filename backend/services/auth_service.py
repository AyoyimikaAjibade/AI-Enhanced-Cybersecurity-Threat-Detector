import jwt
import os
from functools import wraps
from flask import request, jsonify
from models.user import User

def token_required(f):
    """Decorator for routes that require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid token'}), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            # Decode token
            payload = jwt.decode(token, os.getenv('SECRET_KEY', 'dev_key'), algorithms=['HS256'])
            current_user = User.query.get(payload['user_id'])
            
            if not current_user:
                return jsonify({'error': 'User not found'}), 404
            
            if not current_user.is_active:
                return jsonify({'error': 'User account is inactive'}), 403
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Pass user to the route
        return f(current_user, *args, **kwargs)
    
    return decorated

def admin_required(f):
    """Decorator for routes that require admin privileges"""
    @wraps(f)
    def decorated(*args, **kwargs):
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid token'}), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            # Decode token
            payload = jwt.decode(token, os.getenv('SECRET_KEY', 'dev_key'), algorithms=['HS256'])
            current_user = User.query.get(payload['user_id'])
            
            if not current_user:
                return jsonify({'error': 'User not found'}), 404
            
            if not current_user.is_active:
                return jsonify({'error': 'User account is inactive'}), 403
            
            if current_user.role != 'admin':
                return jsonify({'error': 'Admin privileges required'}), 403
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Pass user to the route
        return f(current_user, *args, **kwargs)
    
    return decorated
