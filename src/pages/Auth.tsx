import { Auth } from "@/components/ui/auth-form";
import { Layout } from "@/components/layout/Layout";

const AuthPage = () => {
  return (
    <Layout>
      <div className="w-full flex justify-center items-center min-h-[calc(100vh-200px)] py-12 px-4">
        <Auth />
      </div>
    </Layout>
  );
};

export default AuthPage;
