export type TreeUtilPosition = 'none' | 'before' | 'after' | 'inside';

interface TreeConfig {
  key?: string;
  childrenKey?: string;
}

interface NodeInfo {
  parent: any | null;
  index: number;
  node: any;
}

export class TreeUtil {
  private root: any[];
  private key: string;
  private childrenKey: string;

  constructor(initialData: any[], config?: TreeConfig) {
    this.root = initialData;
    this.key = config?.key || 'key';
    this.childrenKey = config?.childrenKey || 'children';
  }

  getTree() {
    return this.root;
  }

  treeMove(sourceKey: any, targetKey: any, position: TreeUtilPosition) {
    if (position === 'none') {
      return;
    }
    if (sourceKey === targetKey) {
      return;
    }

    const sourceInfo = this.findNodeWithParent(this.root, sourceKey);
    if (!sourceInfo) return;

    const targetInfo = this.findNodeWithParent(this.root, targetKey);
    if (!targetInfo) return;

    const { parent: sourceParent, index: sourceIndex, node: sourceNode } = sourceInfo;
    const { parent: targetParent, index: targetIndex, node: targetNode } = targetInfo;

    if (this.isDescendant(sourceNode, targetKey)) {
      return;
    }
    const sourceArray = sourceParent ? sourceParent[this.childrenKey] : this.root;
    sourceArray.splice(sourceIndex, 1);

    if (sourceParent && sourceArray.length === 0) {
      delete sourceParent[this.childrenKey];
    }
    if (position === 'inside') {
      if (!Array.isArray(targetNode[this.childrenKey])) {
        targetNode[this.childrenKey] = [];
      }
      targetNode[this.childrenKey].push(sourceNode);
      return;
    }

    const targetArray = targetParent ? targetParent[this.childrenKey] : this.root;

    let insertIndex = targetIndex;
    if (sourceParent === targetParent && sourceIndex < targetIndex) {
      insertIndex--;
    }
    if (position === 'after') insertIndex++;

    targetArray.splice(insertIndex, 0, sourceNode);
  }

  private findNodeWithParent(tree: any[], nodeKey: any, parent: any | null = null): NodeInfo | null {
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node[this.key] === nodeKey) return { parent, index: i, node };
      const children = node[this.childrenKey];
      if (Array.isArray(children)) {
        const found = this.findNodeWithParent(children, nodeKey, node);
        if (found) return found;
      }
    }
    return null;
  }

  private isDescendant(node: any, targetKey: any): boolean {
    const children = node[this.childrenKey];
    if (!Array.isArray(children)) return false;
    for (const child of children) {
      if (child[this.key] === targetKey) return true;
      if (this.isDescendant(child, targetKey)) return true;
    }
    return false;
  }
}
