function updateChildren(
  parentElm /* : Node */,
  oldCh /* : VNode[] */,
  newCh /* : VNode[] */
) {
  // oldCh
  let oldStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];

  // newCh
  let newStartIdx = 0;
  let newEndIdx = newCh.length - 1;
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];

  let oldKeyToIdx;
  let idxInOld;
  let elmToMove;

  // while oldCh or newCh hasn't reached the endIndex
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // Vnode might have been moved
    if (oldStartVnode == null) {
      // oldStartIdx -> +1
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (oldEndVnode == null) {
      // -1 <- oldEndIdx
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (newStartVnode == null) {
      // newStartIdx -> +1
      newStartVnode = newCh[++newStartIdx];
    } else if (newEndVnode == null) {
      // -1 <- newEndIdx
      newEndVnode = newCh[--newEndIdx];
    }
    // END Vnode might have been moved
    else if (sameVnode(oldStartVnode, newStartVnode)) {
      // oldStartVnode and newStartVnode are the same node
      patchVnode(oldStartVnode, newStartVnode);
      // oldStartIdx -> +1
      // newStartIdx -> +1
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      // oldEndVnode and newEndVnode are the same node
      patchVnode(oldEndVnode, newEndVnode);
      // -1 <- oldEndIdx
      // -1 <- newEndIdx
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // oldStartVnode and newEndVnode are the same node
      patchVnode(oldStartVnode, newEndVnode);
      // oldStartVnode -> insert after oldEndVnode
      api.insertBefore(
        parentElm,
        oldStartVnode.elm,
        api.nextSibling(oldEndVnode.elm)
      );
      // oldStartIdx -> +1
      // -1 <- newEndIdx
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // oldEndVnode and newStartVnode are the same node
      // insert before oldStartVnode <- oldEndVnode
      patchVnode(oldEndVnode, newStartVnode);
      api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
      // -1 <- oldEndIdx
      // newStartIdx -> +1
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      // oldStartVnode/oldEndVnode and newStartVnode/oldStartVnode are not the same node
      if (oldKeyToIdx === undefined) {
        // create oldKeyToIdx: { [oldVnode.Key]: idxInOld }
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      }
      // find newStartVnode in the oldVnodes
      idxInOld = oldKeyToIdx[newStartVnode.key];

      if (isUndef(idxInOld)) {
        // newStartVnode is a new element
        api.insertBefore(
          parentElm,
          createElm(newStartVnode), // create newStartVnode a new element
          oldStartVnode.elm // insert before oldStartVnode
        );
      } else {
        // newStartVnode matches one oldVnode in OldKeyToIdx
        elmToMove = oldCh[idxInOld];
        if (elmToMove.sel !== newStartVnode.sel) {
          // key is equal but sel not
          // newStartVnode is a new element
          api.insertBefore(
            parentElm,
            createElm(newStartVnode), // create newStartVnode a new element
            oldStartVnode.elm // insert before oldStartVnode
          );
        } else {
          patchVnode(elmToMove, newStartVnode);
          oldCh[idxInOld] = undefined;
          api.insertBefore(
            parentElm,
            elmToMove.elm, // newStartVnode is equal to (elmToMove = oldCh[idxInOld])
            oldStartVnode.elm // insert before oldStartVnode
          );
        }
      }
      // newStartIdx -> +1
      newStartVnode = newCh[++newStartIdx];
    }
  }

  // oldCh or newCh at least one has reached the endIndex
  if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
    if (oldStartIdx > oldEndIdx) {
      // newCh still has elements
      const beforeElm =
        newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
      // add the remaining elements in the newCh before the beforeElm
      addVnodes(parentElm, beforeElm, newCh, newStartIdx, newEndIdx);
    } else {
      // oldCh still has elements
      // remove the remaining elements in the oldCh
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }
}

function isUndef(s) {
  return s === undefined;
}
function isDef(s) {
  return s !== undefined;
}

function patchVnode(oldVnode /* : VNode */, newVnode /* : VNode */) {
  const elm = (newVnode.elm = oldVnode.elm); // the real DOM element of oldVnode
  const oldCh = oldVnode.children; // the children VNode[] of oldVnode
  const newCh = newVnode.children; // the children VNode[] of newVnode

  if (oldVnode === newVnode) return; // if oldVnode is exactly newVnode then return

  if (isUndef(newVnode.text)) {
    if (isDef(oldCh) && isDef(newCh)) {
      // oldCh and newCh are defined
      if (oldCh !== newCh)
        // oldCh is not equal to newCh
        updateChildren(elm, oldCh, newCh); // compare and update the children
    } else if (isDef(newCh)) {
      // oldCh is undefined and newCh is defined
      addVnodes(elm, newCh); // create newCh vnodes and elements append to elm
    } else if (isDef(oldCh)) {
      // oldCh is defined and newCh is undefined
      removeVnodes(elm, oldCh); // remove oldCh vnodes and elements from elm
    } else if (isDef(oldVnode.text)) {
      // oldCh and newCh are undefined
      // oldVnode text is defined and newVnode text is undefined
      api.setTextContent(elm, ""); // set elm text to ""
    }
  } else if (oldVnode.text !== newVnode.text) {
    // oldVnode text and newVnode text are defined but different
    // oldVnode and newVnode are Text node
    api.setTextContent(elm, newVnode.text); // then update newVnode text to elm
  }
}

function sameVnode(vnode1 /* : VNode */, vnode2 /* : VNode */) {
  const isSameKey = vnode1.key === vnode2.key;
  const isSameTagName = vnode1.tagName === vnode2.tagName;
  const isSameSel = vnode1.sel === vnode2.sel;
  const isSameDataIs =
    (vnode1.data && vnode1.data.is) === (vnode2.data && vnode2.is);
  return isSameKey && isSameTagName && isSameSel && isSameDataIs;
}

function patch(oldVnode /* : VNode */, newVnode /* : VNode */) /* : VNode */ {
  // is same vnode?
  if (sameVnode(oldVnode, newVnode)) {
    // yes
    patchVnode(oldVnode, newVnode); // continue the deep comparison
  } else {
    // no
    const oldElm = oldVnode.elm; // the real DOM element of oldVnode
    const parentElm = api.parentNode(oldElm); // the real DOM element of oldElm's parent

    createElm(newVnode); // create a real DOM element corresponding to the newVnode
    const newElm = newVnode.elm; // the real DOM element of newVnode

    // is parentElm exist?
    if (parentElm !== null) {
      // yes
      // insert newElm before oldElm's nextSibling element in parentElm
      api.insertBefore(parentElm, newElm, api.nextSibling(oldElm));
      // remove oldElm from parentElm
      api.removeChild(parentElm, oldElm);
    }
  }

  return newVnode; // return newVnode
}
