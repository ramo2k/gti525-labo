import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';

function Auth() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const displayError = (msg) => {
        setError(msg);
        setTimeout(() => setError(null), 10000);
    };

    const displaySuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 10000);
    };

    // Vérification de la robustesse du mot de passe (Recommandations OWASP)
    const passwordCriteria = useMemo(() => {
        return {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };
    }, [password]);

    const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
    const isPasswordMatch = password && confirmPassword && password === confirmPassword;

    // Le bouton de soumission est désactivé si on est en mode inscription et que les critères ne sont pas remplis
    const isSubmitDisabled = loading || (!isLoginMode && (!isPasswordValid || !isPasswordMatch));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Double vérification au cas où
        if (!isLoginMode) {
            if (!isPasswordValid) {
                displayError("Le mot de passe ne respecte pas les critères de sécurité.");
                return;
            }
            if (password !== confirmPassword) {
                displayError("Les mots de passe ne correspondent pas.");
                return;
            }
        }

        setLoading(true);

        const endpoint = isLoginMode 
            ? '/gti525/v1/auth/connexion' 
            : '/gti525/v1/auth/inscription';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courriel: email, mot_de_passe: password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.erreur || 'Une erreur est survenue.');
            }

            if (isLoginMode) {
                // Succès de connexion
                login(data.jeton, data.utilisateur);
                navigate('/');
            } else {
                // Succès d'inscription, on bascule en mode connexion
                setIsLoginMode(true);
                setEmail(data.courriel || email);
                setPassword('');
                setConfirmPassword('');
                displaySuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
            }
        } catch (err) {
            displayError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError(null);
        setSuccessMessage(null);
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50 py-12">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-slate-200">
                <h2 className="text-2xl font-bold text-center text-mtl-primaire mb-6">
                    {isLoginMode ? 'Connexion' : 'Créer un compte'}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm text-center">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm text-center">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-mtl-texte mb-1">
                            Courriel
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded focus:outline-none focus:border-mtl-primaire"
                            placeholder="exemple@mtlvelo.ca"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-mtl-texte mb-1">
                            Mot de passe
                        </label>
                        <PasswordInput 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        
                        {/* Indicateurs de robustesse (visibles seulement en inscription) */}
                        {!isLoginMode && (
                            <div className="mt-2 text-xs space-y-1 bg-slate-50 p-3 rounded border border-slate-100">
                                <p className="font-semibold text-slate-600 mb-2">Le mot de passe doit contenir :</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${passwordCriteria.length ? "bg-green-500" : "bg-slate-300"}`}></div>
                                    <span className={passwordCriteria.length ? "text-green-700 font-medium" : "text-slate-500"}>Au moins 8 caractères</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${passwordCriteria.uppercase ? "bg-green-500" : "bg-slate-300"}`}></div>
                                    <span className={passwordCriteria.uppercase ? "text-green-700 font-medium" : "text-slate-500"}>Au moins une majuscule</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${passwordCriteria.number ? "bg-green-500" : "bg-slate-300"}`}></div>
                                    <span className={passwordCriteria.number ? "text-green-700 font-medium" : "text-slate-500"}>Au moins un chiffre</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${passwordCriteria.special ? "bg-green-500" : "bg-slate-300"}`}></div>
                                    <span className={passwordCriteria.special ? "text-green-700 font-medium" : "text-slate-500"}>Au moins un caractère spécial</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Champ de confirmation (visible seulement en inscription) */}
                    {!isLoginMode && (
                        <div>
                            <label className="block text-sm font-medium text-mtl-texte mb-1">
                                Confirmer le mot de passe
                            </label>
                            <PasswordInput 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                isSuccess={confirmPassword && isPasswordMatch}
                                isError={confirmPassword && !isPasswordMatch}
                            />
                            
                            {/* Indicateur de correspondance */}
                            {confirmPassword && (
                                <div className="flex items-center gap-2 mt-2 text-xs font-medium">
                                    <div className={`w-2 h-2 rounded-full ${isPasswordMatch ? "bg-green-500" : "bg-red-500"}`}></div>
                                    <span className={isPasswordMatch ? "text-green-700" : "text-red-500"}>
                                        {isPasswordMatch ? "Les mots de passe correspondent" : "Les mots de passe ne correspondent pas"}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className={`w-full py-2 px-4 rounded text-white font-medium mt-4 transition-colors ${
                            isSubmitDisabled 
                            ? 'bg-slate-300 cursor-not-allowed' 
                            : 'bg-mtl-primaire hover:bg-mtl-survol'
                        }`}
                    >
                        {loading ? 'Chargement...' : (isLoginMode ? 'Se connecter' : 'S\'inscrire')}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-mtl-texte">
                    {isLoginMode ? "Vous n'avez pas de compte ? " : "Vous avez déjà un compte ? "}
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="text-mtl-secondaire font-semibold hover:underline"
                    >
                        {isLoginMode ? "S'inscrire" : "Se connecter"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Auth;
