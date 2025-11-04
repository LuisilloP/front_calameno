import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { ComponentType, useEffect } from "react";

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace("/login");
      }
    }, [loading, user, router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
