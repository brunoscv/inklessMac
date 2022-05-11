import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, Image, TouchableOpacity, ActivityIndicator, PermissionsAndroid, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faCheckCircle, faPhoneSquareAlt, faVideo } from '@fortawesome/free-solid-svg-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { HeaderBackButton } from '@react-navigation/stack';

import { format, parseISO } from "date-fns";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../services/api';
import baseURL from './Baseurl';
import axios from 'axios';

import { BackHandler } from 'react-native';

// import { Container } from './styles';

export default function Reloadcall({ route, navigation }) {

    const [schedulings, setSchedulings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [callLoading, setCallLoading] = useState(false);
    const [connState, setConnState] = useState(0);
    const [confirmation, setConfirmation] = useState(false);
    const [answered, setAnswered] = useState(false);
    const [response, setResponse] = useState([]);
    const [showText, setShowText] = useState(true);
    const [user, setUser] = useState('');
    const agendamento = route.params?.scheduling_id;

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
      async function loadCustomer() {
        const user_id = await AsyncStorage.getItem('@storage_Key');
        const response = await api.get('api/customer/' + user_id, { responseType: 'json' });
        setUser(response.data.data);
        
      }
      loadCustomer();
    }, []);

    useEffect(() => {
        async function loadSchedulings() {
            const response = await api.get('api/mobile/scheduling/' + agendamento, { responseType: 'json' });
            setSchedulings(response);
            setLoading(!loading);
        }
        loadSchedulings();
    }, []);

    useEffect(() => {
        // Change the state every second or the time given by User.
        const interval = setInterval(() => {
          setShowText((showText) => !showText);
        }, 500);
        return () => clearInterval(interval);
    }, []);

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

    async function loadVideoCall() {
        setCallLoading(true);
        const response = await api.get('api/mobile/scheduling/' + agendamento, { responseType: 'json' });

        console.log(response);

        console.log(agendamento);

        console.log(response.data.apiKey);
        console.log(response.data.sessionId);
        console.log(response.data.tokenId);
        if(response.status == 200) {
            setCallLoading(false);
            navigation.navigate('Video', { apiKey: `${response.data.apiKey}`, sessionId: `${response.data.session_id}`, tokenId: `${response.data.session_token}` });
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" style={styles.statusBar}/>

            {/* Colocar essa view de volta no android <View style={{backgroundColor: '#004ba0'}}></View> <View style={ {backgroundColor: '#1976d2', padding: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row'} }> */ }
                <View style={ {backgroundColor: '#1976d2', padding: 10, flexDirection: 'row'} }>
                    <TouchableOpacity  onPress={() => navigation.navigate('Menu') } style={{padding: 5}}>
                        <FontAwesomeIcon icon={ faArrowLeft } size={20} color="#fff"/>
                    </TouchableOpacity>
                
                    <View><Text style={{color: '#fff', fontSize: 20, fontWeight: '400'}}>Teleconsulta</Text></View>
                </View>
            <ScrollView style={{
                flex: 1, 
                backgroundColor: "#f5f5f5"}}>
                    <View style={styles.titleBlock}>
                        <Text style={styles.subnameBlock}>{user.name}</Text>
                    </View>
                    <View>
                        <Text style={{paddingHorizontal: 10, paddingVertical: 20}}>Aceitar chamada(s)</Text>
                    </View>
                    <View>
                        {!loading ? 
                            <View style={{ 
                                backgroundColor: '#fff', 
                                marginHorizontal: 10,
                                marginVertical: 4,
                                paddingHorizontal: 14,
                                paddingVertical: 10,
                                borderRadius: 20 }}>
                                    <View style={styles.cardBody} >
                                        <Image style={styles.cardAvatar} source={{uri: baseURL + 'storage/' + schedulings.data.professional_image}}/>
                                        <View style={styles.cardLeftSide} >
                                            <Text style={styles.cardName} >Dr(a). {schedulings.data.professional_name}</Text>
                                            <Text style={styles.cardTime} >{ format(parseISO(schedulings.data.date_scheduling), "dd/MM/yyyy") } às { schedulings.data.time_starting_booked }</Text>
                                            <Text style={styles.cardAddress} >{ schedulings.data.video_appointment == true ? <Text>Teleconsulta</Text> : <Text>Consulta Presencial</Text>} - Hospital Gastrovita</Text>
                                            <Text style={styles.cardAddress} >Não Atendido</Text>
                                        </View>
                                    </View>
                                    <View style={styles.cardFooter}>
                                        <TouchableOpacity onPress={ () => loadVideoCall() } style={styles.callButton}>
                                            <View style={{flexDirection: 'row', justifyContent:'center', alignItems: 'center'}}>
                                            {callLoading ? <ActivityIndicator size="small" color="#0000ff" style={{alignItems: 'center', justifyContent: 'center'}}/> : <FontAwesomeIcon icon={ faVideo } size={20} color="#fff"/>}
                                                <Text style={styles.buttonText}>Atender Chamada</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <Text
                                            style={[styles.textStyle, { display: showText ? 'none' : 'flex' }]}>
                                        </Text>
                                    </View>
                            </View>
                        : 
                            <View style={{
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

                    </View>
                    
                
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
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
    cardName: {
        color: '#222',
        fontSize: 18,
        fontWeight: 'bold'
    },
    cardTime: {
        color: '#222',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5
    },
    cardAddress: {
        color: 'gray',
        fontSize: 15,
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
        backgroundColor: '#1976d2',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:4,
        margin: 2,
        padding: 4,
    },
    callButton: {
        backgroundColor: '#388e3c',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:4,
        margin: 2,
        padding: 4,
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

    },
    buttonText: {
        color:'#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginHorizontal: 10
    }
});