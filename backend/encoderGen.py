import cv2
import face_recognition
import pickle
import os
import urllib.request
import numpy as np
import io



def encode_and_store_images(account_number,db,bucket):
    try:
        # Fetch image URLs from Firestore where cardnumber == account_number
        cards_ref = db.collection('people').where('cardnumber', '==', account_number).stream()
        image_urls = []
        
        for card in cards_ref:
            card_data = card.to_dict()
            image_url = card_data.get('imageSrc')  # Ensure 'imageSrc' field exists in the Firestore document
            if image_url:
                image_urls.append(image_url)

        if not image_urls:
            print(f"No images found for account number {account_number}")
            return

        # Download images from URLs and store in a list
        img_list = []
        for url in image_urls:
            try:
                resp = urllib.request.urlopen(url)
                img_array = np.asarray(bytearray(resp.read()), dtype=np.uint8)
                img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
                if img is not None:
                    img_list.append(img)
                else:
                    print(f"Failed to download or decode image from {url}")
            except Exception as e:
                print(f"Error downloading image from {url}: {e}")

        if not img_list:
            print(f"No valid images found for account number {account_number}")
            return

        print(len(img_list))
        # Encode the images
        def find_encoding(images_list):
            encode_list = []
            for img in images_list:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                try:
                    encode = face_recognition.face_encodings(img)[0]
                    encode_list.append(encode)
                except IndexError:
                    print("No face found in one of the images, skipping that image.")
            return encode_list

        print("Encoding started...")
        encode_list_known = find_encoding(img_list)
        if not encode_list_known:
            print("No valid encodings found.")
            return

        # Prepare the encoding data
        encode_list_known_with_ids = {
            'encodings': encode_list_known,
            'cardnumber': account_number
        }

        # Define the path to save the new encoded file (to Firebase Storage)
        encoded_file_path = f'encodings/{account_number}.p'
        blob = bucket.blob(encoded_file_path)

        # Save the encoding in an in-memory buffer using BytesIO
        pickle_data = io.BytesIO()
        pickle.dump(encode_list_known_with_ids, pickle_data)
        pickle_data.seek(0)  # Reset buffer position to the beginning

        # Upload the in-memory buffer to Firebase Storage


        # Check if encoding already exists in Firestore
        encoding_ref = db.collection('encoding').document(account_number)
        encoding_data = encoding_ref.get()

        # If encoding exists, update the encoding and delete the old one
        if encoding_data.exists:
            old_encoding_url = encoding_data.get('encodingUrl')
            if old_encoding_url:
                # Delete the old encoding file from Firebase Storage
                old_blob = bucket.blob(old_encoding_url)
                old_blob.delete()

            # Update the Firestore document with the new encoding URL
            encoding_ref.update({
                'encodingUrl': encoded_file_path
            })

            print(f"Updated encoding for account number {account_number}")
        else:
            # Create a new Firestore document with the encoding URL
            encoding_ref.set({
                'cardnumber': account_number,
                'encodingUrl': encoded_file_path
            })
            print(f"Created new encoding for account number {account_number}")

        print("Encoding completed and uploaded successfully.")
        blob.upload_from_file(pickle_data, content_type='application/octet-stream')
    except Exception as e:
        print(f"An error occurred: {e}")