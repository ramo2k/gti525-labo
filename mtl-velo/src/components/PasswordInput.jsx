import React, { useState } from 'react';

const PasswordInput = ({ value, onChange, placeholder = "********", className = "", required = true, isError = false, isSuccess = false }) => {
    const [showPassword, setShowPassword] = useState(false);

    let borderClass = 'border-slate-300 focus:border-mtl-primaire';
    if (isError) borderClass = 'border-red-500 focus:ring-red-500';
    if (isSuccess) borderClass = 'border-green-500 focus:ring-green-500';

    return (
        <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                required={required}
                value={value}
                onChange={onChange}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-1 pr-10 ${borderClass} ${className}`}
                placeholder={placeholder}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-mtl-primaire focus:outline-none"
            >
                {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
                        <circle cx="12" cy="12" r="3"/>
                        <line x1="20" y1="4" x2="4" y2="20" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                )}
            </button>
        </div>
    );
};

export default PasswordInput;
