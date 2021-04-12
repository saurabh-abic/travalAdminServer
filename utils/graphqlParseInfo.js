var assert = require('assert')

var castArr = require('cast-array')

module.exports = parseFields

/**
 * parse fields has two signatures:
 * 1)
 * @param {Object} info - graphql resolve info
 * @param {Boolean} [keepRoot] default: true
 * @return {Object} fieldTree
 * 2)
 * @param {Array} asts - ast array
 * @param {Object} [fragments] - optional fragment map
 * @param {Object} [fieldTree] - optional initial field tree
 * @return {Object} fieldTree
 */
function parseFields (/* dynamic */) {
  var tree
  var info = arguments[0]
  var keepRoot = arguments[1]
  var fieldNodes = info && (info.fieldASTs || info.fieldNodes)
  if (fieldNodes) {
    // (info, keepRoot)
    tree = fieldTreeFromAST(fieldNodes, info.fragments)
    if (!keepRoot) {
      var key = firstKey(tree)
      tree = tree[key]
    }
  } else {
    // (asts, fragments, fieldTree)
    tree = fieldTreeFromAST.apply(this, arguments)
  }
  return tree
}

function getKeyValuMap(arg, res){
    let key = arg.name.value,
        value = arg.value.value;
    if (arg.value.kind === 'ObjectValue') {
        arg.value.fields.forEach(field => {
            let key = field.name.value, values = field.value.values, ObjVal = [];
            values && values.forEach(val => {
                ObjVal.push(val.value)
            });
            if(field.value.kind === 'StringValue' && field.value.value){
                ObjVal = field.value.value
            }
            value = { [key]: ObjVal };
        });
    }
    res[key] = value;
}

function prepareArgs(arg, res){
  let value = arg.value,
    key = arg.name.value
  if(arg.kind === 'Argument' && value.fields){
    let obj = {}
    value.fields.forEach(field =>{
      getKeyValuMap(field,obj)
    });
    res[key] =obj
  }
  else{
    res[key] = value.value;
  }
}

function fieldArgumemntTree(args = [], name,tree){
  let res = {}
  args.forEach(arg =>{
    prepareArgs(arg, res)
  });
  Object.assign(tree[name],{args:res})
}

function fieldTreeFromAST (asts, fragments, init) {
  init = init || {}
  fragments = fragments || {}
  asts = castArr(asts)
  return asts.reduce(function (tree, val) {
    var kind = val.kind
    var name = val.name && val.name.value
    var fragment;

    if (kind === 'Field') {
      if (val.selectionSet) {
        tree[name] = tree[name] || {}
        fieldTreeFromAST(val.selectionSet.selections, fragments, tree[name])
      }
      else {
        tree[name] = true
      }
      if (val.arguments.length && tree[name]) {
        fieldArgumemntTree(val.arguments, name,tree)
      }
    } else if (kind === 'FragmentSpread') {
      fragment = fragments[name]
      assert(fragment, 'unknown fragment "' + name + '"')
      fieldTreeFromAST(fragment.selectionSet.selections, fragments, tree)
    } else if (kind === 'InlineFragment') {
      fragment = val
      fieldTreeFromAST(fragment.selectionSet.selections, fragments, tree)
    } // else ignore
    return tree
  }, init)
}

function firstKey (obj) {
  for (var key in obj) {
    return key
  }
}
