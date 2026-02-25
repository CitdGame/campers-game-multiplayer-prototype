# Game Design Document – _Campers_

## Executive Summary
**Campers** ist ein rundenbasiertes Online-Multiplayer mit strategischen und wirtschaftlichen Mechaniken. Die Spieler:innen übernehmen die Leitung eines Campingplatzes, verwalten Ressourcen, bauen Schlafplätze aus, managen Gäste und konkurrieren um die meisten Siegespunkte am Ende einer Saison.

- **Genre:** Strategie, Simulation, Deck-Building 
- **Spieleranzahl:** 2–8
- **Dauer:** 70–150 Minuten
- **Alter:** 14+
- **Projektumfang:** Webgame mit Karten-, Token- und Ressourcenmanagement.
- **Ziel:** Entwicklung eines prototypischen Core Games mit Erweiterungspotenzial für Spin-offs (z. B. Familienversion, digitale Umsetzung).
    
## Core Concept
### Concept Statement
„Baue, erweitere und manage deinen Campingplatz, um Gäste zufrieden zu stellen, Einnahmen zu generieren und am Ende die meisten Siegespunkte zu sammeln.“    

### Player Experience and Game POV
- Ziel: Am Ende des Spiels die meisten Siegespunkt haben
- Spieler:innen erleben Spannung durch Ressourcenknappheit und Konkurrenz
- Humorvolle Identifikation mit Gästen & Situationen
- Mischung aus strategischer Planung und taktischen Reaktionen auf gezogene NPC-Karten

## Main Features

### Story
Das Spieljahr (12 Runden) wird in 4 Quartale à 3 Runden unterteilt 

| Quartal | Saison      | Ereignisse   | Gästeaufkommen           |
| ------- | ----------- | ------------ | ------------------------ |
| Q1      | Nebensaison | 1 Ereignis   | -1 NPC-Karte pro Spieler |
| Q2      | Hauptsaison | 2 Ereignisse | +1 NPC-Karte pro Spieler |
| Q3      | Hauptsaison | 2 Ereignisse | +1 NPC-Karte pro Spieler |
| Q4      | Nebensaison | 1 Ereignis   | -1 NPC-Karte pro Spieler |

Dramaturgischer Verlauf: Aufbau → Boom → Peak → Abkühlung

Dieses System erzeugt:
- Strategiewechsel im Spielverlauf
- Zyklische Ressourcenknappheit
- Story-Momente am Tisch

#### Ereigniskarten-System
Grundprinzip: Ereignisse werden zu Beginn eines Quartals aufgedeckt
- Sie gelten für 3 Runden
- Sie betreffen alle Spieler gleichzeitig
- Sie verändern Nachfrage, Ressourcen oder Asset-Werte

Modularer Aufbau:
- X Basiskarten
- Y Wetterkarten-Modul
- Z Wirtschafts-/Trendkarten-Modul
- W High-Interaction-Karten (Abstimmungen)

##### Entwicklungs-Ereignisse (siehe 0226_Erweiterung für mehr) 
- Dauerregen:
    - Es regnet in Strömen und für diese Saison ist kein Ende in sicht..
    Effekt:
        - NPCs pro Zug halbieren sich
- Tourismusboom:
    - Eure Region wurde zum Weltkulturerbe ausgerufen!
    Effekt:
        - NPCs pro Zug verdoppeln sich
- Sturmwarnung:
    - Das Aufeinandertreffen von Hoch- & Tiefdruckgebieten sorgt für heftige Unwetter in den Nächten.
    Effekt:
        - NPCs wollen nicht in Zelten untergebracht werden
- Festival:
    - In eurer Region findet ein Festival statt
    Effekt:
        - NPCs wollen bevorzugt in Zelten untergebracht werden
- Hitzewelle
- Kälteeinbruch
- Dürre
- Wirtschaft
- Wirtschaftskrise
- Luxus-Trend
- Minimalismus-Trend
- Regionale Events
- Festival in der Nähe
- Sportgroßevent
- Angelwettbewerb
- Indie-Musik-Woche
- Soziale Dynamik
- Influencer-Hype
- Online-Shitstorm
- Campingplatz-Auszeichnung
- Wildtiere auf dem Platz


### Gameplay
- Rundenbasiertes Ressourcen- und Gäste-Management.

#### Core Game Loops
1. Am Anfang eines Zuges wird der NPC-Pool aufgefüllt (potenzielle Gäste)
2. Führe bis zu X Aktionen aus:
    - **Bauen**: Assets errichten oder upgraden
    - **Kaufen**: Ressourcen erwerben
    - **Gästemanagement**: Buchungen annehmen, Gäste platzieren oder entfernen
3. Am Rundenende: Einkommen durch aktive Gäste erhalten

<img width="894" height="680" alt="Bildschirmfoto 2026-02-24 um 18 47 44" src="https://github.com/user-attachments/assets/d4c6deb0-9745-4553-b04e-936323af41ea" />

#### Game Feature
![Campers (2)](https://github.com/user-attachments/assets/eb6180d2-7725-4baa-85ca-18f7c898e270)

##### NPCs:
mandatory:
- Namen
- Typ // wie bisher (Hippies, Familien & Snobs)
- angefragter Zeitraum	- Anzahl Gäste
- Einkommen
- Bedürfnisse (pro Nacht):
-- Anzahl Schlafplätze
-- Strombedarf
-- Wasserbedarf
- Sonderbedürfnisse:
-- bestimmte Assets müssen auf dem Zeltplatz vorhanden sein

##### Assets:
Assets als Interface mit den Werten:
- Preis
- Flächenbedarf
3 Arten von Assets:
- Buchbare Assets:
	- Schlafplätze:
        - Zelt (upgradebar auf Glamping-Zelt)
        - Wohnwagen
        - Bungalow (upgradebar auf Luxus-Bungalow)
- Ressourcen generierende Assets:
    - Bisher Stromgenerator & Wassertank
- Sonderbedürfnisse erfüllende Assets:
    - Sportplatz (Sonderbedürfnis mancher Familien)
    - Lagerfeuerstelle (Sonderbedürfnis mancher Hippies & Familien)
    - Sauna (Sonderbedürfnis mancher Snobs)
    - Open-Air Bühne (Sonderbedürfnis mancher Hippies & Snobs)

###### NPC-Schlafplatz-Logik:
**Hippies** können Anfragen stellen für: Zelte, Wohnwägen oder Bungalows.
**Familien** können Anfragen stellen für: Zelte, Wohnwägen oder Bungalows.
**Snobs** können Anfragen stellen für: Glamping-Zelte, Bungalows oder Luxus-Bungalows.

##### Ressourcen:
Aufgeteilt in kaufbare (Fläche) & generierbare (Geld, Strom & Wasser)

Spieler können:
- Mit ausreichend Geld: 	
    - eine Fläche kaufen und die gesamt Fläche ihres Campingplatzes vergrößern.
- Mit ausreichend Geld & Fläche: 
    - Einen der 3 Asset typen kaufen & platzieren.
- NPC Anfragen sehen & diese, wenn sie die Bedürfnisse erfüllen können annehmen & einem den Bedürfnissen entsprechenden Schlafplatz zuweisen. Oder sie ablehnen.



    
