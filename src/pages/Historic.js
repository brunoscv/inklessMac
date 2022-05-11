import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faBan, faCheckCircle, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { ScrollView } from 'react-native-gesture-handler';

import { format, parseISO } from "date-fns";
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

import api from '../services/api';
import baseURL from './Baseurl';

import { BackHandler } from 'react-native';

// import { Container } from './styles';
import Scheduling from './Scheduling';

export default function Historic({ navigation }) {

    const [schedulings, setSchedulings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [user, setUser] = useState('');

    useEffect(() => {
        async function loadCustomer() {
          const user_id = await AsyncStorage.getItem('@storage_Key');
          //const user_id = 30059;
          const response = await api.get('api/customer/' + user_id, { responseType: 'json' });
          setUser(response.data.data);
        }
        loadCustomer();
    }, []);

    useEffect(() => {
        async function loadSchedulings() {
            const user_id = await AsyncStorage.getItem('@storage_Key');
            //const user_id = 30059;
            const response = await api.get('api/mobile/checkinidall/' + user_id, { responseType: 'json' });
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
          setScheduling(JSON.stringify(remoteMessage.data.scheduling_id));
          if(remoteMessage.data.screen == "Attendance" || remoteMessage.data.screen == "Clinic") {
            //Quando a notificação é para o atendimento em guiche e no consultorio, o aplicativo busca o id do customer para fazer 
            //a impressao das informações na tela do usuário.
            //Qualquer outras funcionalidades utilizam o id do agendamento para alimentar as rotas
            Alert.alert(
              remoteMessage.data.title,
              remoteMessage.data.body,
              [
                {text: 'CONFIRMAR', onPress: () => navigation.navigate(remoteMessage.data.screen, {scheduling_id: userId})},
              ],
              {cancelable: false},
            );
          } else {
            if(remoteMessage.data.scheduling_id) {
              Alert.alert(
                remoteMessage.data.title,
                remoteMessage.data.body,
                [
                  {text: 'CONFIRMAR', onPress: () => navigation.navigate(remoteMessage.data.screen, {scheduling_id: remoteMessage.data.scheduling_id})},
                ],
                {cancelable: false},
              );
            }
            if( !remoteMessage.data.scheduling_id && remoteMessage.data.scheduling_id == null ) {
              Alert.alert(
                remoteMessage.data.title,
                remoteMessage.data.body,
                [
                  {text: 'CONFIRMAR', onPress: () => navigation.navigate(remoteMessage.data.screen)},
                ],
                {cancelable: false},
              );
            }
          } 
        });
        messaging().onNotificationOpenedApp(async remoteMessage => {
          setScheduling(JSON.stringify(remoteMessage.data.scheduling_id));
          if(remoteMessage.data.scheduling_id) {
            navigation.navigate(remoteMessage.data.screen, {scheduling_id: remoteMessage.data.scheduling_id})
          }
          if( !remoteMessage.data.scheduling_id && remoteMessage.data.scheduling_id == null ) {
            navigation.navigate(remoteMessage.data.screen)
          }
        });
        messaging().setBackgroundMessageHandler(async remoteMessage => {
          setScheduling(JSON.stringify(remoteMessage.data.scheduling_id));
          if(remoteMessage.data.scheduling_id) {
            navigation.navigate(remoteMessage.data.screen, {scheduling_id: remoteMessage.data.scheduling_id})
          }
          if( !remoteMessage.data.scheduling_id && remoteMessage.data.scheduling_id == null ) {
            navigation.navigate(remoteMessage.data.screen)
          }
        });
        return unsubscribe;
       }, []);

  requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      getFcmToken();
    }
  }

  getFcmToken = async () => {
    await messaging().getToken();
  }
  /** FIREBASE NOTIFICATION NAVIGATOR */
  
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" style={styles.statusBar}/>

            {/* Colocar essa view de volta no android <View style={{backgroundColor: '#004ba0'}}></View> <View style={ {backgroundColor: '#1976d2', padding: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row'} }>  */ }
                <View style={ {backgroundColor: '#1976d2', padding: 10, flexDirection: 'row'} }>
                    <TouchableOpacity  onPress={() => navigation.navigate('Menu') } style={{padding: 5}}>
                        <FontAwesomeIcon icon={ faArrowLeft } size={20} color="#fff"/>
                    </TouchableOpacity>
                
                    <View><Text style={{color: '#fff', fontSize: 20, fontWeight: '400'}}>Agendamentos</Text></View>
                </View>
            <ScrollView style={{
                flex: 1, 
                position: 'relative',
                backgroundColor: "#f5f5f5"}}>
                    <View style={styles.titleBlock}>
                        <Text style={styles.subnameBlock}>{user.name}</Text>
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
                                    <Image style={styles.cardAvatar} source={{uri: baseURL + 'storage/' + scheduling.professional_image}}/>
                                    <View style={styles.cardLeftSide} >
                                        <Text style={styles.cardHospital} >HOSPITAL GASTROVITA</Text>
                                        <Text style={styles.cardName} >Dr(a). {scheduling.professional_name}</Text>
                                        <Text style={styles.cardCRM} >CRM: {scheduling.professional_crm}</Text>
                                        <Text style={styles.cardTime} >{ format(parseISO(scheduling.date_scheduling), "dd/MM/yyyy") } às { scheduling.time_starting_booked }</Text>
                                        <Text style={styles.cardAddress} >{ scheduling.video_appointment == true ? <Text>Teleconsulta</Text> : <Text>Consulta Presencial</Text>} - Hospital Gastrovita</Text>
                                    </View>
                                </View>
                                <View style={styles.cardFooter}>

                                    { scheduling.check_in == "Red"
                                        ?    <View style={styles.dangerButton}>
                                                <FontAwesomeIcon icon={ faBan } size={20} color="#fff"/>
                                                <Text style={styles.buttonText}>Indisponível</Text>
                                            </View>
                                        : (
                                            scheduling.check_in == "Blue" 
                                            ?   
                                                <View style={styles.primaryButton}>
                                                    <FontAwesomeIcon icon={ faCircleNotch } size={20} color="#fff"/>
                                                    <Text style={styles.buttonText}>Aguardando</Text>
                                                </View>
                                                
                                            :   
                                            ( scheduling.status == 4 || scheduling.status == 5
                                                
                                                ?   <View style={styles.cardFooter}>
                                                        <View style={styles.successButton}>
                                                            <FontAwesomeIcon icon={ faCheckCircle } size={20} color="#fff"/>
                                                            <Text style={styles.buttonText}>Check-In Feito</Text>
                                                        </View>
                                                        <View style={styles.successButton}>
                                                            <FontAwesomeIcon icon={ faCheckCircle } size={20} color="#fff"/>
                                                            <Text style={styles.buttonText}>Atendido</Text>
                                                        </View>
                                                    </View>
                                            
                                                : 
                                                    <View style={styles.successButton}>
                                                        <FontAwesomeIcon icon={ faCheckCircle } size={20} color="#fff"/>
                                                        <Text style={styles.buttonText}>Check-In Feito</Text>
                                                    </View> 
                                            )
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
        </SafeAreaView>
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
        backgroundColor: '#1976d2',
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