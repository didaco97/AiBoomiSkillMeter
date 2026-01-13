import os
import google.generativeai as genai
from django.conf import settings
import json

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

class ContentDiscoveryService:
    @staticmethod
    def search_videos(topic, skill_level):
        """
        Generates a full course structure using Gemini 3 Pro with JSON output.
        """
        # Using verified gemini-3-flash-preview as requested
        # model = genai.GenerativeModel('gemini-3-pro-preview')
        model = genai.GenerativeModel('gemini-3-flash-preview') 
        
        prompt = f"""
        You are an expert curriculum designer. Create a comprehensive video-based learning roadmap for "{topic}" suitable for a "{skill_level}" learner.
        
        Return the response in strictly valid JSON format with this exact structure:
        {{
            "course": {{
                "title": "Course Title",
                "description": "Brief course description",
                "difficulty": "{skill_level}",
                "estimated_hours": 10,
                "tags": ["{topic}", "video learning"]
            }},
            "chapters": [
                {{
                    "title": "Chapter Title",
                    "concepts": [
                        {{
                            "title": "Concept Title",
                            "description": "Concept description",
                            "video_search_query": "Specific search term for this concept", 
                            "duration_minutes": 15
                        }}
                    ]
                }}
            ]
        }}
        """
        
        try:
            print(f"DEBUG: Calling Gemini {model.model_name} for topic: {topic}")
            response = model.generate_content(
                prompt, 
                generation_config={"response_mime_type": "application/json"},
                request_options={"timeout": 60}  # 60 second timeout
            )
            print("DEBUG: Gemini response received. Length:", len(response.text))
            import json
            data = json.loads(response.text)
            print("DEBUG: JSON parsed successfully")
            
            # Post-process to structure simple video list for legacy compatibility if needed, 
            # or return full structure.
            # For now, we flatten the first few concepts to match existing view logic 
            # OR we update the view to handle the rich structure. 
            # Let's map it to the expected list of videos for the current view logic:
            
            # Return full structure for rich course generation
            return data
            
        except Exception as e:
            print(f"Gemini API Error: {e}")
            # Fallback mock data if API fails (for robustness)
            return None

class NotesGeneratorService:
    @staticmethod
    def generate_notes(video_title, extra_context=""):
        model = genai.GenerativeModel('gemini-3-flash-preview')  # Use working model
        
        prompt = f"""
        Create structured study notes for a video titled "{video_title}".
        Context: {extra_context}
        
        Format as Markdown with:
        # Main Title
        ## Key Concepts
        - Bullet points
        ## Code Examples (if applicable)
        ## Summary
        """
        
        try:
            response = model.generate_content(prompt, request_options={"timeout": 30})
            return response.text
        except Exception as e:
            print(f"Notes generation error: {e}")
            return f"# {video_title}\n\nNotes will be generated when you watch this video."

class QuizGeneratorService:
    @staticmethod
    def generate_quiz(topic, context_notes):
        model = genai.GenerativeModel('gemini-3-flash-preview')  # Use working model
        
        prompt = f"""
        Generate 10 multiple-choice questions based on these notes about "{topic}":
        {context_notes[:2000]}...
        
        Return JSON list:
        [{{
            "question": "...",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "Correct Option Text",
            "explanation": "..."
        }}]
        """
        
        try:
            response = model.generate_content(
                prompt,
                generation_config={'response_mime_type': 'application/json'},
                request_options={"timeout": 30}
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Quiz generation error: {e}")
            return []
