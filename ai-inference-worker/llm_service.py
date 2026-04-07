import ollama
import json

def extract_skills(raw_text: str):
    prompt = """
    Extract ONLY the technical skills, programming languages, and frameworks from the following text. 
    You must output strictly as a JSON object with a single key called "skills" containing a list of strings.
    Do not include any other text.
    
    Text: 
    """

    try:
        response = ollama.chat(
            model = "llama3",
            format="json",
            options={'temperature': 0.0},
            messages=[{"role": "system", "content": prompt + raw_text}]
        )

        raw_json_string = response["message"]["content"]
        parsed_json = json.loads(raw_json_string)

        skill_list = parsed_json.get("skills", [])

        return ", ".join(skill_list)
    
    except Exception as e:
        print(f"Error extracting skills: {e}")
        return raw_text