// UniversalLanguageEngine: Scripting engine for Universal Language expressions, puzzle logic, and in-world programming.
// Integrates with save/load, tile/datakey systems, and branch/anchor systems.
import vm from 'vm';
import { ulEventBus } from '../../ul/ulEventBus';

export interface ScriptedPuzzleState {
  id: string;
  branchId: string;
  script: string;
  result: any;
  error?: string;
}

function isScriptSafe(script: string): boolean {
  // Basic static analysis: reject dangerous patterns
  const forbidden = [/require\s*\(/, /process\./, /global\./, /child_process/, /fs\./, /while\s*\(true\)/, /setInterval/, /setTimeout/];
  return !forbidden.some(re => re.test(script));
}

export class UniversalLanguageEngine {
  private puzzleStates: Record<string, ScriptedPuzzleState> = {};

  runScript(branchId: string, script: string): ScriptedPuzzleState {
    let result: any;
    let error: string | undefined;
    if (!isScriptSafe(script)) {
      error = 'Script contains forbidden patterns and was rejected.';
      ulEventBus.emit('ul:puzzle:validated', { id: branchId, result: false, errors: [error] });
    } else {
      try {
        // Use Node.js vm to sandbox script execution
        const context = vm.createContext({}); // Empty context for isolation
        result = vm.runInContext(script, context, { timeout: 1000 });
        ulEventBus.emit('ul:puzzle:validated', { id: branchId, result: true });
      } catch (e: any) {
        error = e.message;
        ulEventBus.emit('ul:puzzle:validated', { id: branchId, result: false, errors: error ? [error] : [] });
      }
    }
    const state: ScriptedPuzzleState = { id: `${branchId}:${Date.now()}`, branchId, script, result, error };
    this.puzzleStates[state.id] = state;
    return state;
  }

  getPuzzleState(id: string): ScriptedPuzzleState | undefined {
    return this.puzzleStates[id];
  }

  // Call this when a puzzle is completed (solved by player)
  completePuzzle(branchId: string, stats?: any) {
    ulEventBus.emit('ul:puzzle:completed', {
      id: branchId,
      time: Date.now(),
      stats,
    });
  }

  integrateWithPersistence(persistence: any) {
    // TODO: Save/load puzzleStates per branch/anchor
  }
}
