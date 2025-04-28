# 🌟 HCAI Education Project

Welcome to the HCAI Education Project! This guide will walk you through setting up a Python virtual environment, installing dependencies, and running a FastAPI server. 🚀
## 👥 Group Members

-  Nguyễn Mạnh Hùng
-  Lê Đắc Minh Trí
-  Phạm Tất Thành
-  Nguyễn Quang Tuấn
## 📋 Prerequisites

Ensure you have one of the following installed:

- 🐍 **Python with venv**: Python 3.11 is required.
- 🧪 **Conda**: Download Miniconda from [here](https://www.anaconda.com/docs/getting-started/miniconda/install). 📥

## 🛠️ Installation

Follow these steps to set up your project environment:

### 1. Create a Virtual Environment 🌐

Choose one of the options below to create and activate a virtual environment named `hcai_edu`.

#### Option 1: Using Conda 🧪
```bash
conda create -n hcai_edu python=3.11
conda activate hcai_edu
```

#### Option 2: Using Python and venv 🐍
- **Linux/macOS** 🐧:
```bash
python3 -m venv hcai_edu
source hcai_edu/bin/activate
```
- **Windows** 🪟:
```bash
python3 -m venv hcai_edu
hcai_edu\Scripts\activate.bat
```

### 2. Install Dependencies 📦

With the virtual environment activated, install the required packages:
```bash
pip install -r requirements.txt
```

> **Note**: Ensure the `requirements.txt` file is in the project directory. ✅

### 3. Configure API Key 🔑

Create a `.env` file in the project root and add your Google API key:

```
GOOGLE_API_KEY=YOUR_API_KEY
```

Replace `YOUR_API_KEY` with your actual Google Gemini API key. 🔒

### 4. Run the FastAPI Server 🚀

Start the FastAPI server with the following command:
```bash
uvicorn app:app --reload
```

> **Note**: The `--reload` flag is recommended for development environments only. ⚠️

Once the server is running, visit [http://localhost:8000/docs](http://localhost:8000/docs) to explore the API documentation and test the endpoints. 📚

## 🚀 Usage

With the setup complete, you can now interact with the FastAPI server and leverage its endpoints as described in the API documentation. Enjoy building with the project! 🎉
