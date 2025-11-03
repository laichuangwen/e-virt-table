type Position = 'before' | 'after';

interface TreeConfig {
  key?: string;
  childrenKey?: string;
}

export class TreeUtil<T extends Record<string, any> = any> {
  private root: T[];
  private key: string;
  private childrenKey: string;

  constructor(initialData: T[], config?: TreeConfig) {
    this.root = initialData;
    this.key = config?.key || 'key';
    this.childrenKey = config?.childrenKey || 'children';
  }

  /** 获取当前树 */
  getTree() {
    return this.root;
  }

  /** 移动节点 */
  treeMove(sourceNode: T, targetNode: T, position: Position) {
    // 找到并移除 Source
    const sourceInfo = this.findNodeWithParent(this.root, sourceNode[this.key]);
    if (!sourceInfo) throw new Error('Source node not found');
    const { parent: sourceParent, index: sourceIndex, node: sourceFound } = sourceInfo;

    if (sourceParent) {
      const childrenArr = sourceParent[this.childrenKey] as T[];
      childrenArr.splice(sourceIndex, 1);
      if (childrenArr.length === 0) {
        delete sourceParent[this.childrenKey];
      }
    } else {
      this.root.splice(sourceIndex, 1);
    }

    // 找到 Target
    const targetInfo = this.findNodeWithParent(this.root, targetNode[this.key]);
    if (!targetInfo) throw new Error('Target node not found');
    const { parent: targetParent, index: targetIndex } = targetInfo;

    // 插入
    if (position === 'before') {
      if (targetParent) {
        (targetParent[this.childrenKey] as T[]).splice(targetIndex, 0, sourceFound);
      } else {
        this.root.splice(targetIndex, 0, sourceFound);
      }
    } else if (position === 'after') {
      if (targetParent) {
        (targetParent[this.childrenKey] as T[]).splice(targetIndex + 1, 0, sourceFound);
      } else {
        this.root.splice(targetIndex + 1, 0, sourceFound);
      }
    }
  }

  /** 在树中找到节点及其父节点 */
  private findNodeWithParent(tree: T[], nodeId: any, parent: T | null = null):
    { parent: T | null, index: number, node: T } | null {
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node[this.key] === nodeId) {
        return { parent, index: i, node };
      }
      if (node[this.childrenKey]) {
        const found = this.findNodeWithParent(node[this.childrenKey] as T[], nodeId, node);
        if (found) return found;
      }
    }
    return null;
  }
}