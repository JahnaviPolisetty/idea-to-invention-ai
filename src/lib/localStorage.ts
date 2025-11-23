import { InventionBlueprint } from "./types/invention";

const STORAGE_KEY = "invention-blueprints";

export const saveBlueprint = (blueprint: InventionBlueprint): void => {
  try {
    const existing = getBlueprints();
    const updated = [blueprint, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving blueprint:", error);
  }
};

export const getBlueprints = (): InventionBlueprint[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading blueprints:", error);
    return [];
  }
};

export const deleteBlueprint = (id: string): void => {
  try {
    const existing = getBlueprints();
    const updated = existing.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error deleting blueprint:", error);
  }
};
