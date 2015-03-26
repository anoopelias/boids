
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
};

function insert(node, vector, isOdd) {
  if(!node) {
    return { value : vector };
  }

  var cmp = vector.compare(node.value, isOdd);
  if(cmp < 0) {
    node.left = insert(node.left, vector, !isOdd);
  } else if (cmp > 0) {
    node.right = insert(node.right, vector, !isOdd);
  }

  return node;
}

function contains(node, vector, isOdd) {
  if(!node) 
    return false;

  var cmp = vector.compare(node.value, isOdd);
  
  if(cmp < 0)
    return contains(node.left, vector, !isOdd);
  else if (cmp > 0)
    return contains(node.right, vector, !isOdd);

  return true;

}

function toString(node) {
  if(!node) {
    return '';
  }

  return '{ L:' + toString(node.left)
    + ', N:' + node.value
    + ', R:' + toString(node.right) + '}';
}
