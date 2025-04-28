from chat import get_chatbot_response


chat_history = []

while True:
    user_input = input("You: ")
    if user_input.lower() in ["exit", "quit"]:
        print("Goodbye!")
        break

    # chat_history.append(f"User: {user_input}")

    # conversation_context = "\n".join(chat_history) + "\nBot:"

    response = get_chatbot_response(user_input)

    print(f"Bot: {response}\n")

    chat_history.append(f"Bot: {response}")