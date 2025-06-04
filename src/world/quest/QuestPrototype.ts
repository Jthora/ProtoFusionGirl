export interface QuestObjective {
  type: string;
  target: string;
  count: number;
}

export interface QuestReward {
  type: string;
  amount?: number;
  id?: string;
}

export interface QuestDefinition {
  id: string;
  type: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  prerequisites: string[];
  nextQuests: string[];
}

// Simple quest definition for prototype
export const sampleQuest: QuestDefinition = {
  id: "quest_defeat_3_enemies",
  type: "combat",
  title: "Defeat 3 Enemies",
  description: "Eliminate 3 enemies in the forest zone.",
  objectives: [
    { type: "kill", target: "enemy", count: 3 }
  ],
  rewards: [
    { type: "xp", amount: 100 },
    { type: "item", id: "health_potion", amount: 1 }
  ],
  prerequisites: [],
  nextQuests: []
};

export interface QuestProgress {
  questId: string;
  progress: number;
  completed: boolean;
}

// Quest state tracking (in-memory for prototype)
export class QuestState {
  activeQuests: Record<string, QuestProgress> = {};
  completedQuests: Set<string> = new Set();

  startQuest(quest: QuestDefinition) {
    if (!this.activeQuests[quest.id] && !this.completedQuests.has(quest.id)) {
      this.activeQuests[quest.id] = { questId: quest.id, progress: 0, completed: false };
    }
  }

  updateProgress(quest: QuestDefinition, amount: number = 1) {
    const progress = this.activeQuests[quest.id];
    if (progress && !progress.completed) {
      progress.progress += amount;
      if (progress.progress >= quest.objectives[0].count) {
        progress.completed = true;
        this.completedQuests.add(quest.id);
        delete this.activeQuests[quest.id];
        // TODO: Grant rewards
      }
    }
  }

  getQuestStatus(questId: string) {
    if (this.completedQuests.has(questId)) return "completed";
    if (this.activeQuests[questId]) return "active";
    return "not started";
  }
}
