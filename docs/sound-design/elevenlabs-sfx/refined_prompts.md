# ElevenLabs SFX — Refined Prompt Roster
## ProtoFusionGirl | Harmonic Engine Sound Design

---

## Part 1: Why the Original Prompts Were Wrong (and What ElevenLabs Actually Responds To)

### The Model's Training Reality

ElevenLabs' SFX model is a **generative synthesis model**, not a sample retrieval system. It learned from professionally labeled audio metadata — Foley libraries, film SFX catalogs, and game audio databases. That training data speaks a very specific language: **physical, material, spatial, and dynamic**. It describes sounds the way a Foley artist would describe a recording session, not the way a writer would describe a feeling.

This is the root of why the original prompts fail in several ways.

---

### What Was Wrong in the Original Prompts

#### ❌ Duration specs embedded in text
> `"...pure sine resonance, 0.8 seconds"`

Duration is a **separate API parameter** (`duration_seconds`). Writing it in the prompt text does nothing — the model ignores it entirely. Remove all duration specs from prompts. Set duration in the UI or API.

#### ❌ "Loopable" as a prompt instruction
> `"...2.0 seconds, loopable"`

The word "loopable" in a text prompt does not instruct the model to produce a loop-friendly sound. For loops, enable `loop=True` in the API/UI *and* restructure the prompt to describe **states, not events**. A loopable prompt describes a condition that is already happening, not something that starts or ends. "Steady," "continuous," "constant," "unvarying" are the right words.

#### ❌ Game-world jargon the model has never seen
> `"UL glyph awakening"`, `"PsiNet handshake tone"`, `"ley line energy"`, `"node stability"`, `"Beu lifecycle"`, `"Base-12 Harmonic Tonality"`

The model has **zero training data** for ProtoFusionGirl lore. These phrases are meaningless to it. When it encounters them, it either ignores them or makes an unpredictable guess. Every piece of game-specific language must be translated into a physical, acoustic, or emotional description that the model has encountered before.

#### ❌ Abstract metaphors
> `"like a seed cracking open"`, `"yearning quality"`, `"threshold feeling"`, `"the sound of potential"`

These are beautiful descriptions for humans. They are noise to the model. Replace with the physical sound that metaphor evokes: a seed cracking open → "a single soft high-frequency crystalline snap, delicate and brief." That's what actually generates the right output.

#### ❌ Musical interval names in an SFX context
> `"minor third interval"`, `"tritone dissonance"`, `"perfect fifth bell interval"`

These terms come from music theory. The SFX model's handling of them is unreliable — they might work, they might not, and results vary. More reliable: describe the **perceptual quality** of the interval. A tritone isn't "a tritone" — it's "two tones that clash maximally, deeply unsettling, the most dissonant possible pairing." That language is in the training data.

#### ❌ Adjective dumps instead of physical pictures
> `"Mysterious minor sixth chime, shimmering overtones, slightly alien, wonder-evoking, 0.9 seconds"`

Seven descriptors in a row, none of them grounded in physical reality. The model latches onto the first few and ignores the rest. Every adjective should be attached to a **physical phenomenon**, not floating free. "Shimmering overtones" → what is shimmering? A bowed glass rim shimmers. A struck bell shimmers. Specifying the source makes the shimmer come out right.

---

### What ElevenLabs Actually Speaks

**The optimal prompt structure:**
```
[Sound source + material] + [playing method/action] + [acoustic environment] + [dynamic arc] + [perceptual/emotional quality] + ["professionally recorded sound effects foley"]
```

The final meta-tag "professionally recorded sound effects foley" is a documented community trick that biases the model toward cleaner, more production-ready output — it matches the quality cues in the training data's best-labeled recordings.

**For one-shots:** Describe the **moment** — sharp attack, clear decay, single event.
**For loops:** Describe the **condition** — already happening, steady, continuous, no beginning or end implied.

**Verbosity means physical completeness**, not more adjectives. One precise sentence beats six vague ones:
- BAD: `"crystal tone, ethereal, alien, mysterious, sci-fi, shimmering"`
- GOOD: `"Crystal wine glass rim slowly bowed with a moistened finger, producing a continuous pure high-register tone with gentle harmonic shimmer, recorded in a small stone room with moderate reverb"`

---

### Reading the Duration and Loop Columns

Each sound entry shows:

```
⏱ Xs   — set this as duration_seconds in the ElevenLabs UI or API
🔁 ON   — enable Loop mode in the UI / loop=True in the API
🔁 OFF  — one-shot; do NOT enable Loop mode
```

Loop mode does two things: it informs the generation model to produce a texture with a clean loop point, and it enables seamless playback looping in the player. Always set it to ON for any ambient or sustained background texture. Duration for loops should be long (15–22s) so the loop point falls in a natural lull in the texture.

