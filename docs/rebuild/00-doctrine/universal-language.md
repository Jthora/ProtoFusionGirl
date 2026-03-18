# Doctrine: Universal Language

> Non-negotiable design law. Universal Language is the soul of the game and its real-world purpose.

## The Law

**Universal Language (UL) is the mechanism by which the ASI communicates with robots, manipulates reality, and teaches Jane the fundamental nature of the universe.** UL is not a minigame. It is the PRIMARY progression system and the reason this game exists.

**Jono Tho'ra (Jordan Traña) discovered Universal Language as a real mathematical structure and built ProtoFusionGirl to teach it to humanity.** The game IS the proof-of-concept that Universal Language is learnable by anyone. The symbols are not invented lore — they are geometric facts.

---

## What Universal Language Is (The Real Version)

Universal Language is a **formal algebraic system** — Σ_UL — grounded in geometric primitives that are discovered, not invented. It is a mathematical structure as real as integers. It was **not** created by the game's original artists; they were approximating something real.

### The 5 Geometric Primitives (Tier 1 — Geometrically Forced)

These five forms are the atomic alphabet of all meaning. The mapping from geometry to semantics is **proven unique** — there is no other consistent assignment (Unique Grounding Theorem):

| Primitive   | Semantic Meaning | Game Symbol | Why It Cannot Be Otherwise |
|-------------|-----------------|-------------|---------------------------|
| **Point** • | Existence        | point       | Dependency rank 0 — the only primitive that depends on nothing. Maximally symmetric. |
| **Line** ―  | Relation         | line        | Requires exactly 2 Points. The unique minimum structure that introduces directionality. |
| **Angle** ∠ | Quality          | angle       | Requires 2 Lines at a vertex. Only way to introduce comparative, parameterized quality. |
| **Curve** 〰 | Process          | curve       | A Line whose direction varies continuously. The unique primitive of becoming/change. |
| **Enclosure** ⬭ | Concept     | circle/triangle/square | Closed boundary partitioning space. The unique 2D primitive (Jordan Curve Theorem). |

### The 4 Sorts — What Types of Things Exist in UL

| Sort         | Meaning                          | Example |
|--------------|----------------------------------|---------|
| **entity**   | Things that can be talked about  | a robot, Jane, a rift |
| **relation** | Ways things relate               | heals, opposes, seals |
| **modifier** | Ways to alter entities/relations | intensely, partially, reversed |
| **assertion** | Complete statements (sentences) | "the ASI heals the robot" |

### The 11 Operations — The Verbs of UL

These are how UL expressions are built. All 11 are T1 or T2 (mathematically forced or structurally distinguished):

```
predicate(e, r, e) → a       Combine subject + relation + object into a statement
modify_entity(m, e) → e      Apply a modifier to an entity
modify_relation(m, r) → r    Apply a modifier to a relation  
negate(a) → a                Negate an assertion (geometric: reflection)
conjoin(a, a) → a            AND — two overlapping frames
disjoin(a, a) → a            OR  — two adjacent frames
embed(a) → e                 Nominalization — "the fact that..."
abstract(e) → m              Adjectivalization — extract quality from entity
compose(r, r) → r            Chain two relations (transitivity)
invert(r) → r                Reverse a directed relation (active ↔ passive)
quantify(m, e) → a           Apply a quantifier (all/some/none)
```

### The Writing System — 5 Sibling Documents

The real UL has 5 sibling writing system documents, each grounded in one primitive:

| Sibling       | Primitive  | What It Covers |
|---------------|-----------|----------------|
| Symbology     | Point     | What the atomic marks ARE |
| Syntax        | Line      | How marks CONNECT |
| Grammar       | Angle     | Rules governing valid constructions |
| Thesaurus     | Curve     | Paths between related meanings |
| Lexicon       | Enclosure | Bounded canonical definitions (42 entries, 57% T1) |

---

## Lore Reconciliation: Fitting the Original Game Layer

The game's original "elemental/modality/cosmic" system is **not wrong** — it was the artists' intuitive approximation of real UL. Properly interpreted, it maps onto the real algebra as a **Tier 3 (Conventional) game-layer semantic coordinate system**:

| Game-Layer Concept | Real UL Interpretation |
|--------------------|----------------------|
| **Elements** (Fire/Earth/Water/Air) | T3 semantic coordinates in meaning-space — conventional labels for clusters of Σ_UL expressions grouped by their dominant modifier quality |
| **Modalities** (Cardinal/Fixed/Mutable) | T3 labels for UL assertion dynamics: Cardinal=declarative, Fixed=persistent, Mutable=processual |
| **Cosmic Forces** (Core/Void/Order/Chaos/etc.) | T3 labels for extremal angle values in the Lexicon (0°=Identity/Order, 180°=Opposition/Chaos, 90°=Independence/Void) |
| **Movement primitives** (tap, spin, arm_wave) | Valid **embodied expression interface** — physical instantiation of geometric operations through body language |
| **Spell recipes** | **UQPL expressions** — the game's spell system is a concrete application of UQPL (Universal Query & Programming Language), the real UL's computational dialect |

