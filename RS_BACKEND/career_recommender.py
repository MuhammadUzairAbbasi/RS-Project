import google.generativeai as genai
import json
import time
from google.api_core.exceptions import ResourceExhausted

def generate_roadmaps(user_background, career_roles, api_key):
    """Generate career roadmaps using Gemini API."""
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')

    prompt_parts = [
        "You are a career consultant AI. Create detailed career roadmaps for a user transitioning into these roles: ",
        ", ".join(career_roles),
        ". The user's background is:\n",
        "- Degree: ", user_background['degree'], "\n",
        "- Skills: ", ", ".join(user_background['skills']), "\n",
        "- Experience: ", user_background['experience'], "\n",
        "- Interests: ", ", ".join(user_background['interests']), "\n\n",
        """For each role, provide:
1. Job Roles: Entry-level, mid-level, senior-level positions.
2. Skills Required: Technical (e.g., programming languages, tools) and soft skills.
3. Resources: Online courses, certifications, books, project ideas.
4. Timeline: Short-term (3-6 months), mid-term (6-18 months), long-term (18+ months).

Output valid JSON only with this exact structure:
{
  "careerRoadmaps": [
    {
      "role": "Role Name",
      "jobRoles": { "entryLevel": [], "midLevel": [], "seniorLevel": [] },
      "skillsRequired": { "technical": [], "softSkills": [] },
      "resources": { "onlineCourses": [], "certifications": [], "books": [], "projectIdeas": [] },
      "timeline": { "shortTerm": [], "midTerm": [], "longTerm": [] },
      "bridgeSkills": []
    }
  ]
}"""
    ]
    prompt = "".join(prompt_parts)

    max_retries = 3
    retry_delay = 5
    roadmaps = []

    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            json_str = response.text.strip('```json\n').strip('```')
            parsed = json.loads(json_str)
            if "careerRoadmaps" in parsed:
                roadmaps = parsed["careerRoadmaps"]
                return roadmaps
            else:
                raise ValueError("Missing 'careerRoadmaps' key")
        except ResourceExhausted:
            time.sleep(retry_delay)
            retry_delay *= 2
        except Exception as e:
            if attempt == max_retries - 1:
                return [{"error": "Failed to parse JSON", "raw": response.text if 'response' in locals() else str(e)}]

    return roadmaps