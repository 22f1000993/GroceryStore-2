from flask_restful import Resource
from flask_restful import fields, marshal_with
from flask_restful import reqparse
from application.utils.validation import NotGivenError, NotFoundError
from application.data.models import *
from application.data.database import db
from datetime import datetime
import matplotlib.pyplot as plt
import matplotlib
from flask import current_app as app, jsonify, abort, request
from flask_security import current_user,login_required, roles_required,auth_required,roles_accepted
from flask_restful import Resource, Api, reqparse, fields, marshal
from sqlalchemy import or_
from time import perf_counter_ns
from main import cache

api = Api(prefix='/api')

user_fields = {
    "id": fields.Integer,
    "user_name": fields.String,
    "email": fields.String,
    "password": fields.String,
}

def user_to_json(user):
    return {
        "user_name": user.username,
        "email": user.email,
    }

user_parse = reqparse.RequestParser()
user_parse.add_argument("user_name")
user_parse.add_argument("email")
user_parse.add_argument("password")

class UserAPI(Resource):
    def get(self):
        users=User.query.all()
        us=[user_to_json(i) for i in users]
        return jsonify(us)

    @marshal_with(user_fields)
    @auth_required('token')
    def put(self, user_id):
        args = user_parse.parse_args()
        user_name = args.get("user_name")
        email = args.get("email")
        pswd = args.get("password")

        users = User.query.filter(
            User.user_name == user_name, User.email == email
        ).first()

        if user_name is None:
            raise NotGivenError(
                status_code=400,
                error_code="USER001",
                error_message="User name is required",
            )

        if email is None:
            raise NotGivenError(
                status_code=400,
                error_code="USER002",
                error_message="email is required",
            )

        if pswd is None:
            raise NotGivenError(
                status_code=400,
                error_code="USER003",
                error_message="Password is required",
            )

        if users:
            raise NotGivenError(
                status_code=400,
                error_code="USER004",
                error_message="User name or email already exist",
            )

        us = User.query.filter_by(id=user_id).first()
        if us:
            us.user_name = user_name
            us.email = email
            us.password = pswd
            db.session.commit()
            return us, 200

        else:
            raise NotFoundError(status_code=404)

    @marshal_with(user_fields)
    def post(self):
        args = user_parse.parse_args()
        user_name = args.get("user_name")
        email = args.get("email")
        pswd = args.get("password")

        if user_name is None:
            raise NotGivenError(
                status_code=400,
                error_code="USER001",
                error_message="User name is required",
            )

        if email is None:
            raise NotGivenError(
                status_code=400,
                error_code="USER002",
                error_message="email is required",
            )

        if pswd is None:
            raise NotGivenError(
                status_code=400,
                error_code="USER003",
                error_message="Password is required",
            )

        us = User.query.filter(
            or_(User.user_name == user_name, User.email == email)
        ).first()
        if us:
            raise NotFoundError(status_code=409)

        else:
            us = User(user_name=user_name,mobile=email, password=pswd)
            db.session.add(us)
            db.session.commit()
            return us, 201


api.add_resource(User, '/user')