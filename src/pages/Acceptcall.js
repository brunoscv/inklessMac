import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Image, TouchableOpacity, ActivityIndicator, PermissionsAndroid, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faCheckCircle, faPhoneSquareAlt, faVideo } from '@fortawesome/free-solid-svg-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { format, parseISO } from "date-fns";
import api from '../services/api';
import axios from 'axios';
import NetInfo from "@react-native-community/netinfo";

// import { Container } from './styles';

export default function Acceptcall({ navigation }) {

    const [schedulings, setSchedulings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [callLoading, setCallLoading] = useState(false);
    const [connState, setConnState] = useState(0);
    const [confirmation, setConfirmation] = useState(false);
    const [answered, setAnswered] = useState(false);
    const [response, setResponse] = useState([]);
    const [showText, setShowText] = useState(true);
    
    const agendamento = navigation.getParam('scheduling_id', '0');

    //console.log(agendamento);

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

    async function handle(scheduling_id) {
        setCallLoading(true);
        const data = {
            id: scheduling_id,
            meet_call: true, 
        };

        const config = {
            method: "put",
            url: `https://demo.denarius.digital/api/mobile/scheduling/meetCall`,
            data: JSON.stringify(data),
            headers: { "content-type": "application/json" }
        };

        if (connState.isConnected == true) {
            const responsed = await axios(config);
            if( responsed.status == 200 ) {
              setResponse(responsed);
              setCallLoading(false);
              setConfirmation(true);
             
              Alert.alert(
                "Confirmação",
                "A teleconsulta foi confirmada com sucesso! Clique no botão 'Atender Chamada' para iniciar o seu atendimento",
                [
                  {text: 'OK', onPress: () => navigation.navigate("Reloadcall", { scheduling_id: agendamento })},
                ],
                {cancelable: false},
              );
              //Alert.alert("Contato", "A teleconsulta foi confirmada com sucesso! Clique no botão 'Atender Chamada' para iniciar o seu atendimento");
            } else {
              Alert.alert("Conexão", "Verifique os dados digitados e tente novamente!");
            }
        } else {
            setCallLoading(false);
            Alert.alert("Conexão", "Detectamos que você não possui conexão ativa com a Internet. Por favor tente novamente!");
        }
    }

    useEffect(() => {
        async function loadSchedulings() {
            const response = await api.get('/mobile/scheduling/' + agendamento, { responseType: 'json' });
            setSchedulings(response);
            setLoading(!loading);
            console.log(agendamento);
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

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" style={styles.statusBar}/>

            <View style={{backgroundColor: '#004ba0'}}>
                <View style={ {backgroundColor: '#1976d2', padding: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row'} }>
                    <TouchableOpacity  onPress={() => navigation.navigate('Menu') } style={{padding: 5}}>
                        <FontAwesomeIcon icon={ faArrowLeft } size={20} color="#fff"/>
                    </TouchableOpacity>
                
                    <View><Text style={{color: '#fff', fontSize: 20, fontWeight: '400'}}>Teleconsulta</Text></View>
                </View>
            </View>
            
            <ScrollView style={{
                flex: 1, 
                backgroundColor: "#f5f5f5", 
                borderTopLeftRadius: 30, 
                borderTopRightRadius: 30}}>
                    <View style={styles.titleBlock}>
                        <Text style={styles.subnameBlock}>{"Anna Renatta"}</Text>
                    </View>
                    <View>
                        <Text style={{paddingHorizontal: 10, paddingVertical: 20}}>Todos os check-in's</Text>
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
                                        <Image style={styles.cardAvatar} source={{uri: 'https://demo.inkless.digital/storage/' + schedulings.data.professional_image}}/>
                                        <View style={styles.cardLeftSide} >
                                            <Text style={styles.cardName} >Dr(a). {schedulings.data.professional_name}</Text>
                                            <Text style={styles.cardTime} >{ format(parseISO(schedulings.data.date_scheduling), "dd/MM/yyyy") } às { schedulings.data.time_starting_booked }</Text>
                                            <Text style={styles.cardAddress} >{ schedulings.data.video_appointment == true ? <Text>Teleconsulta</Text> : <Text>Consulta Presencial</Text>} - Hospital Gastrovita</Text>
                                            <Text style={styles.cardAddress} >Não Atendido</Text>
                                        </View>
                                    </View>
                                    <View style={styles.cardFooter}>
                                        {
                                            schedulings.data.session_id && schedulings.data.session_token 
                                            ?   <View> 
                                                <TouchableOpacity onPress={ () => navigation.navigate('Video', { apiKey: `${schedulings.data.apiKey}`, sessionId: `${schedulings.data.session_id}`, tokenId: `${schedulings.data.session_token}` })} style={styles.callButton}>
                                                    <View style={{flexDirection: 'row', justifyContent:'center', alignItems: 'center'}}>
                                                        <FontAwesomeIcon icon={ faPhoneSquareAlt } size={20} color="#fff"/>
                                                        <Text style={styles.buttonText}>Atender Chamada</Text>
                                                    </View>
                                                </TouchableOpacity>
                                                </View>
                                                
                                            : null
                                        }
                                            
                                        <View>
                                        {
                                            schedulings.data.meet_call == true ?
                                                <TouchableOpacity style={styles.sucessButton}>
                                                    <FontAwesomeIcon icon={ faVideo } size={20} color="#fff"/>
                                                    <Text style={styles.buttonText}>Chamada Confirmada</Text>
                                                </TouchableOpacity>
                                            : 
                                            <View> 
                                                <TouchableOpacity  onPress={ () => handle(schedulings.data.id) } style={styles.primaryButton}>
                                                {callLoading ? <ActivityIndicator size="small" color="#0000ff" style={{alignItems: 'center', justifyContent: 'center'}}/> : <FontAwesomeIcon icon={ faVideo } size={20} color="#fff"/>}
                                                    <Text style={styles.buttonText}>Confirmar Chamada</Text>
                                                </TouchableOpacity>
                                                <Text style={[styles.textStyle, { display: showText ? 'none' : 'flex' }]}>
                                                    O médico está chamando agora ...
                                                </Text>
                                            </View>
                                        }
                                        </View> 
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
        </View>
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