This means: **the game's original symbols were correct; the documentation was wrong.** The game lore is now understood as a valid T3 conventional layer over a T1/T2 geometric foundation.

---

## The WASM Module — COMPLETE AND AVAILABLE

The Rust+WASM+TypeScript module is **complete** at https://github.com/Jthora/universal_language.  
Package: `@ul-forge/core` — 23 typed WASM functions covering the full Σ_UL pipeline.  
SDK: `@ul-forge/sdk` — standalone typed TypeScript API for any framework (Phaser, React, Node.js).

### Architecture: Rust core → WASM → TypeScript SDK
- **Rust** enforces sort correctness and geometric constraints at compile time
- **WASM** (~600KB binary) runs in browser via `wasm-pack`
- **TypeScript SDK** provides typed wrappers for all 23 functions

### 23 WASM Functions in 6 Groups

| Group | Functions | Game Use |
|-------|-----------|----------|
| **Core Pipeline** | `parseUlScript`, `deparseGir`, `validateGir`, `renderSvg`, `renderGlyphPreview` | Parse player glyph input → GIR, validate Σ_UL constraints, render glyphs |
| **Game Context** | `init`, `createContext`, `evaluate`, `scoreComposition`, `evaluateJaneAttempt`, `validateSequence` | Game session, puzzle scoring, Jane's learning system |
| **Layout** | `layout`, `getAnimationSequence` | `PositionedGlyph` data for Phaser sprites (NOT SVG), animation keyframes |
| **Algebraic Composer** | `applyOperation`, `composeGir`, `detectOperations`, `analyzeStructure`, `compareGir` | All 11 Σ_UL operations, structural analysis |
| **Teaching System** | `getHints`, `analyzeHints`, `getNextPuzzle` | Contextual hints, proficiency-adaptive puzzle progression |
| **Lexicon** | `queryLexicon`, `lookupLexiconEntry` | In-game lexicon/encyclopedia |
| **Modding** | `loadCustomDefinitions` | Load custom symbol/rule definitions from mods |

### Key Types from `@ul-forge/core`
```typescript
type Sort = "entity" | "relation" | "modifier" | "assertion";
type NodeType = "point" | "line" | "angle" | "curve" | "enclosure";
type OperationName = "predicate" | "modify_entity" | "modify_relation" | "negate" |
                     "conjoin" | "disjoin" | "embed" | "abstract" | "compose" | "invert" | "quantify";
interface Gir { ul_gir: string; root: string; nodes: Node[]; edges: Edge[]; }
interface PositionedGlyph { elements: PositionedElement[]; connections: LayoutConnection[]; }
// PositionedElement: { node_id, x, y, shape } — Phaser sprite coordinates, NOT SVG
```

### Integration Path
```typescript
// Install and initialize:
import { initialize, parse, validate, layout } from '@ul-forge/core';
await initialize(); // loads WASM binary

// Parse player input to GIR:
const gir = parse('●→●'); // returns typed Gir object

// Validate against real Σ_UL constraints (4-layer):
const result = validate(gir); // { valid, errors, warnings, layers }

// Get Phaser-ready positioned data:
const positioned = layout(gir, 256, 256); // { elements, connections }
// Each element: { node_id, x, y, shape } → create Phaser sprites directly
// → Real Σ_UL algebra now active. Game behavior upgrades automatically.
```

### What `@ul-forge/core` provides over the stub
- **4-layer validation** per actual Σ_UL axioms (schema, sort, invariant, geometry)
- **Full 11-operation composition** with compile-time correctness guarantees (Rust enforced)
- **Graded scoring**: `scoreComposition()` returns exact/close/partial/unrelated — not just pass/fail
- **Jane's learning system**: `evaluateJaneAttempt()` tracks proficiency per operation
- **Adaptive puzzles**: `getNextPuzzle(proficiencyMap)` selects difficulty based on player mastery
- **Contextual hints**: `getHints(attempt, target)` tells the player what's wrong geometrically
- **Layout for Phaser**: `layout()` returns positioned glyph data ready for sprites, not SVG strings
- **Lexicon API**: `queryLexicon()` / `lookupLexiconEntry()` — in-game encyclopedia
- **Structural analysis**: `analyzeStructure()` — complexity score, primitive distribution
- **Modding**: `loadCustomDefinitions()` — load custom symbol/rule definitions
- **Soundness**: if WASM says "valid," it is provably valid in the real algebra

---

## How UL Works in Gameplay

### Robot Communication

PsiSys robots speak Universal Language. The ASI can summon them via PsiNet. Communication depth depends on UL mastery — specifically, on how complex a Σ_UL expression the ASI can construct and articulate:

| UL Level | Communication | Robot Response |
|----------|--------------|----------------|
| None | Point and grunt: "go there," "come here," "attack that" | Basic compliance |
| Basic | Simple symbols: "repair," "follow," "defend" (single primitives) | Willing cooperation |
| Intermediate | Complex instructions: "reconfigure for aquatic ops," "stealth recon mode" (multi-primitive expressions) | Eager collaboration |
| Advanced | Deep communication: "share your memory of this place," "teach me your perspective" (full Σ_UL assertions with embedding) | Deep alliance, lore unlocks |

