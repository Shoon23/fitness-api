import { iWorkout } from "../controller/workout_controller";

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
export function removeDuplicates(array1: any[], array2: any[]) {
  // Compare lengths of the two arrays
  if (array1.length > array2.length) {
    // If array1 is longer, create a set from array2 and filter array1
    const set = new Set(array2);
    return array1.filter((item) => !set.has(item));
  } else {
    // If array2 is longer, create a set from array1 and filter array2
    const set = new Set(array1);
    return array2.filter((item) => !set.has(item));
  }
}

export function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
