import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { LoginForm } from "@features/auth/components";
import { AuthLayout } from "@features/auth/layouts";
import { login } from "@features/auth/services";
import { useAuthStore } from "@features/auth/store";
import { PATHS } from "@routes/paths";
import { ApiError } from "@services/api-error";
import { notifyError, notifySuccess } from "@services/notify";
import { useSessionStore } from "@services/session";
import type { LoginFormData } from "@shared/validation/schemas/authSchemas";

const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

interface LocationState {
  from?: { pathname?: string };
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAccessToken = useSessionStore((state) => state.setAccessToken);
  const { setUser, lockedUntil, loginErrorMessage, setLockout, setLoginErrorMessage } =
    useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLocked = Boolean(lockedUntil && lockedUntil > Date.now());

  const handleSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const response = await login(data);
      setAccessToken(response.accessToken);
      setUser(response.user);

      notifySuccess("Sesión iniciada correctamente");

      const state = location.state as LocationState | null;
      const redirectTo = state?.from?.pathname ?? PATHS.home;
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 423) {
        setLockout(Date.now() + LOCKOUT_DURATION_MS, error.message);
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        setLoginErrorMessage(error.message);
        return;
      }

      notifyError(error, { title: "No se pudo iniciar sesión" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="La experiencia es todo"
      heading="Tu próxima función te está esperando."
      description="Entradas, membresía y beneficios exclusivos, todo en un solo lugar."
      stats={[
        { value: "12+", label: "Salas" },
        { value: "80+", label: "Funciones" },
        { value: "2x1", label: "Miércoles" },
      ]}
      // Imagen desde `public/images` (coloca tu archivo en `public/images/tu-imagen.png`)
      rightImageSrc="/images/tu-imagen.png"
      formEyebrow="Bienvenido de vuelta"
      formTitle="Inicia sesión"
      formSubtitle="Accede a tus entradas, membresía y beneficios."
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link to={PATHS.auth.register} className="font-medium text-primary scrollbar-color">
            Crear cuenta
          </Link>
        </>
      }
    >
      <LoginForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isLocked={isLocked}
        feedbackMessage={loginErrorMessage}
      />
    </AuthLayout>
  );
};
