from flask_restful import Api , Resource , abort ,fields , marshal
from .data.models import *
from flask_security import auth_required
api=Api(prefix="/api")

user_resourse_fields={
    "username":fields.String,
    "email":fields.String,
}

class User(Resource):   
    @auth_required("token")
    def get(self,id=None):
        if id== 5:
            abort(400,message="This user is restricted")
        else:
            user=User.query.filter_by(id=id).first()
            if user:
                return marshal(user,user_resourse_fields)
            else:
                abort(400,message="User not found")

api.add_resource(User,"/users/<int:id>")