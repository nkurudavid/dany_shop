import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShoppingCart, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { passwordResetVerifyOTP, passwordResetConfirm, resendActivationOTP } = useAuth();

    const [step, setStep] = useState(1); // 1: Verify OTP, 2: Set New Password
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [formData, setFormData] = useState({
        new_password1: '',
        new_password2: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(60);

    const email = location.state?.email || '';

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        if (!/^\d{6}$/.test(pastedData)) {
            setError('Please paste a valid 6-digit OTP');
            return;
        }

        const newOtp = pastedData.split('');
        setOtp(newOtp);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');

        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        try {
            setLoading(true);
            await passwordResetVerifyOTP(email, otpString);
            setSuccess('OTP verified successfully!');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setSuccess('');

        try {
            setLoading(true);
            await resendActivationOTP(email);
            setSuccess('OTP has been resent to your email');
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.new_password1 || !formData.new_password2) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.new_password1 !== formData.new_password2) {
            setError('Passwords do not match');
            return;
        }

        if (formData.new_password1.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            setLoading(true);
            await passwordResetConfirm(email, formData.new_password1, formData.new_password2);
            setSuccess('Password reset successful!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4 hover:bg-blue-600 transition"
                    >
                        <ShoppingCart className="w-8 h-8 text-white" />
                    </button>
                    <h2 className="text-3xl font-bold text-gray-900">
                        {step === 1 ? 'Verify OTP' : 'Reset Password'}
                    </h2>
                    <p className="mt-2 text-gray-600">
                        {step === 1
                            ? `Enter the 6-digit code sent to ${email}`
                            : 'Create a new strong password for your account'}
                    </p>
                </div>

                {/* Forms */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="mb-6">
                            <Alert type="error" message={error} onClose={() => setError('')} />
                        </div>
                    )}

                    {success && (
                        <div className="mb-6">
                            <Alert type="success" message={success} />
                        </div>
                    )}

                    {step === 1 ? (
                        // Step 1: Verify OTP
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                                    Enter Verification Code
                                </label>
                                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                                            required
                                        />
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                loading={loading}
                                disabled={loading || otp.some(d => !d)}
                                variant="primary"
                                size="lg"
                                fullWidth
                            >
                                Verify Code
                            </Button>

                            {/* Resend OTP */}
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">
                                    Didn't receive the code?
                                </p>
                                {countdown > 0 ? (
                                    <p className="text-sm text-gray-500">
                                        Resend code in {countdown} seconds
                                    </p>
                                ) : (
                                    <Button
                                        onClick={handleResendOtp}
                                        loading={loading}
                                        disabled={loading}
                                        variant="ghost"
                                    >
                                        Resend Code
                                    </Button>
                                )}
                            </div>
                        </form>
                    ) : (
                        // Step 2: Set New Password
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="relative">
                                <Input
                                    label="New Password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="new_password1"
                                    value={formData.new_password1}
                                    onChange={handlePasswordChange}
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
                                    label="Confirm New Password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="new_password2"
                                    value={formData.new_password2}
                                    onChange={handlePasswordChange}
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

                            {/* Password Requirements */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Password must contain:</p>
                                <ul className="space-y-1 text-sm text-gray-600">
                                    <li className="flex items-center">
                                        <CheckCircle className={`w-4 h-4 mr-2 ${formData.new_password1.length >= 8 ? 'text-green-500' : 'text-gray-300'}`} />
                                        At least 8 characters
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className={`w-4 h-4 mr-2 ${/[A-Z]/.test(formData.new_password1) ? 'text-green-500' : 'text-gray-300'}`} />
                                        One uppercase letter
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className={`w-4 h-4 mr-2 ${/[a-z]/.test(formData.new_password1) ? 'text-green-500' : 'text-gray-300'}`} />
                                        One lowercase letter
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className={`w-4 h-4 mr-2 ${/[0-9]/.test(formData.new_password1) ? 'text-green-500' : 'text-gray-300'}`} />
                                        One number
                                    </li>
                                </ul>
                            </div>

                            <Button
                                type="submit"
                                loading={loading}
                                disabled={loading}
                                variant="primary"
                                size="lg"
                                fullWidth
                            >
                                Reset Password
                            </Button>
                        </form>
                    )}
                </div>

                {/* Back Link */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;