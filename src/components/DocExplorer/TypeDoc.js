/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
const EventEmitter = require('events').EventEmitter;
export const emitter = new EventEmitter();

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLEnumType,
} from 'graphql';

import Argument from './Argument';
import MarkdownContent from './MarkdownContent';
import TypeLink from './TypeLink';
import DefaultValue from './DefaultValue';
// 引用HandleDescription方法和TextContent组件 用来处理field的description
import { HandleDescription } from './HandleDescription';
import TextContent from './TextContent';
import { ToolbarButton } from '../ToolbarButton';
export default class TypeDoc extends React.Component {
  static propTypes = {
    schema: PropTypes.instanceOf(GraphQLSchema),
    type: PropTypes.object,
    onClickType: PropTypes.func,
    onClickField: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { showDeprecated: false };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.type !== nextProps.type ||
      this.props.schema !== nextProps.schema ||
      this.state.showDeprecated !== nextState.showDeprecated
    );
  }

  render() {
    const schema = this.props.schema;
    const type = this.props.type;
    const onClickType = this.props.onClickType;
    const onClickField = this.props.onClickField;
    let typesTitle;
    let types;
    if (type instanceof GraphQLUnionType) {
      typesTitle = 'possible types';
      types = schema.getPossibleTypes(type);
    } else if (type instanceof GraphQLInterfaceType) {
      typesTitle = 'implementations';
      types = schema.getPossibleTypes(type);
    } else if (type instanceof GraphQLObjectType) {
      typesTitle = 'implements';
      types = type.getInterfaces();
    }

    let typesDef;
    if (types && types.length > 0) {
      typesDef = (
        <div className="doc-category">
          <div className="doc-category-title">{typesTitle}</div>
          {types.map(subtype =>
            <div key={subtype.name} className="doc-category-item">
              <TypeLink type={subtype} onClick={onClickType} />
            </div>,
          )}
        </div>
      );
    }

    // InputObject and Object
    let fieldsDef;
    let deprecatedFieldsDef;
    if (type.getFields) {
      const fieldMap = type.getFields();
      const fields = Object.keys(fieldMap).map(name => fieldMap[name]);
      fieldsDef = (
        <div className="doc-category">
          <div className="doc-category-title">{'fields'}</div>
          {fields
            .filter(field => !field.isDeprecated)
            .map(field =>
              <Field
                key={field.name}
                type={type}
                field={field}
                onClickType={onClickType}
                onClickField={onClickField}
              />,
            )}
        </div>
      );

      const deprecatedFields = fields.filter(field => field.isDeprecated);
      if (deprecatedFields.length > 0) {
        deprecatedFieldsDef = (
          <div className="doc-category">
            <div className="doc-category-title">{'deprecated fields'}</div>
            {!this.state.showDeprecated
              ? <button
                  className="show-btn"
                  onClick={this.handleShowDeprecated}>
                  {'Show deprecated fields...'}
                </button>
              : deprecatedFields.map(field =>
                  <Field
                    key={field.name}
                    type={type}
                    field={field}
                    onClickType={onClickType}
                    onClickField={onClickField}
                  />,
                )}
          </div>
        );
      }
    }

    let valuesDef;
    let deprecatedValuesDef;
    if (type instanceof GraphQLEnumType) {
      const values = type.getValues();
      valuesDef = (
        <div className="doc-category">
          <div className="doc-category-title">{'values'}</div>
          {values
            .filter(value => !value.isDeprecated)
            .map(value => <EnumValue key={value.name} value={value} />)}
        </div>
      );

      const deprecatedValues = values.filter(value => value.isDeprecated);
      if (deprecatedValues.length > 0) {
        deprecatedValuesDef = (
          <div className="doc-category">
            <div className="doc-category-title">{'deprecated values'}</div>
            {!this.state.showDeprecated
              ? <button
                  className="show-btn"
                  onClick={this.handleShowDeprecated}>
                  {'Show deprecated values...'}
                </button>
              : deprecatedValues.map(value =>
                  <EnumValue key={value.name} value={value} />,
                )}
          </div>
        );
      }
    }

    return (
      <div>
        <MarkdownContent
          className="doc-type-description"
          markdown={type.description || 'No Description'}
        />
        {type instanceof GraphQLObjectType && typesDef}
        {fieldsDef}
        {deprecatedFieldsDef}
        {valuesDef}
        {deprecatedValuesDef}
        {!(type instanceof GraphQLObjectType) && typesDef}
      </div>
    );
  }

  handleShowDeprecated = () => this.setState({ showDeprecated: true });
}

function Field({ type, field, onClickType, onClickField }) {
  return (
    <div className="doc-category-item">
      <a
        className="field-name"
        onClick={event => onClickField(field, type, event)}>

        {field.name}
      </a>
      {field.args &&
      field.args.length > 0 && [
        '(',
        <span key="args">
          {field.args.map(arg =>
            <Argument key={arg.name} arg={arg} onClickType={onClickType} />,
          )}
        </span>,
        ')',
      ]}
      {': '}
      <TypeLink type={field.type} onClick={onClickType} />
      <DefaultValue field={field} />
      {// 判断type的名称来区分是否显示按钮
      // Determine the name of type to distinguish whether a button is displayed or not
      type.name === 'QueryType_JPA' || type.name === 'Mutation_SpringMVC'
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
        : ''}

      {field.description &&
        <TextContent
          className="field-short-description"
          text={HandleDescription(field.description)}
        />}
      {field.deprecationReason &&
        <MarkdownContent
          className="doc-deprecation"
          markdown={field.deprecationReason}
        />}
    </div>
  );
}

Field.propTypes = {
  type: PropTypes.object,
  field: PropTypes.object,
  onClickType: PropTypes.func,
  onClickField: PropTypes.func,
};

function EnumValue({ value }) {
  return (
    <div className="doc-category-item">
      <div className="enum-value">{value.name}</div>
      <MarkdownContent
        className="doc-value-description"
        markdown={value.description}
      />
      {value.deprecationReason &&
        <MarkdownContent
          className="doc-deprecation"
          markdown={value.deprecationReason}
        />}
    </div>
  );
}

EnumValue.propTypes = {
  value: PropTypes.object,
};