---

## Part 2: Refined Prompts

*All game jargon replaced with physical/acoustic equivalents.*
*"Professionally recorded sound effects foley" appended to all.*

---

### A. Harmonic Tones (`public/audio/harmonic/`)
*The 12 emotional angle tones. All are one-shots — struck or bowed instruments with natural decay.*
*All tones: 🔁 OFF*

---

**tone_0 — Stillness / Root (Unison)**
⏱ 3.0s | 🔁 OFF
- v1: `Tibetan crystal singing bowl struck gently with a padded mallet, single sustained pure note in the high register, minimal overtones, very long resonating decay, recorded in a small stone room with soft reverb, completely still and meditative, professionally recorded sound effects foley`
- v2: `Glass tuning fork struck against a wooden surface, single pure high-frequency tone, clean fundamental with almost no harmonics, long undisturbed sustain, anechoic recording, clinical purity, professionally recorded sound effects foley`
- v3: `Large crystal resonator bowl rubbed slowly at its rim, building to a single stable sustained pitch, low-to-mid register, smooth and unvarying, gentle room reverb, deeply grounded and still, professionally recorded sound effects foley`

---

**tone_1 — Tension / Dissonance (near-unison beating)**
⏱ 3.0s | 🔁 OFF
- v1: `Two crystal wine glasses struck simultaneously, tuned fractionally apart so their frequencies interfere, creating an audible wavering beating pattern at roughly 4Hz, high register, long sustain, the interference producing a subtle but persistent unease, small reverberant room, eerie and unsettling, professionally recorded sound effects foley`
- v2: `Two glass tuning forks vibrating simultaneously, slightly mismatched in pitch, their combined waveform pulsing in an unsteady wavering rhythm, clinical recording with light room reflection, creates a feeling of slight wrongness, professionally recorded sound effects foley`
- v3: `Metal rod struck against two closely pitched glass surfaces in rapid succession, the resulting tones clashing at a narrow dissonant interval, high and sharp, brief but lingering discomfort, dry studio recording, tense and unsettling, professionally recorded sound effects foley`

---

**tone_2 — Curiosity / Movement (bright ascending step)**
⏱ 1.5s | 🔁 OFF
- v1: `Two small crystal bells struck in quick upward succession, the second bell slightly higher in pitch than the first, creating a questioning upward figure, bright and light, slight reverb in a small tiled room, playful and curious, professionally recorded sound effects foley`
- v2: `Marimba bar pair struck with a hard mallet, two adjacent bars ascending in pitch, wooden resonance, percussive and clear, dry close-mic recording, alert and inquisitive, professionally recorded sound effects foley`
- v3: `Two glass xylophone bars of ascending pitch struck with a light mallet, bright harmonic ring, short sustain with clean decay, small room recording, a simple upward question in sound, professionally recorded sound effects foley`

---

**tone_3 — Melancholy / Empathy (soft, warm, sorrowful)**
⏱ 3.0s | 🔁 OFF
- v1: `Crystal singing bowl of low-mid register struck with a felt mallet, producing a warm tone that settles into a slightly hollow, sad resonance, long sustain, recorded in a reverberant wooden chamber, emotionally heavy and quiet, professionally recorded sound effects foley`
- v2: `Two small brass bells struck together, second bell pitched lower and softer than the first, the combined tone creating a sense of mild sadness, moderate reverb, gentle and introspective, professionally recorded sound effects foley`
- v3: `Glass harmonica disc rotating slowly, a single sustained tone with a slightly mournful quality, breathy and warm, mid register, moderate room reverb, lonely and quiet, professionally recorded sound effects foley`

---

**tone_4 — Hope / Warmth (bright, consonant, uplifting)**
⏱ 2.0s | 🔁 OFF
- v1: `Crystal bell struck cleanly with a small metal rod, high register, warm harmonic ring with rich overtones, uplifting brightness, moderate sustain, small wooden room with gentle reverb, optimistic and encouraging, professionally recorded sound effects foley`
- v2: `Two crystal singing bowls of consonant pitches struck in sequence, second bowl notably warmer and brighter, their combined resonance creating a sense of lift and warmth, soft sustained decay, encouraging and hopeful, professionally recorded sound effects foley`
- v3: `Small hand bell rung once, bright clear ring, mid-to-high register, warm harmonic resonance with a gentle shimmer in the overtones, slight room echo, uplifting and energetic, professionally recorded sound effects foley`

---