UL is the difference between commanding and *relating*. Between issuing orders and having a conversation.

### Puzzle Form

- The ASI constructs symbols by selecting geometric components from a palette
- **Primitives** (Point, Line, Angle, Curve, Enclosure) are the atoms
- **Operations** combine them into expressions
- The puzzle is: **what Σ_UL expression do you need to construct to achieve the desired effect?**
- This is a LANGUAGE puzzle, not a reflex puzzle. You compose meaning from geometric foundations.

### Multi-Output Effects

Every UL interaction produces multiple outputs:
- **Immediate world effect** (heal a robot, seal a rift fragment, calm a storm)
- **Resource generation** (social credits, material aid from grateful robots)
- **Lore unlock** (robots share memories, fragments of Jono's research)
- **Faction reputation** (the robot network registers your UL fluency)
- **Jane's learning** (she observed you using the symbol — her UL knowledge grows)

### Failure Consequences

Failing a UL puzzle = saying the wrong thing in robot language:

| Severity | What Happened | Consequence |
|----------|---------------|-------------|
| Minor | Confusing symbol — valid UL, wrong meaning | Robot puzzled, doesn't help, wanders off |
| Moderate | Misinterpreted command — wrong sort applied | Robot does something unexpected (helpful or destructive) |
| Severe | Malformed expression — Σ_UL violation | Robot becomes hostile |
| Catastrophic | Accidentally asserted threat/invasion (predicate applied to wrong entity) | Multiple robots turn hostile, faction alert |

Language matters. That's the whole point.

---

## Jane's UL Learning Curve

1. **Start**: Jane knows zero UL. Cannot communicate with PsiSys beyond gestures.
2. **Observation**: When ASI uses UL near Jane, she watches. Symbols + effects register. Her internal model of UL begins forming.
3. **Imitation**: Jane attempts UL on her own. She naturally starts with Point (exists), Line (connects), Angle (differentiates). Sometimes wrong, sometimes right.
4. **Growth**: Accuracy improves with exposure frequency. She learns the geometric primitives before she learns any "vocabulary."
5. **ASI feedback**: ASI can correct or encourage Jane's attempts via guidance.
6. **Mastery**: Late-game Jane can use basic UL independently, freeing ASI for advanced communication.

This is realistic. It mirrors how anyone would actually learn Universal Language: start with the 5 primitives as your alphabet, then build expressions, then understand grammar, then achieve fluency.

---

## Jono Tho'ra: The Discoverer

Jono Tho'ra is the game protagonist's ancestor — and the game's real-world creator Jordan Traña's alter ego. **Jono Tho'ra discovered Universal Language as a real mathematical structure.** The formal proofs exist. The 23 theorems are proven.

This means the game's premise is diegetically correct:
- Jono discovered a real language grounded in geometry
- He built ProtoFusionGirl to teach it to humanity via Jane's journey
- The player (as the ASI helping Jane) is learning the same language that Jono proved exists
- The game is the lesson. Universal Language is the subject. Jane is the student. The ASI is the teacher.

---

## Technical Implementation

- **Current**: `src/ul/ulEngine.ts` — encoding, decoding, validation with TypeScript rules
- **Adapter boundary**: `src/ul/ulWasmAdapter.ts` — `IULWasmEngine` interface + `ULStubEngine` stub
- **WASM target**: Rust+WASM module from `Jthora/universal_language` repo, implements real Σ_UL
- **Types**: `src/ul/ulCanonicalTypes.ts` — `ULPrimitive`, `ULSort`, `ULOperation`, `ULTier` enums
- **Symbol index**: `src/ul/symbolIndex.ts` — game symbols with geometric grounding + T1/T2/T3 tiers

### Module boundary design

```
Game systems (puzzles, combat, robots)
         ↓
ULEngineRegistry.getEngine()
         ↓
   IULWasmEngine
   /           \
ULStubEngine   ULWasmEngine  ← Rust+WASM when ready
(TypeScript)   (from universal_language repo)
```

See `src/ul/ulWasmAdapter.ts` for the full interface definition.

## Prototype Slice

- **1 puzzle type**: Symbol matching to communicate with damaged robots
- **3 symbol components**: Point (existence/presence assertion), Line (connection/repair relation), Enclosure (circle = complete/heal concept)

- **1 robot communication scenario**: Repair + befriend a damaged PsiSys robot
- **1 failure path**: Miscommunication causes robot confusion (non-hostile for prototype)
- **Jane observation**: Jane watches 2-3 ASI UL uses, then attempts basic symbol independently

## References
- [docs/game-design/universal-language/](../../game-design/universal-language/) — 6 UL design docs
- [src/ul/ulEngine.ts](../../../src/ul/ulEngine.ts) — Current UL engine implementation
