// ulTypeBridge.test.ts
// Tests for game-type ↔ @ul-forge/core type conversion functions.

import { ULPrimitive, ULSort, ULOperation } from '../ulCanonicalTypes';
import {
  primitiveToNodeType,
  sortToForgeSort,
  operationToForgeName,
  nodeTypeToPrimitive,
  forgeSortToSort,
  forgeNameToOperation,
  girToExpression,
  expressionToGir,
} from '../ulTypeBridge';
import type { Gir, NodeType, Sort, OperationName } from '../ulForgeTypes';

describe('ulTypeBridge', () => {
  describe('Game → Forge conversions', () => {
    it('converts all 5 ULPrimitive to NodeType', () => {
      expect(primitiveToNodeType(ULPrimitive.Point)).toBe('point');
      expect(primitiveToNodeType(ULPrimitive.Line)).toBe('line');
      expect(primitiveToNodeType(ULPrimitive.Angle)).toBe('angle');
      expect(primitiveToNodeType(ULPrimitive.Curve)).toBe('curve');
      expect(primitiveToNodeType(ULPrimitive.Enclosure)).toBe('enclosure');
    });

    it('converts all 4 ULSort to Sort', () => {
      expect(sortToForgeSort(ULSort.Entity)).toBe('entity');
      expect(sortToForgeSort(ULSort.Relation)).toBe('relation');
      expect(sortToForgeSort(ULSort.Modifier)).toBe('modifier');
      expect(sortToForgeSort(ULSort.Assertion)).toBe('assertion');
    });

    it('converts all 11 ULOperation to OperationName', () => {
      expect(operationToForgeName(ULOperation.Predicate)).toBe('predicate');
      expect(operationToForgeName(ULOperation.ModifyEntity)).toBe('modify_entity');
      expect(operationToForgeName(ULOperation.ModifyRelation)).toBe('modify_relation');
      expect(operationToForgeName(ULOperation.Negate)).toBe('negate');
      expect(operationToForgeName(ULOperation.Conjoin)).toBe('conjoin');
      expect(operationToForgeName(ULOperation.Disjoin)).toBe('disjoin');
      expect(operationToForgeName(ULOperation.Embed)).toBe('embed');
      expect(operationToForgeName(ULOperation.Abstract)).toBe('abstract');
      expect(operationToForgeName(ULOperation.Compose)).toBe('compose');
      expect(operationToForgeName(ULOperation.Invert)).toBe('invert');
      expect(operationToForgeName(ULOperation.Quantify)).toBe('quantify');
    });
  });

  describe('Forge → Game conversions', () => {
    it('converts all NodeType values back', () => {
      const types: NodeType[] = ['point', 'line', 'angle', 'curve', 'enclosure'];
      for (const t of types) {
        const primitive = nodeTypeToPrimitive(t);
        expect(primitiveToNodeType(primitive)).toBe(t);
      }
    });

    it('converts all Sort values back', () => {
      const sorts: Sort[] = ['entity', 'relation', 'modifier', 'assertion'];
      for (const s of sorts) {
        const sort = forgeSortToSort(s);
        expect(sortToForgeSort(sort)).toBe(s);
      }
    });

    it('converts all OperationName values back', () => {
      const ops: OperationName[] = [
        'predicate', 'modify_entity', 'modify_relation', 'negate',
        'conjoin', 'disjoin', 'embed', 'abstract', 'compose', 'invert', 'quantify',
      ];
      for (const op of ops) {
        const gameOp = forgeNameToOperation(op);
        expect(operationToForgeName(gameOp)).toBe(op);
      }
    });
  });

  describe('GIR ↔ ULExpression', () => {
    it('girToExpression converts a point GIR', () => {
      const gir: Gir = {
        ul_gir: '1.0',
        root: 'n1',
        nodes: [{ id: 'n1', type: 'point', sort: 'entity', label: 'existence' }],
        edges: [],
      };
      const expr = girToExpression(gir);
      expect(expr.valid).toBe(true);
      expect(expr.predicates).toEqual(['point(existence)']);
    });

    it('girToExpression marks empty GIR as invalid', () => {
      const gir: Gir = { ul_gir: '1.0', root: '', nodes: [], edges: [] };
      const expr = girToExpression(gir);
      expect(expr.valid).toBe(false);
      expect(expr.error).toBeDefined();
    });

    it('expressionToGir roundtrips a simple expression', () => {
      const expr = { predicates: ['point(existence)'], valid: true };
      const gir = expressionToGir(expr);
      expect(gir.nodes).toHaveLength(1);
      expect(gir.nodes[0].type).toBe('point');
      expect(gir.nodes[0].label).toBe('existence');
    });

    it('expressionToGir handles unknown type gracefully', () => {
      const expr = { predicates: ['unknown(thing)'], valid: true };
      const gir = expressionToGir(expr);
      expect(gir.nodes).toHaveLength(1);
      // Falls back to 'point' for unknown types
      expect(gir.nodes[0].type).toBe('point');
    });

    it('expressionToGir creates valid GIR for empty predicates', () => {
      const expr = { predicates: [], valid: false };
      const gir = expressionToGir(expr);
      expect(gir.nodes.length).toBeGreaterThan(0); // Fallback node
      expect(gir.root).toBeTruthy();
    });
  });
});
