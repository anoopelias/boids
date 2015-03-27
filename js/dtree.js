
module.exports = Dtree;

function Dtree() {
  this.size = 0;
}

Dtree.prototype.insert = function(vector) {
  this.root = insert(this.root, vector);
};

Dtree.prototype.contains = function(vector) {
  return contains(this.root, vector);
};

Dtree.prototype.toString = function() {
  return toString(this.root);
};

Dtree.prototype.neighbors = function(point, radius) {
  return neighbors(this.root, point, radius);
};

function insert(node, vector, isEven) {
  if(!node) {
    return { value : vector };
  }

  var cmp = vector.compare(node.value, isEven);
  if(cmp < 0) {
    node.left = insert(node.left, vector, !isEven);
  } else if (cmp > 0) {
    node.right = insert(node.right, vector, !isEven);
  }

  return node;
}

function contains(node, vector, isEven) {
  if(!node) 
    return false;

  var cmp = vector.compare(node.value, isEven);
  
  if(cmp < 0)
    return contains(node.left, vector, !isEven);
  else if (cmp > 0)
    return contains(node.right, vector, !isEven);

  return true;

}

function neighbors(node, point, radius, isEven) {
  var neighborPoints = [],
    leftPoints = [],
    rightPoints = [];

  if(!node)
    return neighborPoints;

  if(node.value.distance(point) <= radius) {
    neighborPoints.push(node.value);
  }

  var cmp = point.compare(node.value, isEven);
  var distP2L = distanceToLine(point, node.value, isEven);

  if(cmp <= 0 || distP2L <= radius) {
    leftPoints = neighbors(node.left, point, radius, !isEven);
  }

  if(cmp >= 0 || distP2L <= radius) {
    rightPoints = neighbors(node.right, point, radius, !isEven);
  }

  return neighborPoints.concat(leftPoints).concat(rightPoints);

}

function distanceToLine(a, b, horizontal) {
  return Math.abs(horizontal ? a.y - b.y : a.x - b.x);
}

function toString(node) {
  if(!node) {
    return '';
  }

  return '{ L:' + toString(node.left)
    + ', N:' + node.value
    + ', R:' + toString(node.right) + '}';
}
