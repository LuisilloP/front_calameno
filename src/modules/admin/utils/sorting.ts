export const sortByIdDesc = <T extends { id: number }>(items: T[]): T[] =>
  [...items].sort((a, b) => b.id - a.id);
