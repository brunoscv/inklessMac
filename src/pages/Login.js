import React, { useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, Image, StyleSheet, Text, TextInput, ActivityIndicator, TouchableOpacity , Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
//import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInputMask } from 'react-native-masked-text';
import NetInfo from "@react-native-community/netinfo";

import api from '../services/api';

import logo from '../../assets/inkless.png';

export default function Login({ navigation }) {
  
  const [cpf, setCpf] = useState('');
  const [nasc, setNasc] = useState('');
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connState, setConnState] = useState(0);

  useEffect(() => {
    NetInfo.fetch().then(state => {
      setConnState(state);
    });

    const unsubscribe = NetInfo.addEventListener(state => {
      setConnState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /** FIREBASE NOTIFICATION NAVIGATOR */
  useEffect(() => {
    requestUserPermission();
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage.data));
      Alert.alert(
        remoteMessage.data.title,
        remoteMessage.data.body,
        [
          {text: 'OK', onPress: () => navigation.navigate(remoteMessage.data.screen)},
        ],
        {cancelable: false},
      );
    });
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.data,
      );
      navigation.navigate(remoteMessage.data.screen);
    });
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log(
        'Notification background:',
        remoteMessage.data,
      );
      navigation.navigate(remoteMessage.data.screen);
    });
    return unsubscribe;
   }, []);

  requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      getFcmToken()
      console.log('Authorization status:', authStatus);
    }
  }

  getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
    //  console.log(fcmToken);
     console.log("Your Firebase Token is:", fcmToken);
    } else {
     console.log("Failed", "No token received");
    }
  }
  /** FIREBASE NOTIFICATION NAVIGATOR */

  async function handleSubmit() {
    const user_id = 30059;
    const fcmToken = await messaging().getToken();
    setLoading(true);
    if (connState.isConnected == true) {
      const response = await api.put('/inklessapp/update/customer', { id: user_id, device_id: fcmToken, token_id: fcmToken });
        if( response) {
          setResponse(response);
          setLoading(false);
          navigation.navigate('Menu');
        } else {
          Alert.alert("Conexão", "Verifique os dados digitados e tente novamente!");
        }
    } else {
      setLoading(false);
      Alert.alert("Conexão", "Detectamos que você não possui conexão ativa com a Internet. Por favor tente novamente!");
    }
  }

  return (
    <KeyboardAvoidingView enabled={Platform.OS == 'ios'} behavior="padding" style={styles.container}>
      <Image source={logo} style={styles.logo}/>

      <View style={styles.form}>
        <Text style={styles.label}>CPF:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 123.456.789-00"
          placeholderTextColor="#fff"
          keyboardType="number-pad"
          value={cpf}
          onChangeText={setCpf}
        />
        

        <Text style={styles.label}>Data Nascimento:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 99/99/9999"
          placeholderTextColor="#fff"
          keyboardType="number-pad"
          value={nasc}
          onChangeText={setNasc}
        />
        <View>
          <TouchableOpacity onPress={ handleSubmit } style={styles.loginButton}>
            <Text style={styles.buttonText}>Entrar</Text>
            {!loading ? <FontAwesomeIcon icon={ faAngleRight } size={25} color="#1976d2"/> : <ActivityIndicator size="small" color="#0000ff"/> }
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1976d2',
  },
  logo: {
    width: 155,
    height:140
  },
  form: {
    alignSelf: 'stretch',
    paddingHorizontal: 30,
    marginTop: 30
  },
  label: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 20,
    fontSize: 16,
    height: 60,
    marginBottom:20,
    borderRadius:4,
    color: '#fff'
  },
  button: {
    height:60,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:4
  },
  buttonText: {
    color:'#1976d2',
    fontWeight: 'bold',
    fontSize: 20
  },
  loginButton: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:4,
    margin: 2,
    padding: 15,
    flexDirection: 'row'
  },
}); 