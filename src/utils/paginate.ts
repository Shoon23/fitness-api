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
