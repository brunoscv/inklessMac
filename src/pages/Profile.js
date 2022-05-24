import React, { useEffect, useState } from 'react';

import { SafeAreaView, View, Text, StyleSheet, StatusBar, TouchableOpacity, Image, ActivityIndicator,Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faCameraRetro, faPhotoVideo, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { HeaderBackButton } from '@react-navigation/stack';

import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
import { format, fromUnixTime, parseISO } from "date-fns";

import api from '../services/api';
import axios from 'axios';
import baseURL from './Baseurl';

import { BackHandler } from 'react-native';

import * as ImagePicker from "react-native-image-picker"

export default function Profile({ route, navigation }) {

    const [notifications, setNotifications] = useState([]);
    const [notParse, setNotParse] = useState([]);

    const [userId, setUserId] = useState('');
    const [user, setUser] = useState([]);
    const [visible, setVisible] = useState(true);

    React.useLayoutEffect(() => {     
        navigation.setOptions({
            headerLeft: (...props) => (
                <HeaderBackButton {...props}           
                    onPress={() => {
                        navigation.reset({ index: 0, routes: [{ name: "Menu" }], })
                    }}          
                    label=' Menu'           
                    tintColor='white'         
                    />       
            ),     
        });   
    }, [navigation]);
    
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      async function loadCustomer() {
        const user_id = await AsyncStorage.getItem('@storage_Key');
        const response = await api.get('api/customer/' + user_id, { responseType: 'json' });
       
        if(response) {
            setUser(response.data.data);
            setUserId(user_id);
            setLoading(false)
        }

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

    const [resourcePath, setResourcePath] = useState();
    const [fileName, setFileName] = useState();
    const [fileData, setFileData] = useState();
    const [fileUri, setFileUri] = useState('');
    cameraLaunch = () => {
        let options = {
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
            maxWidth:480,
            maxHeight: 640,
            cameraType: 'front',
            mediaType: 'photo',
            cropping: true,
            quality: 0.5
        };
        ImagePicker.launchCamera(options, (res) => {
            if (res.didCancel) {
                console.log('User cancelled image picker');
            } else if (res.error) {
                console.log('ImagePicker Error: ', res.error);
            } else if (res.customButton) {
                console.log('User tapped custom button: ', res.customButton);
                alert(res.customButton);
            } else {
                const source = { uri: res.assets[0].uri };
                console.log('response', JSON.stringify(res));
                console.log('uri', JSON.stringify(res.assets[0].uri));
                setFileName(res.assets[0].fileName)
                setFileData(res.assets[0].type)
                setFileUri(res.assets[0].uri)
                setResourcePath(source)
                setVisible(false)
            }
        });
    }

    imageGalleryLaunch = () => {
        let options = {
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
            maxWidth:480,
            maxHeight: 640,
            mediaType: 'photo',
            cropping: true,
            quality: 0.5

        };
        ImagePicker.launchImageLibrary(options, (res) => {
            console.log('Response = ', res);
            if (res.didCancel) {
                console.log('User cancelled image picker');
            } else if (res.error) {
                console.log('ImagePicker Error: ', res.error);
            } else if (res.customButton) {
                console.log('User tapped custom button: ', res.customButton);
                alert(res.customButton);
            } else {
                const source = { uri: res.uri };
                //console.log('response', JSON.stringify(res.uri));
                setFileName(res.assets[0].fileName)
                setFileData(res.assets[0].type)
                setFileUri(res.assets[0].uri)
                setResourcePath(source)
                setVisible(false)
            }
            });
    }

    async function upload() {
        
        const payload = new FormData();
        
        payload.append('customer_id', user.id);
         payload.append('image', {
            uri: fileUri,
            type: fileData,
            name: fileName || fileUri.substring(fileUri.lastIndexOf('/') + 1),
        });

        //console.log(JSON.stringify(payload));
        const response = await api.post('api/inklessapp/update/customer/image', payload, {
            headers: {
                Accept: "application/json",
                "Content-Type": "multipart/form-data; charset=utf-8;",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        });

        console.log(JSON.stringify(response));
        
        if(response) {
            Alert.alert(
                "Upload de Imagem",
                "Imagem alterada com sucesso!",
                [
                  {text: 'CONFIRMAR', onPress: () => navigation.reset({ index: 0, routes: [{ name: "Menu" }], })},
                ],
                {cancelable: false},
            );
        } else {
            Alert.alert(
                "Upload de Imagem",
                "Não foi possível alterar a imagem!",
                [
                  {text: 'CONFIRMAR', onPress: () => navigation.reset({ index: 0, routes: [{ name: "Profile" }], })},
                ],
                {cancelable: false},
            );
        }
       
    }


  const renderElements = (user) => {
    if(user == '' || user == null) {
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
              <Text style={{fontSize: 22, color: '#fff'}}>Perfil do Usuário</Text>
              <Text style={{color: '#fff', marginVertical: 10, fontSize: 22, fontWeight: 'bold'}}>Não há informações para serem exibidas no momento. </Text>
        </View>
      );
    } else {
      return (
          <View key={user.id} style={styles.content}> 
            <View style={{ paddingVertical: 5}}>
                <Text style={{fontSize: 22, color: '#fff'}}>Seus Dados: </Text>
            </View>
            
            <View style={{paddingVertical: 5}}>
            {
                visible ? ( !user.image ?  <Image style={{width: 150, height:150, borderRadius: 150 / 2}} source={require('../../assets/user.png')}/> : <Image style={{width: 150, height:150, borderRadius: 150 / 2}} source={{uri: baseURL + 'storage/' + user.image}}/>
                ) : 
                <View style={{}}>
                    <Image style={{width: 150, height:150, borderRadius: 150 / 2}} source={{uri: fileUri}}/>
                    <TouchableOpacity onPress={ () => upload() } style={{paddingVertical: 10}}>
                        <View style={styles.successButton}>
                                <FontAwesomeIcon icon={ faCheckCircle } size={20} color="#004ba0"/>
                                <Text style={styles.buttonText}>Salvar Imagem</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            }
            </View>
            <View style={{paddingHorizontal: 20}}>
                <Text style={{fontSize: 16, color: '#fff', paddingVertical: 5}}>Trocar Imagem: </Text>
            </View>
            <View style={styles.cardFooter}>
                <TouchableOpacity onPress={ () => cameraLaunch() } style={{}}>
                    <View style={styles.successButton}>
                        <FontAwesomeIcon icon={ faCameraRetro } size={20} color="#004ba0"/>
                        <Text style={styles.buttonText}>Câmera</Text>
                    </View>
                </TouchableOpacity>
                    <TouchableOpacity onPress={ () => imageGalleryLaunch() } style={{}}>
                        <View style={styles.successButton}>
                                <FontAwesomeIcon icon={ faPhotoVideo } size={20} color="#004ba0"/>
                                <Text style={styles.buttonText}>Galeria</Text>
                        </View>
                    </TouchableOpacity>
            </View>
            <View style={{paddingHorizontal: 20}}>
                <Text style={{fontSize: 16, color: '#fff', paddingVertical: 5}}>Prontuário: {user.id}</Text>
                <Text style={{fontSize: 16, color: '#fff', paddingVertical: 5}}>Nome: {user.name}</Text>
                <Text style={{fontSize: 16, color: '#fff', paddingVertical: 5}} >CPF: { user.cpf.replace(/(\d{ 3 })(\d{ 3 })(\d{ 3 })(\d{ 2 })/, "$1.$2.$3-$4") }</Text>
                <Text style={{fontSize: 16, color: '#fff', paddingVertical: 5}} >Data de Nasc.:{ format(parseISO(user.birth), "dd/MM/yyyy") }</Text>
            </View>
          </View>  
        )
    }
  }
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" style={styles.statusBar}/>

            <View style={ {backgroundColor: '#004ba0', padding: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row'} }>
                <TouchableOpacity  onPress={() => navigation.reset({ index: 0, routes: [{ name: "Menu" }], }) } style={{padding: 5}}>
                    <FontAwesomeIcon icon={ faArrowLeft } size={20} color="#fff"/>
                </TouchableOpacity>
            
                <View><Text style={{color: '#fff', fontSize: 20, fontWeight: '400'}}>Perfil do Usuário</Text></View>
            </View>
           
            {!loading ?
                  renderElements(user)
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
        alignItems: 'center',
        paddingVertical: 10
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
        color:'#004ba0',
        fontWeight: 'bold',
        fontSize: 16,
        marginHorizontal: 10
    },
    successButton: {
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:4,
        margin: 2,
        padding: 4,
        flexDirection: 'row'
    },
});