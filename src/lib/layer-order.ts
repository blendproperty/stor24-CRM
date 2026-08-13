export type LayerMove = "front" | "forward" | "backward" | "back";

export function moveLayer<T extends { id: string }>(
  items: T[],
  selectedId: string,
  move: LayerMove,
) {
  const currentIndex = items.findIndex((item) => item.id === selectedId);
  if (currentIndex < 0) return items;

  const lastIndex = items.length - 1;
  const nextIndex =
    move === "front"
      ? lastIndex
      : move === "forward"
        ? Math.min(lastIndex, currentIndex + 1)
        : move === "backward"
          ? Math.max(0, currentIndex - 1)
          : 0;

  if (nextIndex === currentIndex) return items;

  const reordered = [...items];
  const [selected] = reordered.splice(currentIndex, 1);
  reordered.splice(nextIndex, 0, selected);
  return reordered;
}
