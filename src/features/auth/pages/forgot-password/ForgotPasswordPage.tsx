import { Link } from "react-router";
import Input from "@shared/components/primitives/Input";
import Button from "@shared/components/primitives/Button";
import { AuthLayout } from "@features/auth/layouts";
import { PATHS } from "@routes/paths";
import { useState } from "react";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    // Aquí podrías llamar a la API para enviar el enlace.
    setTimeout(() => setBusy(false), 800);
  };

  return (
    <AuthLayout
      eyebrow="Recuperar acceso"
      heading="¿Olvidaste tu contraseña?"
      description="Ingresa tu correo y te enviaremos un enlace para restablecerla."
      formEyebrow="Recuperar acceso"
      formTitle="¿Olvidaste tu contraseña?"
      formSubtitle="Ingresa tu correo y te enviaremos un enlace para restablecerla."
      rightImageSrc="/login.png"
      footer={<Link to={PATHS.auth.login} className="text-sm text-primary hover:underline">◂ Volver a iniciar sesión</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Correo electrónico"
          name="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          required
        />

        <Button type="submit" className="w-full" state={busy ? "loading" : "default"}>
          Enviar enlace
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
