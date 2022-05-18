import React, { useEffect, useState } from 'react';
//import Routes from './src/routes';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import { navigationRef, isReadyRef } from './src/components/RootNavigation';

import AsyncStorage from '@react-native-async-storage/async-storage';

import 'react-native-gesture-handler';

import { BackHandler } from 'react-native';

import Menu from "./src/pages/Menu";
import Login from './src/pages/Login';
import Satisfaction from './src/pages/Satisfaction';
import Users from './src/pages/Users';
import CodeRequest from './src/pages/CodeRequest';
import CodeConfirm from './src/pages/CodeConfirm';
import Scheduling from './src/pages/Scheduling';
import Reloadscheduling from './src/pages/Reloadscheduling';
import Historic from './src/pages/Historic';
import Report from './src/pages/Report';
import Document from './src/pages/Document';
import Video from './src/pages/Video';
import Attendance from './src/pages/Attendance';
import Clinic from './src/pages/Clinic';
import Acceptcall from './src/pages/Acceptcall';
import Reloadcall from './src/pages/Reloadcall';
import Profile from './src/pages/Profile';

import messaging from '@react-native-firebase/messaging';

const Stack = createStackNavigator();

export default function App() {

  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Menu');

  useEffect(() => {
    async function loadCustomer() {
      const user_id =  await AsyncStorage.getItem('@storage_Key');
      setUserId(user_id);
    }
    loadCustomer();
  }, []);

  React.useEffect(() => {
    return () => {
      isReadyRef.current = false
    };
  }, []);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => true);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  useEffect(() => {
    async function notifications() {
      // Assume a message-notification contains a "type" property in the data payload of the screen to open
      const customerId =  await AsyncStorage.getItem('@storage_Key');
      // messaging().onMessage(async remoteMessage => {
      //   if (remoteMessage) {
      //     !customerId ? setInitialRoute('Login') : setInitialRoute(remoteMessage.data.screen); // e.g. "Settings"
      //     await AsyncStorage.removeItem('@scheduling_Id');
      //     await AsyncStorage.setItem('@scheduling_Id', remoteMessage.data.scheduling_id);
      //   }
      //   setLoading(false);
      // });
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        if (remoteMessage) {
          !customerId ? setInitialRoute('Login') : setInitialRoute(remoteMessage.data.screen); // e.g. "Settings"
          await AsyncStorage.removeItem('@scheduling_Id');
          if(remoteMessage.data.scheduling_id != null) {
            await AsyncStorage.setItem('@scheduling_Id', remoteMessage.data.scheduling_id);
          }
        }
        setLoading(false);
      });

      messaging().onNotificationOpenedApp(async remoteMessage => {
        if (remoteMessage) {
          !customerId ? setInitialRoute('Login') : setInitialRoute(remoteMessage.data.screen); // e.g. "Settings"
          await AsyncStorage.removeItem('@scheduling_Id');
          
          if(remoteMessage.data.scheduling_id != null) {
            await AsyncStorage.setItem('@scheduling_Id', remoteMessage.data.scheduling_id);
          }
        }
        setLoading(false);
      });

      // Check whether an initial notification is available
      messaging().getInitialNotification().then(async remoteMessage => {
        if (remoteMessage) {
          !customerId ? setInitialRoute('Login') : setInitialRoute(remoteMessage.data.screen); // e.g. "Settings"
          await AsyncStorage.removeItem('@scheduling_Id');
          if(remoteMessage.data.scheduling_id != null) {
            await AsyncStorage.setItem('@scheduling_Id', remoteMessage.data.scheduling_id);
          }
        }
        setLoading(false);
      });
    }
    notifications();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef} 
      onReady={() => {
        isReadyRef.current = true;
      }} >
      
        <Stack.Navigator initialRouteName={ !userId ? 'Login' : initialRoute}
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1976d2',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }} >
          <Stack.Screen name="Menu" component={Menu} options={{headerShown: false, headerLeft: null, gestureEnabled: false, }} />
          <Stack.Screen name="Acceptcall" component={Acceptcall} options={{title: "Aceitar Teleconsulta", headerShown: false, headerLeft: null, gestureEnabled: false, }}/>
          <Stack.Screen name="Attendance" component={Attendance} options={{title: "Atendimento Guichê", headerShown: false, headerLeft: null, gestureEnabled: false, }}/>
          <Stack.Screen name="Profile" component={Profile} options={{title: "Perfil do Usuário", headerShown: false, headerLeft: null, gestureEnabled: false, }}/>
          <Stack.Screen name="Clinic" component={Clinic} options={{title: "Atendimento Consultório", headerShown: false, headerLeft: null, gestureEnabled: false, }}/>
          <Stack.Screen name="CodeConfirm" component={CodeConfirm} options={{ title: "Confirmar Código", headerLeft: null, gestureEnabled: false, }}/>
          <Stack.Screen name="CodeRequest" component={CodeRequest} options={{ title: "Enviar Código", headerLeft: null, gestureEnabled: false, }}/>
          <Stack.Screen name="Document" component={Document} options={{title: "Documentos", headerShown: false, headerLeft: null, gestureEnabled: false, }}/>
          <Stack.Screen name="Report" component={Report} options={{title: "Laudos", headerShown: false, headerLeft: null, gestureEnabled: false, }}/>
          <Stack.Screen name="Historic" component={Historic} options={{title: "Agendamentos", headerShown: false, headerLeft: null, gestureEnabled: false, }}/>
          <Stack.Screen name="Login" component={Login} options={{headerShown: false, headerLeft: null, gestureEnabled: false, title: "Entrar" }}/>
          <Stack.Screen name="Reloadcall" component={Reloadcall} options={{title: "Aceitar Teleconsulta", headerShown: false, headerLeft: null, gestureEnabled: false, }}/>
          <Stack.Screen name="Satisfaction" component={Satisfaction} options={{ title: "Avaliação de Atendimento", headerShown: false, headerLeft: null, gestureEnabled: false, }}/>
          <Stack.Screen name="Scheduling" component={Scheduling} options={{ title: "Check-In", headerShown: false, headerLeft: null, gestureEnabled: false, }}/>
          <Stack.Screen name="Reloadscheduling" component={Reloadscheduling} options={{ title: "Check-In", headerShown: false, headerLeft: null, gestureEnabled: false, }}/>
          <Stack.Screen name="Users" component={Users} options={{ title: "Seus Usuários", headerLeft: null, gestureEnabled: false, }}/>
          <Stack.Screen name="Video" component={Video} options={{headerShown: false, headerLeft: null, gestureEnabled: false}}/>
        </Stack.Navigator>
      
    </NavigationContainer>
  );
 
}