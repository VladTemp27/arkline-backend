import { useNavigate, useLocation } from 'react-router';

/**
 * Disclaimer:
 * Due to the strict time frame this function is made to determine the user role.
 * It is not the best practice to determine user roles.
 * It is recommended to use a more robust authentication and authorization system.
 * This is a temporary solution to get the user role based on the current URL path.
 */

function getUserRole (){
    const currentLocation = useLocation();
    const pathname = currentLocation.pathname;
    
    // Check if the current path includes admin routes
    if (pathname.startsWith('/admin')) {
        return 'admin';
    } else if (pathname.startsWith('/accomplishmentlog')) {
        return 'user';
    } else {
        // Default fallback - could also check localStorage/sessionStorage for user data
        return 'user';
    }
}

function useMenuItems() {
    const navigate = useNavigate();
    const userRole = getUserRole();

    const adminItems = [
        {
            key: 'log-time',
            label: 'Log Time',
            path: '/admin/log-time',
            onClick: () => navigate('/admin/log-time'),
        },
        {
            key: 'tickets',
            label: 'Tickets',
            path: '/admin/tickets',
            onClick: () => navigate('/admin/tickets'),
        },
        {
            key: 'accomplishment-logs',
            label: 'Accomplishment Logs',
            path: '/admin/accomplishment-logs',
            onClick: () => navigate('/admin/accomplishment-logs'),
        }
    ];

    const userItems = [
        {
            key: 'log-time',
            label: 'Log Time',
            path: '/accomplishmentlog/log-time',
            onClick: () => navigate('/accomplishmentlog/log-time'),
        },
        {
            key: 'accomplishment-logs',
            label: 'Accomplishment Logs',
            path: '/accomplishmentlog/accomplishment-logs',
            onClick: () => navigate('/accomplishmentlog/accomplishment-logs'),
        }
    ];

    switch (userRole) {
        case 'admin':
            return adminItems;
        case 'user':
            return userItems;
        default:
            return [];
    }
}

export default useMenuItems;
