import React, { useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, Image, StyleSheet, Text, TextInput, ActivityIndicator, TouchableOpacity, PermissionsAndroid, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAngleRight, faAngry, faStar } from '@fortawesome/free-solid-svg-icons';
import { TextInputMask } from 'react-native-masked-text';

import Moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
import messaging from '@react-native-firebase/messaging';



import api from '../services/api';
import logo from '../../assets/inkless.png';

export default function Login({ navigation }) {

    const [cpf, setCpf] = useState('');
    const [nasc, setNasc] = useState('');
    const [response, setResponse] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [connState, setConnState] = useState(0);
    const [userId, setUserId] = useState('');
    const [id, setId] = useState('');
    const [cpfUnmaskedField, setCpfUnmaskedField] = useState('');
    const [nascUnmaskedField, setNascUnmaskedField] = useState('');
    const [isLogedin, setIsLogedin] = useState(false);


    useEffect(() => {
      async function requestCameraPermission() {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: "App Camera Permission",
              message:"App needs access to your camera ",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              console.log("Camera permission given");
          } else {
              console.log("Camera permission denied");
          }
        } catch (err) {
          console.warn(err);
        }
      }
      requestCameraPermission();
    }, []);

    useEffect(() => {
      async function loadCustomer() {
        const user_id = await AsyncStorage.getItem('@storage_Key');
        setPageLoading(true); 
        if(!user_id) {
          setTimeout(() => {
            setPageLoading(false);
          }, 2000);
          renderElements();
        } else {
          setPageLoading(false);
          navigation.reset({ index: 0, routes: [{ name: "Menu" }], });
        }
      }
      loadCustomer();
    }, []);
    
    useEffect(() => {
      NetInfo.fetch().then(state => {
          setConnState(state);
          //getMyStringValue();
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
              remoteMessage.data.body, [
                  { text: 'CONFIRMAR', onPress: () => navigation.navigate(remoteMessage.data.screen) },
              ], { cancelable: false },
          );
      });
      messaging().onNotificationOpenedApp(remoteMessage => {
        navigation.navigate(remoteMessage.data.screen);
      });
      messaging().setBackgroundMessageHandler(async remoteMessage => { 
        navigation.navigate(remoteMessage.data.screen);
      });
      return unsubscribe;
  }, []);

  requestUserPermission = async() => {
      const authStatus = await messaging().requestPermission();

      console.log("aqui ::::::::", authStatus);
      const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        getFcmToken()
      }
  }

  getFcmToken = async() => {
    const a = await messaging().getToken();
    console.log(a);
  }
  /** FIREBASE NOTIFICATION NAVIGATOR */

    const storeData = async (value) => {
      try {
        await AsyncStorage.setItem('@storage_Key', value);
      } catch (e) {
        // saving error
      }
    }
    
    async function handleLogin() {
      const unmaskedNasc = Moment(nascUnmaskedField.getRawValue()).format('YYYY-MM-DD');
      const unmaskedCpf = cpfUnmaskedField.getRawValue();
      const response = await api.post('api/mobile/searchcpfbirth', { cpf: unmaskedCpf, birth: unmaskedNasc, responseType: 'json' });

      if (response.data['data'] > '0') {
        setLoading(true);
        if (connState.isConnected == true) {
        
          if (response) {
            setLoading(false);
            navigation.navigate('Users', { cpf: unmaskedCpf, birth: unmaskedNasc });
          } else {
            Alert.alert(
              "Conexão",
              "Verifique os dados digitados e tente novamente!",
              [
                {text: 'ENTENDIDO'},
              ],
            );
          }
        } else {
          setLoading(false);
          Alert.alert(
            "Conexão",
            "Detectamos que você não possui conexão ativa com a Internet. Por favor tente novamente!",
            [
              {text: 'ENTENDIDO'},
            ],
          );
        }
      } else {
        Alert.alert(
          "Conexão",
          "Verifique os dados digitados e tente novamente!",
          [
            {text: 'ENTENDIDO'},
          ],
        );
      }
    }

    const renderElements = () => {
      return (
        <View style={styles.content}>
          <Image source={logo} style={styles.logo}/>
          <View style={styles.form}>
            <Text style={styles.label}>CPF:</Text>
            <TextInputMask
              type={'cpf'}
              style={styles.input}
              placeholder="Ex: 123.456.789-00"
              placeholderTextColor="#fff"
              value={cpf}
              onChangeText={cpf => setCpf(cpf)}
              // add the ref to a local var
              ref={(ref) => setCpfUnmaskedField(ref)}
            /> 
            <Text style={styles.label}>Data Nascimento:</Text>
            <TextInputMask
                type={'datetime'}
                options={{
                  format: 'DD/MM/YYYY'
                }}
                style={styles.input}
                placeholder="Ex: 99/99/9999"
                placeholderTextColor="#fff"
                value={nasc}
                onChangeText={nasc => setNasc(nasc)}
                ref={(ref) => setNascUnmaskedField(ref)}
            />
            <View>
              <TouchableOpacity onPress={ handleLogin } style={styles.loginButton}>
                <Text style={styles.buttonText}>Entrar</Text>
                {!loading ? <FontAwesomeIcon icon={ faAngleRight } size={25} color="#1976d2"/> : <ActivityIndicator size="small" color="#0000ff"/> }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }


    return (
        <KeyboardAvoidingView enabled={Platform.OS == 'ios'} behavior="padding" style={styles.container}>
          {!pageLoading ?
            renderElements() :
            <View style={{
              flex: 1,
              backgroundColor: '#1976d2',
              width: '100%',
              alignItems: 'center', justifyContent: 'center'}}>
              <ActivityIndicator size="large" color="#fff"/>
              <Text style={{color: '#fff', marginVertical: 10, fontSize: 15, fontWeight: 'bold'}}>Carregando...</Text>
            </View>        
          }
        </KeyboardAvoidingView>
      );
}

const styles = StyleSheet.create({
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%'
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1976d2',
    },
    logo: {
        width: 155,
        height: 140
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
        marginBottom: 20,
        borderRadius: 4,
        color: '#fff'
    },
    button: {
        height: 60,
        backgroundColor: '#1976d2',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4
    },
    ratingButton: {
      height: 60,
      backgroundColor: '#1976d2',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 4,
      borderWidth:1,
      borderColor:'rgba(255,255,255,1)',
      padding: 5,
      marginTop: 20
    },
    buttonRatingText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 13
    },
    buttonText: {
        color: '#1976d2',
        fontWeight: 'bold',
        fontSize: 20
    },
    loginButton: {
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        margin: 2,
        padding: 15,
        flexDirection: 'row'
    },
});