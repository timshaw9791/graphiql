// 处理后端传过来的描述内容

export function HandleDescription(des) {
  let [desArr, description] = [[], ''];
  desArr = String(des).indexOf('$$') !== -1 ? String(des).split('$$') : des;
  if (desArr instanceof Array) {
    for (const i in desArr) {
      if (desArr[i]) {
        description += desArr[i] + '<br>';
      }
    }
    return description;
  }
  return desArr;
}
