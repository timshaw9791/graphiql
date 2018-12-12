import { ToolbarButton } from '../ToolbarButton';
import { emitter } from './TypeDoc';
import React from 'react';

export function handleStatement(type, field) {
  // 判断type的名称来区分是否显示按钮
  // Determine the name of type to distinguish whether a button is displayed or not
  return type.name === 'QueryType_JPA' || type.name === 'Mutation_SpringMVC'
    ? <ToolbarButton
        title={'Statement'}
        onClick={() => {
          emitter.emit('Statement', {
            field,
            queryOrMutation: !(type.name === 'Mutation_SpringMVC'),
          });
        }}
        label={'Statement'}
      />
    : '';
}
