import { createAppContainer, createSwitchNavigator} from 'react-navigation';

import Login from './pages/Login';
import Menu from './pages/Menu';
import Scheduling from './pages/Scheduling';
import Reloadscheduling from './pages/Reloadscheduling';
import Historic from './pages/Historic';
import Report from './pages/Report';
import Document from './pages/Document';
import Users from './pages/Users';
import Video from './pages/Video';
import Attendance from './pages/Attendance';
import Clinic from './pages/Clinic';
import Acceptcall from './pages/Acceptcall';
import Reloadcall from './pages/Reloadcall';

const Routes = createAppContainer(
    createSwitchNavigator({
        Login,
        Users,
        Menu,
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