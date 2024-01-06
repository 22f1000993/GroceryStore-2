import os
from flask import Flask
from application.resources import api
from flask_security import Security, SQLAlchemySessionUserDatastore
from application.data.models import *
from config import DevelopmentConfig
from application.jobs import worker
from flask_restful import Api
from flask_caching import Cache
from celeryconfig import *

app = Flask(__name__)
cache = None

def create_app():
    app = Flask(__name__, template_folder="templates")
    if os.getenv("ENV", "development") == "production":
        raise Exception("Currently no production config is setup.")
    else:
        print("Staring Local Development")
        app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    app.app_context().push()
    api = Api(app)
    app.app_context().push()
    user_datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
    app.security = Security(app, user_datastore)
    celery=worker.celery
    celery.conf.update(
        broker_url = app.config["CELERY_BROKER_URL"],
        result_backend = app.config["CELERY_RESULT_BACKEND"],
        broker_connection_retry_on_startup=True,
        timezone='Asia/Kolkata'
    )

    celery.Task=worker.FlaskTask
    app.app_context().push()
    cache=Cache(app)
    app.app_context().push()
    return app, api, celery, cache


app, api, celery, cache = create_app()

from application.controller.controllers import *
from application.controller.api import UserAPI
api.add_resource(UserAPI, "/api/user/<int:user_id>", "/api/user")

if __name__ == '__main__':
    app.run(debug=True)