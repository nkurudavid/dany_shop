import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Lock, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { GENDERS } from '../../utils/constants';

const Profile = () => {
    const { user, updateProfile, changePassword } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        gender: '',
        profile: {
            phone_number: '',
            country: '',
            province: '',
            district: '',
            sector: '',
            street: '',
            postal_code: '',
        },
    });
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setProfileData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                gender: user.gender || '',
                profile: {
                    phone_number: user.profile?.phone_number || '',
                    country: user.profile?.country || '',
                    province: user.profile?.province || '',
                    district: user.profile?.district || '',
                    sector: user.profile?.sector || '',
                    street: user.profile?.street || '',
                    postal_code: user.profile?.postal_code || '',
                },
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('profile.')) {
            const profileField = name.split('.')[1];
            setProfileData({
                ...profileData,
                profile: {
                    ...profileData.profile,
                    [profileField]: value,
                },
            });
        } else {
            setProfileData({
                ...profileData,
                [name]: value,
            });
        }
        setError('');
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            setLoading(true);
            await updateProfile(profileData);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwordData.new_password !== passwordData.confirm_password) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.new_password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            setLoading(true);
            await changePassword(
                passwordData.old_password,
                passwordData.new_password,
                passwordData.confirm_password
            );
            setSuccess('Password changed successfully!');
            setPasswordData({
                old_password: '',
                new_password: '',
                confirm_password: '',
            });
        } catch (err) {
            setError('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        My Profile
                    </h1>
                    <p className="text-gray-600">Manage your account information</p>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-1 border-b-2 font-semibold transition ${activeTab === 'profile'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Profile Information
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`py-4 px-1 border-b-2 font-semibold transition ${activeTab === 'password'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Change Password
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6">
                        <Alert type="error" message={error} onClose={() => setError('')} />
                    </div>
                )}
                {success && (
                    <div className="mb-6">
                        <Alert type="success" message={success} onClose={() => setSuccess('')} />
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <Card>
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="First Name"
                                        type="text"
                                        name="first_name"
                                        value={profileData.first_name}
                                        onChange={handleProfileChange}
                                        icon={User}
                                        required
                                    />

                                    <Input
                                        label="Last Name"
                                        type="text"
                                        name="last_name"
                                        value={profileData.last_name}
                                        onChange={handleProfileChange}
                                        icon={User}
                                        required
                                    />

                                    <Input
                                        label="Email Address"
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        icon={Mail}
                                        disabled
                                        helperText="Email cannot be changed"
                                    />

                                    <Select
                                        label="Gender"
                                        name="gender"
                                        value={profileData.gender}
                                        onChange={handleProfileChange}
                                        options={[
                                            { value: GENDERS.MALE, label: 'Male' },
                                            { value: GENDERS.FEMALE, label: 'Female' },
                                            { value: GENDERS.OTHER, label: 'Other' },
                                        ]}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Phone Number"
                                        type="tel"
                                        name="profile.phone_number"
                                        value={profileData.profile.phone_number}
                                        onChange={handleProfileChange}
                                        icon={Phone}
                                    />

                                    <Input
                                        label="Country"
                                        type="text"
                                        name="profile.country"
                                        value={profileData.profile.country}
                                        onChange={handleProfileChange}
                                        icon={MapPin}
                                    />

                                    <Input
                                        label="Province"
                                        type="text"
                                        name="profile.province"
                                        value={profileData.profile.province}
                                        onChange={handleProfileChange}
                                    />

                                    <Input
                                        label="District"
                                        type="text"
                                        name="profile.district"
                                        value={profileData.profile.district}
                                        onChange={handleProfileChange}
                                    />

                                    <Input
                                        label="Sector"
                                        type="text"
                                        name="profile.sector"
                                        value={profileData.profile.sector}
                                        onChange={handleProfileChange}
                                    />

                                    <Input
                                        label="Street"
                                        type="text"
                                        name="profile.street"
                                        value={profileData.profile.street}
                                        onChange={handleProfileChange}
                                    />

                                    <Input
                                        label="Postal Code"
                                        type="text"
                                        name="profile.postal_code"
                                        value={profileData.profile.postal_code}
                                        onChange={handleProfileChange}
                                        containerClassName="md:col-span-2"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    loading={loading}
                                    disabled={loading}
                                    variant="primary"
                                    size="lg"
                                    icon={Save}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                    <Card>
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Ensure your account is using a long, random password to stay secure.
                                </p>

                                <div className="space-y-4">
                                    <Input
                                        label="Current Password"
                                        type="password"
                                        name="old_password"
                                        value={passwordData.old_password}
                                        onChange={handlePasswordChange}
                                        icon={Lock}
                                        required
                                    />

                                    <Input
                                        label="New Password"
                                        type="password"
                                        name="new_password"
                                        value={passwordData.new_password}
                                        onChange={handlePasswordChange}
                                        icon={Lock}
                                        helperText="Must be at least 8 characters"
                                        required
                                    />

                                    <Input
                                        label="Confirm New Password"
                                        type="password"
                                        name="confirm_password"
                                        value={passwordData.confirm_password}
                                        onChange={handlePasswordChange}
                                        icon={Lock}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    loading={loading}
                                    disabled={loading}
                                    variant="primary"
                                    size="lg"
                                    icon={Save}
                                >
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Profile;