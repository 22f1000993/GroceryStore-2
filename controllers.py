from flask_restful import Resource, marshal, fields, marshal_with, reqparse
from application.utils.validation import NotGivenError, NotFoundError
from application.data.models import *
from application.data.database import db
from datetime import datetime
import time
import matplotlib.pyplot as plt
from ..jobs.tasks import *
from ..sec import datastore
from celery.result import AsyncResult
from flask import current_app as app, jsonify, abort, request, render_template, send_file, render_template_string
from sqlalchemy import or_
from werkzeug.security import check_password_hash, generate_password_hash
from flask import  request, jsonify,send_file, current_app
import os,csv
from flask import render_template
from flask import current_app as app
from application.data.data_access import *
from flask_security import current_user, auth_required,hash_password,roles_required
import json
from application.data.database import db
from datetime import datetime
from application.jobs import tasks
from sqlalchemy.orm import aliased
from time import perf_counter_ns
from main import cache
from jinja2 import Template
from httplib2 import Http
from datetime import datetime, timedelta
from flask_caching import Cache
from weasyprint import HTML
import uuid

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
  
    if user.roles==[]:
        role="customer"
    else:
        role=user.roles[0].name
    if check_password_hash(user.password, data.get("password")):
        return jsonify({"token": user.get_auth_token(), "email": user.email, "role": role})
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

@app.route("/registeration", methods=['POST'])
def registers():
    if request.method == 'POST':
        post_data = request.get_json()
        username = post_data["username"]
        email = post_data["email"]
        password = post_data["password"]

        with app.app_context():
            user_datastore = app.security.datastore
            if not user_datastore.find_user(username=username) and not user_datastore.find_user(email=email):
                user_datastore.create_user(username=username, email=email, password=generate_password_hash(password))
                db.session.commit()
                return jsonify({"message": "successfully registered!!"})
    return jsonify({"message": "registration unsuccess!!"})

@roles_required('admin', 'user')
@app.route('/api/categories', methods=['GET'])
def api_categories():
    categories = Category.query.all()
    return jsonify([{ "id":c.category_id,"Category_name":c.category_name} for c in categories])

@roles_required('admin', 'manager')
@app.route('/api/products', methods=['GET'])
def api_products():
    products = Product.query.all()
    product_data = []
    for product in products:
        category = product.category
        product_data.append({
            "ID": product.id,
            "Product": product.product_name,
            "Quantity": product.available_quantity,
            "Categories": category.category_name, 
            "Manufacturing" : product.manufacturing_date,
            "Expiry": product.expiry_date,
            "Price": product.price,
            "Description": product.description,
            "Unit": product.unit

        })

    return jsonify(product_data)

@auth_required("token")
@roles_required('manager')
@app.route('/api/categoryrequests/<action>/<id>', methods=['PUT','DELETE'])
def api_categoryrequests(action,id):
    if request.method == 'PUT':
        category=Category.query.get(id)
        if not category:
            return jsonify({"message": "Category not found"}), 404


        data=request.get_json()
        category_name=data['category_name']
        user_id=current_user.id
        category_request = CategoryRequest(category_name=category_name, description="update the category",user_id=user_id, action_type=action)
        db.session.add(category_request)
        db.session.commit()
        return jsonify({"message": "Category request for update added successfully"}), 200
            
    elif request.method == 'DELETE':
        category=Category.query.get(id)
        if category:
            user_id=current_user.id
            category_request = CategoryRequest(category_name=category.category_name, description="delete the category",user_id=user_id, action_type=action)
            db.session.add(category_request)
            db.session.commit()
            return jsonify({"message": "Category request for delete added successfully"}), 200
        else:
            return jsonify({"message": "Category not found"}), 404

@roles_required('admin')
@app.route('/api/admin_category_requests', methods=['GET'])
def admin_category_request():
    category_requests = CategoryRequest.query.all()
    result = [{
        'id': request.id,
        'category_name': request.category_name,
        'description': request.description,
        'action_type': request.action_type,
        'status': request.status
    } for request in category_requests]
    return jsonify(result)

@auth_required("token")
@roles_required('manager')
@app.route('/api/category_requests', methods=['POST', 'GET'])
def category_requests():
    if request.method == 'POST':
        data = request.get_json()
        new_request = CategoryRequest(
            category_name=data['category_name'],
            description="create the category",
            action_type="create",
            user_id=current_user.id
        )
        db.session.add(new_request)
        db.session.commit()
        return jsonify({'message': 'Category request submitted successfully'}), 201

    elif request.method == 'GET':
        requests = CategoryRequest.query.filter_by(user_id=current_user.id).all()
        result = [{
            'id': request.id,
            'category_name': request.category_name,
            'description': request.description,
            'action_type': request.action_type,
            'status': request.status
        } for request in requests]
        return jsonify(result)

