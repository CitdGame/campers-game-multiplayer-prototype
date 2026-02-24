# Campers - Multiplayer Prototype

## Spiel starten

```bash
npm start
```

Der Server startet auf `http://localhost:3000`.

## Online spielen mit ngrok

1. **ngrok installieren** (falls noch nicht vorhanden):
   ```bash
   brew install ngrok
   ```

2. **Server starten**:
   ```bash
   npm start
   ```

3. **ngrok tunnel erstellen**:
   ```bash
   ngrok http 3000
   ```

4. **URL teilen**: Kopiere die ngrok URL (z.B. `https://abc123.ngrok-free.app`) und teile sie mit Freunden.

5. **Spiel spielen**: Alle Spieler öffnen die URL, erstellen oder treten einer Lobby bei.

## Spielanleitung

### Spielstruktur
- **Jahr**: 4 Quartale × 3 Runden = 12 Runden
- **Saison**: Quartal 1-2 = Hauptsaison (mehr Gäste), Quartal 3-4 = Nebensaison
- **Ereignisse**: Regen reduziert die Anfragen

### Ressourcen
- 💰 **Geld**: Einnahmen von Gästen
- 📐 **Fläche**: Platz für Assets
- ⚡ **Strom**: Benötigt für Gäste
- 💧 **Wasser**: Benötigt für Gäste

### Aktionen
1. **Fläche kaufen** (+5 für 100€)
2. **Assets bauen**:
   - ⛺ Zelt (50€) - 2 Pers.
   - 🚐 Wohnwagen (150€) - 4 Pers.
   - 🏠 Bungalow (300€) - 6 Pers.
   - ⚡ Generator (200€) - +5 Strom
   - 💧 Wassertank (150€) - +5 Wasser
   - ⚽ Sportplatz (250€) - Für Familien mit Sport-Bedürfnis

3. **Gäste annehmen/ablehnen**

### NPC-Typen
- 🌿 **Hippies**: Wenig anspruchsvoll, niedriges Einkommen
- 👨‍👩‍👧 **Families**: Brauchen oft Sportplatz, mittleres Einkommen
- 💎 **Snobs**: Hoher Strombedarf, hohes Einkommen

### Siegbedingung
Nach 12 Runden gewinnt der Spieler mit den meisten Punkten (Einnahmen).
