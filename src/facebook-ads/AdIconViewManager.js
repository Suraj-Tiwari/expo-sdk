// @flow

import React from 'react';
import { requireNativeComponent } from 'react-native';

import { AdIconViewContext } from './withNativeAd';

const NativeAdIconView = requireNativeComponent('AdIconView', null, {});

class AdIconViewChild extends React.Component<Object> {
  // $FlowIssue
  adIconViewRef = React.createRef();

  componentDidMount() {
    this.props.register(this.adIconViewRef.current);
  }

  render() {
    return <NativeAdIconView {...this.props} ref={this.adIconViewRef} />;
  }
}

class AdIconView extends React.Component<Object> {
  render() {
    return (
      <AdIconViewContext.Consumer>
        {register => <AdIconViewChild {...this.props} register={register} />}
      </AdIconViewContext.Consumer>
    );
  }
}

export default AdIconView;
