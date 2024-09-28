import cv2
import time 
import requests


# Initialize the camera
camera = cv2.VideoCapture(0)

# Check if the camera opened successfully
if not camera.isOpened():
    print("Error: Could not open camera.")
    exit()

server_url = ""

try:
   while True:
        for i in range(5):
             camera.read()

        # Read a single frame from the camera
        ret, frame = camera.read()

        if ret:
            # Save the frame as an image file
            timestamp = time.strftime("%Y%m%d-%H%M%S")
            filename = f'webcam_picture_{timestamp}.jpg'
            cv2.imwrite(filename, frame)
            print(f"Picture saved as {filename}")

            with open(filename, 'rb') as image_file:
                response = requests.post(server_url,files={'image':image_file})

            if response.status_code == 200:
                 print("Image sent")
            
            else:
                 print("Failed to send")
        else:
            print("Error: Could not capture frame.")

        time.sleep(10)
        
        
except KeyboardInterrupt:
        print("program interrupted. Exiting...")

finally:
     camera.release()