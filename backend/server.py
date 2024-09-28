from flask import Flask, request, jsonify
from pymongo import MongoClient
from openai import OpenAI
# from PIL import Image
from dotenv import load_dotenv
from flask_cors import CORS
import base64
import os
from bson.objectid import ObjectId
from datetime import datetime, date
load_dotenv()

app = Flask(__name__)
client = MongoClient("mongodb+srv://imanullah1112:ImanUllah@uottahack.oi3vja4.mongodb.net/?retryWrites=true&w=majority&appName=UOttaHack")
db = client['momento']
image_collection = db['images']
text_collection = db['momento']
openAIClient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# CORS(app)

MAX_IMAGE_SIZE = 16 * 1024 * 1024

def store_image(image):
    image_doc = {
        'filename': image.filename,
        'image_data': image.read(),
        'content_type': image.content_type
    }
    return image_collection.insert_one(image_doc)

@app.route('/upload', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    

    image = request.files['image']  
    if image.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    image_data = image.read()
    encoded_image = base64.b64encode(image_data).decode('utf-8')


    try:
        result = store_image(image)
        text = gpt_request(encoded_image)
        save_text(text)

        return jsonify({'message': 'Image uploaded successfully!', 'image_id': str(result.inserted_id)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

   
@app.route('/image/<image_id>', methods=['GET'])
def get_image(image_id):
    try:
        # Fetch the image document from MongoDB
        image_doc = image_collection.find_one({'_id': ObjectId(image_id)})

        if not image_doc:
            return jsonify({'error': 'Image not found'}), 404
        
        # Convert binary data back to bytes
        image_data = image_doc['image_data']
        filename = image_doc['filename']
        

        image_path = f"./uploads/{filename}"

        with open(image_path, 'wb') as f:
            f.write(image_data)



        return jsonify({'message': f'Image saved to {image_path} successfully!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Send request to gpt
def gpt_request(image):

    prompt = "Describe this image in detail: "

    response =  openAIClient.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
        "role": "user",
        "content": [
            {"type": "text", "text": prompt},
            {
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpg;base64,{image}"
            },
            },
        ],
        }
    ],
    max_tokens=300,
    )
    current_date = datetime.now().strftime('%Y-%m-%d')
    print(current_date)
    date_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    text = f"At {date_time} you were doing: {response.choices[0].message.content}"

    return text

def save_text(response_text):
    # Get the current date
    current_date = datetime.now().strftime('%Y-%m-%d')
    date_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    text = f"At {date_time} you were doing: {response_text}"

    text_doc = {
        'date': current_date,
        'text': text
    }

    try:
        result = text_collection.insert_one(text_doc)
        return result
    except Exception as e:
        return str(e)

@app.route('/day', methods=['GET'])
def get_texts_by_date(): 
    try:
        # Extract the date from the POST request body
        date_input = request.json.get('date')

        if not date_input:
            return jsonify({'error': 'No date provided'}), 400
        
        
        # Query the database for documents with the provided date
        result = text_collection.find({'date': date_input})

        # Prepare the list of results
        texts = []
        for doc in result:
            texts.append({
                'id': str(doc['_id']),
                'date': doc['date'],
                'text': doc['text']
            })

        if len(texts) == 0:
            return jsonify({'message': 'No documents found for the provided date.'}), 200
        
        # Return the documents as a response
        return jsonify({'documents': texts}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
