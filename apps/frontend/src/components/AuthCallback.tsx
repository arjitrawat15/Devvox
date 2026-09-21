import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";

export function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    const code = params.get("code");
    const provider = params.get("provider");

    if (token) {
      // Direct token from backend redirect
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      navigate("/dashboard", { replace: true });
      return;
    }

    if (code && provider) {
      // Exchange code via backend callback
      axios
        .get(`${BACKEND_URL}/api/v1/auth/${provider}/callback`, {
          params: { code },
        })
        .then(() => {
          // Backend redirects with token, handled above on next load
          navigate("/dashboard", { replace: true });
        })
        .catch(() => {
          navigate("/", { replace: true });
        });
      return;
    }

    navigate("/", { replace: true });
  }, [params, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="size-5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
        Signing you in...
      </div>
    </div>
  );
}
