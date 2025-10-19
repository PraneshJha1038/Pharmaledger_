import os

class Config:
    """Configuration class for Flask application"""
    SECRET_KEY = '46d77a9ec3a06af27bcdd45169cc203c'
    
    # Database connection URI
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://root:Shine2107@127.0.0.1:3306/pharmaledger'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False  # Set to True for SQL query debugging
    
    # Upload folder for files
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
