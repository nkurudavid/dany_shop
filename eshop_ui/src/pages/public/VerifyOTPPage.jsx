import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const VerifyOTPPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyActivationOTP, resendActivationOTP } = useAuth();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(60);

    const email = location.state?.email || '';

    useEffect(() => {
        if (!email) {
            navigate('/signup');
        }
    }, [email, navigate]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (index, value) => {
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

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        if (!/^\d{6}$/.test(pastedData)) {
            setError('Please paste a valid 6-digit OTP');
            return;
        }

        const newOtp = pastedData.split('');
        setOtp(newOtp);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        try {
            setLoading(true);
            await verifyActivationOTP(email, otpString);
            setSuccess('Account verified successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setSuccess('');

        try {
            setResending(true);
            await resendActivationOTP(email);
            setSuccess('OTP has been resent to your email');
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setResending(false);
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
                    <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
                    <p className="mt-2 text-gray-600">
                        We've sent a 6-digit code to
                    </p>
                    <p className="font-semibold text-gray-900">{email}</p>
                </div>

                {/* Verification Form */}
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* OTP Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                                Enter Verification Code
                            </label>
                            <div className="flex justify-center gap-2" onPaste={handlePaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                                        required
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={loading || otp.some(d => !d)}
                            variant="primary"
                            size="lg"
                            fullWidth
                        >
                            Verify Account
                        </Button>
                    </form>

                    {/* Resend OTP */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 mb-2">
                            Didn't receive the code?
                        </p>
                        {countdown > 0 ? (
                            <p className="text-sm text-gray-500">
                                Resend code in {countdown} seconds
                            </p>
                        ) : (
                            <Button
                                onClick={handleResend}
                                loading={resending}
                                disabled={resending}
                                variant="ghost"
                            >
                                Resend Code
                            </Button>
                        )}
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-start">
                            <Mail className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="ml-3">
                                <p className="text-sm text-blue-800">
                                    Check your spam folder if you don't see the email in your inbox.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/signup')}
                        className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                        ← Back to Signup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTPPage;