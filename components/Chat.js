// import Gifted Chat library
import { GiftedChat, Bubble } from "react-native-gifted-chat";
//fixing keyboard for android
import {
  View,
  Platform,
  KeyboardAvoidingView,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";

import React, { Component } from "react";

//Firestore Database
const firebase = require("firebase");
require("firebase/firestore");

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: "",
        name: "",
      },
    };

    // web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyDsdIBBJtYCcajM26o8HVmt3eVc4-n2S1k",
      authDomain: "test-8db08.firebaseapp.com",
      projectId: "test-8db08",
      storageBucket: "test-8db08.appspot.com",
      messagingSenderId: "715820354546",
      appId: "1:715820354546:web:5c97b443f592103188b96b",
    };
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    // reference to your Firestore collection
    this.referenceChatMessages = firebase.firestore().collection("messages");
  }

  //allowing store data to be rendered in view
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentsSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
        },
      });
    });
    this.setState({
      messages,
    });
  };

  componentDidMount() {
    //title Chat name
    let { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });

    // Reference to load messages via Firebase
    this.referenceChatMessages = firebase.firestore().collection("messages");

    // Authenticate user anonymously
    this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        firebase.auth().signInAnonymously();
      }
      this.setState({
        uid: user.uid,
        messages: [],
        user: {
          _id: user.uid,
          name: name,
        },
      });
      this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);
    });
  }
  //delete a original listener
  componentWillUnmount() {
    this.unsubscribe();
  }

  // function which be called when user sends a message
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        // Call addMessage with last message in message state
        this.addMessages(this.state.messages[0]);
      }
    );
  }

  // store messages on Firestore
  addMessages = (message) => {
    this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      user: message.user,
    });
  };

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#fff",
          },
          right: {
            backgroundColor: "blue",
          },
        }}
      />
    );
  }

  render() {
    const { color } = this.props.route.params;

    return (
      <View style={{ flex: 1, backgroundColor: color }}>
        <GiftedChat
          renderUsernameOnMessage={true}
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{ _id: this.state.user._id, name: "name" }}
        />
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });