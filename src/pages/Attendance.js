import React, { useEffect, useState } from 'react';

import { SafeAreaView, View, Text, StyleSheet, StatusBar, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { HeaderBackButton } from '@react-navigation/stack';

import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";

import api from '../services/api';
import axios from 'axios';
import baseURL from './Baseurl';

import { BackHandler } from 'react-native';

export default function Attendance({ route, navigation }) {

    function goToMenu() {
        //const response = await api.get()
        //await AsyncStorage.setItem('user', 30059);
        navigation.navigate('Menu');
    }

    const [notifications, setNotifications] = useState([]);
    const [notParse, setNotParse] = useState([]);
    const agendamento = route.params?.scheduling_id;

    const [userId, setUserId] = useState('');
    const [user, setUser] = useState('');

    React.useLayoutEffect(() => {     
        navigation.setOptions({
            headerLeft: (...props) => (
                <HeaderBackButton {...props}           
                    onPress={() => {
                        navigation.navigate('Menu')
                    }}          
                    label=' Menu'           
                    tintColor='white'         
                    />       
            ),     
        });   
    }, [navigation]);

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', () => true);
        return () =>
          BackHandler.removeEventListener('hardwareBackPress', () => true);
      }, []);
    
    useEffect(() => {
      async function loadCustomer() {
        const user_id = await AsyncStorage.getItem('@storage_Key');
        const response = await api.get('api/customer/' + user_id, { responseType: 'json' });
        setUser(response.data.data);
        setUserId(user_id);
        
      }
      loadCustomer();
    }, []);
   
    /** FIREBASE NOTIFICATION NAVIGATOR */
    useEffect(() => {
        requestUserPermission();
        function loadNotifications() {
            messaging().onNotificationOpenedApp(async remoteMessage => {
                setNotifications(JSON.stringify(remoteMessage.data));
            });
            messaging().onMessage(async remoteMessage => {
                setNotifications(JSON.stringify(remoteMessage.data));
            });
            messaging().setBackgroundMessageHandler(async remoteMessage => {
                setNotifications(JSON.stringify(remoteMessage.data));
            });
            messaging().setBackgroundMessageHandler(async remoteMessage => {
                setNotifications(JSON.stringify(remoteMessage.data));
            });
        }
        loadNotifications();
    }, []);

  requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      getFcmToken()
    }
  }

  getFcmToken = async () => {
    await messaging().getToken();
  }
  /** FIREBASE NOTIFICATION NAVIGATOR */
    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
    async function loadAttendances() {
        const user_id = await AsyncStorage.getItem('@storage_Key');
        const response = await api.get('api/mobile/messageapps/search/' + user_id, { responseType: 'json' });
        //O response retorna como objeto no Inkless
        //É preciso dar um cast para array, como é feito abaixo.
        const arrResponse = []
        Object.keys(response.data.data).forEach(key => arrResponse.push(response.data.data[key]));
        //

        console.log(attendances);
        console.log(user_id);
        setAttendances(arrResponse);
        setLoading(!loading);
    }
    loadAttendances();
  }, []);
  const renderElements = (attendances) => {
    if(attendances == '' || attendances == null) {
      return (
        <View style={{
            flex: 1,
            backgroundColor: '#004ba0', 
            marginHorizontal: 10,
            marginVertical: '30%',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 20,
            alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{fontSize: 22, color: '#fff'}}>Atendimento Guichê</Text>
              <Text style={{color: '#fff', marginVertical: 10, fontSize: 22, fontWeight: 'bold'}}>Não há atendimento disponível no momento. </Text>
        </View>
      );
    } else {
      return (
        attendances.map(attendance => 
          <View key={attendance.id} style={styles.content}> 
                <View style={{ paddingVertical: 5}}>
                    <Text style={{fontSize: 22, color: '#fff'}}>Atendimento</Text>
                </View>
                
                <View style={{paddingVertical: 5}}>
                {!attendance.image ? 
                    <Image style={{width: 200, height:200, borderRadius: 200 / 2}} source={require('../../assets/user.png')}/>
                    : 
                    <Image style={{width: 200, height:200, borderRadius: 200 / 2}} source={{uri: baseURL + 'storage/' + attendance.image}}/>
                }
                </View>
                <View style={{paddingHorizontal: 20}}>
                    <Text style={{fontSize: 16, color: '#fff', paddingVertical: 20}}>{attendance.body}</Text>
                </View>
          </View>   
        )
      )
    }
  }
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" style={styles.statusBar}/>

            <View style={ {backgroundColor: '#004ba0', padding: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row'} }>
                <TouchableOpacity  onPress={() => navigation.navigate('Menu') } style={{padding: 5}}>
                    <FontAwesomeIcon icon={ faArrowLeft } size={20} color="#fff"/>
                </TouchableOpacity>
            
                <View><Text style={{color: '#fff', fontSize: 20, fontWeight: '400'}}>Atendimento Guichê</Text></View>
            </View>
           
            {!loading ?
                  renderElements(attendances)
                :
                  <View style={{
                    flex: 1,
                    backgroundColor: '#004ba0', 
                    marginHorizontal: 10,
                    marginVertical: '30%',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 20,
                    alignItems: 'center', justifyContent: 'center'}}>
                    <ActivityIndicator size="large" color="#fff"/>
                    <Text style={{color: '#fff', marginVertical: 10, fontSize: 15, fontWeight: 'bold'}}>Carregando...</Text>
                  </View>
                  
                }
                
           
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#004ba0',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBar: {
        backgroundColor: '#1976d2',
        color: '#fff'
    },
    actionsBlock: {
        backgroundColor: '#1976d2',
    },
    backBlock: {
        backgroundColor: '#1976d2',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rightBlock: {
        flexDirection: 'row',
    },
    titleBlock: {
        backgroundColor: '#004ba0',
        padding: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15
    },
    nameBlock: {
        color: '#fff',
        fontSize: 16,
    },
    subnameBlock: {
        color: '#fff',
        fontSize: 30,
    },
    cardAvatar: {
        height: 60,
        width: 60,
        backgroundColor: 'gray',
        borderRadius: 60,
    },
    cardBody: {
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: {width:0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4
    },
    cardFooter: {
        flexDirection: 'row', 
        justifyContent:'center', 
        alignItems: 'center'
    },
    cardLeftSide: {
        paddingHorizontal: 10,
        flex: 1
    },  
    cardHospital: {
        color: '#1976d2',
        fontSize: 18,
        fontWeight: 'bold'
    },
    cardName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold'
    },
    cardTime: {
        color: '#222',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5
    },
    cardAddress: {
        color: 'gray',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 5
    },
    iconMore: {
        position: 'absolute',
        bottom: 3,
        right: 0,
    },
    cardActionButtons: {

    },
    checkinButton: {
        backgroundColor: '#388e3c',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:4,
        margin: 5,
        padding: 5,
        flexDirection: 'row'
    },
    callButton: {
        backgroundColor: '#388e3c',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:4,
        margin: 5,
        padding: 5,
    },
    navButton: {

    },
    buttonText: {
        color:'#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginHorizontal: 10
    }
});