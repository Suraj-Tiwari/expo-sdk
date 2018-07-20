// @flow-weak

import React from 'react';
import { EmitterSubscription } from 'fbemitter';
import { requireNativeComponent, findNodeHandle } from 'react-native';

import AdsManager from './NativeAdsManager';

const NativeAdView = requireNativeComponent('CTKNativeAd', null);

type NativeAd = any;

type NativeAdWrapperState = {
  ad: ?NativeAd,
  canRequestAds: boolean,
};

type NativeAdWrapperProps = {
  adsManager: AdsManager,
  onAdLoaded: NativeAd => void,
};

/**
 * Higher order function that wraps given `Component` and provides `nativeAd` as a prop
 *
 * In case of an empty ad or adsManager not yet ready for displaying ads, null will be
 * returned instead of a component provided.
 */

// $FlowIssue
export const TriggerableContext = React.createContext();
// $FlowIssue
export const MediaViewContext = React.createContext();
// $FlowIssue
export const AdIconViewContext = React.createContext();

export default (Component: Function) =>
  class NativeAdWrapper extends React.Component<NativeAdWrapperProps, NativeAdWrapperState> {
    subscription: ?EmitterSubscription;
    _mediaView: number;
    _adIconView: number;
    _nativeAdViewRef: ?NativeAdView;
    _registerFunctionsForTriggerable: {
      unregister: React.Node => void,
      register: React.Node => void,
    };
    _clickableChildren: Set<number>;

    constructor(props: NativeAdWrapperProps) {
      super(props);

      this._registerFunctionsForTriggerable = {
        register: this._registerClickableChild,
        unregister: this._unregisterClickableChild,
      };

      // iOS requires a nonnull value
      this._mediaView = -1;
      this._adIconView = -1;
      this._clickableChildren = new Set();

      this.state = {
        ad: null,
        canRequestAds: false,
      };
    }

    /**
     * On init, register for updates on `adsManager` to know when it becomes available
     */
    componentDidMount() {
      this.subscription = this.props.adsManager.onAdsLoaded(() =>
        this.setState({ canRequestAds: true })
      );
    }

    componentDidUpdate() {
      if (this._mediaView !== -1) {
        AdsManager.registerViewsForInteractionAsync(
          findNodeHandle(this._nativeAdViewRef),
          this._mediaView,
          this._adIconView,
          [...this._clickableChildren]
        );
      }
    }

    /**
     * Clear subscription when component goes off screen
     */
    componentWillUnmount() {
      if (this.subscription) {
        this.subscription.remove();
      }
    }

    _registerMediaView = (mv: *) => (this._mediaView = findNodeHandle(mv));

    _registerAdIconView = (aiv: *) => (this._adIconView = findNodeHandle(aiv));

    _registerClickableChild = (child: React.Node) => {
      this._clickableChildren.add(findNodeHandle(child));
    };

    _unregisterClickableChild = (child: React.Node) => {
      this._clickableChildren.delete(findNodeHandle(child));
    };

    _handleAdLoaded = ({ nativeEvent }: { nativeEvent: NativeAd }) => {
      this.setState({ ad: nativeEvent }, () => {
        if (this._mediaView === -1) {
          console.warn(
            "MediaView is missing - when there's no MediaView it's not possible to fill MediaView and AdIconView with ad content and also it's not possible to make the ad react on click event."
          );
        }
        if (this.props.onAdLoaded) {
          this.props.onAdLoaded(nativeEvent);
        }
      });
    };

    _handleNativeAdViewMount = (ref: ?NativeAdView) => {
      this._nativeAdViewRef = ref;
    };

    renderAdComponent(componentProps: Object) {
      if (this.state.ad) {
        return (
          <AdIconViewContext.Provider value={this._registerAdIconView}>
            <MediaViewContext.Provider value={this._registerMediaView}>
              <TriggerableContext.Provider value={this._registerFunctionsForTriggerable}>
                <Component {...componentProps} nativeAd={this.state.ad} />
              </TriggerableContext.Provider>
            </MediaViewContext.Provider>
          </AdIconViewContext.Provider>
        );
      }
      return null;
    }

    render() {
      const { adsManager, ...props } = this.props;

      if (!this.state.canRequestAds) {
        return null;
      }

      return (
        <NativeAdView
          ref={this._handleNativeAdViewMount}
          adsManager={adsManager.toJSON()}
          onAdLoaded={this._handleAdLoaded}>
          {this.renderAdComponent(props)}
        </NativeAdView>
      );
    }
  };
