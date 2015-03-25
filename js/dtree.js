
module.exports = Dtree;

function Dtree() {
  this.size = 0;
}

Dtree.prototype.insert = function(vector) {
  this.root = insert(this.root, vector, true);
};

Dtree.prototype.contains = function(vector) {
  return contains(this.root, vector, true);
};

function insert(node, vector, isOdd) {
  if(!node) {
    return { value : vector };
  }
}

function contains(node, vector, isOdd) {
  if(!node) 
    return false;

  var cmp = node.value.compare(vector, isOdd);
  
  if(cmp < 0)
    return contains(node.left, vector, !isOdd);
  else if (cmp > 0)
    return contains(node.right, vector, !isOdd);

  return true;

}
