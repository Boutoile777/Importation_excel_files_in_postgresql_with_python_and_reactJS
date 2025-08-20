import requests


url = "https://www.google.com"

page = requests.get(url)


# Voir le code html source

print(page.content)