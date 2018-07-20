// @flow

import * as React from 'react';
import { requireNativeComponent } from 'react-native';

import { MediaViewContext } from './withNativeAd';

const NativeMediaView = requireNativeComponent('MediaView', null, {});

class MediaViewChild extends React.Component<Object> {
  // $FlowIssue
  nativeMediaViewRef = React.createRef();

  componentDidMount() {
    this.props.register(this.nativeMediaViewRef.current);
  }

  render() {
    return <NativeMediaView ref={this.nativeMediaViewRef} {...this.props} />;
  }
}

export default class MediaView extends React.Component<Object> {
  render() {
    return (
      <MediaViewContext.Consumer>
        {register => <MediaViewChild {...this.props} register={register} />}
      </MediaViewContext.Consumer>
    );
  }
}
