import { EventBus } from '../core/EventBus';

export interface ResearchProject {
  id: string;
  name: string;
  durationMs: number;
  effect: string;
  /** Material costs (task 6351). Key = material name, value = amount required. */
  materials?: Record<string, number>;
}

interface ActiveResearch {
  project: ResearchProject;
  startTime: number;
  elapsed: number;
}

/**
 * ProvisionManager — Timer-based research/provisioning queue.
 * Start a project → timer ticks → completion fires event.
 */
export class ProvisionManager {
  private eventBus: EventBus;
  private projects = new Map<string, ResearchProject>();
  private active: ActiveResearch | null = null;
  private completed: string[] = [];
  /** Material inventory (task 6352) */
  private materials: Record<string, number> = {};

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  registerProject(project: ResearchProject): void {
    this.projects.set(project.id, project);
  }

  getProject(id: string): ResearchProject | undefined {
    return this.projects.get(id);
  }

  getAllProjects(): ResearchProject[] {
    return [...this.projects.values()];
  }

  getCompletedIds(): string[] {
    return [...this.completed];
  }

  getActiveResearch(): ActiveResearch | null {
    return this.active ? { ...this.active } : null;
  }

  // --- Material Inventory (task 6352) ---

  /** Add materials to the inventory (e.g. from mission rewards). */
  addMaterial(name: string, amount: number): void {
    this.materials[name] = (this.materials[name] ?? 0) + amount;
  }

  /** Get current amount of a material. */
  getMaterial(name: string): number {
    return this.materials[name] ?? 0;
  }

  /** Check if inventory has enough materials for a project (task 6353). */
  hasMaterials(projectId: string): boolean {
    const project = this.projects.get(projectId);
    if (!project?.materials) return true; // no cost = always affordable
    for (const [mat, needed] of Object.entries(project.materials)) {
      if ((this.materials[mat] ?? 0) < needed) return false;
    }
    return true;
  }

  /** Start researching a project. Returns false if busy, completed, or missing materials. */
  startResearch(projectId: string): boolean {
    if (this.active) return false;
    const project = this.projects.get(projectId);
    if (!project) return false;
    if (this.completed.includes(projectId)) return false;
    if (!this.hasMaterials(projectId)) return false;

    // Consume materials
    if (project.materials) {
      for (const [mat, needed] of Object.entries(project.materials)) {
        this.materials[mat] -= needed;
      }
    }

    this.active = { project, startTime: Date.now(), elapsed: 0 };
    this.eventBus.emit({
      type: 'JANE_STATE_CHANGED',
      data: { newState: `researching_${projectId}`, previousState: 'idle' }
    });
    return true;
  }

  /**
   * Tick the research timer. Call each frame.
   * @param dtMs Delta time in milliseconds
   */
  update(dtMs: number): void {
    if (!this.active) return;

    this.active.elapsed += dtMs;
    if (this.active.elapsed >= this.active.project.durationMs) {
      const project = this.active.project;
      this.completed.push(project.id);
      this.active = null;

      this.eventBus.emit({
        type: 'NODE_STABILITY_CHANGED',
        data: {
          nodeId: `research_${project.id}`,
          previousStability: 0,
          newStability: 100,
        }
      });
    }
  }

  /** Cancel in-progress research. */
  cancelResearch(): boolean {
    if (!this.active) return false;
    this.active = null;
    return true;
  }

  /** Progress of current research (0.0 – 1.0), or null if idle. */
  getProgress(): number | null {
    if (!this.active) return null;
    return Math.min(1, this.active.elapsed / this.active.project.durationMs);
  }
}
