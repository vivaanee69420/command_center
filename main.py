import sys
import os

# Add the backend folder to the Python path
backend_path = os.path.join(os.path.dirname(__file__), 'COMMAND_OS_BACKEND')
sys.path.append(backend_path)

# Import the FastAPI app from the backend folder
from app.main import app

if __name__ == "__main__":
    import uvicorn
    # Railway provides the port via the PORT environment variable
    port = int(os.environ.get("PORT", 8765))
    uvicorn.run(app, host="0.0.0.0", port=port)