**tone_5 — Balance / Structure (grounded, stable, symmetric)**
⏱ 3.0s | 🔁 OFF
- v1: `Two crystal bowls struck simultaneously at a stable consonant interval, their tones locking together in a grounded, architectural resonance, mid register, very long sustain, stone room recording with moderate reverb, solid and balanced, professionally recorded sound effects foley`
- v2: `Vibraphone bar struck with a medium-hard mallet, clean precise tone, mid register, moderate sustain with slight metallic shimmer, close-mic'd in a treated studio room, structured and neutral, professionally recorded sound effects foley`
- v3: `Two tuning forks of consonant pitches vibrated simultaneously and placed on a wooden resonating box, their combined tone even and symmetric, stable and clear, professionally recorded sound effects foley`

---

**tone_6 — Chaos / Transformation (maximally dissonant, clashing)**
⏱ 2.0s | 🔁 OFF
- v1: `Two metal rods struck against glass surfaces tuned to the most dissonant possible interval, their frequencies clashing and refusing to blend, high and harsh, the combined tone deeply unsettling and unstable, close-mic'd dry recording, jarring and wrong, professionally recorded sound effects foley`
- v2: `Two crystal glasses struck simultaneously with metal implements, their pitches chosen to create maximum tonal clash, a harsh dissonant beating with no resolution, medium sustain, small room, ominous and destabilizing, professionally recorded sound effects foley`
- v3: `Glass plate resonance created by two clashing frequencies applied simultaneously via bowing, producing a harsh grinding shimmer, dissonant and chaotic, dry close recording, unsettling and unstable, like reality slightly distorting, professionally recorded sound effects foley`

---

**tone_7 — Power / Clarity (strong, resonant, authoritative)**
⏱ 3.0s | 🔁 OFF
- v1: `Two large crystal singing bowls struck simultaneously at a powerful resonant consonant interval, their combined tone filling the space with authority and clarity, deep and rich, cathedral acoustic, strong and triumphant, professionally recorded sound effects foley`
- v2: `Large temple bell struck firmly with a wooden mallet, deep resonant strike with a strong clear fundamental, long powerful sustain, outdoor recording with natural reverb, authoritative and strong, professionally recorded sound effects foley`
- v3: `Two vibraphone bars struck together at a clean powerful interval, the motor on to add slight tremolo, resonant and full, mid-to-low register, clear and commanding, professionally recorded sound effects foley`

---

**tone_8 — Mystery / Wonder (ambiguous, shimmering, otherworldly)**
⏱ 3.0s | 🔁 OFF
- v1: `Crystal wine glass rim slowly bowed with a moistened finger, producing a continuous high sustained tone with gentle harmonic shimmer and soft beating overtones, slightly ambiguous in pitch, dreamy and mysterious, small reverberant room, otherworldly, professionally recorded sound effects foley`
- v2: `Glass armonica disc rotating under a moistened finger, producing a sustained ethereal tone with soft wavering character, high register, dream-like shimmer, slight room echo, wondering and strange, professionally recorded sound effects foley`
- v3: `Two crystal bells struck at a wide ambiguous interval, their tones not quite resolving into each other, shimmering sustain, the space between them creating a sense of quiet awe, reverberant stone room, professionally recorded sound effects foley`

---

**tone_9 — Connection / Belonging (warm, resolved, arriving)**
⏱ 2.5s | 🔁 OFF
- v1: `Two crystal singing bowls in a warm resonant interval struck together, their tones blending smoothly into a unified harmonic sound, a sense of arrival and belonging, mid register, slow sustain decay, warm wooden room reverb, peaceful and connected, professionally recorded sound effects foley`
- v2: `Small hand bell and crystal bowl struck in close succession, their tones combining into a warm glowing consonance, the sensation of two things finding each other, gentle reverb, comforting and unified, professionally recorded sound effects foley`
- v3: `Two glass tuning forks at a warm consonant interval placed on a shared wooden resonating box, their combined vibration producing a unified hum, mid register, slow fade, a sense of harmony and home, professionally recorded sound effects foley`

---

**tone_10 — Longing / Unresolved (reaching but not arriving)**
⏱ 3.0s | 🔁 OFF
- v1: `Two crystal bells struck in sequence, the second pitched to create a sense of unresolved tension, as though the phrase needs one more note that never comes, mid-high register, moderate sustain, small room recording, emotionally pulling and searching, professionally recorded sound effects foley`
- v2: `Glass harmonica producing two sustained tones that want to resolve into each other but do not quite meet, an ongoing sense of reaching and yearning, breathy and warm, slight room echo, melancholic and searching, professionally recorded sound effects foley`
- v3: `Bowed metal bar producing a sustained tone that wavers slightly, as though seeking a resting pitch without finding it, mid register, slight metallic edge, room reverb, a feeling of longing and incompleteness, professionally recorded sound effects foley`

---

