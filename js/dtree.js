module.exports = Dtree;

function Dtree() {
  this.size = 0;
}

Dtree.prototype.insert = function(obj) {
  this.root = insert(this.root, obj, false);
};

Dtree.prototype.contains = function(obj) {
  return contains(this.root, obj);
};

Dtree.prototype.toString = function() {
  return toString(this.root);
};

Dtree.prototype.neighbors = function(point, radiusSq) {
  var objects = [],
    stack = [this.root],
    distSq,
    distX, distY,
    node,
    cmp,
    position,
    dist2line;

  // Not speeding up enough with recursion
  while(stack.length > 0) {
    node = stack.pop();
    position = node.value.position;
    isEven = node.isEven;

    distX = point.x - position.x;
    distY = point.y - position.y;
    distSq = distX * distX + distY * distY;

    if(distSq <= radiusSq)
      objects.push({
        neighbor: node.value,
        distSq: distSq
      });

    cmp = (isEven ? (distY || distX) : (distX || distY));
    dist2line = Math.pow(isEven ? distY : distX, 2);

    if(node.left && (cmp <= 0 || dist2line <= radiusSq))
      stack.push(node.left);

    if(node.right && (cmp >= 0 || dist2line <= radiusSq))
      stack.push(node.right);

  }

  return objects;
};

function insert(node, obj, isEven) {
  if(!node) {
    return { value : obj, isEven: isEven };
  }

  var cmp = obj.compare(node.value, isEven);
  if(cmp < 0) {
    node.left = insert(node.left, obj, !isEven);
  } else if (cmp > 0) {
    node.right = insert(node.right, obj, !isEven);
  }

  return node;
}

function contains(node, obj, isEven) {
  if(!node)
    return false;

  var cmp = obj.compare(node.value, isEven);

  if(cmp < 0)
    return contains(node.left, obj, !isEven);
  else if (cmp > 0)
    return contains(node.right, obj, !isEven);

  return true;

}

function toString(node) {
  if(!node) {
    return '';
  }

  return '{ L:' + toString(node.left) +
    ', N:' + node.value +
    ', R:' + toString(node.right) + '}';
}
