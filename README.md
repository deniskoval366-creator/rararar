# SHAZAY — Ukrainian landing page (проста структура для GitHub)

Мінімалістичний, люксовий односторінковий сайт для бренду догляду за
волоссям SHAZAY, локалізований українською мовою.

Ця версія навмисно **без підпапок** — усі файли лежать в одній теці,
щоб їх можна було просто перетягнути в GitHub через веб-інтерфейс
("Add file → Upload files") без ризику, що вкладені папки загубляться.

## Структура

```
shazay-ua/
├── index.html
├── style.css
├── main.js
├── hero-spray.jpg, leave-in-bed.jpg, conditioner-cream.jpg, ... (13 фото)
└── README.md
```

## Розгортання на GitHub Pages

1. Створіть репозиторій на GitHub.
2. **Add file → Upload files** — перетягніть усі файли з цієї теки
   одразу (не саму теку, а її вміст).
3. Settings → Pages → Branch: `main`, Folder: `/ (root)` → Save.
4. Через кілька хвилин сайт буде на
   `https://<акаунт>.github.io/<репозиторій>/`.

## Локальний перегляд

Відкрийте `index.html` у браузері, або підніміть сервер:

```bash
python3 -m http.server 8000
```
