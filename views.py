from flask import current_app as app, jsonify, request, render_template, send_file
from flask_security import auth_required, roles_required
from werkzeug.security import check_password_hash
from flask_restful import marshal, fields
import flask_excel as excel
from celery.result import AsyncResult
from .jobs.tasks import create_product_csv
from .data.models import User, db, Product
from .sec import datastore


@app.route('/')
def home():
    return render_template("index.html")

@app.get('/admin')
@auth_required("token")
@roles_required("admin")
def admin():
    return "Hello Admin"


@app.get('/activate/manager/<int:manager_id>')
@auth_required("token")
@roles_required("admin")
def activate_manager(manager_id):
    manager = User.query.get(manager_id)
    if not manager or "manager" not in manager.roles:
        return jsonify({"message": "manager not found"}), 404

    manager.active = True
    db.session.commit()
    return jsonify({"message": "User Activated"})


@app.post('/user-login')
def user_login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message": "email not provided"}), 400

    user = datastore.find_user(email=email)

    if not user:
        return jsonify({"message": "User Not Found"}), 404

    if check_password_hash(user.password, data.get("password")):
        return jsonify({"token": user.get_auth_token(), "email": user.email, "role": user.roles[0].name})
    else:
        return jsonify({"message": "Wrong Password"}), 400


user_fields = {
    "id": fields.Integer,
    "email": fields.String,
    "active": fields.Boolean
}


@app.get('/users')
@auth_required("token")
@roles_required("admin")
def all_users():
    users = User.query.all()
    if len(users) == 0:
        return jsonify({"message": "No User Found"}), 404
    return marshal(users, user_fields)


@app.get('/product/<int:id>/approve')
@auth_required("token")
@roles_required("manager")
def resource(id):
    all_products = Product.query.get(id)
    if not all_products:
        return jsonify({"message": "Product Not found"}), 404
    all_products.is_approved = True
    db.session.commit()
    return jsonify({"message": "Aproved"})


@app.get('/download-csv')
def download_csv():
    task = create_product_csv.delay()
    return jsonify({"task-id": task.id})


@app.get('/get-csv/<task_id>')
def get_csv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        filename = res.result
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"message": "Task Pending"}), 404


