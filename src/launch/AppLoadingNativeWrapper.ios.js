// @flow

import React from 'react';
import { NativeModules, requireNativeComponent } from 'react-native';

export default class AppLoading extends React.Component<{}> {
  componentWillUnmount() {
    // Until we give more control over this, give the app 200ms to render
    // something and prevent a white flash
    const reportFinished =
      () => NativeModules.ExponentAppLoadingManager.finishedAsync();
    // Don't do this when running the app in e2e testing mode
    if (global.__E2E__) {
      reportFinished()
    } else {
      setTimeout(reportFinished, 200);
    }
  }

  render() {
    return <NativeAppLoading />;
  }
}

const NativeAppLoading = requireNativeComponent('ExponentAppLoading', null);
