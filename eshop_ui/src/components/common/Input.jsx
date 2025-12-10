import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  type = 'text',
  placeholder,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = true,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const baseInputStyles = 'px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed';

  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300';

  const widthClass = fullWidth ? 'w-full' : '';

  const iconPaddingLeft = Icon && iconPosition === 'left' ? 'pl-10' : '';
  const iconPaddingRight = Icon && iconPosition === 'right' ? 'pr-10' : '';

  return (
    <div className={`${widthClass} ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}

        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${baseInputStyles} ${errorStyles} ${widthClass} ${iconPaddingLeft} ${iconPaddingRight} ${className}`}
          {...props}
        />

        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;