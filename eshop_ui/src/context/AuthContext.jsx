import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { AUTH_ENDPOINTS } from '../api/endpoints';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      const token = Cookies.get('access_token');
      if (token) {
        const { data } = await axiosInstance.get(AUTH_ENDPOINTS.PROFILE);
        setUser(data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      Cookies.remove('access_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Signup - Register new user
  const signup = async (userData) => {
    try {
      const { data } = await axiosInstance.post(AUTH_ENDPOINTS.SIGNUP, userData);
      toast.success('Signup successful! Please check your email for OTP verification.');
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.email?.[0]
        || error.response?.data?.password?.[0]
        || 'Signup failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Verify OTP for account activation
  const verifyActivationOTP = async (email, otp) => {
    try {
      const { data } = await axiosInstance.post(AUTH_ENDPOINTS.ACTIVATE_VERIFY_OTP, {
        email,
        otp,
      });
      toast.success('Account activated successfully! You can now login.');
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.otp?.[0]
        || 'Invalid OTP. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Resend activation OTP
  const resendActivationOTP = async (email) => {
    try {
      const { data } = await axiosInstance.post(AUTH_ENDPOINTS.ACTIVATE_RESEND_OTP, {
        email,
      });
      toast.success('OTP has been resent to your email.');
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail 
        || 'Failed to resend OTP. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Login
  const login = async (email, password, role) => {
    try {
      const { data } = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, {
        email,
        password,
        role,
      });
      
      if (data.access) {
        Cookies.set('access_token', data.access, { expires: 7 });
      }
      
      await checkAuth();
      toast.success(`Welcome back${user?.first_name ? `, ${user.first_name}` : ''}!`, {
        icon: '👋',
      });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.non_field_errors?.[0]
        || 'Invalid credentials. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
      Cookies.remove('access_token');
      setUser(null);
      toast.success('Logged out successfully', {
        icon: '👋',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      Cookies.remove('access_token');
      setUser(null);
    }
  };

  // Password Reset - Step 1: Verify email
  const passwordResetVerifyEmail = async (email) => {
    try {
      const { data } = await axiosInstance.post(AUTH_ENDPOINTS.PASSWORD_RESET_VERIFY_EMAIL, {
        email,
      });
      toast.success('OTP has been sent to your email.');
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.email?.[0]
        || 'Email verification failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Password Reset - Step 2: Verify OTP
  const passwordResetVerifyOTP = async (email, otp) => {
    try {
      const { data } = await axiosInstance.post(AUTH_ENDPOINTS.PASSWORD_RESET_VERIFY_OTP, {
        email,
        otp,
      });
      toast.success('OTP verified. Please set your new password.');
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.otp?.[0]
        || 'Invalid OTP. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Password Reset - Step 3: Confirm new password
  const passwordResetConfirm = async (email, newPassword1, newPassword2) => {
    try {
      const { data } = await axiosInstance.post(AUTH_ENDPOINTS.PASSWORD_RESET_CONFIRM, {
        email,
        new_password1: newPassword1,
        new_password2: newPassword2,
      });
      toast.success('Password reset successful! You can now login with your new password.');
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.new_password1?.[0]
        || error.response?.data?.new_password2?.[0]
        || 'Password reset failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Change Password (for logged-in users)
  const changePassword = async (oldPassword, newPassword, confirmPassword) => {
    try {
      const { data } = await axiosInstance.put(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      toast.success('Password changed successfully!');
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.old_password?.[0]
        || error.response?.data?.new_password?.[0]
        || error.response?.data?.confirm_password?.[0]
        || 'Password change failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    try {
      const { data } = await axiosInstance.patch(AUTH_ENDPOINTS.PROFILE, profileData);
      setUser(data);
      toast.success('Profile updated successfully!');
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail 
        || 'Profile update failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Get Profile
  const getProfile = async () => {
    try {
      const { data } = await axiosInstance.get(AUTH_ENDPOINTS.PROFILE);
      setUser(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  };

  // Delete Account
  const deleteAccount = async () => {
    try {
      await axiosInstance.delete(AUTH_ENDPOINTS.PROFILE);
      Cookies.remove('access_token');
      setUser(null);
      toast.success('Account deleted successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.detail 
        || 'Account deletion failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    
    // Auth functions
    signup,
    verifyActivationOTP,
    resendActivationOTP,
    login,
    logout,
    checkAuth,
    
    // Password reset functions
    passwordResetVerifyEmail,
    passwordResetVerifyOTP,
    passwordResetConfirm,
    
    // Profile functions
    changePassword,
    updateProfile,
    getProfile,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};