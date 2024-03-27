import { iWorkout } from "../types/workout_types";

export function filter_by_level(workouts: iWorkout[], level: string) {
  if (!level) {
    return workouts;
  }

  return workouts.filter((workout: iWorkout) => workout.level === level);
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
  if (!search_key) {
    return workouts;
  }

  return workouts.filter(({ instructions, name }) => {
    return name.includes(search_key) || instructions.includes(search_key);
  });
}
