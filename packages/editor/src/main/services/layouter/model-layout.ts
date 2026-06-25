import { UMLModel } from '../../typings';
import { IBoundary } from '../../utils/geometry/boundary';
import { IPath } from '../../utils/geometry/path';
import { Direction } from '../uml-element/uml-element-port';
import { computeElkLayout, LayoutEdge, LayoutNode, LayoutPoint } from './elk-layouter';

/**
 * Lays out a UML class model with ELK and returns a NEW model whose elements
 * are repositioned accordingly. Pure and fully awaitable (no editor instance,
 * no Redux, no DOM) — intended for headless use such as server-side SVG export.
 *
 * Top-level elements (classes/enums, `owner === null`) are placed by ELK; their
 * child members (attributes/methods) are shifted by the same delta so they stay
 * attached. The layout is recentered onto the model's current center so it does
 * not jump toward the origin. Relationships are re-routed using ELK's own edge
 * geometry and marked `isManuallyLayouted` so the rendered model is internally
 * consistent without depending on the editor's layouter saga (which does not run
 * reliably in a headless/jsdom editor).
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

  const { nodes: positions, edges: routes } = await computeElkLayout(nodes, edges);
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

  // Re-route relationships from ELK's edge geometry. ELK's coordinates share the
  // layout origin, so the same recentering `offset` maps them onto the moved
  // boxes. Each route becomes the relationship's path (relative to its own
  // bounds, the Apollon convention) with anchors derived from where the route
  // meets each box. Marking the relationship manually-layouted keeps the
  // editor's layouter saga from overwriting it on import.
  const routeById = new Map(routes.map((route) => [route.id, route.points]));
  const relationships: UMLModel['relationships'] = {};
  for (const [id, relationship] of Object.entries(model.relationships)) {
    const elkPoints = routeById.get(id);
    if (!elkPoints || elkPoints.length < 2) {
      relationships[id] = relationship;
      continue;
    }

    const absolute = elkPoints.map((point) => ({ x: point.x + offset.x, y: point.y + offset.y }));
    const xs = absolute.map((point) => point.x);
    const ys = absolute.map((point) => point.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const bounds: IBoundary = { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
    const path = absolute.map((point) => ({ x: point.x - minX, y: point.y - minY })) as IPath;

    relationships[id] = {
      ...relationship,
      path,
      bounds,
      source: {
        ...relationship.source,
        direction: borderDirection(absolute[0], elements[relationship.source.element]?.bounds) ?? relationship.source.direction,
      },
      target: {
        ...relationship.target,
        direction:
          borderDirection(absolute[absolute.length - 1], elements[relationship.target.element]?.bounds) ??
          relationship.target.direction,
      },
      isManuallyLayouted: true,
    };
  }

  return { ...model, elements, relationships };
}

/**
 * Classifies which side of `box` a routed endpoint sits on, so the relationship
 * anchor (and its marker/labels) faces the correct border. Returns `undefined`
 * when the connected box is missing so the caller keeps the existing anchor.
 */
function borderDirection(point: LayoutPoint, box?: IBoundary): Direction | undefined {
  if (!box) {
    return undefined;
  }
  const candidates: Array<[Direction, number]> = [
    [Direction.Up, Math.abs(point.y - box.y)],
    [Direction.Down, Math.abs(point.y - (box.y + box.height))],
    [Direction.Left, Math.abs(point.x - box.x)],
    [Direction.Right, Math.abs(point.x - (box.x + box.width))],
  ];
  return candidates.reduce((closest, current) => (current[1] < closest[1] ? current : closest))[0];
}
