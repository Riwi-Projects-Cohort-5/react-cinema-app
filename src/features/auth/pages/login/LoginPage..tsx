import { useState } from "react"
import { Link } from "react-router-dom"
import login from "./login.png"

export const LoginPage = () => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const showUnverifiedMessage = false
    const showBlockedMessage = false

    const handleSubmit = async (event: any) => {
        event.preventDefault()
        setIsSubmitting(true)

        try {
            // Aquí luego conectamos authService.login(...)
            console.log({ email, password })
            await new Promise((resolve) => setTimeout(resolve, 1500)) // simulación temporal, bórrala cuando conectes el servicio real
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="flex w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 border border-border">

                {/* Columna izquierda: imagen */}
                <div className="hidden md:block w-1/2 relative">
                    <img
                        src={login}
                        alt="Login banner"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Columna derecha: formulario */}
                <div className="w-full md:w-1/2 bg-surface flex items-center justify-center p-10">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-transparent flex flex-col gap-6 w-full max-w-md">

                        <h1 className="text-text-primary font-bold text-3xl mb-2 text-center">Sign in</h1>

                        {showUnverifiedMessage && (
                            <div className="bg-warning/10 border border-warning text-warning text-sm rounded p-3">
                                Your account has not been verified yet. Check your email to activate it.
                            </div>
                        )}

                        {showBlockedMessage && (
                            <div className="bg-error/10 border border-error text-error text-sm rounded p-3">
                                Your account is temporarily blocked due to too many failed attempts.
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            <label className="text-text-primary text-sm">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full bg-surface-variant text-text-primary h-12 px-4 rounded border border-border placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-text-primary text-sm">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    className="w-full bg-surface-variant text-text-primary h-12 px-4 pr-10 rounded border border-border placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isSubmitting}
                                    className="absolute right-3 top-3.5 text-text-secondary hover:text-text-primary disabled:opacity-60">
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="text-right -mt-4">
                            <Link to="/forgot-password" className="text-accent text-sm cursor-pointer hover:underline">
                                Forgot my password
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary-hover text-text-primary font-bold h-12 rounded mt-2 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {isSubmitting ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 text-text-primary"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>

                        <p className="text-text-secondary text-sm">
                            Don't have an account? <span className="text-accent font-semibold cursor-pointer hover:underline">Sign up</span>
                        </p>

                        <label className="flex items-center gap-2 text-text-secondary text-sm mt-2">
                            <input type="checkbox" className="accent-primary" disabled={isSubmitting} />
                            Remember me
                        </label>
                    </form>
                </div>
            </div>
        </div>
    )
}