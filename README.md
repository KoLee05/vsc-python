Projekt neve: Feladat Rendező

Projektleírás:

A Feladat Rendező egy egyszerű, de hatékony webalapú feladatkezelő és időmenedzsment alkalmazás, amely egyéni felhasználók számára készült. Célja, hogy segítse a felhasználókat a napi, heti vagy hosszabb távú teendőik átlátható szervezésében és priorizálásában.

A rendszer lehetőséget nyújt feladatok létrehozására, szerkesztésére, címkézésére, határidő megadására, valamint azok különböző nézetekben történő megjelenítésére (például napi, heti naptár vagy lista nézet). A felület egyszerű, reszponzív és felhasználóbarát lesz, modern UI/UX elvek mentén tervezve.


Célkitűzések:


Egyszerű, letisztult webalkalmazás, amely segíti a felhasználót teendői rendszerezésében

Átlátható, reszponzív felhasználói felület asztali nézetre

Sötét világos téma váltás

Időalapú rendezés (dátum, határidő), címkék és státuszok kezelése

Adatbázis-alapú háttértárolás a felhasználói feladatokhoz

Későbbi bővíthetőség (pl. értesítések, naptárszinkron)


Tervezett technológiai stack:


Backend: Python (FastAPI)

Frontend: React.js, Tailwind CSS

Adatbázis: SQLite3

Funkcionalitások:

Új feladat létrehozása (név, leírás, határidő, státusz)

Feladatok szerkesztése és törlése

Lista- és naptárnézet

Címkék és kategóriák hozzárendelése

Letisztult, reszponzív felhasználói felület


Későbbi bővítési lehetőségek:


Regisztráció és bejelentkezés

E-mail vagy push értesítések közelgő határidőkről

Drag & drop feladatátmozgatás

Feladatmegosztás más felhasználókkal

Napi statisztika / dashboard


Telepítési útmutató:

1. Hozzunk létre egy üres mappát valahol a saját gépen.
2. Futtassuk a mappában az alábbi parancsot: ```git clone https://github.com/KoLee05/vsc-python/```
4. Hozzunk létre egy python virtuális környezetet: ```python -m venv venv```
5. Aktiváljuk a virtuális python környezetet: ```venv/Scripts/activate.bat``` -- Amennyiben a paracs windows környezetben nem fut le, futtassuk kézzel az "activate.bat" fájlt
6. Telepítsük a 2 szükséges pip modult: ```pip install fastapi, uvicorn```
7. Lépjünk be a backend mappájába: ```cd backend```
8. Futtassuk az uvicorn környezetet: ```uvicorn ToDoList:app --reload```
9. Egy új terminálban lépjünk be a frontend mappájába: ```cd frontend```
10. Telepítsük a szükséges node modulokat: ```npm install```
11. Futtassuk a frontend szervert: ```npm run dev```
12. Lépjünk fel a ```http://localhost:5173/``` oldalra az alkalmazás eléréséhez