@app.route('/api/reject_category_request/<int:id>', methods=['PUT'])
def reject_category_request(id):
    try:
        category_request = CategoryRequest.query.get(id)
        if category_request:
            category_request.status = 'rejected'
            db.session.commit()
            return jsonify({"message": "Category request rejected successfully"}), 200
        else:
            return jsonify({"message": "Category request not found"}), 404
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

@app.route('/api/approve_category_request/<int:id>', methods=['PUT'])
def approve_category_request(id):
    try:
        category_request = CategoryRequest.query.get(id)
        if category_request:
            category_request.status = 'approved'
            db.session.commit()
            return jsonify({"message": "Category request approved successfully"}), 200
        else:
            return jsonify({"message": "Category request not found"}), 404
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

@roles_required('admin', 'manager')
@app.route("/api/create_category",methods=["POST"])
def api_create_category():
    post_data = request.get_json()
    category_name = post_data["category_name"]
    c1 = Category(category_name=category_name)
    db.session.add(c1)
    db.session.commit()
    return jsonify({"id":c1.category_id,"Category_name":c1.category_name})

@roles_required('admin')
@app.route('/api/create_product', methods=['POST'])
def api_create_product():
    product_name = request.json.get('name')
    available_quantity = request.json.get("quantity")
    price = request.json.get("price")
    expiry = request.json.get("exp")
    mfg=request.json.get("mfg")
    description=request.json.get("description")
    unit=request.json.get("unit")
    category_name = request.json.get('category')
    mfg = datetime.strptime(mfg, "%Y-%m-%dT%H:%M")
    exp = datetime.strptime(expiry, "%Y-%m-%dT%H:%M")

    if not product_name or not category_name or not available_quantity or not price or not mfg or not exp or not description or not unit:
        abort(400)
    c1 = Category.query.filter_by(category_name=category_name).first()
    product = Product(product_name=product_name, 
                      available_quantity=available_quantity, 
                      price=price, 
                      expiry_date=exp,
                      manufacturing_date=mfg, 
                      description=description, 
                      category_id=c1.category_id,
                      unit=unit)
   
    db.session.add(product)
    db.session.commit()
    return jsonify({"ID":product.id,"Name":product.product_name,"Price":product.price,"Quantity":product.available_quantity,"Expiry":product.expiry_date, "Manufacturing":product.manufacturing_date,"Description":product.description,"Unit":product.unit})

@roles_required('manager')
@app.route('/api/delete_category/<int:id>', methods=['DELETE'])
def api_delete_category(id):
    c1 = Category.query.filter_by(category_id=id).first()
    if not c1:
        abort(404)
    products = c1.products
    for product in products:
        db.session.delete(product)
        db.session.commit()
    db.session.delete(c1)
    db.session.commit()
    return jsonify({"message":'Category deleted successfully.'})

@roles_required('admin')
@app.route("/api/delete_product/<int:id>", methods=["DELETE"])
def api_delete_product(id):
    product = Product.query.get(id)
    if not product:
        abort(400)

    orders = Order.query.filter_by(product_id=id).all()
    for order in orders:
        db.session.delete(order)

    # Delete the product
    db.session.delete(product)
    db.session.commit()

    return jsonify({"Message": "Product and associated orders have been deleted successfully"})

@roles_required('manager')
@app.route("/api/edit_category/<int:category_id>",methods=(["PUT"]))
def api_edit_category(category_id):
    category = Category.query.filter_by(category_id=category_id).first()
    if not category:
        abort(404)
    category.category_name = request.json["category_name"]
    db.session.add(category)
    db.session.commit()
    cat = Category.query.filter_by(category_id=category_id).first()
    return jsonify({"id":cat.category_id,"category_name":cat.category_name})

@roles_required('manager')
@app.route("/api/edit_product/<int:product_id>",methods=(["PUT"]))
def api_edit_product(product_id):
    product=Product.query.filter_by(id=product_id).first()
    Category_name=request.json.get("category")
    cat=Category.query.filter_by(category_name=Category_name).first()
    if not product or not cat:
        abort(400)
    product.product_name=request.json["name"]
    product.category_id=cat.category_id
    product.price=request.json["price"]
    product.available_quantity=request.json["quantity"]
    product.description=request.json["description"]
    product.unit=request.json["unit"]
    db.session.commit()
    product = Product.query.filter_by(id=product_id).first()
    return jsonify({"ID":product.id,"Name":product.product_name,"Price":product.price,"Quantity":product.available_quantity,"Expiry":product.expiry_date, "Manufacturing":product.manufacturing_date})

@app.route("/api/search_product", methods=["GET"])
@cache.cached(timeout=60) 
def search_product():
    product_name = request.args.get("product_name")
    price = request.args.get("price")

    if product_name:
        product_by_name = Product.query.filter(Product.product_name.ilike(f"%{product_name}%")).all()
    else:
        product_by_name = []
    if price:
        product_by_price = Product.query.filter(Product.price.ilike(f"%{price}%")).all()
    else:
        product_by_price = []

    products = product_by_name + product_by_price
    product_data = []

    for product in products:
        product_data.append({
            "product_id": product.id,
            "product_name": product.product_name,
            "expiry_date": product.expiry_date,
            "manufacturing_date": product.manufacturing_date,
            "price": product.price,
            "available_quantity": product.available_quantity
        })
    print(product_data)
    return jsonify(product_data)

