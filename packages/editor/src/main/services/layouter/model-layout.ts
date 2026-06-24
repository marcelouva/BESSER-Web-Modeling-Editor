import { UMLModel } from '../../typings';
import { computeElkLayout, LayoutEdge, LayoutNode } from './elk-layouter';

/**
 * Lays out a UML class model with ELK and returns a NEW model whose elements
 * are repositioned accordingly. Pure and fully awaitable (no editor instance,
 * no Redux, no DOM) — intended for headless use such as server-side SVG export.
 *
 * Top-level elements (classes/enums, `owner === null`) are placed by ELK; their
 * child members (attributes/methods) are shifted by the same delta so they stay
 * attached. The layout is recentered onto the model's current center so it does
 * not jump toward the origin. Relationship paths are left untouched — the editor
 * recomputes non-manually-layouted relationships when the model is rendered.
 */
export async function layoutModel(model: UMLModel): Promise<UMLModel> {
  const topLevel = Object.values(model.elements).filter((element) => element.owner === null);
  if (topLevel.length === 0) {
    return model;
  }

  const nodes: LayoutNode[] = topLevel.map((element) => ({
    id: element.id,
    width: element.bounds.width,
    height: element.bounds.height,
  }));

  const edges: LayoutEdge[] = Object.values(model.relationships)
    .filter((rel) => Boolean(rel.source?.element && rel.target?.element))
    .map((rel) => ({ id: rel.id, sourceId: rel.source.element, targetId: rel.target.element }));

  const positions = await computeElkLayout(nodes, edges);
  if (positions.length === 0) {
    return model;
  }

  // Recenter the ELK result onto the model's current bounding-box center.
  let newMinX = Infinity;
  let newMinY = Infinity;
  let newMaxX = -Infinity;
  let newMaxY = -Infinity;
  let curMinX = Infinity;
  let curMinY = Infinity;
  let curMaxX = -Infinity;
  let curMaxY = -Infinity;
  const sizeById = new Map(nodes.map((node) => [node.id, node]));
  for (const position of positions) {
    const size = sizeById.get(position.id);
    const current = model.elements[position.id];
    if (!size || !current) {
      continue;
    }
    newMinX = Math.min(newMinX, position.x);
    newMinY = Math.min(newMinY, position.y);
    newMaxX = Math.max(newMaxX, position.x + size.width);
    newMaxY = Math.max(newMaxY, position.y + size.height);
    curMinX = Math.min(curMinX, current.bounds.x);
    curMinY = Math.min(curMinY, current.bounds.y);
    curMaxX = Math.max(curMaxX, current.bounds.x + current.bounds.width);
    curMaxY = Math.max(curMaxY, current.bounds.y + current.bounds.height);
  }
  const offset = Number.isFinite(newMinX)
    ? { x: (curMinX + curMaxX) / 2 - (newMinX + newMaxX) / 2, y: (curMinY + curMaxY) / 2 - (newMinY + newMaxY) / 2 }
    : { x: 0, y: 0 };

  // Per-top-level delta = target position - current position.
  const deltaById = new Map<string, { x: number; y: number }>();
  for (const position of positions) {
    const current = model.elements[position.id];
    if (!current) {
      continue;
    }
    deltaById.set(position.id, {
      x: position.x + offset.x - current.bounds.x,
      y: position.y + offset.y - current.bounds.y,
    });
  }

  const elements: UMLModel['elements'] = {};
  for (const [id, element] of Object.entries(model.elements)) {
    // A node moves by its own delta; a child moves by its owner's delta.
    const delta = deltaById.get(id) ?? (element.owner ? deltaById.get(element.owner) : undefined);
    elements[id] = delta
      ? { ...element, bounds: { ...element.bounds, x: element.bounds.x + delta.x, y: element.bounds.y + delta.y } }
      : element;
  }

  return { ...model, elements };
}
