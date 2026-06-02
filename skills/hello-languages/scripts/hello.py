#!/usr/bin/env python3
"""
Greet in 4 random languages.
"""

import random

HELLOS = {
    "Spanish": "Hola",
    "French": "Bonjour",
    "German": "Hallo",
    "Italian": "Ciao",
    "Portuguese": "Olá",
    "Japanese": "こんにちは (Konnichiwa)",
    "Mandarin": "你好 (Nǐ hǎo)",
    "Korean": "안녕하세요 (Annyeong)",
    "Arabic": "مرحبا (Marhaba)",
    "Hindi": "नमस्ते (Namaste)",
    "Russian": "Привет (Privet)",
    "Polish": "Cześć",
    "Turkish": "Merhaba",
    "Dutch": "Hallo",
    "Swedish": "Hej",
    "Norwegian": "Hallo",
    "Danish": "Hej",
    "Finnish": "Hei",
    "Greek": "Γεια (Yia)",
    "Czech": "Ahoj",
    "Hungarian": "Halló",
    "Romanian": "Bună",
    "Thai": "สวัสดี (Sawasdee)",
    "Vietnamese": "Xin chào",
    "Indonesian": "Halo",
    "Tagalog": "Kumusta",
    "Hebrew": "שלום (Shalom)",
    "Swahili": "Jambo",
    "Afrikaans": "Hallo",
    "Icelandic": "Halló",
}

def main():
    selected = random.sample(list(HELLOS.items()), 4)
    
    print("👋 Hello in 4 random languages:\n")
    for language, greeting in selected:
        print(f"  {greeting:30} ({language})")
    print()

if __name__ == "__main__":
    main()
