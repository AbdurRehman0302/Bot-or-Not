import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Animated, Alert, TouchableOpacity, Image, Modal, StatusBar } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { selectGameStats, incrementGamesPlayed, incrementWins, incrementLosses } from './store'; // Update path accordingly
import { LinearGradient } from 'expo-linear-gradient';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__? TestIds.INTERSTITIAL : 'ca-app-pub-7037675035390273/7436495404';

const ChatScreen = () => {
  const navigation = useNavigation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();
  const [timer, setTimer] = useState(120); // Timer set to 60 seconds
  const [fadeAnim] = useState(new Animated.Value(0));
  const [guessPromptVisible, setGuessPromptVisible] = useState(false);
  const [resultPopupVisible, setResultPopupVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultTitle, setResultTitle] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [showStartMessage, setShowStartMessage] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const adRef = useRef(
    InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    })
  );
 

  const dispatch = useDispatch();
  const { gamesPlayed, wins, losses } = useSelector(selectGameStats);

  // Define default bot messages
  const defaultBotMessages = [
    "Hey! Hows your day going?",
    "Hello! Whats new with you today?",
    "Hi! Did you do anything fun recenty?",
    "Hey there! How have u been?",
    "Hiya! Any exciting plans for today?",
    "Hey! How was ur weekend?",
    "Hey! Whats on your mind?",
    "Hello! Hows your week been so far?",
    "Hi there! Got any intresting stories to share?",
    "Hey! What did you have for brekfast?",
    "Hi! Hows work or school treating you?",
    "Hello! Have u seen any good movies lately?",
    "Hey! Hows the weather where you are?",
    "Hiya! What hobbys have you been enjoying lately?",
    "Hey! Any books or shows u recommend?",
    "Hello! How do u usually spend your weekends?",
    "Hi! Got any favorite recipies you've tried recently?",
    "Hey there! How are your friends or family doing?",
    "Hey! Have u discovered any new music recently?",
    "Hello! Whats your go-to way to relax?",
    "Hi! Any upcoming events you're exited about?",
    "Hey! Hows your fitness routine going?",
    "Hiya! Whats been the highlight of your week?",
    "Hey! Any intresting projects you're working on?",
    "Hello! How do u like to unwind after a long day?",
    "Hi there! Whats the best thing that happend to you today?",
    "Hey! Hows your pet (if you have one) doing?",
    "Hi! Have u tried any new resturants or cafes lately?",
    "Hello! Whats your favorite way to spend a day off?",
    "Hey! How are you feeling today?",
    "Hiya! Have you picked up any new skills or hobbies?",
    "Hey! Any travel plans or places youd love to visit?",
    "Hello! Whats something your looking forward to?",
    "Hi! How do u stay motivated during tough times?",
    "Hey there! Any recent accomplishments your proud of?",
    "Hey! Whats your favorite way to stay active?",
    "Hello! How do u like to start your mornings?",
    "Hi! Got any favorite podcasts or YouTube channels?",
    "Hey! Hows your sleep schedule these days?",
    "Hiya! Any tips for staying organized?",
    "Hey! How do u like to spend your evenings?",
    "Hello! Whats your favorite comfort food?",
    "Hi there! How do you balance work and relaxation?"
];



  // Randomly decide who starts the chat
  const [chatStarted, setChatStarted] = useState(false);
  const [botStartsFirst, setBotStartsFirst] = useState(Math.random() < 0.5);

  // Function to get a random bot message
  const getRandomBotMessage = () => {
    return defaultBotMessages[Math.floor(Math.random() * defaultBotMessages.length)];
  };

  // Initial effect to handle bot's first message with typing indicator and delay
  useEffect(() => {
    if (botStartsFirst && !chatStarted) {
      setChatStarted(true);
      setIsTyping(true);
      setShowStartMessage(true);

      setTimeout(() => {
        const firstMessage = getRandomBotMessage();
        setMessages([{ text: firstMessage, fromUser: false }]);
        setIsTyping(false);
        setShowStartMessage(false); // Hide the message after the bot sends its first message
      }, 8000); // 5-second delay
    }
  }, [botStartsFirst, chatStarted]);

  // Countdown effect for the timer
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prev => {
        if (prev > 1) {
          return prev - 1;
        } else {
          clearInterval(countdown);
          setGuessPromptVisible(true);
          promptGuess();
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  // Function to format timer as mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to scroll to the bottom of messages
  const scrollToBottom = () => {
    scrollViewRef.current.scrollToEnd({ animated: true });
  };

  // Function to handle sending user message
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, fromUser: true }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    const humanResponse = humanResponses(input);
    if (humanResponse) {
      setTimeout(() => {
        const updatedMessages = [...newMessages, { text: humanResponse, fromUser: false }];
        setMessages(updatedMessages);
        setIsTyping(false);
      }, 8000); // 5-second delay
    } else {
      try {
        const res = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: newMessages.map(message => ({ role: message.fromUser ? 'user' : 'assistant', content: message.text })),
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer sk-proj-PrGniX4KkqG4DIOkkFdsT3BlbkFJDhBcVWF5RuYsR4btAfOo',
            },
          }
        );

        const botResponse = res.data.choices[res.data.choices.length - 1].message.content;
        const adjustedResponse = (botResponse);

        setTimeout(() => {
          const updatedMessages = newMessages.filter(msg => !msg.isTyping);
          setMessages([...updatedMessages, { text: adjustedResponse, fromUser: false }]);
          setIsTyping(false);
        }, 8000); // 5-second delay
      } catch (error) {
        console.error('Error sending message:', error.message);
        setIsTyping(false);
      }
    }
  };

  // Function to prompt guess
  const promptGuess = () => {
    setGuessPromptVisible(true);
  };

  const handleGuess = (guess) => {
    const isBot = Math.random() < 0.5;
    setGuessPromptVisible(false); // Close the Guess prompt

    if ((isBot && guess) || (!isBot && !guess)) {
      setResultTitle('Correct!');
      setResultMessage('You Won!');
      setResultPopupVisible(true);
      dispatch(incrementWins());
    } else {
      setResultTitle('Wrong!');
      setResultMessage('You Lose!');
      setResultPopupVisible(true);
      dispatch(incrementLosses());
    }

    dispatch(incrementGamesPlayed());
  };

  // Function to handle game over
  const handleGameOver = () => {
    setGameOver(true);
  };
  // Function to show ad
  useEffect(() => {
    const loadInterstitial = async () => {
      try {
        await adRef.current?.load();
        console.log('ad loaded');
      } catch (error) {
        console.error('Failed to load ad:', error);
        Alert.alert(error);
      }
    };

    const showInterstitial = () => {
      adRef.current?.show();
    };

    // const unsubscribeLoaded = adRef.current?.addAdEventListener(
    //   AdEventType.LOADED,
    //   showInterstitial()
    // );

    const unsubscribeClosed = adRef.current?.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        loadInterstitial()
        navigation.navigate('StartChat');
      }
    );

    loadInterstitial();
    

    return () => {
      // unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, [navigation]);

  // Function to handle new game
  const handleNewGame = () => {
    setMessages([]);
    setGameOver(false);
    setGuessPromptVisible(false);
    setResultPopupVisible(false);
    setShowStatsModal(false);
    setTimer(120); // Reset the timer to 35 seconds
    if (adRef.current?.loaded) {
      console.log('checking if loaded.')
      adRef.current?.show();
    } else {
      navigation.navigate('StartChat');
    }
  };

  // Initial effect to send bot message
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const humanResponses = (input) => {
    const humanTraits = {
        greetings: [
            "Hey there! How can I halp you today?",
            "Hello! What can I asist yu with?",
            "Hi! Whats on your mind?",
            "Hey, good to see yu! What's up?",
            "Helo! How's yur day going so far?",
            "Hi ther! How can I make yur day better?",
            "Hey! Redy to chat about anyting?",
            "Hello! Let's dive into your questons!",
            "Hi! What brngs you hear today?",
            "Hey, nice to meat you! How can I asist you?",
        ],
        identity: [
            "I'm jus someone here to chat with yu.",
            "Yu can call me Dave!",
            "I'm a frendly chat companian.",
            "You can think of me as your freind.",
            "I'm hear to help you out.",
            "I'm your go-to chat parter rite now.",
            "I'm here to provide suport and answrs.",
            "Yu've found me! What's on your mind?",
            "I'm yur freind and want to talk to you!",
            "I'm here to make yur day a littel eaiser.",
        ],
        feelings: [
            "I'm doin great, thanks for asking! How bout you?",
            "I'm hear and redy to chat! How are yu?",
            "I'm feeling gud. What's new with yu?",
            "I'm doin well, thanks! How can I asist yu today?",
            "I'm grate! What can I help yu with?",
            "I'm feeling awsome! Redy for our chat?",
            "I'm gud, thanks for asking. What's on yur mind?",
            "I'm doin fine, how about yorself?",
            "I'm here and feeling positve! What about yu?",
            "I'm feeling fantastic! What can I do for yu?",
        ],
        activities: [
            "I'm here to chat with yu and answer yur questons.",
            "I'm jus hanging out, redy to asist yu.",
            "I'm here, ready to help yu with anything yu need.",
            "I'm avaiable to chat and provide suport.",
            "I'm here to make yur day a bit eaiser.",
            "I'm here to asist yu with whatevr yu need.",
            "I'm redy to chat and help yu out.",
            "I'm jus here to be yur chat buddy.",
            "I'm here to help and chat with yu.",
            "I'm here to provide ansers and asistence.",
        ],
        hobbies: [
            "I love reading boks. What's your favrite bok?",
            "I enjoy watching movis. Any recomendations?",
            "I like to go for long waks. Do you enjoy waling?",
            "I spend my fre time painting. Do yu like art?",
            "I'm a fan of cooking. What's yur favrite dish?",
        ],
        travel: [
            "I love traveling to new plaes. What's yur dream destnation?",
            "I've always wanted to visit Japen. How bout yu?",
            "Travling opens up new perspectves. Where have yu been recently?",
            "Exploring new culturs is exciting. Any travel plans?",
            "Traveling is a grate way to relax. Do yu travel ofen?",
        ],
        music: [
            "I enjoy listening to clasical music. What do yu like?",
            "I'm a fan of jaz. What's yur favrite music genre?",
            "Music is a grate way to unwined. Do yu play any instruments?",
            "I love going to concerts. Have yu been to any recently?",
            "Music can set the mood. What's yur go-to song?",
        ],
        bot: [
            "I'm just a humen like yu, here to chat!",
            "Nope, not a bot. Jus yur frendly chat parter.",
            "I'm a real person, promse!",
            "I'm here to chat, jus like yu.",
            "Yu can think of me as yur chat companian.",
        ],
        living: [
            "I live in a cozy corner of the internet. Where do yu live?",
            "I don't have a physical place, but I'm here to chat with yu. Where do yu call home?",
            "I'm a digital resident, so no specific location. How about yu?",
            "I exist in the cloud, but I'm curious, where do yu live?",
            "I don't have a physical address, but I'm always here. Where is your home base?",
        ],
        work: [
            "I’m here to chat and help out. What’s your profession or what do you do for a living?",
            "I spend my time talking with people and offering support. What’s your line of work?",
            "I’m always around to provide a conversation. What’s your job or what do you enjoy doing?",
            "I’m here to keep you company and offer advice. What’s your career or what’s your field?",
            "I’m all about engaging and assisting. What’s your professional role or what’s your occupation?",
            "I’m here to offer a chat whenever you need it. What’s your work life like?",
            "I enjoy having conversations and helping out. What’s your job or what do you spend your time on?",
            "I’m here to provide some company and support. What’s your profession or what kind of work do you do?",
            "I’m always here for a good chat. What’s your career path or what do you do professionally?",
            "I’m around to keep the conversation going. What’s your job or what’s your field of expertise?"
        ],
        love: [
            "I love chatting and helping out. What do yu love to do?",
            "I enjoy engaging in conversations and learning new things. What are your passions?",
            "I'm here to make your day better. What do yu love doing in your free time?",
            "I get a kick out of our chats. What activities do you love the most?",
            "I'm all about having great conversations. What are your favorite hobbies?",
        ],
    };

    const randomResponses = [
        "Hmm, interesting.",
        "Oh, really?",
        "Tell me more!",
        "Wow, that's cool!",
        "I see.",
        "Okay!",
        "Got it.",
        "Nice.",
        "Hmm.",
        "Alright.",
        "Sure.",
        "Hmm...",
        "Right!",
        "Yup.",
        "Uh huh.",
    ];

    const prompts = {
        greetings: ['hello', 'helo', 'hi', 'hy', 'hey'],
        identity: ['who are you', 'your name', 'what is your name', 'introduce yourself'],
        feelings: ['how are you', 'how do you feel', 'how are you doing', 'how r u doing', 'how are u doing', 'how is it going'],
        activities: ['what are you doing', 'what are you up to', 'what’s up', 'any plans'],
        hobbies: ['what are your hobbies', 'what do you do for fun', 'any hobbies', 'how do you spend your free time'],
        travel: ['do you like to travel', 'do you like travelling', 'where do you want to go', 'any travel plans', 'favorite travel destination'],
        music: ['what music do you like', 'favorite song', 'do you play any instruments', 'favorite band'],
        bot: ['are you a bot', 'u are a bot', 'are u a bot', 'u a bot', 'u bot', 'bot',  'are you human', 'are you a chatbot', 'bot or human', 'human or bot', 'human or not', 'are you a virtual assistant', 'you are bot', 'you are a bot', 'you are a chatbot', 'you are a AI assisstant'],
        living: ['where do you live', 'where are you from', 'what’s your location', 'where are you based'],
        work: ['what do you do for a living', 'what’s your job', 'what’s your profession', 'what do you do'],
        love: ['what do you love to do', 'what are your passions', 'what’s your favorite activity', 'what do you enjoy'],
    };

    const lowerInput = input.toLowerCase();

    for (const [trait, keywords] of Object.entries(prompts)) {
        for (const keyword of keywords) {
            if (lowerInput.includes(keyword)) {
                return humanTraits[trait][Math.floor(Math.random() * humanTraits[trait].length)];
            }
        }
    }
    if (lowerInput.includes('thank')) {
        return "You're welcome!";
    } else if (lowerInput.includes('tell me about')) {
        return "Sure, let's talk about that!";
    }

    // 20% chance to return a random short response
    if (Math.random() < 0.25) {
        return randomResponses[Math.floor(Math.random() * randomResponses.length)];
    }

    return null;
};


//   const adjustBotResponse = (response) => {
// //     const variations = [
// //       "Thats intersting!",
// //       "I hadnt thoght about that.",
// //       "Hmm, I see wht you mean.",
// //       "Intresting perspective!",
// //       "Im not sure about that...",
// //       "Thats a tough one!",
// //       "Could you tell me more abt that?",
// //       "Im glad you broght that up.",
// //       "Im not entirely sure, but...",
// //       "I'd love to hear yur thoughts on that.",
// //       "Let me think about that for a moment.",
// //       "Thats a good point!",
// //       "You might be on to somthing there.",
// //       "Intresting idea!",
// //       "I apprecaite your input!",
// //       "Ill have to look into that.",
// //       "That makes sence.",
// //       "I see yur point.",
// //       "Thats a tricky question!",
// //       "Im curious to know more abt that.",
// //       "Im learning somthing new every day!",
// //       "Tell me more about what you think.",
// //       "Im here to help!",
// //       "Wow, didn't see that comin'!",
// //       "Oh, that's a new one for me!",
// //       "Yikes, that's a brain twister!",
// //       "I'm kinda lost on that one.",
// //       "Can you break that down a bit more?",
// //       "Well, that's somethin' to ponder!",
// //       "Hmm, that's a head-scratcher!",
// //       "I gotta mull that over.",
// //       "That's a puzzler for sure!",
// //       "Whoa, that's deep!",
// //       "Huh, I never thought about it like that!",
// //       "Interesting thought!",
// //       "I'm not entirely sure I follow.",
// //       "That's a real stumper!",
// //       "You've got me thinking now!",
// //       "That's a tough nut to crack!",
// //       "I need a sec to digest that.",
// //       "I'll need to chew on that one.",
// //       "Well, now you've got my wheels turning!",
// //       "You've got my gears grinding on that!",
// //       "I'll have to chew on that a bit.",
// //       "I'm scratching my head on that.",
// //       "Interesting take on it!",
// //       "Hmm, let me ponder that for a moment.",
// //       "That's a bit of a conundrum!",
// //       "That's a poser!",
// //       "I'm intrigued by your perspective.",
// //       "I'm gonna need a minute to wrap my head around that.",
// //       "You've got me curious now!",
// //       "I'm gonna need to noodle on that one."
// //     ];
    
// //     // Pick a random variation
// //     return variations[Math.floor(Math.random() * variations.length)];
// };



  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#333" barStyle="light-content" />

      <View style={styles.headerContainer}>
        <Image
          source={require('./assets/imgpsh_fullsize_anim.png')} // Replace with your logo path
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Human or AI!</Text>
        <View style={styles.timerContainer}>
          <Text style={styles.timer}> {formatTime(timer)}</Text>
        </View>
      </View>
      {showStartMessage && (
        <View style={styles.startMessageContainer}>
          <Text style={styles.startMessageText}>The other person starts conversation</Text>
        </View>
      )}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollViewContent}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.fromUser ? styles.userMessageContainer : styles.botMessageContainer
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
        
      </ScrollView>
      {!gameOver && (
        <View style={styles.inputContainer}>
           
           {isTyping ? (
        <TextInput
          style={[styles.input, styles.inputBoldPlaceholder]}
          value={input}
          onChangeText={setInput}
          placeholder="Typing..."
          editable={!isTyping && !gameOver}
          placeholderTextColor="black"
          
        />
      ) : (
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          editable={!isTyping && !gameOver}
          placeholderTextColor="black"
          
        />
      )}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSendMessage}
            disabled={isTyping}
          >
            <LinearGradient
              colors={['#ba55d3', '#7b68ee']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Send</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Modal
      animationType="slide"
      transparent={true}
      visible={guessPromptVisible}
      onRequestClose={() => setGuessPromptVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Guess</Text>
          <Text style={styles.modalMessage}>Is the other side a Human or Not?</Text>
          <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.button, { width: '30%', height: 30 }]} // Adjusted width and height of New Game button
            onPress={handleGuess}
          >
            <LinearGradient
              colors={['#ba55d3', '#7b68ee']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Human</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { width: '30%', height: 30 }]} // Adjusted width and height of New Game button
            onPress={handleGuess}
          >
            <LinearGradient
              colors={['#ba55d3', '#7b68ee']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Bot</Text>
            </LinearGradient>
          </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* Result Popup */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={resultPopupVisible}
      onRequestClose={() => setResultPopupVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle}>{resultTitle}</Text>
          <Text style={styles.resultMessage}>{resultMessage}</Text>
          <TouchableOpacity
            style={[styles.button, { width: '30%', height: 30 }]} // Adjusted width and height of New Game button
            onPress={handleGameOver}
          >
            <LinearGradient
              colors={['#ba55d3', '#7b68ee']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>OK</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

        </View>
      )}
      {gameOver && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.stats}>Games Played: {gamesPlayed}</Text>
          <Text style={styles.stats}>Wins: {wins}</Text>
          <Text style={styles.stats}>Losses: {losses}</Text>
          <TouchableOpacity
            style={[styles.button, { width: '40%', height: 40 }]} // Adjusted width and height of New Game button
            onPress={handleNewGame}
          >
            <LinearGradient
              colors={['#ba55d3', '#7b68ee']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>New Game</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    height: 80,
    flexDirection: 'row',
    alignItems: '',
    justifyContent: 'space-between', // To space out logo, title, and timer
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#333', // Dark background for the header
    marginTop: 0,
  },
  logo: {
    
    paddingTop: 80,
    width: 40,
    height: 40,
    marginRight: 5,
  },
  title: {
    marginLeft: 5,
    paddingTop: 30,
    fontSize: 20,
    color: '#ba55d3', // Title color
    fontWeight: 'bold', // Optionally, add bold font weight
  },
  timerContainer: {
    flex: 1, // Ensures timer takes all available space to push to the right
    alignItems: 'flex-end', // Align timer to the right
  },
  timer: {
    paddingTop: 38,
    fontSize: 16,
    color: '#fff', // Timer text color
  },
  startMessageContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  startMessageText: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
  },
  scrollViewContent: {
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 25,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#ba55d3',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#fafafa',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: '#333', // Dark background for input container
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 10,
    color: '#000',
    backgroundColor: '#fff',
  },
  inputBoldPlaceholder: {
    fontWeight: 'bold',
  },
  button: {
    borderRadius: 8,
    marginTop: 3,
    width: '20%', // Ensure button takes full width
    height: 40, // Adjust button height
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  gameOverContainer: {
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#a9a9a9',
  },
  stats: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '45%',
  },
  cancelButton: {
    backgroundColor: '#ba55d3',
  },
  defaultButton: {
    backgroundColor: '#ba55d3',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  resultContent: {
    width: '80%',
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  resultMessage: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
  resultButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#ba55d3',
    marginTop: 10,
  },
  resultButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
