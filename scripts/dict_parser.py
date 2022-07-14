import json
import sys

if __name__ == "__main__":
    input_file = sys.argv[-2]
    output_file = sys.argv[-1]

    with open(input_file, 'r', encoding="utf8") as dict_file:
        full_dict = json.load(dict_file)

    filtered_dict = []

    for entry in full_dict:
        row = {
            "id": entry['ent_seq'][0],
            "reading": entry['r_ele'][0]['reb'][0],
            "meaning": entry['sense'][0]['gloss'][0] if 'gloss' in entry['sense'][0] else "",
            "kanji": entry['k_ele'][0]['keb'][0] if 'k_ele' in entry else ""
        }

        filtered_dict.append(row)

    with open(output_file, 'w', encoding="utf8") as output_file:
        json.dump(filtered_dict, output_file, ensure_ascii=False)
