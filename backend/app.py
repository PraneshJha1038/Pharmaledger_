from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from models import db, MedicineBatch
import os
from sqlalchemy import text
from datetime import datetime

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    register_routes(app)
    return app


def register_routes(app):
    @app.route('/')
    def home():
        return jsonify({
            'message': 'PharmaLedger Backend is running successfully!',
            'status': 'active',
            'version': '1.0.0'
        })
    
    @app.route('/api/health')
    def health_check():
        try:
            db.session.execute(text('SELECT 1'))
            return jsonify({
                'status': 'healthy',
                'database': 'connected',
                'timestamp': datetime.utcnow().isoformat()
            })
        except Exception as e:
            return jsonify({
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }), 500
    
    @app.route('/api/verify-batch', methods=['GET'])
    def verify_batch():
        """
        Verify medicine batch by batch number
        Query param: batch_number
        """
        try:
            batch_number = request.args.get('batch_number', '').strip()
            
            if not batch_number:
                return jsonify({
                    'success': False,
                    'message': 'Batch number is required'
                }), 400
            
            # Query database for batch
            batch = MedicineBatch.query.filter_by(batch_number=batch_number.upper()).first()
            
            if not batch:
                return jsonify({
                    'success': False,
                    'isAuthentic': False,
                    'message': 'Batch number not found in database',
                    'batchNumber': batch_number
                }), 404
            
            # Check if expired
            is_expired = batch.expiry_date < datetime.utcnow().date()
            
            return jsonify({
                'success': True,
                'isAuthentic': not is_expired,
                'batchNumber': batch.batch_number,
                'productName': batch.medicine_name,
                'manufacturer': 'Verified Manufacturer',  # Can be enhanced with manufacturer lookup
                'manufactureDate': batch.manufacture_date.strftime('%Y-%m-%d'),
                'expiryDate': batch.expiry_date.strftime('%Y-%m-%d'),
                'status': 'Expired' if is_expired else 'Authentic',
                'pharmacyName': batch.pharmacy_name,
                'dateUploaded': batch.date_uploaded.strftime('%Y-%m-%d %H:%M:%S') if batch.date_uploaded else None
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Internal server error',
                'error': str(e)
            }), 500
    
    @app.route('/api/batches', methods=['GET'])
    def get_all_batches():
        """Get all medicine batches (for admin/testing)"""
        try:
            batches = MedicineBatch.query.all()
            return jsonify({
                'success': True,
                'count': len(batches),
                'batches': [batch.to_dict() for batch in batches]
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Error fetching batches',
                'error': str(e)
            }), 500


# Create app instance
app = create_app()

if __name__ == '__main__':
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()
        print("✓ Database tables created successfully!")
        print("✓ Flask app is ready to run")
    
    # Run the app
    app.run(debug=True, host='127.0.0.1', port=5000)