**tone_11 — Anticipation / Threshold (one step from resolution)**
⏱ 2.0s | 🔁 OFF
- v1: `Two crystal bowls struck so their combined tone sits just one step below resolution, creating a suspended tense brightness, a sound that feels like an inheld breath before something happens, high register, sharp attack, quick sustain, dry close recording, tense and bright, professionally recorded sound effects foley`
- v2: `Small crystal bell struck producing a high bright tone that shimmers with harmonic complexity, an upward quality that never quite lands, slightly tense and expectant, the sensation of standing at an edge, moderate reverb, professionally recorded sound effects foley`
- v3: `Glass xylophone bar struck at a high pitch, the tone ringing bright and searching, overtones complex and slightly restless, a brief sound with an air of imminence, close-mic studio recording, anticipatory and tense, professionally recorded sound effects foley`

---

### B. Beu Lifecycle (`public/audio/beu/`)

---

**seed_ambient**
⏱ 15s | 🔁 ON
- 1: `Extremely faint single high-frequency sine tone, nearly inaudible, steady and unvarying, like a signal from very far away, gentle hiss of silence around it, anechoic recording, completely still and dormant, continuous and unmoving, professionally recorded sound effects foley`
- 2: `Single barely-audible glass tone vibrating continuously at low amplitude, steady and unvarying, the quietest possible sustained resonance, a breath of potential sound, anechoic or dead room, motionless and dormant, professionally recorded sound effects foley`

**seed_stinger**
⏱ 0.5s | 🔁 OFF
- 1: `A single extremely small high-pitched crystalline impact, delicate as a hairline crack in glass, sharp and brief transient, minimal sustain, anechoic recording, fragile and quiet, professionally recorded sound effects foley`
- 2: `One tiny crystal bell tap, softest possible strike, a single high clear note of minimal volume, very short sustain, dry recording, delicate and nascent, professionally recorded sound effects foley`

---

**sprout_ambient**
⏱ 15s | 🔁 ON
- 1: `Two or three small crystal bells sounding at irregular intervals, soft and tentative, each note brief and gentle, the silences between them longer than the sounds, small room with light reverb, curious and exploring, steady repeated pattern, professionally recorded sound effects foley`
- 2: `Sparse irregular chiming of small glass bells, gentle and childlike, each strike soft and exploring, a loose intermittent rhythm, warm small room acoustic, tentative and discovering, professionally recorded sound effects foley`

**sprout_stinger**
⏱ 1.0s | 🔁 OFF
- 1: `Three small crystal bells struck in rapid ascending sequence, bright and curious, a simple upward three-note figure, short sustain, small room reverb, playful and discovering, professionally recorded sound effects foley`
- 2: `Quick ascending three-note marimba or glass xylophone figure, wooden and resonant, each note light and bright, upward motion suggesting discovery, dry close recording, curious and newly alive, professionally recorded sound effects foley`

---

**growth_ambient**
⏱ 15s | 🔁 ON
- 1: `Four or five crystal bells in a steady repeating melodic pattern, energetic and purposeful, bright mid register, each note clean and decisive, moderate room reverb, the pattern cycling continuously, vital and active, professionally recorded sound effects foley`
- 2: `Continuous flowing arpeggio of glass or crystal tones, ascending and descending in a repeating wave, alive and rhythmic, warm tonal quality, moderate reverb, energetic and determined, steady repeating cycle, professionally recorded sound effects foley`

**growth_stinger**
⏱ 1.0s | 🔁 OFF
- 1: `Five crystal bells struck in rapid bright ascending sequence, an energetic upward run, each note clear and ringing, slight reverb trail, triumphant and vital, full of forward momentum, professionally recorded sound effects foley`
- 2: `Quick ascending five-note glass xylophone run, bright and resonant, each bar struck firmly with a light mallet, a short flourish of upward motion, close-mic studio recording, energetic and growing, professionally recorded sound effects foley`

---

**bloom_ambient**
⏱ 18s | 🔁 ON
- 1: `Six or seven crystal bowls of different sizes all resonating simultaneously in harmonic agreement, a rich layered drone of overlapping sustained tones, warm and complex, large reverberant room, lush and full, continuous and steady, professionally recorded sound effects foley`
- 2: `Multiple crystal wine glasses in continuous rim resonance, their tones layering into a shimmering complex chord, rich overtone content, the whole space vibrating, slightly wavering and alive, warm and beautiful, steady and unvarying, professionally recorded sound effects foley`

**bloom_stinger**
⏱ 1.5s | 🔁 OFF
- 1: `Multiple crystal bowls and bells struck simultaneously in a full harmonious chord, a brief bloom of layered ringing tones, rich and warm overtones filling the space, large room reverb, triumphant and beautiful, a single moment of harmonic fullness, professionally recorded sound effects foley`
- 2: `Full chord of six crystal bells struck at once, their harmonics mingling into a rich resonant bloom, warm and emotionally full, cathedral reverb, a peak moment of tonal beauty, professionally recorded sound effects foley`

