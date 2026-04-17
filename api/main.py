from fastapi import FastAPI, File, UploadFile
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)

try:
    MODEL = tf.keras.models.load_model("../saved_models/1")
    IS_TFSMLAYER = False
except Exception as e:
    print(f"Standard load failed, attempting Keras 3 legacy load: {e}")
    # Keras 3 compatibility for legacy SavedModel
    MODEL = tf.keras.layers.TFSMLayer("../saved_models/1", call_endpoint='serving_default')
    IS_TFSMLAYER = True

CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]


@app.get("/ping")
async def ping():
    return "Hello, I am alive"


def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image


@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)
    
    # Ensure float32 for model consistency
    img_batch = img_batch.astype('float32')

    if IS_TFSMLAYER:
        # TFSMLayer is called like a function
        predictions_raw = MODEL(img_batch)
        # Handle dict output if necessary
        if isinstance(predictions_raw, dict):
            predictions = predictions_raw[list(predictions_raw.keys())[0]].numpy()
        else:
            predictions = predictions_raw.numpy()
    else:
        predictions = MODEL.predict(img_batch)

    predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
    confidence = np.max(predictions[0])
    return{
        'class': predicted_class,
        'confidence': float(confidence)
    }


if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)

