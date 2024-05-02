# Setup
Klone die repository, geh in den Ordner und für `npm install` aus

Danach erstelle eine `.env` Datei im selben Verzeichnis, im dem auch die `app.js` liegt.
Kopiere dann den folgenden Inhalt hinein:

PORT=8080<br/>
DATABASE=mongodb://127.0.0.1:27017/wallpaper<br/>
SECRET=7e247dbe-482a-418c-92b8-b5a0ebc509f6<br/>
PASSWORD_DEFAULT_USER=john07<br/>

Um die Datenbank zu befüllen führe `node seeds/index.js`aus.
Danach gib `node start.js` in die Konsole ein um den Server zu starten.