import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Load credentials from your .env file
load_dotenv(dotenv_path=".env")

URI = "bolt://localhost:7687"
AUTH = ("neo4j", os.getenv("NEO4J_PASSWORD"))

def seed_curated_graph():
    driver = GraphDatabase.driver(URI, auth=AUTH)
    
    # 100+ Standardized Industry Relationships
    relationships = [
    ("html", "css"), ("html", "react"), ("html", "php"), ("html", "web accessibility"),
    ("html", "progressive web apps"), ("css", "javascript"), ("css", "react"), ("css", "sass"),
    ("css", "tailwind css"), ("css", "bootstrap"), ("css", "material ui"), ("css", "web accessibility"),
    ("javascript", "typescript"), ("javascript", "react"), ("javascript", "vue.js"), ("javascript", "angular"),
    ("javascript", "svelte"), ("javascript", "rxjs"), ("javascript", "vite"), ("javascript", "webpack"),
    ("javascript", "browser apis"), ("javascript", "three.js"), ("javascript", "node.js"), ("javascript", "json"),
    ("javascript", "functional programming"), ("javascript", "web3.js"), ("javascript", "web application security"),
    ("javascript", "jest"), ("javascript", "cypress"), ("javascript", "cross-platform mobile"), ("javascript", "progressive web apps"),
    ("javascript", "web accessibility"), ("typescript", "react"), ("typescript", "angular"), ("typescript", "vue.js"),
    ("typescript", "node.js"), ("typescript", "nestjs"), ("typescript", "graphql"), ("typescript", "ethers.js"),
    ("typescript", "object oriented programming"), ("typescript", "react native"), ("react", "next.js"), ("react", "redux"),
    ("react", "react native"), ("react", "tailwind css"), ("react", "material ui"), ("vue.js", "pinia"),
    ("angular", "rxjs"), ("angular", "typescript"), ("svelte", "sveltekit"), ("java", "spring boot"),
    ("java", "maven"), ("java", "junit"), ("java", "object oriented programming"), ("java", "software engineering"),
    ("java", "docker"), ("java", "android development"), ("java", "selenium"), ("java", "kafka"),
    ("java", "aws"), ("java", "hadoop"), ("java", "apache spark"), ("spring boot", "spring security"),
    ("spring boot", "hibernate"), ("spring boot", "microservices"), ("spring boot", "rest apis"), ("spring boot", "kafka"),
    ("spring boot", "java"), ("spring security", "cybersecurity"), ("hibernate", "postgresql"), ("hibernate", "java"),
    ("hibernate", "sql"), ("microservices", "api gateway"), ("microservices", "eureka"), ("microservices", "feign client"),
    ("microservices", "service mesh"), ("microservices", "docker"), ("microservices", "kubernetes"), ("node.js", "express.js"),
    ("node.js", "nestjs"), ("node.js", "socket.io"), ("node.js", "docker"), ("node.js", "microservices"),
    ("node.js", "rest apis"), ("node.js", "kafka"), ("node.js", "aws"), ("express.js", "mongodb"),
    ("express.js", "rest apis"), ("express.js", "node.js"), ("nestjs", "node.js"), ("nestjs", "typescript"),
    ("socket.io", "node.js"), ("socket.io", "javascript"), ("python", "django"), ("python", "fastapi"),
    ("python", "flask"), ("python", "numpy"), ("python", "sql"), ("python", "pyspark"),
    ("python", "jupyter notebooks"), ("python", "apache airflow"), ("python", "object oriented programming"), ("python", "software engineering"),
    ("python", "docker"), ("python", "machine learning"), ("python", "rest apis"), ("python", "kafka"),
    ("python", "aws"), ("python", "data analysis"), ("python", "etl"), ("python", "data pipelines"),
    ("python", "big data"), ("python", "apache spark"), ("python", "hadoop"), ("python", "functional programming"),
    ("python", "web application security"), ("python", "selenium"), ("django", "drf"), ("django", "postgresql"),
    ("django", "rest apis"), ("django", "python"), ("fastapi", "rest apis"), ("fastapi", "python"),
    ("flask", "rest apis"), ("flask", "python"), ("drf", "django"), ("go", "gin"),
    ("go", "grpc"), ("go", "docker"), ("go", "microservices"), ("go", "rest apis"),
    ("go", "kafka"), ("go", "kubernetes"), ("go", "functional programming"), ("gin", "go"),
    ("grpc", "go"), ("grpc", "microservices"), ("grpc", "system design"), ("c#", ".net"),
    ("c#", "unity"), ("c#", "object oriented programming"), ("c#", "game development"), ("c#", "microservices"),
    ("c#", "asp.net core"), (".net", "asp.net core"), ("asp.net core", "entity framework"), ("asp.net core", "blazor"),
    ("asp.net core", "web api"), ("asp.net core", "rest apis"), ("asp.net core", "c#"), ("asp.net core", ".net"),
    ("entity framework", "linq"), ("entity framework", "c#"), ("entity framework", "sql"), ("blazor", "asp.net core"),
    ("blazor", "c#"), ("blazor", "webassembly"), ("linq", "c#"), ("web api", "asp.net core"),
    ("web api", "rest apis"), ("php", "laravel"), ("php", "symfony"), ("php", "wordpress"),
    ("php", "sql"), ("php", "rest apis"), ("php", "object oriented programming"), ("php", "web application security"),
    ("laravel", "php"), ("symfony", "php"), ("wordpress", "php"), ("ruby", "ruby on rails"),
    ("ruby", "rest apis"), ("ruby", "web application security"), ("ruby", "object oriented programming"), ("ruby on rails", "active record"),
    ("ruby on rails", "ruby"), ("active record", "ruby on rails"), ("active record", "sql"), ("c", "c++"),
    ("c", "operating systems"), ("c", "embedded systems"), ("c++", "embedded systems"), ("c++", "unreal engine"),
    ("c++", "rust"), ("c++", "object oriented programming"), ("c++", "game development"), ("rust", "tokio"),
    ("rust", "webassembly"), ("rust", "functional programming"), ("operating systems", "linux kernel"), ("linux", "bash scripting"),
    ("linux", "docker"), ("linux", "nginx"), ("linux", "kali linux"), ("linux", "git"),
    ("linux", "ansible"), ("linux", "cybersecurity"), ("linux", "operating systems"), ("bash scripting", "python"),
    ("bash scripting", "powershell"), ("bash scripting", "docker"), ("bash scripting", "linux"), ("bash scripting", "ci/cd"),
    ("docker", "kubernetes"), ("docker", "docker compose"), ("docker", "datadog"), ("docker", "ci/cd"),
    ("docker", "aws"), ("docker", "gcp"), ("docker", "azure"), ("docker", "terraform"),
    ("docker compose", "microservices"), ("docker compose", "docker"), ("kubernetes", "helm"), ("kubernetes", "istio"),
    ("kubernetes", "argocd"), ("kubernetes", "prometheus"), ("kubernetes", "microservices"), ("helm", "kubernetes"),
    ("istio", "kubernetes"), ("istio", "service mesh"), ("argocd", "kubernetes"), ("argocd", "ci/cd"),
    ("prometheus", "grafana"), ("grafana", "prometheus"), ("datadog", "cloud computing"), ("datadog", "kubernetes"),
    ("nginx", "haproxy"), ("nginx", "api gateway"), ("nginx", "load balancing"), ("haproxy", "load balancing"),
    ("aws", "ec2"), ("aws", "lambda"), ("aws", "s3"), ("aws", "iam"),
    ("aws", "eks"), ("aws", "terraform"), ("aws", "cloud computing"), ("ec2", "aws"),
    ("ec2", "linux"), ("lambda", "aws"), ("s3", "aws"), ("s3", "cloud computing"),
    ("iam", "aws"), ("iam", "cybersecurity"), ("eks", "aws"), ("eks", "kubernetes"),
    ("terraform", "infrastructure as code"), ("terraform", "aws"), ("terraform", "azure"), ("terraform", "gcp"),
    ("terraform", "cloud computing"), ("infrastructure as code", "pulumi"), ("infrastructure as code", "cloud computing"), ("infrastructure as code", "ci/cd"),
    ("pulumi", "aws"), ("pulumi", "azure"), ("pulumi", "gcp"), ("pulumi", "cloud computing"),
    ("cloud computing", "azure"), ("cloud computing", "gcp"), ("cloud computing", "infrastructure as code"), ("azure", "azure devops"),
    ("azure devops", "azure"), ("azure devops", "ci/cd"), ("gcp", "google kubernetes engine"), ("google kubernetes engine", "gcp"),
    ("google kubernetes engine", "kubernetes"), ("jenkins", "ci/cd"), ("jenkins", "docker"), ("jenkins", "kubernetes"),
    ("github actions", "ci/cd"), ("github actions", "docker"), ("github actions", "kubernetes"), ("ansible", "automation"),
    ("ansible", "ci/cd"), ("ansible", "linux"), ("ansible", "docker"), ("automation", "ci/cd"),
    ("powershell", "azure"), ("numpy", "pandas"), ("numpy", "data analysis"), ("pandas", "matplotlib"),
    ("pandas", "scikit-learn"), ("pandas", "data analysis"), ("scikit-learn", "tensorflow"), ("scikit-learn", "machine learning"),
    ("tensorflow", "keras"), ("tensorflow", "pytorch"), ("tensorflow", "machine learning"), ("keras", "deep learning"),
    ("pytorch", "deep learning"), ("pytorch", "machine learning"), ("sql", "data modeling"), ("sql", "postgresql"),
    ("sql", "data warehousing"), ("sql", "dbt"), ("sql", "mysql"), ("sql", "oracle"),
    ("sql", "hibernate"), ("sql", "entity framework"), ("sql", "active record"), ("sql", "data analysis"),
    ("sql", "database administration"), ("sql", "etl"), ("sql", "data pipelines"), ("sql", "nosql"),
    ("postgresql", "redis"), ("postgresql", "sql"), ("postgresql", "database tuning"), ("mysql", "sql"),
    ("mysql", "database tuning"), ("oracle", "sql"), ("data modeling", "etl"), ("data modeling", "data warehousing"),
    ("data warehousing", "snowflake"), ("data warehousing", "amazon redshift"), ("data warehousing", "google bigquery"), ("data warehousing", "etl"),
    ("snowflake", "data warehousing"), ("snowflake", "cloud computing"), ("amazon redshift", "data warehousing"), ("amazon redshift", "aws"),
    ("google bigquery", "data warehousing"), ("google bigquery", "gcp"), ("apache airflow", "data pipelines"), ("apache airflow", "etl"),
    ("data pipelines", "etl"), ("apache spark", "hadoop"), ("apache spark", "pyspark"), ("apache spark", "big data"),
    ("pyspark", "big data"), ("pyspark", "apache airflow"), ("pyspark", "apache spark"), ("hadoop", "big data"),
    ("data analysis", "tableau"), ("data analysis", "power bi"), ("data analysis", "python"), ("tableau", "sql"),
    ("power bi", "sql"), ("deep learning", "computer vision"), ("deep learning", "nlp"), ("deep learning", "python"),
    ("computer vision", "opencv"), ("computer vision", "deep learning"), ("nlp", "large language models"), ("nlp", "nltk"),
    ("nlp", "spacy"), ("nlp", "deep learning"), ("large language models", "langchain"), ("large language models", "prompt engineering"),
    ("large language models", "hugging face"), ("large language models", "rag"), ("large language models", "deep learning"), ("large language models", "nlp"),
    ("prompt engineering", "large language models"), ("rag", "large language models"), ("hugging face", "large language models"), ("langchain", "large language models"),
    ("machine learning", "mlops"), ("machine learning", "deep learning"), ("machine learning", "python"), ("mlops", "mlflow"),
    ("mlops", "machine learning"), ("mlops", "ci/cd"), ("mlops", "docker"), ("mlops", "kubernetes"),
    ("mlflow", "mlops"), ("jupyter notebooks", "data analysis"), ("jupyter notebooks", "machine learning"), ("redis", "caching strategies"),
    ("redis", "nosql"), ("redis", "caching"), ("caching strategies", "system design"), ("caching strategies", "caching"),
    ("mongodb", "nosql"), ("nosql", "elasticsearch"), ("nosql", "cassandra"), ("nosql", "dynamodb"),
    ("nosql", "graph databases"), ("nosql", "redis"), ("elasticsearch", "logstash"), ("elasticsearch", "nosql"),
    ("logstash", "kibana"), ("kibana", "elasticsearch"), ("cassandra", "nosql"), ("dynamodb", "nosql"),
    ("dynamodb", "aws"), ("graph databases", "neo4j"), ("neo4j", "cypher"), ("neo4j", "graph databases"),
    ("cypher", "neo4j"), ("database administration", "database tuning"), ("database administration", "data warehousing"), ("database administration", "sql"),
    ("database tuning", "database administration"), ("database tuning", "sql"), ("swift", "swiftui"), ("swiftui", "ios development"),
    ("swiftui", "swift"), ("ios development", "rest apis"), ("ios development", "swift"), ("kotlin", "jetpack compose"),
    ("jetpack compose", "android development"), ("jetpack compose", "kotlin"), ("android development", "java"), ("android development", "kotlin"),
    ("dart", "flutter"), ("flutter", "cross-platform mobile"), ("flutter", "dart"), ("cross-platform mobile", "rest apis"),
    ("cross-platform mobile", "dart"), ("react native", "react"), ("react native", "javascript"), ("react native", "cross-platform mobile"),
    ("jest", "javascript"), ("jest", "testing"), ("cypress", "javascript"), ("cypress", "testing"),
    ("selenium", "java"), ("selenium", "python"), ("selenium", "testing"), ("testing", "test driven development"),
    ("testing", "behavior driven development"), ("test driven development", "testing"), ("behavior driven development", "testing"), ("unit testing", "testing"),
    ("unit testing", "software engineering"), ("unit testing", "test driven development"), ("software engineering", "design patterns"), ("software engineering", "system design"),
    ("software engineering", "unit testing"), ("software engineering", "swift"), ("software engineering", "dart"), ("software engineering", "testing"),
    ("software engineering", "agile"), ("software engineering", "rust"), ("design patterns", "solid principles"), ("design patterns", "software engineering"),
    ("solid principles", "design patterns"), ("solid principles", "object oriented programming"), ("system design", "scalability"), ("system design", "load balancing"),
    ("system design", "message queues"), ("system design", "event-driven architecture"), ("system design", "caching"), ("system design", "cap theorem"),
    ("system design", "microservices"), ("system design", "database tuning"), ("system design", "software engineering"), ("scalability", "system design"),
    ("load balancing", "system design"), ("load balancing", "scalability"), ("message queues", "rabbitmq"), ("message queues", "kafka"),
    ("message queues", "system design"), ("rabbitmq", "message queues"), ("kafka", "message queues"), ("kafka", "distributed systems"),
    ("event-driven architecture", "system design"), ("event-driven architecture", "message queues"), ("event-driven architecture", "kafka"), ("event-driven architecture", "rabbitmq"),
    ("event-driven architecture", "microservices"), ("computer networking", "tcp/ip"), ("computer networking", "dns"), ("computer networking", "cybersecurity"),
    ("computer networking", "wireshark"), ("computer networking", "linux"), ("tcp/ip", "computer networking"), ("dns", "computer networking"),
    ("rest apis", "graphql"), ("rest apis", "grpc"), ("rest apis", "postman"), ("rest apis", "microservices"),
    ("rest apis", "api gateway"), ("graphql", "rest apis"), ("graphql", "api gateway"), ("caching", "cdn"),
    ("caching", "scalability"), ("cdn", "caching"), ("cdn", "scalability"), ("cdn", "computer networking"),
    ("cap theorem", "system design"), ("cap theorem", "nosql"), ("cybersecurity", "ethical hacking"), ("cybersecurity", "cryptography"),
    ("cybersecurity", "owasp"), ("cybersecurity", "incident response"), ("ethical hacking", "penetration testing"), ("owasp", "web application security"),
    ("web application security", "rest apis"), ("web application security", "javascript"), ("wireshark", "computer networking"), ("kali linux", "linux"),
    ("cryptography", "blockchain"), ("blockchain", "ethereum"), ("blockchain", "hyperledger"), ("ethereum", "solidity"),
    ("solidity", "smart contracts"), ("smart contracts", "web3.js"), ("smart contracts", "ethers.js"), ("git", "github"),
    ("git", "ci/cd"), ("git", "software engineering"), ("github", "gitflow"), ("github", "ci/cd"),
    ("agile", "scrum"), ("agile", "jira"), ("agile", "ci/cd"), ("agile", "software engineering"),
    ("object oriented programming", "design patterns"), ("functional programming", "react"), ("json", "rest apis"), ("api gateway", "microservices"),
    ("ci/cd", "kubernetes"), ("ci/cd", "aws"), ("game development", "unity"), ("game development", "unreal engine"),
    ("etl", "apache airflow")
    ]

    with driver.session() as session:
        print("🚀 Cold-starting Neo4j with 100+ standardized relationships...")
        
        # Ensure the unique constraint exists
        session.run("CREATE CONSTRAINT skill_name_unique IF NOT EXISTS FOR (s:Skill) REQUIRE s.name IS UNIQUE")

        for from_skill, to_skill in relationships:
            # Force standardization here as well: lower() and strip()
            s1 = from_skill.lower().strip()
            s2 = to_skill.lower().strip()

            session.run("""
                MERGE (a:Skill {name: $name1})
                MERGE (b:Skill {name: $name2})
                MERGE (a)-[:LEADS_TO]->(b)
            """, name1=s1, name2=s2)

        print(f"✨ Successfully injected {len(relationships)} high-quality tech relationships.")
    
    driver.close()

if __name__ == "__main__":
    seed_curated_graph()