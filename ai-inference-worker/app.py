import os
import json
import threading
import psycopg2
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from sentence_transformers import SentenceTransformer
from confluent_kafka import Consumer, Producer, KafkaException
from contextlib import asynccontextmanager

from llm_service import extract_skills

# Load the same .env file from the root folder
load_dotenv(dotenv_path="../.env")
print("===============Loading model==============")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("---------------Model loaded--------------")

def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        port="5433",
        database=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD")
    )

def initialize_database():
    print("Checking database and ensuring pgvector table exists...")
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        create_table_query = """
        CREATE TABLE IF NOT EXISTS ai_embeddings (
            id UUID PRIMARY KEY,                   
            entity_type VARCHAR(20),               
            embedding vector(384),                 
            created_at TIMESTAMP DEFAULT NOW()
        );
        """
        cur.execute(create_table_query)
        conn.commit()
        cur.close()
        conn.close()
        print("Database initialized successfully!")
    except Exception as e:
        print(f"Failed to initialize database: {e}")

def start_kafka_listener():
    consumer = Consumer({'bootstrap.servers': 'localhost:9092', 'group.id': 'trajectory-ai', 'auto.offset.reset': 'earliest'})
    producer = Producer({'bootstrap.servers': 'localhost:9092'})
    consumer.subscribe(['trajectory.resume.uploaded', 'trajectory.job.created'])

    print("Kafka listener started, waiting for messages...")

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None or msg.error():
                continue

            payload = json.loads(msg.value().decode('utf-8'))

            is_job = msg.topic() == 'trajectory.job.created'
            entity_id = payload.get("jobId") if is_job else payload.get("userId")
            raw_text = payload.get("description") if is_job else payload.get("resumeText")
            entity_type = 'JOB' if is_job else 'USER'

            print("Sending to LLM for extraction...")
            clean_skills_string = extract_skills(raw_text)
            print(f"Cleaned Skills for embedding: {clean_skills_string}")

            vector = model.encode(clean_skills_string).tolist()
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO ai_embeddings (id, entity_type, embedding) 
                VALUES (%s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET embedding = EXCLUDED.embedding;
            """, (entity_id, entity_type, vector))
            conn.commit()
            cur.close(); conn.close()

            callback_topic = 'trajectory.ai.job_vectorized' if is_job else 'trajectory.ai.vectorized'
            producer.produce(callback_topic, json.dumps({"id": entity_id, "status": "READY"}).encode('utf-8'))
            producer.flush()
            print(f"[{entity_type}] Vectorized and saved ID: {entity_id}")
    
    except Exception as e:
        print(f"Kafka error: {e}")
    finally:
        consumer.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Everything BEFORE the 'yield' happens on STARTUP
    initialize_database()
    threading.Thread(target=start_kafka_listener, daemon=True).start()
    
    yield # This hands control over to the web server to run normally
    
    # Everything AFTER the 'yield' happens on SHUTDOWN
    print("Shutting down the AI Engine safely...")

# Pass the lifespan function into the FastAPI app
app = FastAPI(title="Trajectory AI Engine", lifespan=lifespan)

@app.get("/match/user/{user_id}")
def get_job_matches(user_id: str, limit: int = 5):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        match_query = """
            SELECT id, 1 - (embedding <=> (SELECT embedding FROM ai_embeddings WHERE id = %s)) AS similarity_score
            FROM ai_embeddings
            WHERE entity_type = 'JOB'
            ORDER BY embedding <=> (SELECT embedding FROM ai_embeddings WHERE id = %s)
            LIMIT %s;
        """

        cur.execute(match_query, (user_id, user_id, limit))
        results = cur.fetchall()
        cur.close(); conn.close()

        if not results:
            return {"message": "No jobs found or user vector not available."}
        
        matches = [{"job_id": str(row[0]), "similarity_score": round(row[1]*100, 2)} for row in results]
        return {"user_id": user_id, "matches": matches}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# --- 5. THE REVERSE MATCHING ENDPOINT (FOR EMPLOYERS) ---
@app.get("/match/job/{job_id}")
def get_user_matches(job_id: str, limit: int = 5):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Notice the WHERE clause is now looking for 'USER'
        match_query = """
            SELECT id, 1 - (embedding <=> (SELECT embedding FROM ai_embeddings WHERE id = %s)) AS similarity_score
            FROM ai_embeddings
            WHERE entity_type = 'USER'
            ORDER BY embedding <=> (SELECT embedding FROM ai_embeddings WHERE id = %s)
            LIMIT %s;
        """
        cur.execute(match_query, (job_id, job_id, limit))
        results = cur.fetchall()
        cur.close(); conn.close()
        
        if not results:
            return {"message": "No students found or job vector missing."}
            
        matches = [{"user_id": str(row[0]), "match_score": round(row[1] * 100, 2)} for row in results]
        return {"job_id": job_id, "top_matches": matches}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    