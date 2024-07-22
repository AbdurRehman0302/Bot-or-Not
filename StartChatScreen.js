import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BannerAd, BannerAdSize, TestIds, AdEventType } from 'react-native-google-mobile-ads';

const adUnitId = 'ca-app-pub-7037675035390273/7747324897';

const StartChatScreen = () => {
  const navigation = useNavigation();
  const [firstAppearance, setFirstAppearance] = useState(true);
  const fadeAnim = new Animated.Value(0); // Initialize fade animation value
  const progressAnim = new Animated.Value(0); // Initialize progress animation value

  // Effect to start animations on screen focus
  useFocusEffect(() => {
    startAnimations();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Handle back press to navigate to splash screen
      navigation.popToTop(); // Navigate to the first screen in the stack
      // Clean up animations
      fadeAnim.setValue(0);
      progressAnim.setValue(0);
      return true; // Prevent default back navigation
    });

    // Clean up function on screen blur
    return () => {
      backHandler.remove(); // Remove back press event listener
      fadeAnim.setValue(0); // Reset fade animation value
      progressAnim.setValue(0); // Reset progress animation value
    };
  });

  // Function to start animations
  const startAnimations = () => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 12000, // 10 seconds
      useNativeDriver: false,
    }).start(() => {
      // Check if the component is still mounted before navigating
      if (navigation.isFocused()) {
        navigation.navigate('Chat'); // Navigate to the chat screen after 10 seconds
      }
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContainer}>
          <Image
            source={require('./assets/imgpsh_fullsize_anim.png')} // Replace with your logo path
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>Bot or Not!</Text>
          </View>
          <Text style={styles.timerText}>02:00</Text>
        </View>
      </View>
      <View style={styles.loaderContainer}>
        <Animated.View style={[styles.loader, { width: progressWidth }]}>
          <LinearGradient
            colors={['#ba55d3', '#7b68ee']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </View>
      <View style={styles.content}>
        <View style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
            {/* Instructions */}
            <Text style={styles.instructions}>
              While we find a partner for you, here's a quick rundown:
            </Text>
            <Text style={styles.listItem}>
  <Text style={{ fontSize: 16 }}>•</Text> {' '} You have 2 Minute to chat
</Text>
<Text style={styles.listItem}>
  <Text style={{ fontSize: 16 }}>•</Text> {' '} Respond within 20 seconds
</Text>
<Text style={styles.listItem}>
  <Text style={{ fontSize: 16 }}>•</Text> {' '} End of chat: Human or Bot?
</Text>
<Text style={styles.listItem}>
  <Text style={{ fontSize: 16 }}>•</Text> {' '} Guess right? You win!
</Text>
<Text style={styles.additionalInstructions}>
  Additional Instructions:
</Text>
<Text style={styles.listItem}>
  <Text style={{ fontSize: 16 }}>•</Text> {' '} Don't share personal information
</Text>
<Text style={styles.listItem}>
  <Text style={{ fontSize: 16 }}>•</Text> {' '} NSFW content is not allowed
</Text>
<Text style={styles.listItem}>
  <Text style={{ fontSize: 16 }}>•</Text> {' '} No insults allowed
</Text>
<Text style={styles.listItem}>
  <Text style={{ fontSize: 16 }}>•</Text> {' '} Respectful communication is key
</Text>

            <Text style={styles.additionalInstructions}>Enjoy!</Text>
          </Animated.View>
          {/* Banner Ad */}
          <View style={styles.bannerContainer}>
            <BannerAd
              unitId={adUnitId}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
              onAdFailedToLoad={(error) => {
                console.error('Ad failed to load: ', error);
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
  },
  header: {
    backgroundColor: '#333', // Dark grey background for header
    paddingTop: 0,
  },
  headerContainer: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8, // Optional: Adjust as needed
    marginTop: 0, // Adjust top margin as needed
  },
  logo: {
    marginTop: 20,
    width: 40,
    height: 40,
    marginRight: 10, // Adjust margin as needed
  },
  headerTextContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ba55d3', // Title color
    textAlign: 'left', // Align text to the left
    paddingTop: 33,
    marginLeft: 5,
  },
  timerText: {
    paddingTop: 38,
    fontSize: 16,
    color: '#fff', // Timer text color
    textAlign: 'right', // Align text to the right
  },
  loaderContainer: {
    height: 10,
    backgroundColor: '#444',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  loader: {
    height: '100%',
  },
  gradient: {
    height: '100%',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  instructions: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'left',
    color: '#fff', // White color for instructions
  },
  listItem: {
    
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'left',
    color: '#fff', // White color for list items
  },
  additionalInstructions: {
    fontSize: 18,
    marginTop: 20,
    textAlign: 'left',
    color: '#ba55d3', // Blue color for additional instructions
  },
  bannerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%', // Adjust the width as needed
    paddingVertical: 10, // Add some padding if needed
  },
});

export default StartChatScreen;
