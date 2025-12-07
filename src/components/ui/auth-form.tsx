"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/i18n";

// --------------------------------
// Types and Enums
// --------------------------------

enum AuthView {
  SIGN_IN = "sign-in",
  SIGN_UP = "sign-up",
  FORGOT_PASSWORD = "forgot-password",
  RESET_SUCCESS = "reset-success",
}

interface AuthState {
  view: AuthView;
}

interface FormState {
  isLoading: boolean;
  error: string | null;
  showPassword: boolean;
}

// --------------------------------
// Main Auth Component
// --------------------------------

function Auth({ className, ...props }: React.ComponentProps<"div">) {
  const [state, setState] = React.useState<AuthState>({ view: AuthView.SIGN_IN });

  const setView = React.useCallback((view: AuthView) => {
    setState((prev) => ({ ...prev, view }));
  }, []);

  return (
    <div
      data-slot="auth"
      className={cn("mx-auto w-full max-w-md", className)}
      {...props}
    >
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/80 shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-sage/5" />
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {state.view === AuthView.SIGN_IN && (
              <AuthSignIn
                key="sign-in"
                onForgotPassword={() => setView(AuthView.FORGOT_PASSWORD)}
                onSignUp={() => setView(AuthView.SIGN_UP)}
              />
            )}
            {state.view === AuthView.SIGN_UP && (
              <AuthSignUp
                key="sign-up"
                onSignIn={() => setView(AuthView.SIGN_IN)}
              />
            )}
            {state.view === AuthView.FORGOT_PASSWORD && (
              <AuthForgotPassword
                key="forgot-password"
                onSignIn={() => setView(AuthView.SIGN_IN)}
                onSuccess={() => setView(AuthView.RESET_SUCCESS)}
              />
            )}
            {state.view === AuthView.RESET_SUCCESS && (
              <AuthResetSuccess
                key="reset-success"
                onSignIn={() => setView(AuthView.SIGN_IN)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --------------------------------
// Shared Components
// --------------------------------

interface AuthFormProps {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
  className?: string;
}

function AuthForm({ onSubmit, children, className }: AuthFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      data-slot="auth-form"
      className={cn("space-y-6", className)}
    >
      {children}
    </form>
  );
}

interface AuthErrorProps {
  message: string | null;
}

function AuthError({ message }: AuthErrorProps) {
  if (!message) return null;
  return (
    <div
      data-slot="auth-error"
      className="mb-6 animate-in rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
    >
      {message}
    </div>
  );
}

interface AuthSocialButtonsProps {
  isLoading: boolean;
}

function AuthSocialButtons({ isLoading }: AuthSocialButtonsProps) {
  return (
    <div data-slot="auth-social-buttons" className="w-full mt-6">
      <Button
        variant="outline"
        className="w-full h-12 bg-background/50 border-border/50"
        disabled={isLoading}
        type="button"
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
          <path d="M1 1h22v22H1z" fill="none" />
        </svg>
        Google
      </Button>
    </div>
  );
}

interface AuthSeparatorProps {
  text?: string;
}

function AuthSeparator({ text }: AuthSeparatorProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const displayText = text || t.auth.orContinueWith;
  
  return (
    <div data-slot="auth-separator" className="relative mt-6">
      <div className="absolute inset-0 flex items-center">
        <Separator />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">{displayText}</span>
      </div>
    </div>
  );
}

// --------------------------------
// Sign In Component
// --------------------------------

interface AuthSignInProps {
  onForgotPassword: () => void;
  onSignUp: () => void;
}

function AuthSignIn({ onForgotPassword, onSignUp }: AuthSignInProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const signInSchema = z.object({
    email: z.string().email(t.auth.errors.invalidEmail),
    password: z.string().min(8, t.auth.errors.passwordMin),
  });
  
  type SignInFormValues = z.infer<typeof signInSchema>;
  
  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInFormValues) => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        const errorKey = result.error as keyof typeof t.auth.errors;
        setFormState((prev) => ({ 
          ...prev, 
          error: t.auth.errors[errorKey] || t.auth.errors.unexpectedError 
        }));
      }
    } catch {
      setFormState((prev) => ({ ...prev, error: t.auth.errors.unexpectedError }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <motion.div
      data-slot="auth-sign-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-8"
    >
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold text-foreground">{t.auth.welcomeBack}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.auth.signInToAccount}</p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={formState.isLoading}
            className={cn(errors.email && "border-destructive")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs"
              onClick={onForgotPassword}
              disabled={formState.isLoading}
            >
              {t.auth.forgotPassword}
            </Button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={formState.showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={formState.isLoading}
              className={cn(errors.password && "border-destructive")}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() =>
                setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
              }
              disabled={formState.isLoading}
            >
              {formState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.auth.signingIn}
            </>
          ) : (
            t.auth.signIn
          )}
        </Button>
      </AuthForm>

      <AuthSeparator />
      <AuthSocialButtons isLoading={formState.isLoading} />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t.auth.noAccount}{" "}
        <Button
          variant="link"
          className="h-auto p-0 text-sm"
          onClick={onSignUp}
          disabled={formState.isLoading}
        >
          {t.auth.createOne}
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Sign Up Component
// --------------------------------

interface AuthSignUpProps {
  onSignIn: () => void;
}

function AuthSignUp({ onSignIn }: AuthSignUpProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const signUpSchema = z.object({
    firstName: z.string().min(2, t.auth.errors.firstNameMin),
    lastName: z.string().min(2, t.auth.errors.lastNameMin),
    email: z.string().email(t.auth.errors.invalidEmail),
    phone: z.string().min(10, t.auth.errors.phoneRequired),
    password: z.string().min(8, t.auth.errors.passwordMin),
    terms: z.literal(true, { errorMap: () => ({ message: t.auth.errors.agreeTerms }) }),
  });
  
  type SignUpFormValues = z.infer<typeof signUpSchema>;
  
  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", terms: undefined as unknown as true },
  });

  const terms = watch("terms");

  const onSubmit = async (data: SignUpFormValues) => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        const errorKey = result.error as keyof typeof t.auth.errors;
        setFormState((prev) => ({ 
          ...prev, 
          error: t.auth.errors[errorKey] || t.auth.errors.unexpectedError 
        }));
      }
    } catch {
      setFormState((prev) => ({ ...prev, error: t.auth.errors.unexpectedError }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <motion.div
      data-slot="auth-sign-up"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-8"
    >
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold text-foreground">{t.auth.createAccount}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.auth.getStarted}</p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t.auth.firstName}</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              disabled={formState.isLoading}
              className={cn(errors.firstName && "border-destructive")}
              {...register("firstName")}
            />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t.auth.lastName}</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              disabled={formState.isLoading}
              className={cn(errors.lastName && "border-destructive")}
              {...register("lastName")}
            />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={formState.isLoading}
            className={cn(errors.email && "border-destructive")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t.auth.phone}</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+994 XX XXX XX XX"
            disabled={formState.isLoading}
            className={cn(errors.phone && "border-destructive")}
            {...register("phone")}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t.auth.password}</Label>
          <div className="relative">
            <Input
              id="password"
              type={formState.showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={formState.isLoading}
              className={cn(errors.password && "border-destructive")}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() =>
                setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
              }
              disabled={formState.isLoading}
            >
              {formState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={terms === true}
            onCheckedChange={(checked) => setValue("terms", checked === true ? true : undefined as unknown as true)}
            disabled={formState.isLoading}
          />
          <div className="space-y-1">
            <Label htmlFor="terms" className="text-sm leading-normal">
              {t.auth.agreeToTerms}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t.auth.bySigningUp}{" "}
              <Button variant="link" className="h-auto p-0 text-xs">
                {t.auth.termsLink}
              </Button>{" "}
              &{" "}
              <Button variant="link" className="h-auto p-0 text-xs">
                {t.auth.privacyLink}
              </Button>
              .
            </p>
          </div>
        </div>
        {errors.terms && <p className="text-xs text-destructive">{errors.terms.message}</p>}

        <Button type="submit" className="w-full" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.auth.creatingAccount}
            </>
          ) : (
            t.auth.createAccount
          )}
        </Button>
      </AuthForm>

      <AuthSeparator />
      <AuthSocialButtons isLoading={formState.isLoading} />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t.auth.haveAccount}{" "}
        <Button
          variant="link"
          className="h-auto p-0 text-sm"
          onClick={onSignIn}
          disabled={formState.isLoading}
        >
          {t.auth.signIn}
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Forgot Password Component
// --------------------------------

