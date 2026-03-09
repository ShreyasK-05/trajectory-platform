import json
from confluent_kafka import Producer

producer = Producer({'bootstrap.servers': "localhost:9092"})

print("Sending Kafka Messages...")
producer.produce('trajectory.resume.uploaded', json.dumps({"userId": 999, "extractedSkills": ["java"]}).encode('utf-8'))
producer.produce('trajectory.job.created', json.dumps({"jobId": 8888, "title": "Test Dev", "requiredSkills": ["java", "spring boot"]}).encode('utf-8'))
producer.flush()
print("Sent! Check your Java terminal.")