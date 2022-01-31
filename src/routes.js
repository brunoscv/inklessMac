import { createAppContainer, createSwitchNavigator} from 'react-navigation';

import Menu from './pages/Menu';
import Login from './pages/Login';
import Satisfaction from './pages/Satisfaction';
import Users from './pages/Users';
import CodeRequest from './pages/CodeRequest';
import CodeConfirm from './pages/CodeConfirm';
import Scheduling from './pages/Scheduling';
import Reloadscheduling from './pages/Reloadscheduling';
import Historic from './pages/Historic';
import Report from './pages/Report';
import Document from './pages/Document';
import Video from './pages/Video';
import Attendance from './pages/Attendance';
import Clinic from './pages/Clinic';
import Acceptcall from './pages/Acceptcall';
import Reloadcall from './pages/Reloadcall';

const Routes = createAppContainer(
    createSwitchNavigator({
        Menu,
        Login,
        Satisfaction,
        Users,
        CodeRequest,
        CodeConfirm,
        Scheduling,
        Reloadscheduling,
        Historic,
        Report,
        Document,
        Video,
        Attendance,
        Clinic,
        Acceptcall,
        Reloadcall,
        
    })
);
export default Routes;