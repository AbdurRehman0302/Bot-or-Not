import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__? TestIds.INTERSTITIAL : 'ca-app-pub-7037675035390273/7436495404';

const SplashScreen = () => {
  const navigation = useNavigation();
  const title = 'Human or AI!';
  const [loading, setLoading] = useState(true);
  const adRef = useRef(
    InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    })
  );

  useEffect(() => {
    console.log('__DEV__', __DEV__);
    const loadInterstitial = () => {
      adRef.current?.load();
      setLoading(false);
    };

    const unsubscribeLoaded = adRef.current?.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setLoading(false);
      }
    );

    const unsubscribeClosed = adRef.current?.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        loadInterstitial();
        navigation.navigate('StartChat');
      }
    );

    const unsubscribeError = adRef.current?.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error('Ad failed to loadss: ', error.code);
        // loadInterstitial()
        setLoading(false);
        
      }
    );

    loadInterstitial();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [navigation]);

  const handleStartGame = () => {
    if (adRef.current?.loaded) {
      adRef.current?.show();
      console.log('__DEV__:', __DEV__);
    } else {
      console.log('__DEV__:', __DEV__);
      navigation.navigate('StartChat');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />

      <Animatable.Image
        source={require('./assets/imgpsh_fullsize_anim.png')}
        animation="fadeIn"
        duration={1500}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.headerTextContainer}>
        {title.split('').map((char, index) => (
          <Animatable.Text
            key={index}
            animation="fadeIn"
            delay={index * 200}
            style={styles.headerText}
          >
            {char}
          </Animatable.Text>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#ba55d3" style={styles.activityIndicator} />
      ) : (
        <TouchableOpacity style={styles.buttonContainer} onPress={handleStartGame}>
          <LinearGradient
            colors={['#ba55d3', '#7b68ee']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>Start Game</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  headerText: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ba55d3',
  },
  image: {
    width: 200,
    height: 200,
  },
  activityIndicator: {
    marginTop: 30,
  },
  buttonContainer: {
    marginTop: 30,
    paddingVertical: 0,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  gradientButton: {
    height: 50,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SplashScreen;
