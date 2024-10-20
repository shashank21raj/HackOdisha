import cv2
import os
import pickle
import face_recognition
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import urllib.request
import urllib.parse

def recognize_face_base64(image_base64, account_number, db, bucket):
    # Search for the encoding document in Firestore
    encoding_ref = db.collection('encoding').document(account_number)
    encoding_data = encoding_ref.get()

    # Check if the encoding document exists
    if not encoding_data.exists:
        print(f"No encoding document found for account number {account_number}")
        return False

    # Get the encoding URL from the document
    encoding_url = encoding_data.get('encodingUrl')
    if not encoding_url:
        print(f"No encoding URL found in the document for account number {account_number}")
        return False

    # Correctly format the encoding URL for Firebase Storage (URL encode the path)
    try:
        # Construct the full download URL
        encoded_url = urllib.parse.quote(encoding_url, safe='')
        full_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/{encoded_url}?alt=media"

        # Download the encoding file from Firebase Storage
        response = urllib.request.urlopen(full_url)
        encoding_data_bytes = response.read()

        # Load the encoding data from the downloaded file
        encode_ListKnown_With_Ids = pickle.loads(encoding_data_bytes)
    except Exception as e:
        print(f"Error downloading or loading encoding data: {e}")
        return False

    # Unpack the known encodings (only extract the 'encodings' field from the dictionary)
    encodeListKnown = encode_ListKnown_With_Ids['encodings']
    print('Encodings Loaded')
    print(account_number)

    # Decode the base64 image
    try:
        img_data = base64.b64decode(image_base64.split(',')[1])  # Remove 'data:image/jpeg;base64,' part
        img = Image.open(BytesIO(img_data))
        img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)  # Convert PIL image to OpenCV BGR format
    except Exception as e:
        print(f"Error decoding base64 image: {e}")
        return False

    # Resize and convert the image for processing
    imgS = cv2.resize(img, (0, 0), None, 0.25, 0.25)
    imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)

    # Locate the face and find its encodings
    faceCurFrame = face_recognition.face_locations(imgS)
    if len(faceCurFrame) == 0:
        print("Face not visible")
        return False

    encodeCurFrame = face_recognition.face_encodings(imgS, faceCurFrame)

    for encodeFace, faceLoc in zip(encodeCurFrame, faceCurFrame):
        matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
        faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)
        matchIndex = np.argmin(faceDis)

        # Check if the closest match is within an acceptable range
        if matches[matchIndex]:
            print("Face recognized as known")
            return True

    print("Face not recognized")
    return False
