

def read_prompt_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except UnicodeDecodeError:
        print("Error reading the file. Please check the file encoding.")
        return ""

def save_prompt(file_path, content):
    print("saving prompt!")
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            print("opened file!")
            file.write(content)
        print(f"Prompt successfully saved to {file_path}")
    except Exception as e:
        print(f"Error saving the prompt: {e}")

DEFUALT_DIRECT_LLM_PROMPT = read_prompt_file("./prompts/default/DEFUALT_DIRECT_LLM_PROMPT.txt")
DEFAULT_LLM_QUERY_TOOL_DESCRIPTION = read_prompt_file("./prompts/default/DEFAULT_LLM_QUERY_TOOL_DESCRIPTION.txt")
