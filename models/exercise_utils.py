import os
import json
import random
import re
from datetime import datetime
from typing import List, Dict
from fastapi import HTTPException

# Constants
EXERCISE_HISTORY_DIR = os.path.join("models", "exercise_history")
os.makedirs(EXERCISE_HISTORY_DIR, exist_ok=True)

# Story templates
STORY_TEMPLATES = [
    """
    The Research Project

    In a {word1} laboratory, Dr. Sarah {word2} her team's findings. The project had {word3} many challenges, but their {word4} never wavered. After months of {word5} work, they finally {word6} a breakthrough. Their research {word7} the way we understand {word8}, and the results were truly {word9}. The team's ability to {word10} complex data was key to their success.
    """,
    """
    The Business Innovation

    The startup company {word1} a new approach to {word2} market trends. Their team {word3} various strategies before {word4} the perfect solution. The CEO's {word5} vision {word6} the company's success. They {word7} their findings in a way that {word8} the industry. The project's {word9} impact {word10} their reputation in the market.
    """,
    """
    The Environmental Initiative

    The environmental group {word1} to {word2} the effects of climate change. They {word3} data from multiple sources to {word4} their findings. The team's {word5} approach {word6} significant results. Their work {word7} the community's understanding of {word8}, and the project's {word9} success {word10} their commitment to the cause.
    """,
    """
    The Educational Journey

    The student {word1} to {word2} the complex subject matter. Through {word3} study and {word4} practice, they {word5} their understanding. The teacher's {word6} guidance {word7} the learning process. Their {word8} efforts {word9} in academic success, and the experience {word10} their future career path.
    """,
    """
    The Cultural Exchange

    The international program {word1} to {word2} cultural understanding. Participants {word3} their experiences while {word4} new perspectives. The program's {word5} activities {word6} meaningful connections. Their {word7} approach {word8} the way people view {word9}, and the impact {word10} lasting relationships.
    """
]

def extract_vocabulary(text: str) -> List[str]:
    """Extract vocabulary words from text using multiple patterns."""
    vocabulary = set()
    
    # Pattern 1: Words marked with **
    vocabulary.update(re.findall(r'\*\*([^*]+)\*\*', text))
    
    # Pattern 2: Words in quotes with definitions
    vocabulary.update(re.findall(r'"([^"]+)"\s*\(([^)]+)\)', text))
    
    # Pattern 3: Words followed by a dash and definition
    vocabulary.update(re.findall(r'([A-Za-z]+)\s*-\s*([^.\n]+)', text))
    
    # Pattern 4: Words in lists with definitions
    vocabulary.update(re.findall(r'•\s*([A-Za-z]+):\s*([^.\n]+)', text))
    
    # Clean and filter vocabulary
    cleaned_vocabulary = []
    for word in vocabulary:
        if isinstance(word, tuple):
            word = word[0]  # Take the word part from tuples
        word = word.strip().lower()
        if len(word) > 2 and word.isalpha():  # Filter out short words and non-alphabetic
            cleaned_vocabulary.append(word)
    
    return list(set(cleaned_vocabulary))  # Remove duplicates

def generate_fill_in_blank_question(word: str) -> dict:
    """Generate a fill-in-the-blank question for a given word."""
    # Dictionary of word definitions and example sentences
    word_contexts = {
        "implement": {
            "definition": "to put a plan or system into operation",
            "examples": [
                "The company plans to _____ the new software next month.",
                "We need to _____ these changes carefully.",
                "The government will _____ the new policy in January."
            ]
        },
        "analyze": {
            "definition": "to examine something in detail",
            "examples": [
                "Scientists will _____ the data from the experiment.",
                "Let's _____ the results of the survey.",
                "The team needs to _____ the market trends."
            ]
        },
        "evaluate": {
            "definition": "to assess or judge something",
            "examples": [
                "Teachers must _____ students' performance.",
                "We need to _____ the effectiveness of the program.",
                "The committee will _____ all applications."
            ]
        },
        "synthesize": {
            "definition": "to combine different elements into a whole",
            "examples": [
                "The research aims to _____ information from various sources.",
                "Students must _____ the key points in their essays.",
                "The report will _____ findings from multiple studies."
            ]
        },
        "demonstrate": {
            "definition": "to show or prove something",
            "examples": [
                "The experiment will _____ the theory.",
                "Please _____ how to use the new software.",
                "The results _____ the effectiveness of the treatment."
            ]
        }
    }

    # Get context for the word or use default
    context = word_contexts.get(word.lower(), {
        "definition": "to use or apply something",
        "examples": [
            f"The team will _____ the new strategy.",
            f"We need to _____ this approach carefully.",
            f"The project will _____ these changes."
        ]
    })

    # Generate question with definition and example
    question = {
        "text": f"Word: {word}\nDefinition: {context['definition']}\n\nComplete the sentence:\n{random.choice(context['examples'])}",
        "options": [word, f"not_{word}", f"anti_{word}", f"pre_{word}"],
        "correct_answer": word,
        "explanation": f"The word '{word}' means {context['definition']}. In this context, it is the most appropriate choice to complete the sentence."
    }
    return question

