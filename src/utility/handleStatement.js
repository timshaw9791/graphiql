// 处理数据方法
import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLNonNull,
} from 'graphql';

export function handleStatement(data) {
  let setType = '';
  let parameter = '';
  let statement;
  // 判断是query还是mutation
  if (data.queryOrMutation) {
    statement = 'query get';
  } else {
    statement = 'mutation ';
  }
  // 加上对象名称组成操作名称
  statement += data.field.name;
  // 如果对象里有参数那么就循环 添加参数
  if (data.field.args.length) {
    let type;
    let args = '';
    for (const i in data.field.args) {
      if (data.field.args[i]) {
        args = data.field.args[i].name;
      }
      // if (data.queryOrMutation) {
      //   type = data.field.args[i].type.name;
      // } else {
      // type = data.field.args[i].type.ofType;
      // }
      type = data.field.args[i].type;
      if (type instanceof GraphQLNonNull) {
        type = type.ofType + '!';
      }
      setType += '$' + args + ':' + type;
      parameter += args + ':$' + args + ' ';
    }
    setType = '(' + setType + ')';
    parameter = '(' + parameter + ')';
    statement += setType;
  }
  statement += '{' + data.field.name + parameter;
  // 判断 如果是GraphQLScalarType 就加上名字然后返回
  if (data.field.type instanceof GraphQLScalarType) {
    statement += '}';
  } else {
    // 不是GraphQLScalarType那就是GraphQLObjectType或者是GraphQLList放入递归算法
    const fields = data.field.type.getFields();
    statement += '{' + f(fields) + '} }';
  }
  return statement;
}

// 递归算法取值然后拼接
function f(fields) {
  let rs = '';
  for (const m in fields) {
    // GraphQLScalarType
    if (fields[m].type instanceof GraphQLScalarType) {
      rs += fields[m].name + ' ';
    } else if (fields[m].type instanceof GraphQLList) {
      // GraphQLList
      const contentFields = fields[m].type.ofType.getFields();
      rs += fields[m].name + '{ ';
      // 判断GraphQLList下面的每个元素
      rs += f(contentFields) + ' }';
    } else if (fields[m].type instanceof GraphQLObjectType) {
      // GraphQLObjectType 判断是不是值对象
      const objectFields = fields[m].type.getFields();
      if (isInArray(objectFields)) {
        rs += fields[m].name + '{ id }';
      } else {
        rs += fields[m].name + '{ ';
        // 判断GraphQLList下面的每个元素
        rs += f(objectFields) + ' }';
      }
    }
  }
  return rs;
}

// 判断是否是值对象
function isInArray(array) {
  let isIn = false;
  for (const i in array) {
    if (i === 'id') {
      isIn = true;
    }
  }
  return isIn;
}
