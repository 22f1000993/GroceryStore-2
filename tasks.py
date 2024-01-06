from flask import current_app, send_file,jsonify
from application.jobs.worker import celery
from .email import send_email
from datetime import datetime,timedelta
from celery.schedules import crontab
from httplib2 import Http
from jinja2 import Template
from application.jobs.email import send_email
from application.data.models import User, Order, Rate, Product
from application.data.database import db
from sqlalchemy.orm import aliased
from celeryconfig import timezone
import os,csv,zipfile

@celery.on_after_finalize.connect
def set_up_daily_task(sender, **kwargs):
   sender.add_periodic_task(crontab(hour=17, minute=54), send_daily_email.s(), name="send_daily_email")

@celery.on_after_finalize.connect
def set_up_monthly_task(sender, **kwargs):
   sender.add_periodic_task(crontab(day_of_month='10', hour=17, minute=54),send_monthly_email.s(),name="send_monthly_email")

@celery.task
def send_daily_email():
    all_users = User.query.all()
    for user in all_users:
        latest_order = Order.query.filter_by(user_id=user.id).first()
        
        if latest_order and latest_order.order_date < (datetime.utcnow() - timedelta(days=1)):
            with open('templates/dailyalert.html') as file_:
                template = Template(file_.read())
                message = template.render(name=user.username)

            try:
                send_email(
                    to="sender@example.com",
                    sub="Visit Alert",
                    message=message
                )
                current_app.logger.info(f"Email sent to {user.username} for last visit alert.")
            except Exception as e:
                current_app.logger.error(f"Error sending daily alert email to {user.username}: {str(e)}")

    return "Emails have been sent to users who haven't visited in 24 hours!"

@celery.task
def send_monthly_email():
    with current_app.app_context():
        users = User.query.all()
        order_alias = aliased(Order)
        query = db.session.query(order_alias)
        details = query.all()
        if not details:
            return "No details available for the monthly report."
        for user in users:
            latest_order = Order.query.filter_by(user_id=user.id).first()
            if latest_order:
                l = []
                for i in details:
                    s = {"product_name": i.product_name, "quantity": i.quantity}
                    l.append(s)
                with open('templates/monthlyreport.html') as file_:
                    template = Template(file_.read())
                    message = template.render(user_name=user.username, details=l)
                try:
                    send_email(
                        to=user.email,
                        sub="Monthly Report",
                        message=message
                    )
                except Exception as e:
                    current_app.logger.error(f"Error sending monthly report to {user.username}: {str(e)}")

        return "Monthly emails have been sent to all users!"
        
@celery.task()
def generate_csv(username):
    import csv
    order = Order.query.filter_by(user_name=username).all()
    fields = ["Product Name", "Category", "Quantity"]
    rows = []
    for i in order:
        rows.append([order.product_name, order.category, order.quantity])
    with open("product.csv", "w") as csvfile:
        csvwriter = csv.writer(csvfile)
        csvwriter.writerow(fields)
        csvwriter.writerows(rows)
    return f"CSV file generated!"

@celery.task()
def generate_product_csv(id):
    import csv
    print("Product ID:", id)
    product = Product.query.filter_by(id=id).first()
    print("Retrieved Product:", product)
    if product is None:
        return f"No product found with ID {id}"

    fields = ["product id", "product name", "price", "manufacturing date", "expiry"]
    rows = [[product.id, product.product_name, product.price, product.manufacturing_date, product.expiry_date,]]

    with open("product.csv", "w") as csvfile:
        csvwriter = csv.writer(csvfile)
        csvwriter.writerow(fields)
        csvwriter.writerows(rows)

    # Notify manager about CSV export
    manager_email = "sender@example.com"  
    subject = "CSV Export Alert"
    message = f"CSV export for product ID {id} has been triggered."

    try:
        send_email(manager_email, subject, message)
    except Exception as e:
        current_app.logger.error(f"Error sending email: {str(e)}")

    return f"csv file generated for the selected product"