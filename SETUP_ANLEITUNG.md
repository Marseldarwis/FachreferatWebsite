# Anleitung zur Einrichtung der Umfrage-Webseite

## 1. Google Tabelle vorbereiten
1. Gehe zu [sheets.new](https://sheets.new), um eine neue Google Tabelle zu erstellen.
2. Gib der Tabelle einen Namen (z. B. "Schul-Umfrage Daten").

## 2. Backend einrichten (Google Apps Script)
1. Klicke in der Tabelle oben im Menü auf **Erweiterungen** > **Apps Script**.
2. Lösche den vorhandenen Code in der Datei `Code.gs` und füge den Inhalt deiner lokalen Datei `Code.gs` ein.
3. Drücke `Strg + S` zum Speichern.

## 3. Skript veröffentlichen (WICHTIG!)
Damit die Webseite Daten senden und empfangen kann, muss das Skript als Web-App veröffentlicht werden.

1. Klicke rechts oben auf den blauen Button **Bereitstellen** > **Neue Bereitstellung**.
2. Wähle beim Zahnrad-Symbol (links) **Web-App** aus.
3. Fülle die Felder wie folgt aus:
   - **Beschreibung**: z. B. "Umfrage Backend"
   - **Ausführen als**: `Mich` (deine E-Mail-Adresse)
   - **Wer hat Zugriff**: `Jeder` (Dies ist wichtig, damit die Webseite ohne Google-Login Daten senden kann)
4. Klicke auf **Bereitstellen**.
5. Du musst den Zugriff autorisieren (klicke auf deinen Account, dann ggf. auf "Erweitert" > "Unsicher fortfahren" - da es dein eigenes Skript ist).
6. Kopiere die **Web-App-URL** (die mit `/exec` endet).

## 4. Webseite verbinden
1. Öffne die Datei `script.js` in diesem Ordner.
2. Suche die Zeile `const SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';`.
3. Ersetze `'YOUR_GOOGLE_SCRIPT_URL_HERE'` mit deiner kopierten Web-App-URL.
4. Mache das Gleiche in der Datei `admin.js`.

## 5. Testen
1. Öffne `index.html` im Browser.
2. Fülle das Formular aus und sende es ab.
3. Öffne `admin.html` (Passwort: `admin`).
4. Prüfe, ob die Daten dort angezeigt werden.
