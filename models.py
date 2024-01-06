from flask_security import UserMixin, RoleMixin
from datetime import datetime
from .database import db

class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=False)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role', secondary='roles_users',
                         backref=db.backref('users', lazy='dynamic'))
    logs = db.relationship("Userlog", backref="logg")

class Userlog(db.Model):
    log_id=db.Column(db.Integer, autoincrement=True, primary_key=True)
    lastvisited=db.Column(
        db.DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    luser_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    
class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class Category(db.Model):
    __tablename__ = 'category'
    category_id = db.Column(db.Integer, primary_key=True)
    category_name = db.Column(db.String, nullable=False)
    products = db.relationship('Product', back_populates='category')
    orders = db.relationship('Order', back_populates='category')

class Product(db.Model):
    __tablename__ = 'product'
    id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String, nullable=False)
    manufacturing_date = db.Column(db.String)
    expiry_date = db.Column(db.String)
    price = db.Column(db.Integer)
    unit = db.Column(db.String)
    available_quantity = db.Column(db.Integer)
    category_id = db.Column(db.Integer, db.ForeignKey('category.category_id'))
    category = db.relationship('Category', back_populates='products')
    description = db.Column(db.String)
    units_sold = db.Column(db.Integer, default=0)
    orders = db.relationship('Order', back_populates='product')
   

class Order(db.Model):
    __tablename__ = 'order'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    product_id = db.Column(db.String, db.ForeignKey('product.id'))
    product_name = db.Column(db.String, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.category_id'))
    quantity = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    order_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow())
    user = db.relationship('User', backref='orders')
    product = db.relationship('Product', back_populates='orders')
    category = db.relationship('Category', back_populates='orders')

class Rate(db.Model):
    __tablename__ = 'rate'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    user = db.relationship('User', backref='ratings')
    product = db.relationship('Product', backref='ratings')

class CategoryRequest(db.Model):
    __tablename__ = 'request'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    category_name = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    action_type = db.Column(db.String)  # 'add' or 'edit'
    status = db.Column(db.String, default='pending')