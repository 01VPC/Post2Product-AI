from flask import Blueprint, request, jsonify
import os
import google.generativeai as genai

chatbot_bp = Blueprint('chatbot', __name__)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

ALLOWED_KEYWORDS = [
    "Instagram", "product", "Amazon", "listing", "e-commerce",
    "optimization", "analytics", "Post2ProductAI", "conversion", 
    "connect", "disconnect", "convert", "edit", "publish", "import",
    "settings", "API", "connections", "product listing", "product details",
    "product listing optimization", "product listing analytics", "product listing conversion",
    "product listing edit", "product listing publish", "product listing import",
    "product listing settings", "product listing API", "product listing connections",
    "product listing conversion", "product listing edit", "product listing publish",
    "product listing import", "product listing settings", "product listing API", "product listing connections",
    "further assistance", "further help", "further information", "further details", "further instructions",
    "further guidance", "further assistance", "further help", "further information", "further details",
    "further instructions", "further guidance", "further assistance", "further help", "further information",
    "further details", "further instructions", "further guidance", "further assistance", "further help",
    "further information", "further details", "further instructions", "further guidance", "further assistance",
    "further help", "further information", "further details", "further instructions", "further guidance",       
]

PREDEFINED_ANSWERS = {
    "what all tasks do you perform": (
        "I can help you with tasks related to converting Instagram posts into Amazon product listings, "
        "optimizing your product listings, tracking analytics, and assisting with e-commerce workflows on the Post2ProductAI platform. "
        "If you have questions about these topics, just ask!"
    ),
    "how do i connect instagram here": (
        "To connect your Instagram account:\n"
        "1. Go to the Instagram section in the app.\n"
        "2. Click on 'Connect Instagram'.\n"
        "3. Authorize the app to access your Instagram account.\n"
        "4. Once connected, you can import your posts and start converting them into product listings!"
    ),
    "how to connect instagram": (
        "To connect your Instagram account:\n"
        "1. Go to the Instagram section in the app.\n"
        "2. Click on 'Connect Instagram'.\n"
        "3. Authorize the app to access your Instagram account.\n"
        "4. Once connected, you can import your posts and start converting them into product listings!"
    ),
    "how do i disconnect instagram": (
        "To disconnect your Instagram account, go to Settings > API Connections and click 'Disconnect Instagram'."
    ),
    "how do i convert a post to a product listing": (
        "After connecting Instagram, go to the Instagram page, select a post, and click 'Convert to Product'. "
        "You can then edit the product details and publish it to Amazon."
    ),
}

def is_allowed_query(message):
    return any(keyword.lower() in message.lower() for keyword in ALLOWED_KEYWORDS)

def get_predefined_answer(message):
    msg = message.strip().lower()
    for prompt, answer in PREDEFINED_ANSWERS.items():
        if prompt in msg:
            return answer
    return None

def ask_gemini(message):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    system_instruction = (
        "You are Ava, the AI assistant for the Post2ProductAI platform. "
        "You ONLY answer questions about converting Instagram posts to Amazon product listings, e-commerce, product listing optimization, analytics, and related workflows. "
        "If a user asks about anything else (including your own capabilities, general AI tasks, or connecting accounts), you MUST reply: "
        "'Sorry, I can only help with Post2ProductAI and product listing related queries.' "
        "Do NOT answer questions outside this scope, even if asked directly."
    )
    chat = model.start_chat(history=[])
    response = chat.send_message([
        {"role": "user", "parts": [system_instruction]},
        {"role": "user", "parts": [message]}
    ])
    text = response.candidates[0].content.parts[0].text
    return text

@chatbot_bp.route('/api/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json()
    user_message = data.get('message')
    if not user_message:
        return jsonify({'reply': "Please enter a message."}), 400
    predefined = get_predefined_answer(user_message)
    if predefined:
        return jsonify({'reply': predefined})
    if not is_allowed_query(user_message):
        return jsonify({'reply': "Sorry, I can only help with Post2ProductAI and product listing related queries."})
    try:
        gemini_reply = ask_gemini(user_message)
        return jsonify({'reply': gemini_reply})
    except Exception as e:
        return jsonify({'reply': "Sorry, I couldn't process your request."}), 500 