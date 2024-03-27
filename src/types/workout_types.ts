export type iWorkout = {
  name: string;
  force: string;
  level: string;
  mechanic: string;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
  id: string;
};

export interface iExercises {
  muscle_groups: Array<string>;
  equipment_types: Array<string>;
  workouts: Array<iWorkout>;
}