interface AuthForgotPasswordProps {
  onSignIn: () => void;
  onSuccess: () => void;
}

function AuthForgotPassword({ onSignIn, onSuccess }: AuthForgotPasswordProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  
  const forgotPasswordSchema = z.object({
    email: z.string().email(t.auth.errors.invalidEmail),
  });
  
  type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
  
  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      onSuccess();
    } catch {
      setFormState((prev) => ({ ...prev, error: t.auth.errors.unexpectedError }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <motion.div
      data-slot="auth-forgot-password"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-8"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-4"
        onClick={onSignIn}
        disabled={formState.isLoading}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Back</span>
      </Button>

      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold text-foreground">{t.auth.resetPassword}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.auth.enterEmailForReset}
        </p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={formState.isLoading}
            className={cn(errors.email && "border-destructive")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.auth.sending}
            </>
          ) : (
            t.auth.sendResetLink
          )}
        </Button>
      </AuthForm>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t.auth.rememberPassword}{" "}
        <Button
          variant="link"
          className="h-auto p-0 text-sm"
          onClick={onSignIn}
          disabled={formState.isLoading}
        >
          {t.auth.signIn}
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Reset Success Component
// --------------------------------

interface AuthResetSuccessProps {
  onSignIn: () => void;
}

function AuthResetSuccess({ onSignIn }: AuthResetSuccessProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  
  return (
    <motion.div
      data-slot="auth-reset-success"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col items-center p-8 text-center"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <MailCheck className="h-8 w-8 text-primary" />
      </div>

      <h1 className="font-display text-2xl font-semibold text-foreground">{t.auth.checkEmail}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t.auth.resetLinkSent}
      </p>

      <Button
        variant="outline"
        className="mt-6 w-full max-w-xs"
        onClick={onSignIn}
      >
        {t.auth.backToSignIn}
      </Button>

      <p className="mt-6 text-xs text-muted-foreground">
        {t.auth.noEmail}{" "}
        <Button variant="link" className="h-auto p-0 text-xs">
          {t.auth.tryAnotherEmail}
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Exports
// --------------------------------

export {
  Auth,
  AuthSignIn,
  AuthSignUp,
  AuthForgotPassword,
  AuthResetSuccess,
  AuthForm,
  AuthError,
  AuthSocialButtons,
  AuthSeparator,
};
