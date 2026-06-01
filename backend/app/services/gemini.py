import json
import logging
from typing import List, Dict, Any, Tuple
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure API Key if available
if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Error configuring Gemini API: {e}")

class GeminiService:
    @staticmethod
    def _is_api_configured() -> bool:
        return bool(settings.GEMINI_API_KEY)

    @classmethod
    def generate_academic_response(cls, prompt: str, mode: str, context: str = "") -> str:
        """
        AI Academic Assistant modes:
        - Beginner: Simple, child-friendly explanations, high analogies
        - Exam: Academic-style, point-wise, detailed structure matching university evaluation
        - Expert: Deep technical details, mathematics, research references
        - Teacher: Socratic style, guiding steps
        """
        system_instructions = {
            "beginner": "You are a friendly campus mentor explaining complex engineering concepts simply. Use basic analogies, avoid heavy math or jargon unless you define it, and keep it accessible for a first-year student.",
            "exam": "You are an engineering college examiner. Provide answers that would score full marks in semester exams: define terms, use bullet points, specify block diagrams (in text description), state advantages/disadvantages, and write structured points.",
            "expert": "You are a university research scientist. Explain this concept using mathematically rigorous definitions, exact algorithms, reference code blocks, performance metrics, and technical detail.",
            "teacher": "You are an interactive Socratic professor. Guide the student step-by-step. Break the concept down into parts, explain the first part, and then ask a guiding question to encourage their thought process."
        }

        instructions = system_instructions.get(mode.lower(), system_instructions["beginner"])
        full_prompt = f"System Context: {instructions}\n"
        if context:
            full_prompt += f"Academic Document Excerpt (RAG): {context}\n"
        full_prompt += f"Student Question: {prompt}\n\nResponse:"

        if not cls._is_api_configured():
            return cls._get_mock_academic_response(prompt, mode)

        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API academic error: {e}. Falling back to mock response.")
            return cls._get_mock_academic_response(prompt, mode)

    @classmethod
    def analyze_resume(cls, resume_text: str) -> Dict[str, Any]:
        """
        Analyze a candidate resume and generate ATS score, strengths, improvements, and a career roadmap.
        """
        prompt = (
            "Analyze the following resume details. Rate the resume on a scale of 0 to 100 as an ATS Score. "
            "Output your entire answer strictly as a valid JSON object matching the following structure:\n"
            "{\n"
            "  'ats_score': 85,\n"
            "  'strengths': ['Detail 1', 'Detail 2'],\n"
            "  'weaknesses': ['Detail 1', 'Detail 2'],\n"
            "  'improvements': ['Actionable advice 1', 'Actionable advice 2'],\n"
            "  'roadmap': ['Semester 1 action plan', 'Semester 2 action plan', 'Job search strategy']\n"
            "}\n"
            "Resume contents:\n"
            f"{resume_text}"
        )

        if not cls._is_api_configured():
            return cls._get_mock_resume_analysis(resume_text)

        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            # Find and parse JSON from the response text
            text = response.text.strip()
            # Clean possible markdown wrap
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            data = json.loads(text.strip())
            return data
        except Exception as e:
            logger.error(f"Gemini API resume error: {e}. Falling back to mock analysis.")
            return cls._get_mock_resume_analysis(resume_text)

    @classmethod
    def get_interview_response(cls, role_type: str, history: List[Dict[str, str]], last_answer: str) -> Tuple[str, bool]:
        """
        Handles interactive interviews.
        Returns: (next_question_or_feedback, is_completed)
        """
        if len(history) >= 10:  # 5 questions + 5 answers -> complete interview
            return cls._generate_interview_feedback(role_type, history), True

        prompt = (
            f"You are conducting a professional mock interview for a {role_type} role. "
            f"Here is the dialogue history:\n"
            f"{json.dumps(history)}\n\n"
            f"The candidate's last answer was: '{last_answer}'\n\n"
            "If the candidate is answering the previous question, acknowledge their answer briefly, assess it, "
            "and then ask the NEXT logical technical or situational question suitable for the role. "
            "Keep your response strictly as the next interviewer question (concise and natural, 1-3 sentences)."
        )

        if not cls._is_api_configured():
            return cls._get_mock_interview_step(role_type, len(history), last_answer)

        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            return response.text.strip(), False
        except Exception as e:
            logger.error(f"Gemini API interview error: {e}. Falling back to mock interviewer.")
            return cls._get_mock_interview_step(role_type, len(history), last_answer)

    @classmethod
    def _generate_interview_feedback(cls, role_type: str, history: List[Dict[str, str]]) -> str:
        prompt = (
            f"Evaluate this {role_type} mock interview. Generate a scorecard in JSON format with:\n"
            "{\n"
            "  'overall_score': 78,\n"
            "  'communication_rating': 'Good but needs structural flow',\n"
            "  'technical_rating': 'Strong in basics, gaps in system design',\n"
            "  'strengths': ['point 1', 'point 2'],\n"
            "  'weaknesses': ['point 1', 'point 2'],\n"
            "  'improvement_plan': ['step 1', 'step 2']\n"
            "}\n\n"
            f"Interview transcript: {json.dumps(history)}"
        )

        if not cls._is_api_configured():
            return json.dumps(cls._get_mock_interview_feedback_data(role_type))

        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            # Validate JSON
            json.loads(text.strip())
            return text.strip()
        except Exception:
            return json.dumps(cls._get_mock_interview_feedback_data(role_type))

    # --- MOCK FALLBACKS ---

    @staticmethod
    def _get_mock_academic_response(prompt: str, mode: str) -> str:
        concept = prompt.split()[-1] if prompt.strip() else "Engineering"
        if mode == "beginner":
            return (
                f"### Let's understand **{concept}** like you're 5! 💡\n\n"
                f"Imagine **{concept}** is like a mail delivery service. Instead of walking files directly "
                f"from your computer to a server, we put messages in tiny digital envelopes (packets), "
                f"stamp them with the recipient's address, and throw them onto a highway. The highway routers "
                f"direct the envelopes. If one gets lost, the mail carrier notices and sends a replacement!\n\n"
                f"* **Analogy**: Mailing a letter to a friend in a different town.\n"
                f"* **Key takeaway**: It splits big things into smaller packages to send them safely."
            )
        elif mode == "exam":
            return (
                f"### **{concept}** (Semester Exam Solution)\n\n"
                f"#### **1. Definition**\n"
                f"**{concept}** is a fundamental architectural concept in modern engineering. It operates "
                f"as a multi-layered structure where nodes communicate through designated protocols.\n\n"
                f"#### **2. Block Diagram Description**\n"
                f"```text\n"
                f"+-------------------+       +-------------------+\n"
                f"|    Source Node    | ===== |  Destination Node |\n"
                f"| (Data Generation) |       |  (Data Consumer)  |\n"
                f"+-------------------+       +-------------------+\n"
                f"         ||                          ||\n"
                f"         V                           V\n"
                f"    [Controller] ---------------> [Feedback Loop]\n"
                f"```\n\n"
                f"#### **3. Advantages**\n"
                f"* **Scalability**: Nodes can be appended dynamically.\n"
                f"* **Redundancy**: High fault tolerance due to multi-path routing.\n\n"
                f"#### **4. Limitations**\n"
                f"* **Latency**: Inherent transmission overhead.\n"
                f"* **Complexity**: High network monitoring requirements."
            )
        elif mode == "expert":
            return (
                f"### Mathematical & Technical Analysis of **{concept}**\n\n"
                f"In high-performance deployments, the efficiency $\\eta$ of the **{concept}** mechanism "
                f"is governed by the transmission relation:\n\n"
                f"$$\\eta = \\frac{{T_{{useful}}}}{{T_{{total}}}} = \\frac{{L / R}}{{L / R + 2 \\cdot T_{{prop}}}}$$\n\n"
                f"where $L$ is packet length, $R$ is link capacity, and $T_{prop}$ is propagation delay. "
                f"Below is a production reference implementation in Python representing the packet queue scheduler:\n\n"
                f"```python\n"
                f"import heapq\n"
                f"\n"
                f"class QueueScheduler:\n"
                f"    def __init__(self):\n"
                f"        self.queue = []\n"
                f"        \n"
                f"    def schedule_packet(self, packet_id, priority):\n"
                f"        # Priority queue push: O(log N)\n"
                f"        heapq.heappush(self.queue, (priority, packet_id))\n"
                f"        \n"
                f"    def dispatch_packet(self):\n"
                f"        # Priority queue pop: O(log N)\n"
                f"        return heapq.heappop(self.queue) if self.queue else None\n"
                f"```\n"
                f"This design achieves logarithmic execution time bounds, optimal for high-throughput networks."
            )
        else: # Teacher Mode
            return (
                f"### Guiding Steps for **{concept}**\n\n"
                f"Hello! Let's explore **{concept}** together. I won't just give you the answer; let's "
                f"discover how it works step-by-step.\n\n"
                f"**Step 1:** In any engineering system, we need to balance inputs and outputs. If you flood a server "
                f"with inputs without regulating them, it crashes.\n\n"
                f"**Question for you:** How do you think a server tells a sender to slow down when its buffer is full? "
                f"Does it discard the incoming data, or does it send back a signal? Write what you think!"
            )

    @staticmethod
    def _get_mock_resume_analysis(resume_text: str) -> Dict[str, Any]:
        return {
            "ats_score": 75,
            "strengths": [
                "Good representation of technical skills (Python, JavaScript, SQL).",
                "Includes multiple academic and personal projects."
            ],
            "weaknesses": [
                "Lack of quantifiable metrics (e.g., did not mention percentage improvement, speedup, or active users).",
                "ATS parsing might struggle with multi-column formats."
            ],
            "improvements": [
                "Rewrite project bullets using the Google XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.",
                "Ensure standard headings like 'Experience', 'Education', 'Projects', and 'Skills' are used."
            ],
            "roadmap": [
                "Month 1: Re-structure resume to single-column, ATS-friendly markdown/Word format.",
                "Month 2: Complete one major full-stack project utilizing React & FastAPI; deploy it on Railway.",
                "Month 3: Solve 50+ DSA problems on Leetcode (focus on arrays, strings, and hash maps).",
                "Month 4: Start applying for off-campus summer internships and participate in college hackathons."
            ]
        }

    @staticmethod
    def _get_mock_interview_step(role_type: str, history_len: int, last_answer: str) -> Tuple[str, bool]:
        # history_len represents message index: 0, 1 (first QA), 2, 3 (second QA), etc.
        question_index = history_len // 2
        
        questions = {
            "frontend": [
                "Welcome to the Frontend Engineering interview. Let's start with the basics. Can you explain the difference between state and props in React, and when you would choose to use one over the other?",
                "Great. Now, how does React's Virtual DOM work under the hood, and how does it optimize rendering performance?",
                "Interesting. If you have a list of thousands of items rendering in a React app and it's lagging, what techniques or hooks would you use to improve performance?",
                "Good. Next, can you explain the CSS box model and how setting `box-sizing: border-box` impacts layout calculations?",
                "Finally, how do you handle state management across a large-scale application? When would you use Context API vs. Redux or Zustand?"
            ],
            "backend": [
                "Welcome to the Backend Engineering interview. Let's begin. Can you explain the difference between SQL and NoSQL databases, and what factors guide your database choice for a project?",
                "Good. In a relational database, what are indexes, how do they speed up lookups, and what is the trade-off of creating too many indexes?",
                "Understood. How would you handle user authentication and session management securely in a FastAPI application?",
                "Excellent. Suppose your backend endpoint is experiencing slow response times due to heavy API integration calls. How would you introduce caching or background tasks to solve this?",
                "Finally, what is the difference between horizontal and vertical scaling, and how do you design a database to support horizontal scaling?"
            ],
            "hr": [
                "Thank you for joining today's HR session. Let's start by introducing yourself. Please highlight your academic background at SRGEC and your key career aspirations.",
                "Excellent. Tell me about a time when you had to work in a team and faced a major conflict. How did you resolve the conflict to complete the project?",
                "Very mature approach. What is your greatest professional weakness, and what active steps are you taking to overcome it?",
                "Where do you see yourself in five years? What skills or achievements do you hope to accumulate by then?",
                "Why do you want to join our company specifically, and what makes you a unique candidate that we should hire?"
            ],
            "aptitude": [
                "Welcome to the Aptitude round. Let's start with a quantitative question: A train leaves a station at 60 km/h. Two hours later, another train leaves the same station in the same direction at 80 km/h. How many hours will it take for the second train to overtake the first train?",
                "Correct. Next: If 5 machines can print 5 books in 5 minutes, how many minutes will it take 100 machines to print 100 books?",
                "Great. Let's do a logical reasoning problem: In a family of six, A is B's brother, C is A's father, D is E's brother, and E is B's daughter. Who is the uncle of D?",
                "Excellent. Next question: A store increases its prices by 20% and then runs a 20% discount sale. What is the net percentage change in prices from the original values?",
                "Perfect. Final question: A bag contains 3 red, 4 blue, and 5 green balls. If two balls are drawn at random without replacement, what is the probability that both are blue?"
            ]
        }
        
        role_questions = questions.get(role_type.lower(), questions["hr"])
        if question_index < len(role_questions):
            return role_questions[question_index], False
        else:
            return "Thank you. That completes the questions. I am compiling your interview report...", True

    @staticmethod
    def _get_mock_interview_feedback_data(role_type: str) -> Dict[str, Any]:
        return {
            "overall_score": 82,
            "communication_rating": "Clear articulation, maintained good eye contact (simulated), structures answers using STAR method.",
            "technical_rating": f"Demonstrated solid fundamental understanding of {role_type} concepts. Handled edge cases well.",
            "strengths": [
                "Structured responses logic flow.",
                "Solid grasp of base definitions and engineering terms.",
                "Acknowledges gaps honestly instead of guessing incorrectly."
            ],
            "weaknesses": [
                "Could expand on trade-offs and practical architectural limitations.",
                "Mathematical calculations in aptitude rounds could be accelerated."
            ],
            "improvement_plan": [
                "Practice writing out full system architecture diagrams.",
                "Review algorithmic time/space complexities of common sorting/searching operations.",
                "Read articles about software trade-offs (e.g., CAP Theorem, cache eviction policies)."
            ]
        }
