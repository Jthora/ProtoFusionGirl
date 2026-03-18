// ulTypeBridge.ts
// Maps between ProtoFusionGirl's game-layer types (ulCanonicalTypes.ts)
// and the @ul-forge/core formal system types (ulForgeTypes.ts).
//
// The game uses enum-based types (ULPrimitive, ULSort, ULOperation) while
// @ul-forge/core uses string literal unions (NodeType, Sort, OperationName).
// This bridge provides zero-cost conversion between the two.

import { ULPrimitive, ULSort, ULOperation } from './ulCanonicalTypes';
import type { NodeType, Sort, OperationName, Gir } from './ulForgeTypes';
import type { ULExpression } from './ulCanonicalTypes';

// ── Game enum → Forge string ──

export function primitiveToNodeType(p: ULPrimitive): NodeType {
  switch (p) {
    case ULPrimitive.Point:     return 'point';
    case ULPrimitive.Line:      return 'line';
    case ULPrimitive.Angle:     return 'angle';
    case ULPrimitive.Curve:     return 'curve';
    case ULPrimitive.Enclosure: return 'enclosure';
  }
}

export function sortToForgeSort(s: ULSort): Sort {
  switch (s) {
    case ULSort.Entity:    return 'entity';
    case ULSort.Relation:  return 'relation';
    case ULSort.Modifier:  return 'modifier';
    case ULSort.Assertion: return 'assertion';
  }
}

export function operationToForgeName(op: ULOperation): OperationName {
  switch (op) {
    case ULOperation.Predicate:       return 'predicate';
    case ULOperation.ModifyEntity:    return 'modify_entity';
    case ULOperation.ModifyRelation:  return 'modify_relation';
    case ULOperation.Negate:          return 'negate';
    case ULOperation.Conjoin:         return 'conjoin';
    case ULOperation.Disjoin:         return 'disjoin';
    case ULOperation.Embed:           return 'embed';
    case ULOperation.Abstract:        return 'abstract';
    case ULOperation.Compose:         return 'compose';
    case ULOperation.Invert:          return 'invert';
    case ULOperation.Quantify:        return 'quantify';
  }
}

// ── Forge string → Game enum ──

const NODE_TYPE_MAP: Record<NodeType, ULPrimitive> = {
  point:     ULPrimitive.Point,
  line:      ULPrimitive.Line,
  angle:     ULPrimitive.Angle,
  curve:     ULPrimitive.Curve,
  enclosure: ULPrimitive.Enclosure,
};

const SORT_MAP: Record<Sort, ULSort> = {
  entity:    ULSort.Entity,
  relation:  ULSort.Relation,
  modifier:  ULSort.Modifier,
  assertion: ULSort.Assertion,
};

const OP_MAP: Record<OperationName, ULOperation> = {
  predicate:       ULOperation.Predicate,
  modify_entity:   ULOperation.ModifyEntity,
  modify_relation: ULOperation.ModifyRelation,
  negate:          ULOperation.Negate,
  conjoin:         ULOperation.Conjoin,
  disjoin:         ULOperation.Disjoin,
  embed:           ULOperation.Embed,
  abstract:        ULOperation.Abstract,
  compose:         ULOperation.Compose,
  invert:          ULOperation.Invert,
  quantify:        ULOperation.Quantify,
};

export function nodeTypeToPrimitive(t: NodeType): ULPrimitive {
  return NODE_TYPE_MAP[t];
}

export function forgeSortToSort(s: Sort): ULSort {
  return SORT_MAP[s];
}

export function forgeNameToOperation(name: OperationName): ULOperation {
  return OP_MAP[name];
}

// ── GIR ↔ ULExpression conversion ──

/**
 * Convert a GIR document to the game's ULExpression format.
 * This bridges the formal algebra representation to the existing game code.
 */
export function girToExpression(gir: Gir): ULExpression {
  return {
    predicates: gir.nodes.map(n => `${n.type}(${n.label ?? n.type})`),
    valid: gir.nodes.length > 0,
    error: gir.nodes.length === 0 ? 'Empty GIR' : undefined,
  };
}

/**
 * Convert a ULExpression to a minimal GIR for passing to the WASM engine.
 * Parses predicates like "point(existence)" back into GIR nodes.
 */
export function expressionToGir(expr: ULExpression): Gir {
  const nodes = expr.predicates.map((pred, i) => {
    const match = pred.match(/^([a-zA-Z_]+)\(([^)]*)\)/);
    const nodeType = (match?.[1] ?? 'point') as NodeType;
    const label = match?.[2] ?? nodeType;
    return {
      id: `n${i + 1}`,
      type: nodeType in NODE_TYPE_MAP ? nodeType : 'point' as NodeType,
      sort: nodeTypeToSort(nodeType in NODE_TYPE_MAP ? nodeType : 'point'),
      label,
    };
  });

  return {
    ul_gir: '1.0',
    root: nodes[0]?.id ?? 'n1',
    nodes: nodes.length > 0 ? nodes : [{ id: 'n1', type: 'point' as NodeType, sort: 'entity' as Sort, label: 'empty' }],
    edges: [],
  };
}

function nodeTypeToSort(t: string): Sort {
  switch (t) {
    case 'point': return 'entity';
    case 'line': return 'relation';
    case 'angle': return 'modifier';
    case 'curve': return 'relation';
    case 'enclosure': return 'assertion';
    default: return 'entity';
  }
}
