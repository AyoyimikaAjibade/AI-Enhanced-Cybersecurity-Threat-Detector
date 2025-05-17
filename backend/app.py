import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@db:5432/cybersecurity')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Import and register blueprints after db initialization to avoid circular imports
from api.routes.auth import auth_bp
from api.routes.dashboard import dashboard_bp
from api.routes.alerts import alerts_bp
from api.routes.analysis import analysis_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
app.register_blueprint(analysis_bp, url_prefix='/api/analysis')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'AI-Enhanced Cybersecurity Threat Detector API is running'
    })

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Not Found',
        'message': 'The requested resource was not found'
    }), 404

@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'An unexpected error occurred'
    }), 500

if __name__ == '__main__':
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()
    
    # Run the Flask application
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=os.getenv('FLASK_DEBUG', 'False') == 'True')