---

**bond_ambient**
⏱ 20s | 🔁 ON
- 1: `Two crystal singing bowls of consonant pitches both resonating continuously, their tones weaving around each other in a steady interlocked hum, mid register, the two voices unified into a single warm complex drone, gentle room reverb, peaceful and unified, continuous and unvarying, professionally recorded sound effects foley`
- 2: `Two glass harmonica tones sustained simultaneously at a warm consonant interval, their vibrations interacting to form a single fused tone with gentle harmonic shimmer, intimate room recording, transcendent and unified, steady and continuous, professionally recorded sound effects foley`

**bond_stinger**
⏱ 2.0s | 🔁 OFF
- 1: `Two separate crystal tones initially heard distinctly, then gradually resolving into a single unified resonance as their pitches align, a short arc from duality to unity, warm and emotionally resolved, gentle reverb, transcendent and complete, professionally recorded sound effects foley`
- 2: `Two glass bells struck in sequence, their tones meeting and locking together in a final warm consonant blend, the sensation of two things merging into one, soft reverb, deeply satisfying resolution, professionally recorded sound effects foley`

---

### C. Universal Language Casting (`public/audio/ul/`)

---

**cast_init**
⏱ 0.5s | 🔁 OFF
- 1: `Single sharp crystalline electrical blip, a clean high-frequency transient like a relay switch engaging, brief and precise, dry anechoic recording, a mental snap of activation, professionally recorded sound effects foley`
- 2: `One small crystal bell struck with a metal rod, producing a single precise bright note, quick sharp attack, short sustain cut off cleanly, clinical and focused, dry recording, a moment of decisive activation, professionally recorded sound effects foley`

**cast_charge** *(hold-to-charge loop — describes a sustained condition)*
⏱ 15s | 🔁 ON
- 1: `Continuous high-frequency crystal bowl tone slowly building in amplitude, steady and sustained, a resonant hum that holds at a tension-filled pitch, the sound of energy accumulating, small stone room reverb, unvarying and pressurized, professionally recorded sound effects foley`
- 2: `Steady electric sine tone with faint glass harmonic overtones, continuous and building, mid-high frequency, the sensation of something being held at full tension, anechoic with subtle room reflection, tense and focused, professionally recorded sound effects foley`

**cast_release** *(success — variants differ in scale/weight)*
🔁 OFF
- v1 ⏱ 2.0s: `Crystal singing bowl struck firmly then immediately dampened, producing a single strong resonant tone that blooms briefly before cutting clean, mid-high register, decisive and satisfying, small room reverb, a clean release of accumulated energy, professionally recorded sound effects foley`
- v2 ⏱ 2.5s: `Multiple crystal bells struck in rapid descending cascade, a falling harmonic flourish, bright and resonant, each note clear, a brief waterfall of sound suggesting a complex idea discharged all at once, moderate reverb, professionally recorded sound effects foley`
- v3 ⏱ 3.5s: `Large crystal bowl struck with full force, the resulting tone rich and resonant, expanding outward in a warm bloom, long decay, large reverberant room, deep and satisfying, the sound of something significant being released, professionally recorded sound effects foley`

**cast_fail**
⏱ 0.8s | 🔁 OFF
- 1: `Crystal bowl struck cleanly but immediately stopped by a muting hand, the truncated tone cutting to silence with an abrupt clunk, a sound that started but was prevented from completing, dry recording, tense and unresolved, professionally recorded sound effects foley`
- 2: `Two glass tones struck simultaneously at a clashing dissonant interval, brief and harsh, immediately decaying, the sonic equivalent of a mistake, small room dry recording, discordant and abrupt, professionally recorded sound effects foley`

---

### D. Node Events (`public/audio/nodes/`)

---

**distress** *(node struggling — variants increase in urgency)*
🔁 OFF
- v1 ⏱ 2.5s: `A sustained crystal bowl tone gradually losing stability, its pitch slowly sagging lower and its amplitude flickering unevenly, a once-clear tone going wrong, mid register, moderate room reverb, unsettling and declining, professionally recorded sound effects foley`
- v2 ⏱ 2.0s: `Crystal bell struck, the resulting tone bending downward in pitch over its decay as though the structure supporting it is failing, high register declining to mid, eerie and concerning, small room recording, professionally recorded sound effects foley`
- v3 ⏱ 1.0s: `Two-tone glass chime struck, the second tone noticeably lower and more muted than the first, a descending two-note alarm figure, brief and urgent, dry recording, a simple warning signal, professionally recorded sound effects foley`

