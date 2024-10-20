import os
from flask import Flask, jsonify,request,redirect, send_file, url_for,render_template
import numpy as np
from flask_cors import CORS
from main_1 import recognize_face_base64
from encoderGen import encode_and_store_images
import firebase_admin
from firebase_admin import credentials, firestore, storage
from firebase import firebase_config
from dotenv import load_dotenv
load_dotenv()
app = Flask(__name__)
CORS(app)

# Initialize Firebase
cred = credentials.Certificate(firebase_config)  # Update with your Firebase credentials path
firebase_admin.initialize_app(cred, {
    'storageBucket': os.getenv("STORAGE_BUCKET")  # Update with your Firebase project details
})
db = firestore.client()
bucket = storage.bucket()


@app.route("/")
def hello_world():
    return jsonify("Hello world")

@app.route('/test',methods=['POST','GET'])
def test():
    image=request.form.get('image')
    account_number=request.form.get('account_number')
    result=recognize_face_base64(image,account_number,db,bucket)
    if result:
        return jsonify({"status": "success", "message": "Face recognized as known"})
    else:
        return jsonify({"status": "failure", "message": "Face not recognized"})

@app.route('/encode',methods=['POST'])
def encode():
    account_number=request.form.get('account_number')
    res=encode_and_store_images(account_number,db,bucket)
    return jsonify({"status": "failure", "message": "not encoded"})



if __name__ == '__main__':
    app.run(port=5001, debug=True)