@app.route("/api/search_category", methods=["GET"])
@cache.cached(timeout=60) 
def search_category():
    category_name = request.args.get("category_name")
    if category_name:
        categories = Category.query.filter(Category.category_name.ilike(f"%{category_name}%")).all()
    else:
        categories = []        
    category_data=[]
    for category in categories:
        product_list = []
        for category in Product.category:
            product_list.append({
                "product_id": Product.id,
                "product_name": Product.product_name
            })
        category_data.append({
            "id": category.category_id,
            "category": category.category_name,
            "product": product_list
        })
    return jsonify(category_data)

@app.route("/api/rating/<int:product_id>", methods=["POST"])
def api_ratings_product(product_id):
    if request.method == "POST":
        ratings = request.json.get("rating")
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        user = current_user
        rate = Rate.query.filter_by(product_id=product_id, user=user.username).count()
        if rate == 0:
            r1 = Rate(product_id=product_id, Rating=ratings, user=user.username)
            db.session.add(r1)
            db.session.commit()
        else:
            r1 = Rate.query.filter_by(product_id=product_id,user=user.username).first()
            r1.Rating = ratings
            db.session.add(r1)
            db.session.commit()
        
        ratings = Rate.query.filter_by(product_id=product_id)
        Rating_sum = sum(rating.Rating for rating in ratings)
        count = ratings.count()

        rating = Rating_sum / count if count != 0 else 0
        rating = round(rating, 2)
        
        product = Product.query.filter_by(product_id=product_id).first()

        product.Rating = rating
        db.session.add(product)
        db.session.commit()

        return jsonify({"message": "Rating submitted successfully"}), 200

@auth_required("token")
@app.route('/api/order/product', methods=['POST'])
def order_product():
    # Get the current authenticated user
    user = current_user
 
    # Get the order data from the request JSON
    order_data = request.get_json()
    # Extract the necessary data from the order_data
    product_id = order_data.get('product_id')
    product_name = order_data.get('product_name')
    category = order_data.get('category_name')
    order_date = datetime.now()
    quantity=order_data.get('quantity')


    # Check if required fields are present
    if None in [product_id, product_name, category,quantity]:
        return jsonify({'message': 'Missing required fields in the order data'}), 400
    category_id = Category.query.filter_by(category_name=category).first().category_id
    product = Product.query.filter_by(product_name=product_name).first()
    try:
        # Check if total_price_str is a valid integer
        total_price = product.price * int(order_data.get('quantity'))
    except ValueError:
        return jsonify({'message': 'Invalid value for total price. Must be a valid integer'}), 400

    # Check if the product is available for order
    product = Product.query.filter_by(product_name=product_name).first()
    if not product:
        return jsonify({'message': 'Invalid Product'}), 400

    available_quantity = product.available_quantity 
    if available_quantity < int(quantity):
        return jsonify({'message': 'Product is Out Of Stock. Cannot place the order.'}), 400
    product.available_quantity -= int(quantity)
    product.units_sold += int(quantity)
    db.session.commit()

    order = Order(
        user_id=user.id,
        product_id=product_id,
        product_name=product_name,
        quantity=quantity,
        total_price=total_price,
        order_date=order_date,
        category_id=category_id
    )
    db.session.add(order)
    db.session.commit()
    return jsonify({'message': 'Order successful!', 'order_id': order.id}), 200

@auth_required("token")
@app.route('/api/order', methods=['GET'])
def get_orders():
    user = current_user.id 
    orders = Order.query.filter_by(user_id=user).all()
    order_info = []
    for order in orders:
        cat=Category.query.filter_by(category_id=order.category_id).first()
        order_details = {
            'id': order.id,
            'product': order.product_name,
            'category': cat.category_name,
            'price': order.total_price,
            'quantity': order.quantity,
            'order_date': order.order_date,
        }
        order_info.append(order_details)
    return jsonify(order_info)

@auth_required("token")
@app.route('/api/order/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'message': 'Order not found'}), 404

    db.session.delete(order)
    db.session.commit()

    return jsonify({'message': 'Order deleted successfully'}), 200

@app.route("/trigger_celery_job")
def celery_job():
    username = current_user.username
    a=generate_csv.delay(username)
    return jsonify({"Task_id": a.id})

@app.route("/trigger_product_celery_job/<int:id>")
def product_export(id):
    try:
        print(f"Received product ID: {id}")
        a = generate_product_csv.delay(id)
        return jsonify({"Task_id": a.id})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/status/<int:id>")
def check_status(id):
    res=AsyncResult(id)
    return{
        "Task_id":res.id,
        "Task_state":res.state,
        "Task_result":res.result
    }
   
@app.route("/download/csv/product")
def download_csv_product():
    time.sleep(5)
    return send_file("product.csv")