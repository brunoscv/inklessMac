import React, { useEffect, useState } from 'react';

import { View, Text, StyleSheet, StatusBar, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faBan, faUserCircle, faCheckCircle, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { format, parseISO } from "date-fns";
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../services/api';
import messaging from '@react-native-firebase/messaging';

// import { Container } from './styles';

export default function Historic({ navigation }) {

    async function goToMenu() {
        //const response = await api.get()
        //await AsyncStorage.setItem('user', 30059);
        navigation.navigate('Menu');
    }

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
     console.log(fcmToken);
     console.log("Your Firebase Token is:", fcmToken);
    } else {
     console.log("Failed", "No token received");
    }
  }
  /** FIREBASE NOTIFICATION NAVIGATOR */

    const [schedulings, setSchedulings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    useEffect(() => {
        async function loadSchedulings() {
            const user_id = await AsyncStorage.getItem('@storage_Key');
            const response = await api.get('/mobile/checkinidall/' + user_id, { responseType: 'json' });
            //O response retorna como objeto no Inkless
            //É preciso dar um cast para array, como é feito abaixo.
            const arrResponse = []
            Object.keys(response.data.schedulings).forEach(key => arrResponse.push(response.data.schedulings[key]));
            //
            setSchedulings(arrResponse);
            setLoading(!loading);
            setUsername(response.data.name);
        }
        loadSchedulings();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" style={styles.statusBar}/>
            
            <View style={{backgroundColor: '#004ba0'}}>
                <View style={ {backgroundColor: '#1976d2', padding: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row'} }>
                    <TouchableOpacity onPress={goToMenu} style={{padding: 5}}>
                        <FontAwesomeIcon icon={ faArrowLeft } size={20} color="#fff"/>
                    </TouchableOpacity>
                
                    <View><Text style={{color: '#fff', fontSize: 20, fontWeight: '400'}}>Agendamentos</Text></View>
                </View>
            </View>

            <ScrollView style={{
                flex: 1, 
                position: 'relative',
                backgroundColor: "#eee"}}>
                    <View style={styles.titleBlock}>
                        <Text style={styles.subnameBlock}>{username}</Text>
                    </View>
                    <View>
                        <Text style={{paddingHorizontal: 10, paddingVertical: 20}}>Todos os agendamentos</Text>
                    </View>
                     {!loading ?
                        schedulings.map(scheduling => 
                            <View key={scheduling.id} style={{ 
                                backgroundColor: '#fff', 
                                marginHorizontal: 10,
                                marginVertical: 4,
                                paddingHorizontal: 14,
                                paddingVertical: 10,
                                borderRadius: 20 }}>
                                <View style={styles.cardBody} >
                                    <Image style={styles.cardAvatar} source={{uri: 'https://demo.inkless.digital/storage/' + scheduling.professional_image}}/>
                                    <View style={styles.cardLeftSide} >
                                        <Text style={styles.cardHospital} >HOSPITAL GASTROVITA</Text>
                                        <Text style={styles.cardName} >Dr(a). {scheduling.professional_name}</Text>
                                        <Text style={styles.cardCRM} >CRM: {scheduling.professional_crm}</Text>
                                        <Text style={styles.cardTime} >{ format(parseISO(scheduling.date_scheduling), "dd/MM/yyyy") } às { scheduling.time_starting_booked }</Text>
                                        <Text style={styles.cardAddress} >Consulta Presencial</Text>
                                    </View>
                                </View>
                                <View style={styles.cardFooter}>

                                    { scheduling.check_in == "Red"
                                        ?    <View style={styles.dangerButton}>
                                                <FontAwesomeIcon icon={ faBan } size={20} color="#fff"/>
                                                <Text style={styles.buttonText}>Indisponível</Text>
                                            </View>
                                        : (
                                            scheduling.check_in == "Green" 
                                                ?   <View style={styles.successButton}>
                                                        <FontAwesomeIcon icon={ faCheckCircle } size={20} color="#fff"/>
                                                        <Text style={styles.buttonText}>Atendido</Text>
                                                    </View>
                                                :   <View style={styles.primaryButton}>
                                                        <FontAwesomeIcon icon={ faCircleNotch } size={20} color="#fff"/>
                                                        <Text style={styles.buttonText}>Aguardando</Text>
                                                    </View>
                                        )
                                    } 

                                </View>
                            </View>
                        ) : <View style={{
                            flex: 1,
                            backgroundColor: '#fff', 
                            marginHorizontal: 10,
                            marginVertical: '30%',
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            borderRadius: 20,
                            alignItems: 'center', justifyContent: 'center'}}>
                            <ActivityIndicator size="large" color="#0000ff"/>
                            <Text style={{color: '#222', marginVertical: 10}}>Carregando ...</Text>
                        </View>
                    }           
               
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eee',
    },
    statusBar: {
        backgroundColor: '#1976d2',
        color: '#fff'
    },
   
    backBlock: {
        backgroundColor: '#bf360c',
        flexDirection: 'row',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15
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
        fontSize: 13,
    },
    cardAvatar: {
        height: 60,
        width: 60,
        backgroundColor: 'gray',
        borderRadius: 20,
        marginVertical: 20
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
        color: '#222',
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
    cardCRM: {
        color: '#222',
        fontSize: 14,
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
        margin: 2,
        padding: 4,
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
    dangerButton: {
        backgroundColor: '#d32f2f',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:4,
        margin: 2,
        padding: 4,
        flexDirection: 'row'
    },
    successButton: {
        backgroundColor: '#388e3c',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:4,
        margin: 2,
        padding: 4,
        flexDirection: 'row'
    },
    primaryButton: {
        backgroundColor: '#1976d2',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:4,
        margin: 2,
        padding: 4,
        flexDirection: 'row'
    },
    navButton: {
        color: '#bf360c'
    },
    buttonText: {
        color:'#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginHorizontal: 10
    }
});