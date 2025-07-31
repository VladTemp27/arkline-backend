import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

// Loading component placeholder - replace with your actual loading component
const Loading = () => <div>Loading...</div>;

export const RedirectIfAuthenticated = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            console.log('Token found, checking authentication...');
            checkAuth(token).then((result) => {
                setIsAuthenticated(result);
            });
        } else {
            console.log('No token found, user is not authenticated.');
            setIsAuthenticated(false);
        }
    }, []);

    if (isAuthenticated === null) {
        return <Loading />
    }

    if(isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export const RequireAuth = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            checkAuth(token).then((result) => {
                setIsAuthenticated(result);
            });
        } else {
            setIsAuthenticated(false);
        }
    },[])

    if( isAuthenticated === null) {
        return <Loading />;
    }

    if( isAuthenticated === false) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};


export const RedirectIfAdmin = ({ children }) => {
    const token = localStorage.getItem('token');
    const [isAdmin, setIsAdmin] = useState(null);

    useEffect(() => {
        if (token) {
            checkAuth(token, 'admin').then((result) => {
                setIsAdmin(result);
            });
        } else {
            setIsAdmin(false);
        }
    }, [token]);

    if (isAdmin === null) {
        return <Loading />;
    }

    if (isAdmin === true) {
        return <Navigate to="/admin" replace />;
    }

    return children;
}

// This function checks if the user is authenticated by verifying the token
// It returns true if the token is valid, otherwise false
async function checkAuth(token, role = null) {
    if (!token){
        return false;
    }
    try{
        const response = await axios.post('http://api.arkline.com/api/user-service/auth/authorize', {}, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        console.log(response.data)

        if(response.status === 200) {
            if (role) {
                return response.data.role === role;
            }
            return true;
        }

        return false;
    }catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

