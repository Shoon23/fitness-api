import { iWorkout } from "../types/workout_types";

export function paginateResults(
  recommendations: iWorkout[],
  params: { page_size: number; page_number: number }
) {
  const totalItems = recommendations.length;
  const totalPages = Math.ceil(totalItems / params.page_size);

  const startIndex = (params.page_number - 1) * params.page_size;
  const endIndex = Math.min(startIndex + params.page_size, totalItems);

  const hasNextPage = endIndex < totalItems;
  const hasPrevPage = params.page_number > 1;

  const nextPage = hasNextPage ? params.page_number + 1 : null;
  const prevPage = hasPrevPage ? params.page_number - 1 : null;

  const paginatedResults = recommendations.slice(startIndex, endIndex);

  return {
    totalItems: totalItems,
    totalPages: totalPages,
    currentPage: params.page_number,
    nextPage: nextPage,
    prevPage: prevPage,
    workouts: paginatedResults,
  };
}
export function removeDuplicates(
  array1: any[],
  array2: any[],
  propertyName: string
) {
  // Concatenate both arrays
  const combinedArray = [...array1, ...array2];

  // Create a Set to store unique property values
  const set = new Set();

  // Filter the combined array to keep only unique objects based on the specified property
  const uniqueObjects = combinedArray.filter((item) => {
    if (set.has(item[propertyName])) {
      return false; // Filter out duplicates
    } else {
      set.add(item[propertyName]);
      return true; // Keep unique items
    }
  });

  return uniqueObjects;
}

export function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
