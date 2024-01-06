from celery import Celery
from flask import current_app as app

celery = Celery("Application Jobs")

class FlaskTask(celery.Task):
    def __call__(self, *args, **kwargs):
        with app.app_context():
            return self.run(*args, **kwargs)

# celery -A main.celery worker -l info
# celery -A main.celery beat --max-interval 2 -l info

# wget https://github.com/mailhog/MailHog/releases/download/v1.0.1/MailHog_linux_amd64
# chmod +x MailHog_linux_amd64
# sudo mv MailHog_linux_amd64 /usr/local/bin/mailhog
# http://localhost:8025/

# pip install -r requirements.txt

# sudo apt update
# sudo apt install redis-server


# redis-cli ping (check if redis is already running)
# redis-cli shutdown (shutdown redis)
