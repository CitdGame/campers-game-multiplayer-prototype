# Monetization Analysis – *Campers: Pocket Resort*

> **Version:** 1.0.0
> **Status:** Pre-Launch Analysis / Benchmark
> **Ziel:** Ermittlung des potenziellen Umsatzes pro Spieler (ARPU) auf Basis der implementierten IAP-Struktur, Gem-Ökonomie und Werbefrequenz.

---

## 1. In-App Purchase Struktur (IAP)

### 1.1 Gem-Pakete (Echtgeld → Gems)

Dies sind die vier aktuell implementierten IAP-Tiers im Shop (`DrawerUI.js` → Sektion „GEM STORE"):

| Tier | Name | Preis | Gems | Bonus | Gems / € | Indexierter Wert |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 💎 Pouch of Gems | **$0.99** | 80 | — | 80,8 | Baseline |
| 2 | 💰 Sack of Gems | **$4.99** | 500 | +10% | 100,2 | +24% günstiger |
| 3 | 💎 Chest of Gems | **$9.99** | 1.400 | +25% | 140,1 | +73% günstiger |
| 4 | 👑 Mountain Vault | **$19.99** | 3.600 | +50% | 180,1 | +123% günstiger |

> [!NOTE] Der Wert pro Gem steigt mit dem Tier stark an – ein klassisches **„Whale Incentive"**-Pricing, das Vielspieler zu größeren Käufen incentiviert.

---

## 2. Gem-Verbrauch & Was man bekommt (Gem → Ingame-Wert)

### 2.1 Gem Shop – Kaufoptionen

| Artikel | Gem-Kosten | Was man erhält | Effektiver Echtgeld-Wert (bei Tier-1-Kauf) |
| --- | --- | --- | --- |
| ⏱️ 1h Time Warp | 30 💎 | Sofortiger 1h-Einnahmen-Output | $0.37 |
| ⏳ 4h Time Warp | 80 💎 | Sofortiger 4h-Einnahmen-Output | $0.99 |
| 🌌 24h Mega Warp | 250 💎 | Sofortiger 24h-Einnahmen-Output | $3.09 |
| ⚡ 2x Boost (2h) | 50 💎 | 2× Multiplikator für 2 Stunden | $0.62 |
| 🚀 3x Super Boost (4h) | 120 💎 | 3× Multiplikator für 4 Stunden | $1.48 |
| 🔮 Mythic Crate | 100 💎 | 14–18 Cards + $350–$800 Cash + 2+ Epics | $1.24 |
| 👑 Emperor Vault | 250 💎 | 32–42 Cards + $1.200–$3.000 Cash + 6+ Epics | $3.09 |

> [!TIP] Der **Emperor Vault (250 💎)** ist der teuerste Einzelkauf im Shop – und entspricht exakt dem Preis eines **Mountain Vault IAP** ($19.99 → 3.600 Gems → 14,4× Emperor Vaults). Das setzt den richtigen psychologischen Ankerpunkt für Whalepurchases.

### 2.2 Gem-Sink-Analyse (Wie schnell werden Gems verbraucht?)

Startgems: **25 💎** (kostenlos bei Spielstart)

Gems durch kostenlose Quellen (ohne Kauf):
- Achievements: **10–25 Gems** pro Achievement × 11 = ca. **~165 Gems** über Camp 1
- Events: bis zu **135 Gems** (15 + 35 + 100 von Event-Milestones) pro Event-Zyklus
- **→ F2P-Spieler verdient ca. 300 Gems/Camp** ohne zu zahlen

Gems für sinnvollen Einsatz:
- 1× Mythic Crate (100 💎) + 1× 2h Boost (50 💎) = **150 Gems** → Spieler kommt ~2 Camps gratis aus
- 1× Emperor Vault (250 💎) → erfordert entweder 2+ Camps grinden oder **$1.99–$4.99 IAP**

---

## 3. Werbung (Ad Monetization)

### 3.1 Geplante Ad-Formate

> [!IMPORTANT] Ad-Integration ist noch **nicht im Code implementiert**. Die folgenden Empfehlungen basieren auf dem bestehenden Spieldesign und Branchenstandards für Casual-Idle-Spiele (AdMob / AppLovin / IronSource).

| Format | Trigger | Empfohlene Frequenz | Typischer eCPM (Tier-1) | Ø Dauer |
| --- | --- | --- | --- | --- |
| 🎬 **Rewarded Video** | Freiwillig: „2× Reward", Free Crate Skip, Offline Bonus verdoppeln | Max. 1× alle 3–5 Minuten, pro Aufruf opt-in | $15–$50 | 15–30 Sek. |
| 📱 **Interstitial** | Erzwungen: Camp abgeschlossen, App-Start (nach >5 Min. Pause) | 1× alle 3–5 Camp-Completions, nie häufiger als alle 3 Min. | $8–$20 | 15–30 Sek. |
| 🏷️ **Banner** | Dauerhaft: Unterer Rand (außerhalb der Joystick-Zone) | Permanent | $0.50–$2.00 | Permanent |

### 3.2 Rewarded Ad Einbindungspunkte (Empfehlung)

Folgende Stellen im Spiel sind ideal für opt-in Rewarded Ads:

1. **Free Crate Cooldown überspringen** – statt 90 Minuten warten → Ad schauen → sofort claimen
2. **Offline Earning verdoppeln** – beim Zurückkehren ins Spiel die passive Einnahme 2× nehmen
3. **Campfire Joy Frenzy verlängern** – nach Ablauf der Frenzy-Zeit → Ad → +30s Frenzy
4. **2× Cash Drop** – nächsten Pitch-Checkout verdoppeln durch Ad
5. **Revive / Continue** – wenn Cash für Build Pad nicht reicht → Ad → +$50 Sofortbonus

### 3.3 Ad Revenue-Schätzung pro Spieler

Annahmen:
- Casual Mobile Player, **20 Minuten** Spielzeit/Tag
- Session Länge: ~5–7 Min. pro Session, 3–4 Sessions/Tag
- Rewarded Ads: ~3–4× pro Tag (opt-in bei Crate/Offline)
- Interstitials: ~1–2× pro Tag (Camp-Completion)
- Banner: Aktiv während der Spielzeit

| Ad-Format | Tägliche Views | eCPM | Tagesertrag / Spieler |
| --- | --- | --- | --- |
| Rewarded Video | 3,5 | $25 | **$0.0875** |
| Interstitial | 1,5 | $12 | **$0.018** |
| Banner | 20 Min. (~0.33h) | $1.00 | **$0.00033** |
| **Gesamt/Tag** | | | **~$0.106** |
| **Gesamt/Monat** | | | **~$3.18** |

---

## 4. ARPU-Kalkulation (Average Revenue Per User)

### 4.1 Player-Segmentierung

Typische Verteilung bei einem Casual-Idle-Spiel (Mobile F2P-Benchmark):

| Segment | Anteil | Ø Spend / Monat | Charakteristik |
| --- | --- | --- | --- |
| 🐟 **Non-Payer (F2P)** | 95% | $0 | Nur Werbung, spielt auf Free Gems |
| 🐬 **Minnow (Kleinkäufer)** | 3% | $1–$5 | 1× Pouch ($0.99) oder 1× Sack ($4.99) |
| 🦈 **Dolphin (Mittelkäufer)** | 1.5% | $10–$20 | 1–2× Chest of Gems / Mountain Vault |
| 🐋 **Whale (Großkäufer)** | 0.5% | $30–$100+ | Mehrfach Mountain Vault, regelmäßig |

### 4.2 ARPU-Berechnung (pro Monat)

**Formel:**
```
ARPU = (Ad Revenue × Gesamt-Spieler + IAP Revenue × Zahlende Spieler) / Gesamt-Spieler
```

Beispielrechnung für **1.000 aktive Spieler/Monat**:

| Einnahmequelle | Berechnung | Ergebnis |
| --- | --- | --- |
| Ad Revenue (alle 1.000 Spieler) | 1.000 × $3.18 | **$3.180** |
| IAP – Minnow (30 Spieler) | 30 × $2.50 Ø | **$75** |
| IAP – Dolphin (15 Spieler) | 15 × $14.99 Ø | **$224.85** |
| IAP – Whale (5 Spieler) | 5 × $59.99 Ø | **$299.95** |
| **Gesamt** | | **$3.779.80** |
| **ARPU (monatlich)** | $3.779.80 / 1.000 | **$3.78 / Spieler / Monat** |
| **ARPPU (zahlende Spieler)** | ($75 + $224.85 + $299.95) / 50 | **$11.99 / zahlendem Spieler / Monat** |

### 4.3 ARPU nach Geo-Targeting (Beispiele)

| Region | Ad eCPM-Faktor | IAP-Conversion | Erwarteter Monats-ARPU |
| --- | --- | --- | --- |
| 🇺🇸 USA / Kanada | 1.0× (Baseline) | 2.5% | ~$4.50 |
| 🇩🇪 🇦🇹 🇨🇭 DACH | 0.85× | 2.2% | ~$3.90 |
| 🇬🇧 UK | 0.90× | 2.0% | ~$3.60 |
| 🇧🇷 Brasilien | 0.25× | 0.8% | ~$0.80 |
| 🇮🇳 Indien | 0.15× | 0.4% | ~$0.45 |

---

## 5. Hebel zur ARPU-Optimierung

### 5.1 Sofortmaßnahmen (kurzfristig)

| Maßnahme | Erwarteter ARPU-Effekt |
| --- | --- |
| **Starter Pack** einführen ($1.99 → 250 Gems + $500 Camp Cash), nur 1× kaufbar, prominent nach 1. Camp-Completion | +0.15–0.30 ARPU |
| **Rewarded Ads** für Free Crate Cooldown implementieren | +0.05–0.10 ARPU |
| **„Battle Pass"** – Saisonpass ($4.99/Monat) mit exklusiven Worker-Skins & täglichen Gems | +0.40–0.80 ARPU |

### 5.2 Mittelfristig

| Maßnahme | Erwarteter ARPU-Effekt |
| --- | --- |
| **5. IAP-Tier** hinzufügen: „🏰 Grand Empire Pack" ($49.99 → 10.000 Gems + Epic Worker-Skin) | +0.05–0.20 ARPU (Whale-Zielgruppe) |
| **Offline Earning Ad Doubler** – Rewarded Ad beim App-Start | +0.08–0.15 ARPU |
| **Tägliche Gem-Quests** (Login-Streak, Daily Goals → 5–10 Gems/Tag) | Retention +15%, indirekter ARPU +0.20 |

### 5.3 Preissensitivitäts-Check

```
Mythic Crate: 100 Gems = $1.24 (Tier-1) / $0.70 (Tier-4)
→ Psychologisch günstig: Spieler kauft Tier-2 ($4.99) = 500 Gems = 5× Mythic Crates

Emperor Vault: 250 Gems = $3.09 (Tier-1) / $1.39 (Tier-4)
→ Klarer Whale-Druckmacher: Tier-4 ($19.99) deckt 14 Emperor Vaults – starkes Anchor-Angebot
```

---

## 6. Risiken & Benchmarks

### 6.1 Branchenvergleich (Casual Idle Mobile)

| Spiel | Genre | ARPU/Monat | Conversion Rate |
| --- | --- | --- | --- |
| *Idle Miner Tycoon* | Idle/Mine | $2.50–$4.00 | 2–3% |
| *My Little Universe* | Casual/Idle | $1.80–$3.20 | 1.5–2.5% |
| *Merge Mansion* | Merge/Casual | $4.50–$7.00 | 3–5% |
| *Hay Day* | Farming/Social | $3.00–$5.50 | 2–4% |
| **Campers (Projektion)** | **Idle/Camp Tycoon** | **$3.50–$5.00** | **2–3.5%** |

### 6.2 Kritische Risiken

> [!WARNING]
> - **Retention ist der entscheidende Faktor.** ARPU ist nichts ohne Spieler, die nach Tag 7 noch aktiv sind. D7-Retention von 15–20% ist für diesen ARPU nötig.
> - **Ad-Overload** (>1 Interstitial alle 2 Min.) vernichtet Retention. Lieber weniger Ads, mehr Rewarded.
> - **Zu wenige F2P-Gem-Quellen** können das Gefühl erzeugen, Pay-to-Win zu sein – das schadet langfristig der Retention und den Reviews.

> [!CAUTION]
> Der **Emperor Vault** kostet 250 Gems = fast der gesamte F2P-Vorrat aus einem Camp (ca. 300 Gems). Wenn er zu oft im Shop beworben wird ohne genug Free-Gems, wirkt das als Paywall. Empfehlung: Emperor Vault nur über Events als Reward anbieten, nicht direkt kaufbar im regulären Shop.

---

## 7. Zusammenfassung & Empfehlung

```
Projizierter ARPU:    $3.50–$5.00 / Spieler / Monat
ARPPU:                $10–$15 / zahlenden Spieler / Monat
Ad-Anteil am ARPU:    ~84% (bei 95% F2P-Spielern)
IAP-Anteil am ARPU:   ~16% (bei 5% Conversion Rate)
```

**Top-3-Prioritäten zur ARPU-Verbesserung:**

1. 🎬 **Rewarded Ads implementieren** (Free Crate Skip + Offline Doubler) → größter unmittelbarer Hebel
2. 🎁 **Starter Pack einführen** ($1.99, einmalig) → senkt Kaufschwelle für Erstpayer massiv
3. 📅 **Daily Login Streak** (Gems/Tag) → erhöht D7/D30-Retention → mehr Ad-Impressions & mehr IAP-Wahrscheinlichkeit
