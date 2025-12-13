import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ShoppingCart, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { USER_ROLES, GENDERS } from '../../utils/constants';

const SignupPage = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: USER_ROLES.CUSTOMER,
        gender: GENDERS.MALE,
        profile: {
            phone_number: '',
            country: 'Rwanda',
            province: '',
            district: '',
            sector: '',
            street: '',
            postal_code: '',
        },
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('profile.')) {
            const profileField = name.split('.')[1];
            setFormData({
                ...formData,
                profile: {
                    ...formData.profile,
                    [profileField]: value,
                },
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            setLoading(true);
            await signup(formData);
            navigate('/verify-otp', { state: { email: formData.email } });
        } catch (err) {
            setError(err.response?.data?.detail || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4 hover:bg-blue-600 transition"
                    >
                        <ShoppingCart className="w-8 h-8 text-white" />
                    </button>
                    <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                    <p className="mt-2 text-gray-600">Join us and start shopping today</p>
                </div>

                {/* Signup Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="mb-6">
                            <Alert type="error" message={error} onClose={() => setError('')} />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="John"
                                    icon={User}
                                    required
                                />

                                <Input
                                    label="Last Name"
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    icon={User}
                                    required
                                />

                                <Select
                                    label="Gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    options={[
                                        { value: GENDERS.MALE, label: 'Male' },
                                        { value: GENDERS.FEMALE, label: 'Female' },
                                        { value: GENDERS.OTHER, label: 'Other' },
                                    ]}
                                    required
                                />

                                <Select
                                    label="Account Type"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    options={[
                                        { value: USER_ROLES.CUSTOMER, label: 'Customer' },
                                        { value: USER_ROLES.SHOP_OWNER, label: 'Shop Owner' },
                                    ]}
                                    required
                                />
                            </div>
                        </div>

                        {/* Account Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                            <div className="space-y-4">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    icon={Mail}
                                    required
                                />

                                <div className="relative">
                                    <Input
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        icon={Lock}
                                        helperText="Must be at least 8 characters"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                <div className="relative">
                                    <Input
                                        label="Confirm Password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        icon={Lock}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
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
                                    value={formData.profile.phone_number}
                                    onChange={handleChange}
                                    placeholder="+250 123 456 789"
                                    icon={Phone}
                                />

                                <Input
                                    label="Country"
                                    type="text"
                                    name="profile.country"
                                    value={formData.profile.country}
                                    onChange={handleChange}
                                    placeholder="Rwanda"
                                    icon={MapPin}
                                />

                                <Input
                                    label="Province"
                                    type="text"
                                    name="profile.province"
                                    value={formData.profile.province}
                                    onChange={handleChange}
                                    placeholder="Kigali"
                                />

                                <Input
                                    label="District"
                                    type="text"
                                    name="profile.district"
                                    value={formData.profile.district}
                                    onChange={handleChange}
                                    placeholder="Gasabo"
                                />

                                <Input
                                    label="Sector"
                                    type="text"
                                    name="profile.sector"
                                    value={formData.profile.sector}
                                    onChange={handleChange}
                                    placeholder="Kimironko"
                                />

                                <Input
                                    label="Street"
                                    type="text"
                                    name="profile.street"
                                    value={formData.profile.street}
                                    onChange={handleChange}
                                    placeholder="KG 123 St"
                                />

                                <Input
                                    label="Postal Code"
                                    type="text"
                                    name="profile.postal_code"
                                    value={formData.profile.postal_code}
                                    onChange={handleChange}
                                    placeholder="00000"
                                    containerClassName="md:col-span-2"
                                />
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                required
                                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 mt-1"
                            />
                            <label className="ml-2 text-sm text-gray-600">
                                I agree to the{' '}
                                <Link to="/terms" className="text-blue-500 hover:text-blue-600 font-medium">
                                    Terms and Conditions
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-blue-500 hover:text-blue-600 font-medium">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={loading}
                            variant="primary"
                            size="lg"
                            fullWidth
                        >
                            Create Account
                        </Button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-blue-500 hover:text-blue-600 font-semibold"
                        >
                            Sign in instead
                        </Link>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;