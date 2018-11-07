// 处理数据方法
import { GraphQLList, GraphQLObjectType, GraphQLScalarType } from 'graphql';

export function handleStatement(data) {
  let setType = '';
  let parameter = '';
  let statement;
  if (data.queryOrMutation) {
    statement = 'query get';
  } else {
    statement = 'mutation ';
  }
  statement += data.field.name;
  if (data.field.args.length) {
    let type = '';
    let args = '';
    for (const i in data.field.args) {
      if (data.field.args[i]) {
        args = data.field.args[i].name;
      }
      if (data.queryOrMutation) {
        type = data.field.args[i].type.name;
      } else {
        type = data.field.args[i].type.ofType;
      }
      setType += '$' + args + ':' + type + '! ';
      parameter += args + ':$' + args + ' ';
    }
  }
  statement +=
    '(' + setType + ')' + '{' + data.field.name + '(' + parameter + ') {';
  if (data.field.type instanceof GraphQLScalarType) {
    statement += data.field.type + ' ';
  } else {
    const fields = data.field.type.getFields();
    statement += f(fields);
  }
  statement += '} }';
  return statement;
}

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
      // GraphQLObjectType
      rs += fields[m].name + '{ id }';
    }
  }
  return rs;
}
