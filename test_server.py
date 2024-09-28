import requests
from datetime import datetime
import json

def test_save_text():
    upload_url = 'http://127.0.0.1:5000/upload'
    get_image_url = 'http://127.0.0.1:5000/image/'

    # Path to the image you want to upload
    image_path = './images/test.jpg'

    # Step 1: Send the POST request to upload the image
    with open(image_path, 'rb') as image_file:
        files = {'image': image_file}
        
        # Send the POST request with the image file
        upload_response = requests.post(upload_url, files=files)

    # Print the server's response to the POST request
    upload_response_json = upload_response.json()
    print("POST Response:", upload_response_json)

    # Check if the upload was successful and contains an image_id
    if upload_response.status_code == 200 and 'image_id' in upload_response_json:
        # Step 2: Use the returned image_id to make the GET request
        image_id = upload_response_json['image_id']
        
        # Send the GET request to retrieve the image
        get_response = requests.get(f'{get_image_url}{image_id}')
        
        # Print the server's response to the GET request
        print("GET Response:", get_response.json())
    else:
        print("Failed to upload the image.")

def test_get_texts_by_date():
    get_texts_url = 'http://127.0.0.1:5000/day'

    # Define the date you want to query
    current_date = datetime.now().strftime('%Y-%m-%d')

    data = {
    'date': '2024-09-28' 
    }
    response = requests.get(get_texts_url, json=data)

    # Print the status code and the response from the server
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(json.dumps(response.json(), indent=4))
# test_save_text()
test_get_texts_by_date()