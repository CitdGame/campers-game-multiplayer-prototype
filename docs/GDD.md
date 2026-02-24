# Game Design Document – _Campers_

## Executive Summary

**Campers** ist ein rundenbasiertes Online-Multiplayer mit strategischen und wirtschaftlichen Mechaniken. Die Spieler:innen übernehmen die Leitung eines Campingplatzes, verwalten Ressourcen, bauen Schlafplätze aus, managen Gäste und konkurrieren um die meisten Siegespunkte am Ende einer Saison.

- **Genre:** Strategie, Simulation, Deck-Building, Brettspiel
- **Spieleranzahl:** 2–4
- **Dauer:** 70–150 Minuten
- **Alter:** 14+
- **Projektumfang:** Webgame mit Karten-, Token- und Ressourcenmanagement.
- **Ziel:** Entwicklung eines prototypischen Core Games mit Erweiterungspotenzial für Spin-offs (z. B. Familienversion, digitale Umsetzung).
    

## Core Concept
### Concept Statement
„Baue, erweitere und manage deinen Campingplatz, um Gäste zufrieden zu stellen, Einnahmen zu generieren und am Ende die meisten Siegespunkte zu sammeln.“

### Genre(s)
- Brettspiel
- Strategie & Simulation
- Wirtschaftsspiel
- Deck-Building
    

### Target Audience
- Vielspieler:innen mit Vorliebe für Management- und Wirtschaftssimulationen
- Alter 14+
- Gruppen von 2–4 Personen

### Unique Selling Points
- Ungewöhnliches Setting: Campingplatz-Management als Brettspiel
- Mischung aus Ressourcenverwaltung, Deck-Building und Gäste-Management
- Variable Gästetypen (Familien, Hippies, Snobs) mit unterschiedlichen Anforderungen
- Flexibles Spielfeld mit Ausbau- und Erweiterungsmechaniken
- Hoher Wiederspielwert durch NPC-Effekte und variierende Strategien

## Main Features

### Story
Kein narratives Kampagnenspiel – stattdessen thematischer Rahmen: _„Wer schafft es, den attraktivsten Campingplatz der Saison aufzubauen?“_

### Gameplay
Rundenbasiertes Ressourcen- und Gäste-Management.  
Eine Runde = ein Monat → 12 Runden = ein Spieljahr.

#### Game Tools
- Spielfeld mit Pool-Bereich (Ressourcen & Kartenstapel) und individuellen Spielplätzen
- Kartenstapel: NPC-Karten, Gemeinschaftsflächen-Karten, Asset-Karten
- Tokens & Marker: Wasser, Strom, Geld, Flächen-Erweiterungen
- Shop-Register für Assets

#### Core Game Loops
1. Ziehe NPC-Karten (potenzielle Gäste)
2. Führe bis zu 3 Aktionen aus:
    - **Bauen**: Assets errichten oder upgraden
    - **Kaufen**: Ressourcen erwerben
    - **Gästemanagement**: Buchungen annehmen, Gäste platzieren oder entfernen
3. Am Rundenende: Einkommen durch aktive Gäste erhalten

##### Mechanics
- Ressourcenmanagement: Fläche, Wasser, Strom
- Deck-Building: Gäste & NPC-Effekte
- Infrastruktur-Ausbau: Schlafplätze & Gemeinschaftsflächen
- Konkurrenzmechaniken: Limitierte Assets und Ressourcen → strategische Interaktion

#### Objectives and Progression
- **Kurzfristig:** Ressourcen sichern, Gäste annehmen, Infrastruktur erweitern
- **Mittelfristig:** Gästezufriedenheit maximieren, Einkommen steigern
- **Langfristig:** Siegbedingungen erfüllen (Siegespunkte aus Geld + Gäste-Punkten)



### Visual Style
**Design Pillar:** Humorvolle, zugängliche Simulation mit leicht ironischem Blick auf Camping-Kultur.
- **Game Elements (Worldbuilding):** Campingplatz-Atmosphäre, Gästetypen als Archetypen (Familien, Hippies, Snobs), Ausbauoptionen (Zelt bis Luxus-Bungalow), Gemeinschaftsflächen (Sport, Lagerfeuer, Angeln).
    
- **Assets:**
    
    - Cartoon-Illustrationen für Karten & Board
        
    - Leichte, helle Farbpalette (Natur, Sommer)
        
    - Sound-Effekte optional für digitale Adaption (Vogelgezwitscher, Wasser, Gitarrenmusik)
        

---

## Product Design

### Design Scope

- Basisversion: 1 Brett, 160 NPC-Karten, 8 Gemeinschaftsflächen-Karten, 16 Flächen-Erweiterungen, diverse Tokens
    
- Erweiterungspotenzial: zusätzliche Gästetypen, Events, Festival-Module, digitale Adaption
    

### Format

Physisches Brettspiel, optional mit Erweiterungsboxen.

### Player Definition

- Rollen: Campingplatz-Manager
    
- Ziel: Am Ende des Spieljahres die meisten Siegespunkte
    

### Player Experience and Game POV

- Spieler:innen erleben Spannung durch Ressourcenknappheit und Konkurrenz
    
- Humorvolle Identifikation mit Gästen & Situationen
    
- Mischung aus strategischer Planung und taktischen Reaktionen auf gezogene NPC-Karten
    

### Monetization

- Grundspiel (Retail)
    
- Erweiterungen: Neue Gästetypen, zusätzliche Assets, Event-Karten
    
- Lizenzierbar als digitale Version oder Spin-off-Kartenspiele
    