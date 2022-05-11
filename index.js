
import { AppRegistry, Platform } from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";

if (Platform.OS === 'ios') {
    // Must be outside of any component LifeCycle (such as `componentDidMount`).
    PushNotification.configure({
        onNotification: function (notification) {
            const { foreground, userInteraction, title, message } = notification;
            if (foreground && (title || message) && !userInteraction) PushNotification.localNotification(notification);
            notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
    });
}

AppRegistry.registerComponent(appName, () => App);