**collapse** *(node destroyed — full dramatic arc)*
🔁 OFF
- v1 ⏱ 2.5s: `Crystal bowl resonance suddenly interrupted by a sharp crack and then descending harmonic smear as the pitch drops rapidly to silence, the sonic arc of structural failure, large room reverb, dramatic and final, professionally recorded sound effects foley`
- v2 ⏱ 3.0s: `Multiple crystal and glass tones sounding simultaneously then cut off in a downward pitch-smear crash, all harmonics collapsing toward low noise then silence, reverberant stone room, the definitive sound of something important breaking, professionally recorded sound effects foley`
- v3 ⏱ 2.0s: `A sustained crystal tone abruptly disrupted by a sharp transient impact, the resulting sound spiraling downward in pitch and amplitude, crumbling to silence, close-mic'd with slight room, a catastrophic structural failure sound, professionally recorded sound effects foley`

**restore** *(node recovered)*
🔁 OFF
- v1 ⏱ 2.0s: `Two crystal bells struck in ascending order, the second brighter and higher than the first, the combined resonance suggesting recovery and relief, warm room reverb, an upward resolution, hopeful and grounded, professionally recorded sound effects foley`
- v2 ⏱ 2.5s: `Crystal singing bowl struck after a moment of silence, the resulting tone rising in amplitude from quiet to a full stable resonance, as though reforming from nothing, mid register, gentle reverberant room, a sense of return and stability, professionally recorded sound effects foley`

---

### E. Trust Milestones (`public/audio/trust/`)
*Milestones grow in weight and complexity as trust increases — durations deliberately escalate.*

---

**milestone_25 — First Contact** *(quiet, tentative)*
⏱ 1.5s | 🔁 OFF
- v1: `Two small crystal bells struck gently in sequence, quiet and tentative, a soft two-note chime that suggests first recognition, warm small room, the sound is cautious and slightly wondering, professionally recorded sound effects foley`
- v2: `Three glass bells in a gentle ascending sequence, each struck softly, a quiet moment of first connection, moderate reverb, warm and careful, the beginning of something forming, professionally recorded sound effects foley`

**milestone_50 — Alignment** *(balanced, resolved)*
⏱ 2.0s | 🔁 OFF
- v1: `Four crystal bells in a balanced rising and settling figure, the sequence ending on a stable consonant note, mid register, the sound of equilibrium found, warm room reverb, even and satisfied, professionally recorded sound effects foley`
- v2: `Two crystal singing bowls struck in sequence at a consonant interval, their tones settling into a stable unified resonance, mid register, a sense of two things agreeing, gentle room reverb, balanced and resolved, professionally recorded sound effects foley`

**milestone_75 — Resonance** *(rich, approaching completion)*
⏱ 2.5s | 🔁 OFF
- v1: `Six crystal bells struck in a rich ascending run, the final note lingering in a warm harmonic bloom, the sequence complex and full, large room reverb, a deeply satisfying progression, warm and glowing, professionally recorded sound effects foley`
- v2: `Multiple crystal bowls struck in sequence building to a sustained harmonic chord, the tones overlapping into a complex warm resonance, cathedral acoustic, approaching completion, rich and beautiful, professionally recorded sound effects foley`

**milestone_100 — Bond Complete** *(peak — let these breathe)*
🔁 OFF
- v1 ⏱ 3.5s: `All pitches of a crystal bowl set struck simultaneously, a full harmonic chord blooming in a large reverberant space, every overtone present, the sound expanding outward like a sunrise, joyful and complete, cathedral acoustic, triumphant, professionally recorded sound effects foley`
- v2 ⏱ 4.0s: `A dense chord of crystal bells and bowls struck together, rich harmonic complexity, the tones sustaining and weaving together in a long resonating tail, large stone chamber, transcendent and unified, a peak emotional musical moment, professionally recorded sound effects foley`
- v3 ⏱ 4.0s: `Two crystal tones struck separately then a third unifying tone struck that brings them together in a full resonant chord, a three-stage resolution arc, the final tone rich and complete with cathedral reverb, deeply emotional and triumphant, professionally recorded sound effects foley`

---

### F. Rift Contamination (`public/audio/rift/`)

---

