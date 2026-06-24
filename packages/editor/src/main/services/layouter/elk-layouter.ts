import ELK from 'elkjs/lib/elk.bundled.js';
import type { ElkNode } from 'elkjs/lib/elk.bundled.js';

/**
 * Framework-agnostic ELK auto-layout.
 *
 * Inputs are plain `{ id, width, height }` nodes and `{ id, sourceId, targetId }`
 * edges — deliberately decoupled from the editor's element model so the same
 * function can be reused by the current editor, a future React Flow editor, and
 * any headless model→image path. The ELK options mirror the React Flow
 * migration branch (layered algorithm, orthogonal routing) so layouts stay
 * consistent across both editors.
 */

export type LayoutDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface LayoutNode {
  id: string;
  width: number;
  height: number;
}

export interface LayoutEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface LayoutPosition {
  id: string;
  x: number;
  y: number;
}

export interface ElkLayoutOptions {
  /** Layer flow direction. Defaults to DOWN (top-to-bottom). */
  direction?: LayoutDirection;
}

const elk = new ELK();

/**
 * Computes new top-left positions for every node using ELK's layered
 * algorithm. Returns absolute positions (relative to the layout origin);
 * the caller maps them onto its own coordinate/move API.
 */
export async function computeElkLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  options: ElkLayoutOptions = {},
): Promise<LayoutPosition[]> {
  if (nodes.length === 0) {
    return [];
  }

  const nodeIds = new Set(nodes.map((node) => node.id));
  // ELK only understands edges whose endpoints are both laid-out nodes.
  const elkEdges = edges
    .filter((edge) => nodeIds.has(edge.sourceId) && nodeIds.has(edge.targetId))
    .map((edge) => ({ id: edge.id, sources: [edge.sourceId], targets: [edge.targetId] }));

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': options.direction ?? 'DOWN',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.spacing.nodeNode': '60',
      'elk.layered.spacing.nodeNodeBetweenLayers': '90',
      'elk.padding': '[top=50,left=30,bottom=30,right=30]',
    },
    children: nodes.map((node) => ({ id: node.id, width: node.width, height: node.height })),
    edges: elkEdges,
  };

  const laidOut = await elk.layout(graph);

  return (laidOut.children ?? []).map((child) => ({
    id: child.id,
    x: child.x ?? 0,
    y: child.y ?? 0,
  }));
}
