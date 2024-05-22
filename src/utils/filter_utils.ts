import { iWorkout } from "../types/workout_types";

export function filter_by_level(workouts: iWorkout[], levels: string[]) {
  if (!levels || levels.length <= 0) {
    return workouts;
  }

  return workouts.filter((workouts) => {
    return levels.some(
      (level: string) => workouts.level.toLowerCase() === level.toLowerCase()
    );
  });
}

export function filter_by_equipments(
  workouts: iWorkout[],
  equipments: string[]
) {
  if (!equipments || equipments.length <= 0) {
    return workouts;
  }
  return workouts.filter((workouts) => {
    if (!workouts.equipment) return false;
    return equipments.some((equipment: string) =>
      workouts.equipment.includes(equipment)
    );
  });
}

export function filter_by_muscle(workouts: iWorkout[], muscles: string[]) {
  if (!muscles || muscles.length <= 0) {
    return workouts;
  }

  return workouts.filter((workouts) => {
    return muscles.some((muscle: string) =>
      workouts.primaryMuscles.includes(muscle)
    );
  });
}

export function filter_by_search_key(workouts: iWorkout[], search_key: string) {
  const lowercase_searchKey = search_key.toLowerCase().replace(/\s+/g, ""); // Remove whitespace
  return workouts.filter(({ instructions, name }) => {
    const lowercaseName = name.toLowerCase().replace(/\s+/g, ""); // Remove whitespace
    const firstInstruction = instructions.length > 0 ? instructions[0] : ""; // Check if instructions array is not empty
    const lowercaseInstruction = firstInstruction
      .toLowerCase()
      .replace(/\s+/g, ""); // Remove whitespace

    // Remove hyphens and whitespace from search_key
    const searchKeyWithoutHyphens = lowercase_searchKey.replace(/-/g, "");

    return (
      lowercaseName.includes(searchKeyWithoutHyphens) ||
      lowercaseInstruction.includes(searchKeyWithoutHyphens)
    );
  });
}