**rift_pulse** *(player is near a rift — always on in background)*
⏱ 20s | 🔁 ON
- 1: `Continuous low electronic sine tone with irregular pitch instability, the frequency wobbling and stuttering unpredictably, mid-low register, a steady droning distortion, as though a power source is malfunctioning, dry recording, ominous and wrong, continuous and unvarying in character, professionally recorded sound effects foley`
- 2: `Steady drone of two electronic tones beating against each other at a slow irregular rate, the interference pattern shifting unpredictably, mid register, a continuous background of tonal conflict, unsettling and persistent, professionally recorded sound effects foley`
- 3: `Sustained layered electronic distortion, a corrupted sine tone with harsh harmonic clipping, mid-low frequency, the texture of a damaged signal held constant, grinding and unpleasant, continuous, professionally recorded sound effects foley`
- 4: `Once-pure crystal bowl tone playing back corrupted, pitch bending irregularly, harmonics distorting, the original beautiful sound now wrong and broken, a sustained damaged resonance, continuous and unsettling, professionally recorded sound effects foley`

**rift_warning** *(brief triggered alerts — variants escalate in harshness)*
🔁 OFF
- 1 ⏱ 0.6s: `Single sharp high-frequency electronic blip with slight pitch instability, a brief corrupted ping, the sound of a damaged signal, dry anechoic recording, unsettling and brief, professionally recorded sound effects foley`
- 2 ⏱ 0.8s: `Crystal bell struck but played back with pitch modulation and slight distortion, a damaged bell tone, brief sustain, close-mic, something that was once beautiful now slightly wrong, professionally recorded sound effects foley`
- 3 ⏱ 1.0s: `Warped electronic tone with a downward pitch bend and harmonic distortion, a single note going wrong, brief and harsh, dry recording, the sonic sensation of something corrupting, professionally recorded sound effects foley`
- 4 ⏱ 1.2s: `Two sharp dissonant electronic tones sounding simultaneously, a brief alarm-like clash, mid-high register, dry close recording, urgent and alarming, a system warning in sound, professionally recorded sound effects foley`

**rift_seal** *(rift closed — order restored)*
🔁 OFF
- 1 ⏱ 2.0s: `Dissonant electronic drone suddenly resolving into a clean sustained crystal tone, the moment of chaos becoming order, a before-and-after arc, moderate reverb, the sound of corruption being healed, satisfying and decisive, professionally recorded sound effects foley`
- 2 ⏱ 1.5s: `Distorted oscillating tone snapping to a clean stable pitch, the instability instantly gone, replaced by a pure resonant tone, dry then slightly reverberant, a sharp moment of purification, relief and resolution, professionally recorded sound effects foley`
- 3 ⏱ 2.0s: `Single large crystal bowl struck cleanly through an existing layer of electronic noise, its pure tone cutting through and silencing the distortion, a decisive healing strike, moderate reverb, clarity cutting through chaos, professionally recorded sound effects foley`

---

### G. Jane Physical Impacts (`public/audio/jane/`)
*Body hits — keep these punchy and extremely short. All 🔁 OFF.*

---

**hurt**
⏱ 0.5s | 🔁 OFF
- 1: `Close-mic'd body impact sound, soft flesh striking padded surface, a dull thud with minimal resonance, brief and dry, no reverb, immediate and physical, professionally recorded sound effects foley`
- 2: `Short sharp impact transient, a quick blunt hit, medium-low frequency body contact sound, dry recording, brief and physical, professionally recorded sound effects foley`
- 3: `Heavier dull body impact, a meatier collision sound, close-mic'd, slightly more mass than a light hit, dry and immediate, professionally recorded sound effects foley`

**attack**
⏱ 0.5s | 🔁 OFF
- 1: `Quick short whoosh of a fast hand movement through air, terminating in a sharp brief impact, close-mic, dry and fast, a single decisive strike, professionally recorded sound effects foley`
- 2: `Fast air movement and impact combined, a swift physical strike, short and decisive, medium frequency, close-mic'd dry recording, kinetic and clean, professionally recorded sound effects foley`
- 3: `Crisp snap of physical contact, the cleanest shortest version of a hand strike, very brief, dry, close recording, decisive and sharp, professionally recorded sound effects foley`

---

### H. Speeder Engine (`public/audio/speeder/`)

---

**engine_idle** *(runs while Jane is on the speeder)*
⏱ 20s | 🔁 ON
- 1: `Continuous smooth electronic hum with a slight magnetic resonance quality, mid-low frequency, steady and unvarying, the ambient tone of a hovering electromagnetic device at rest, no vibration irregularity, clean and futuristic, continuous drone, professionally recorded sound effects foley`
- 2: `Steady synthesized engine tone, a clean sawtooth-adjacent electronic hum with smooth texture, mid-low register, constant and stable, the sound of efficient magnetic propulsion at idle, continuous and unvarying, professionally recorded sound effects foley`

