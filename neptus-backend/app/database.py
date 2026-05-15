from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config.app_config import APP_CONFIG

# Database setup
SQLALCHEMY_DATABASE_URL = APP_CONFIG.SQLALCHEMY_DATABASE_URI

# Create the engine
# Note: For SQLite, we would need connect_args={"check_same_thread": False}
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()
metadata = Base.metadata

# Compatibility object to mimic Flask-SQLAlchemy 'db'
class DBCompatibility:
    Model = Base
    Column = staticmethod(lambda *args, **kwargs: __import__('sqlalchemy').Column(*args, **kwargs))
    Integer = __import__('sqlalchemy').Integer
    String = __import__('sqlalchemy').String
    Text = __import__('sqlalchemy').Text
    DateTime = __import__('sqlalchemy').DateTime
    Numeric = __import__('sqlalchemy').Numeric
    Boolean = __import__('sqlalchemy').Boolean
    Uuid = __import__('sqlalchemy').Uuid
    JSON = __import__('sqlalchemy').JSON
    ForeignKey = staticmethod(lambda *args, **kwargs: __import__('sqlalchemy').ForeignKey(*args, **kwargs))
    Table = staticmethod(lambda *args, **kwargs: __import__('sqlalchemy').Table(*args, **kwargs))
    relationship = staticmethod(lambda *args, **kwargs: __import__('sqlalchemy').orm.relationship(*args, **kwargs))
    backref = staticmethod(lambda *args, **kwargs: __import__('sqlalchemy').orm.backref(*args, **kwargs))

db = DBCompatibility()

# Dependency to get the database session
def get_db():
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()
