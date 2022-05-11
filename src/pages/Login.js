import React, { useState, useEffect } from 'react';
import { useHeaderHeight } from '@react-navigation/stack';
import { View, KeyboardAvoidingView, Platform, Image, StyleSheet, Text, TextInput, ActivityIndicator, TouchableOpacity, Alert, TouchableWithoutFeedback } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAngleRight, faAngry, faStar } from '@fortawesome/free-solid-svg-icons';
import { TextInputMask } from 'react-native-masked-text';

import Moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
import messaging from '@react-native-firebase/messaging';

import api from '../services/api';
import logo from '../../assets/inkless.png';

import { BackHandler } from 'react-native';

export default function Login({ navigation }) {

    const [cpf, setCpf] = useState('');
    const [nasc, setNasc] = useState('');
    const [response, setResponse] = useState([]);
    const [loading, setLoading] = useState(false);
    const [connState, setConnState] = useState(0);

    const [userId, setUserId] = useState('');
    const [id, setId] = useState('');
    const [cpfUnmaskedField, setCpfUnmaskedField] = useState('');
    const [nascUnmaskedField, setNascUnmaskedField] = useState('');
    const [isLogedin, setIsLogedin] = useState(false);

    useEffect(() => {
      BackHandler.addEventListener('hardwareBackPress', () => true);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', () => true);
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
      const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        getFcmToken()
      }
  }

  getFcmToken = async() => {
    await messaging().getToken();
  }
  /** FIREBASE NOTIFICATION NAVIGATOR */

    const storeData = async (value) => {
      try {
        await AsyncStorage.setItem('@storage_Key', value);
      } catch (e) {
        // saving error
      }
    }

    // getMyStringValue = async () => {
    //   try {
    //     const logged = await AsyncStorage.getItem('@storage_Key');
    //     if (logged) {
    //       navigation.navigate('Menu');
    //     }
    //   } catch(e) {}
    // }
    
    async function handleLogin() {
      const unmaskedNasc = Moment(nascUnmaskedField.getRawValue()).format('YYYY-MM-DD');
      const unmaskedCpf = cpfUnmaskedField.getRawValue();
      const response = await api.post('api/mobile/searchcpfbirth', { cpf: unmaskedCpf, birth: unmaskedNasc, responseType: 'json' });

      if (response.data['data'] > '0') {   
        //const fcmToken = await messaging().getToken();
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

    return (
        <View style={styles.container}>
        <KeyboardAvoidingView 
        {...(Platform.OS === 'ios' && { behavior: 'padding' }) }
        style={{flex: 1}}>
          <Image source={logo} style={styles.logo}/>
    
          <View style={styles.form}>
            <Text style={styles.label}>CPF:</Text>
            { /*<TextInput
              style={styles.input}
              placeholder="Ex: 123.456.789-00"
              placeholderTextColor="#fff"
              keyboardType="number-pad"
              onChangeText={ cpf => setCpf(cpf)}
              defaultValue={cpf}
            />*/}
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
            {/* <TextInput
              style={styles.input}
              placeholder="Ex: 99/99/9999"
              placeholderTextColor="#fff"
              //keyboardType="number-pad"
              onChangeText={nasc => setNasc(nasc)}
              defaultValue={nasc}
            /> */}
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
                // add the ref to a local var
                ref={(ref) => setNascUnmaskedField(ref)}
            />
            <View>
              <TouchableOpacity onPress={ handleLogin } style={styles.loginButton}>
                <Text style={styles.buttonText}>Entrar</Text>
                {!loading ? <FontAwesomeIcon icon={ faAngleRight } size={25} color="#1976d2"/> : <ActivityIndicator size="small" color="#0000ff"/> }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        </View>
      );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1976d2',
    },
    logo: {
        width: 155,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 130,
        marginVertical: 40 
    },
    form: {
        alignSelf: 'stretch',
        paddingHorizontal: 30,
       
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