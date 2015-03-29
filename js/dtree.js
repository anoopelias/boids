
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

Dtree.prototype.neighbors = function(point, radius) {
  var objects = [],
    stack = [this.root],
    radiusSq = radius * radius,
    node,
    position;

  // Not speeding up enough with recursion
  while(stack.length > 0) {
    node = stack.pop();
    position = node.value.position;

    if(position.distSquared(point) <= radiusSq) 
      objects.push(node.value);

    var cmp = point.compare(position, node.isEven);
    var distP2L = distanceToLine(point, position, node.isEven);

    if(node.left && (cmp <= 0 || distP2L <= radius))
      stack.push(node.left);

    if(node.right && (cmp >= 0 || distP2L <= radius))
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

function distanceToLine(a, b, horizontal) {
  return Math.abs(horizontal ? a.y - b.y : a.x - b.x);
}

function toString(node) {
  if(!node) {
    return '';
  }

  return '{ L:' + toString(node.left) + 
    ', N:' + node.value + 
    ', R:' + toString(node.right) + '}';
}
