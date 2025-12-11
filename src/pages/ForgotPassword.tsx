import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const schema = z.object({
    email: z.string().email(t.auth?.errors?.invalidEmail || 'Invalid email address'),
  });

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    // Simulate API call - backend will handle actual email sending
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <Layout>
      <div className="w-full flex justify-center items-center min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="mx-auto w-full max-w-md">
          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/80 shadow-xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-sage/5" />
            <div className="relative z-10 p-8">
              {!isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link to="/auth">
                    <Button variant="ghost" size="sm" className="mb-6 -ml-2 gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      {t.auth?.backToLogin || 'Back to Login'}
                    </Button>
                  </Link>

                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="font-display text-2xl font-semibold text-foreground">
                      {t.auth?.forgotPassword || 'Forgot Password'}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t.auth?.forgotPasswordDesc || 'Enter your email and we\'ll send you a reset link'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.auth?.email || 'Email'}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        disabled={isLoading}
                        className={cn(errors.email && "border-destructive")}
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.auth?.sending || 'Sending...'}
                        </>
                      ) : (
                        t.auth?.sendResetLink || 'Send Reset Link'
                      )}
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-4"
                >
                  <div className="mx-auto mb-6 w-20 h-20 bg-sage/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-sage-dark" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    {t.auth?.checkEmail || 'Check Your Email'}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {t.auth?.resetLinkSent || 'We\'ve sent a password reset link to your email address.'}
                  </p>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {t.auth?.didntReceive || 'Didn\'t receive the email?'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsSubmitted(false)}
                      className="w-full"
                    >
                      {t.auth?.tryAgain || 'Try Again'}
                    </Button>
                    <Link to="/auth" className="block">
                      <Button variant="ghost" className="w-full gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        {t.auth?.backToLogin || 'Back to Login'}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
