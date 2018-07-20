// @flow

import * as React from 'react';
import { TriggerableContext } from './withNativeAd';

type TriggerableFragmentChildPropsType = {
  unregister: (*) => void,
  register: (*) => void,
  children: React.Node,
}

class TriggerableFragmentChild extends React.Component<TriggerableFragmentChildPropsType> {
  componentDidMount() {
    this.props.register(this);
  }

  componentWillUnmount() {
    this.props.unregister(this);
  }

  render() {
    return this.props.children;
  }
}

export default class TriggerableFragment extends React.Component<{ children: React.Node }> {
  render() {
    return (
      <TriggerableContext.Consumer>
        {({ register, unregister }) => (
          <TriggerableFragmentChild register={register} unregister={unregister}>
            {this.props.children}
          </TriggerableFragmentChild>
        )}
      </TriggerableContext.Consumer>
    );
  }
}
