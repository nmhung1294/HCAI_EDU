from freedictionaryapi.clients.sync_client import DictionaryApiClient
words = ['Cumulative', 'Dog', 'Cat']
with DictionaryApiClient() as client:
    for word in words:
        try:
            parser = client.fetch_parser(word)
            meaning = {
                'Definitions': [v for v in parser.get_all_definitions() if v],
                'Synonyms': [v for v in parser.get_all_synonyms() if v],
                'Examples': [v for v in parser.get_all_examples() if v],
            }

            parts = []
            for key, values in meaning.items():
                value_str = '; '.join(values) if values else 'None'
                parts.append(f"{key}: {value_str}")

            final_str = f"Word: {parser.word.word} | " + ' | '.join(parts)
            print(final_str)

        except Exception as e:
            print(f"Word: {word} | Error: {e}")