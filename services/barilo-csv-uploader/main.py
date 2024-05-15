import pandas as pd
from typing import Annotated
from fastapi import FastAPI, UploadFile

app = FastAPI()

chunk_size = 1000


@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile):
    # stream each row of the file
    df = pd.read_csv(file.file, chunksize=chunk_size)
    for chunk in df:
        print("...", end="\n\n")
        for row in chunk.iterrows():
            print(row)

        break

    return {"filename": file.filename}
