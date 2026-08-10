import { useState } from "react"
import { Link } from "react-router-dom"
import login from "../login/login.png"

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [emailSent, setEmailSent] = useState<boolean>(false)

    const handleSubmit = async (event: any) => {
        event.preventDefault()
        setIsSubmitting(true)

        try {
            // Aquí luego conectamos authService.forgotPassword(email)
            console.log({ email })
            await new Promise((resolve) => setTimeout(resolve, 1500)) // simulación temporal, bórrala cuando conectes el servicio real
            setEmailSent(true)
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
                        alt="Forgot password banner"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Columna derecha: formulario */}
                <div className="w-full md:w-1/2 bg-surface flex items-center justify-center p-10">
                    <div className="flex flex-col gap-6 w-full max-w-md">

                        <div className="text-center">
                            <h1 className="text-text-primary font-bold text-3xl mb-2">
                                Forgot your password?
                            </h1>
                            <p className="text-text-secondary text-sm">
                                Enter your email and we'll send you a link to reset it.
                            </p>
                        </div>

                        {emailSent ? (
                            <div className="bg-success/10 border border-success text-success text-sm rounded p-4 text-center">
                                If an account exists for <span className="font-semibold">{email}</span>, you'll receive an email with instructions shortly.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                <div className="flex flex-col gap-1">
                                    <label className="text-text-primary text-sm">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isSubmitting}
                                        required
                                        className="w-full bg-surface-variant text-text-primary h-12 px-4 rounded border border-border placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-primary hover:bg-primary-hover text-text-primary font-bold h-12 rounded transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
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
                                            Sending...
                                        </>
                                    ) : (
                                        "Send reset link"
                                    )}
                                </button>
                            </form>
                        )}

                        <p className="text-text-secondary text-sm text-center">
                            Remembered your password?{" "}
                            <Link to="/login" className="text-accent font-semibold cursor-pointer hover:underline">
                                Back to login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}