**boost**
⏱ 1.0s | 🔁 OFF
- 1: `Sudden electromagnetic surge sound, a fast rise in pitch and amplitude followed by a sharp cutoff, like a capacitor discharging, brief and energetic, a quick burst of power, dry electronic recording, professionally recorded sound effects foley`
- 2: `Electronic whoosh with rising pitch, an acceleration surge that ramps up fast and cuts clean, medium-to-high frequency sweep, brief and kinetic, the sound of sudden forward thrust, professionally recorded sound effects foley`

---

### I. Ley Line Energy (`public/audio/leylines/`)
*Ancient earth energy — low frequency, vast, geological. Very long loops for natural texture.*

---

**leyline_ambient**
⏱ 22s | 🔁 ON
- 1: `Deep low-frequency earth resonance, a sub-bass hum like the fundamental vibration of bedrock, continuous and vast, slight slow undulation in amplitude, the sensation of standing on ground with massive power running through it, steady and continuous, professionally recorded sound effects foley`
- 2: `Slow continuous low drone with the character of deep geological vibration, a fundamental tone with minimal harmonics, vast and ancient, very slight low-frequency pulse every few seconds, a sense of enormous grounded power, steady and unvarying, professionally recorded sound effects foley`
- 3: `Multiple overlapping low-frequency resonances, as though several underground chambers are vibrating simultaneously, a complex deep drone, slow movement between the frequencies, vast and telluric, continuous and steady, professionally recorded sound effects foley`

**leyline_activate** *(one-time event when Jane crosses a ley line node)*
🔁 OFF
- 1 ⏱ 2.5s: `Deep earth bass resonance suddenly surging in amplitude, a sub-bass rise and bloom from a low rumble to a full powerful presence, large open outdoor recording, a sense of immense underground energy awakening, dramatically louder, professionally recorded sound effects foley`
- 2 ⏱ 3.0s: `Low-frequency geological resonance sweeping upward in amplitude and adding harmonic complexity as it grows, a dramatic swell from quiet rumble to full deep resonant power, outdoor natural reverb, ancient and vast, professionally recorded sound effects foley`

---

### J. PsiNet (`public/audio/psinet/`)

---

**psinet_connect**
⏱ 1.0s | 🔁 OFF
- 1: `Clean digital confirmation tone, a brief two-note ascending electronic chime with a slightly metallic quality, high-mid register, dry and precise, the sound of a successful system handshake, brief and satisfying, professionally recorded sound effects foley`
- 2: `Short ascending electronic two-tone, clean and precise, like a network connection confirmation, mid-high register, slight electronic shimmer, dry close recording, positive and decisive, professionally recorded sound effects foley`

**psinet_alert**
⏱ 0.6s | 🔁 OFF
- 1: `Rapid two-pulse electronic alarm tone, two quick high-pitched blips in fast succession, mid-high frequency, urgent and clean, a system warning signal, dry and immediate, professionally recorded sound effects foley`
- 2: `Single sharp electronic alert beep, a bright high-frequency pulse with clean attack and short decay, urgent and precise, dry recording, a notification that demands attention, professionally recorded sound effects foley`

---

## Part 3: Generation Workflow Notes

### Settings for One-Shots
- Duration: Use the ⏱ value from the entry above
- Loop: OFF
- Prompt influence: 0.7–1.0 (higher = more consistent across batches)
- Generate 4 variants per prompt, select best 1–2

### Settings for Loops
- Duration: Use the ⏱ value from the entry above (15–22s is the sweet spot)
- Loop: **ON** — this tells the model to generate a texture with a clean loop point, not just enable player-side looping
- Prompt influence: 0.9–1.0 — you want minimal variation so the loop point is seamless
- The words "steady," "continuous," "unvarying," "constant" in the prompt reinforce loop-friendly generation

### File Naming After Download
```
tone_0_v1.mp3       →  public/audio/harmonic/
beu_seed_a1.mp3     →  public/audio/beu/
ul_cast_init_1.mp3  →  public/audio/ul/
node_distress_1.mp3 →  public/audio/nodes/
trust_25_1.mp3      →  public/audio/trust/
rift_pulse_1.mp3    →  public/audio/rift/
jane_hurt_1.mp3     →  public/audio/jane/
speeder_idle_1.mp3  →  public/audio/speeder/
leyline_ambient_1.mp3 → public/audio/leylines/
psinet_connect_1.mp3  → public/audio/psinet/
```

### Priority Order (biggest impact per credit spent)
1. **Harmonic Tones A** — powers the entire emotional arc. 36 one-shots, all short = cheap
2. **Beu Lifecycle B** — immediate character depth, Beu evolving is core to the story
3. **Rift F** — highest player anxiety payoff, dramatically shifts atmosphere
4. **Trust Milestones E** — peak emotional moments, low count, high return
5. **Node Events D** — frequent in gameplay
6. **UL Casting C** — directly tied to puzzle resolution
7. Everything else
