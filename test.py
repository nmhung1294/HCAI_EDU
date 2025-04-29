from models.chat import get_chatbot_response


chat_history = []
# #
# response = get_chatbot_response("Làm sao để có thể viết được Writting task 1 trong IELTS")
# response = get_chatbot_response("Làm sao để có thể viết được Writting task 1 trong IELTS")
# print(response)
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