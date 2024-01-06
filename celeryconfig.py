timezone = 'Asia/Kolkata'
broker_url = 'redis://localhost:6379/1'
result_backend = 'redis://localhost:6379/2'
broker_connection_retry_on_startup = True

MAIL_SERVER = 'localhost'
MAIL_PORT = 1025
MAIL_USE_TLS = False
MAIL_USE_SSL = False
MAIL_USERNAME = None
MAIL_PASSWORD = None
MAIL_DEFAULT_SENDER = 'sender@example.com'