def generate_story_gap_exercise(vocabulary: List[str]) -> dict:
    """Generate a story with gaps for vocabulary practice."""
    # Select a random story template
    story_template = random.choice(STORY_TEMPLATES)
    
    # Fill in the story with the vocabulary
    story = story_template
    for i, word in enumerate(vocabulary, 1):
        story = story.replace(f"{{word{i}}}", f"_____")
    
    # Create hints for each gap
    hints = []
    for word in vocabulary:
        if word.endswith('ing'):
            hints.append(f"Verb in present continuous form")
        elif word.endswith('ed'):
            hints.append(f"Verb in past tense")
        elif word.endswith('s'):
            hints.append(f"Noun in plural form or verb in third person")
        else:
            hints.append(f"Word related to {word}")
    
    return {
        "story": story,
        "gaps": vocabulary,
        "hints": hints,
        "correct_answers": vocabulary,
        "title": "Complete the Story",
        "instructions": "Fill in the blanks with the appropriate words from the vocabulary list. Pay attention to the context and grammar of each sentence."
    }

def save_exercise_history(user_id: str, exercise_data: dict):
    """Save exercise history to a file."""
    user_history_file = os.path.join(EXERCISE_HISTORY_DIR, f"{user_id}_history.json")
    
    # Load existing history
    if os.path.exists(user_history_file):
        with open(user_history_file, 'r') as f:
            history = json.load(f)
    else:
        history = []
    
    # Add new exercise
    exercise_data['timestamp'] = datetime.now().isoformat()
    history.append(exercise_data)
    
    # Save updated history
    with open(user_history_file, 'w') as f:
        json.dump(history, f, indent=2)

def get_exercise_history(user_id: str) -> List[dict]:
    """Get user's exercise history."""
    user_history_file = os.path.join(EXERCISE_HISTORY_DIR, f"{user_id}_history.json")
    if not os.path.exists(user_history_file):
        return []
    
    with open(user_history_file, 'r') as f:
        history = json.load(f)
    
    return history

def check_answers(user_id: str, exercise_id: str, answers: Dict[str, str]) -> dict:
    """Check user's answers for an exercise."""
    # Load exercise history
    user_history_file = os.path.join(EXERCISE_HISTORY_DIR, f"{user_id}_history.json")
    if not os.path.exists(user_history_file):
        raise FileNotFoundError("Exercise not found")
    
    with open(user_history_file, 'r') as f:
        history = json.load(f)
    
    # Find the exercise
    exercise = next((ex for ex in history if ex["exercise_id"] == exercise_id), None)
    if not exercise:
        raise FileNotFoundError("Exercise not found")
    
    # Check answers
    results = {
        "fill_in_blank": [],
        "story_gap": []
    }
    
    # Check fill-in-blank answers
    for i, question in enumerate(exercise["questions"]):
        user_answer = answers.get(f"fill_in_blank_{i}")
        is_correct = user_answer == question["correct_answer"]
        results["fill_in_blank"].append({
            "question": question["text"],
            "user_answer": user_answer,
            "correct_answer": question["correct_answer"],
            "is_correct": is_correct,
            "explanation": question["explanation"]
        })
    
    # Check story gap answers
    for i, word in enumerate(exercise["story_gap"]["gaps"]):
        user_answer = answers.get(f"story_gap_{i}")
        is_correct = user_answer == word
        results["story_gap"].append({
            "gap": i + 1,
            "user_answer": user_answer,
            "correct_answer": word,
            "is_correct": is_correct
        })
    
    # Calculate score
    total_questions = len(results["fill_in_blank"]) + len(results["story_gap"])
    correct_answers = sum(1 for q in results["fill_in_blank"] if q["is_correct"]) + \
                    sum(1 for q in results["story_gap"] if q["is_correct"])
    score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    
    return {
        "results": results,
        "score": score,
        "total_questions": total_questions,
        "correct_answers": correct_answers
    }

def generate_practice_questions(vocabulary: List[str], question_type: str = "fill_in_blank") -> dict:
    """Generate practice questions based on vocabulary."""
    try:
        if question_type == "fill_in_blank":
            questions = [generate_fill_in_blank_question(word) for word in vocabulary]
            return {"questions": questions}
        elif question_type == "story_gap":
            story = generate_story_gap_exercise(vocabulary)
            return {"questions": [story]}
        else:
            raise HTTPException(status_code=400, detail="Invalid question type")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_random_questions(count: int = 5) -> dict:
    """Generate random practice questions."""
    try:
        # For now, just return fill-in-blank questions
        words = ["implement", "analyze", "evaluate", "synthesize", "demonstrate"]
        questions = [generate_fill_in_blank_question(random.choice(words)) for _ in range(count)]
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 