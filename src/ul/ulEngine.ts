// Universal Language (UL) Runtime Engine
// Implements encoding, decoding, validation, and runtime mapping for UL expressions per the formal system and artifacts.
// Version: 0.1.0 (dev)
// Author: GitHub Copilot (corrected)

import { ULExpression, ULFeedback } from "./ulTypes";
import { ULResourceLoader } from './ulResourceLoader';

// Load all UL resources at runtime (stub: returns empty data for now)
const ulResources = ULResourceLoader.loadAll();

// --- Symbol/Primitive/Animation Maps (from resources) ---
// These will be auto-generated or imported from UL resource JSONs in a full build system.
interface SymbolMovement {
  primitive: string;
  animation: string;
}

const symbolMovementMap: { [symbol: string]: SymbolMovement } =
  ulResources.symbols.length > 0
    ? Object.fromEntries(
        ulResources.symbols.map((s) => [s.name, { primitive: s.movement || '', animation: s.animation || '' }])
      )
    : {
        point: { primitive: "tap", animation: "point_tap" },
        line: { primitive: "step_line", animation: "line_walk" },
        circle: { primitive: "spin", animation: "spin_360" },
        triangle: { primitive: "step_sequence_triangle", animation: "triangle_footwork" },
        square: { primitive: "box_step", animation: "box_step_anim" },
        curve: { primitive: "arm_curve", animation: "curve_arm_anim" },
        angle: { primitive: "angle_pose", animation: "angle_pose_anim" },
        wave: { primitive: "arm_wave", animation: "wave_arm" },
        spiral: { primitive: "spiral_turn", animation: "spiral_turn_anim" },
        zigzag: { primitive: "zigzag_dash", animation: "zigzag_dash_anim" },
        leap: { primitive: "high_leap", animation: "high_leap_anim" },
      };

const primitiveToSymbol: { [primitive: string]: string } = Object.fromEntries(
  Object.entries(symbolMovementMap).map(([symbol, v]) => [v.primitive, symbol])
);

// --- Encoding: sequence of primitives -> ULExpression ---
export function encodeULExpression(sequence: string[]): ULExpression {
  const predicates: string[] = [];
  let valid = true;
  let error: string | undefined = undefined;
  const repetitionCount: Record<string, number> = {};

  for (const primitive of sequence) {
    const symbol = primitiveToSymbol[primitive];
    if (!symbol) {
      valid = false;
      error = "UNKNOWN_PRIMITIVE";
      break;
    }
    // Repetition check (e.g., no more than 3 of the same symbol in a row)
    repetitionCount[symbol] = (repetitionCount[symbol] || 0) + 1;
    if (repetitionCount[symbol] > 3) {
      valid = false;
      error = "EXCEEDS_REPETITION_LIMIT";
      break;
    }
    predicates.push(`${symbol}(${symbol[0]})`); // e.g., circle(c)
  }

  return { predicates, valid, error };
}

// --- Decoding: ULExpression -> sequence of primitives ---
export function decodeULExpression(ulExpression: ULExpression): string[] {
  return ulExpression.predicates.map((pred: string) => {
    const match = pred.match(/^([a-zA-Z_]+)\(/);
    if (!match) return "UNKNOWN";
    const symbol = match[1];
    return symbolMovementMap[symbol]?.primitive || "UNKNOWN";
  });
}

// --- Validation: sequence of primitives ---
export function validateULSequence(sequence: string[]): { valid: boolean; error?: string } {
  // Well-formedness: all primitives must be known, repetition, context, etc.
  let valid = true;
  let error: string | undefined = undefined;
  const repetitionCount: Record<string, number> = {};

  for (const primitive of sequence) {
    const symbol = primitiveToSymbol[primitive];
    if (!symbol) {
      valid = false;
      error = "UNKNOWN_PRIMITIVE";
      break;
    }
    repetitionCount[symbol] = (repetitionCount[symbol] || 0) + 1;
    if (repetitionCount[symbol] > 3) {
      valid = false;
      error = "EXCEEDS_REPETITION_LIMIT";
      break;
    }
    // TODO: Add context checks (e.g., square only for order_guardians)
  }
  return { valid, error };
}

// --- Runtime: Map ULExpression to animation events ---
export function getAnimationSequence(ulExpression: ULExpression): string[] {
  return ulExpression.predicates.map((pred: string) => {
    const match = pred.match(/^([a-zA-Z_]+)\(/);
    if (!match) return "UNKNOWN_ANIMATION";
    const symbol = match[1];
    return symbolMovementMap[symbol]?.animation || "UNKNOWN_ANIMATION";
  });
}

// --- Extensibility: Add new symbol/primitive/animation at runtime ---
export function registerULSymbol(symbol: string, primitive: string, animation: string) {
  symbolMovementMap[symbol] = { primitive, animation };
  primitiveToSymbol[primitive] = symbol;
}

// --- Feedback/Streaming (stub) ---
export function streamULFeedback(sequence: string[]): ULFeedback[] {
  // For each step, validate incrementally and provide hints/errors
  const feedback: ULFeedback[] = [];
  let valid = true;
  let error: string | undefined = undefined;
  const repetitionCount: Record<string, number> = {};
  for (let i = 0; i < sequence.length; i++) {
    const primitive = sequence[i];
    const symbol = primitiveToSymbol[primitive];
    if (!symbol) {
      valid = false;
      error = "UNKNOWN_PRIMITIVE";
    }
    repetitionCount[symbol] = (repetitionCount[symbol] || 0) + 1;
    if (repetitionCount[symbol] > 3) {
      valid = false;
      error = "EXCEEDS_REPETITION_LIMIT";
    }
    feedback.push({ step: i, valid, hint: error });
    if (!valid) break;
  }
  return feedback;
}

// --- Runtime Integration: EventBus-driven animation and feedback ---

/**
 * Triggers animation and feedback events for a UL expression using the provided EventBus.
 * @param ulExpression The ULExpression to animate.
 * @param eventBus The EventBus instance to emit events on.
 * @param options Optional: { playerId, context, feedback } for richer event payloads.
 */
export function triggerULAnimationEvents(
  ulExpression: ULExpression,
  eventBus: { emit: (event: { type: string; data: any }) => void },
  options?: { playerId?: string; context?: any; feedback?: boolean }
) {
  const animationSequence = getAnimationSequence(ulExpression);
  const { playerId, context, feedback } = options || {};

  // Emit animation events for each animation in sequence
  animationSequence.forEach((animation, idx) => {
    eventBus.emit({
      type: 'UL_ANIMATION',
      data: {
        animation,
        step: idx,
        total: animationSequence.length,
        playerId,
        context,
        ulExpression
      }
    });
  });

  // Emit feedback event if requested or if there is an error
  if (feedback || ulExpression.error) {
    eventBus.emit({
      type: 'UL_FEEDBACK',
      data: {
        valid: ulExpression.valid,
        error: ulExpression.error,
        ulExpression,
        playerId,
        context
      }
    });
  }
}

// --- TODO: Integrate with game engine event system for real-time animation/logic ---
