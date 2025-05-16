import { useEffect, useState } from "react";
import { supabase } from "../../context/auth/supabaseClient";
import { useAuth } from "../../context/auth/authProvider";
import { Eye, EyeOff } from "lucide-react";

const SponsorAuth = () => {
  const { session } = useAuth();

  const [sponsors, setSponsors] = useState<string[]>([]);
  const { setSession, setRole } = useAuth();
  const [showPasscode, setShowPasscode] = useState(false);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/sponsors/names`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        const companyNames = data.map(
          (item: { company_name: string }) => item.company_name
        );
        setSponsors(companyNames);
      } catch (error) {
        console.error("Error fetching sponsors:", error);
      }
    };
    fetchSponsors();
  }, []);

  // Get base URL for redirect
  const baseUrl =
    import.meta.env.VITE_ENV_STATE === "development"
      ? "http://localhost:5173"
      : "https://frontend-iota-gules-58.vercel.app";

  // Redirect to saved path or default to auth home
  const getRedirectUrl = () => {
    const savedPath = localStorage.getItem("redirectAfterLogin");
    // If there's a saved path, use it and clear storage
    if (savedPath) {
      localStorage.removeItem("redirectAfterLogin");
      return `${baseUrl}${savedPath}`;
    }
    // Otherwise default to auth home
    return `${baseUrl}/auth/Home`;
  };

  // If already logged in, redirect appropriately
  useEffect(() => {
    if (session) {
      window.location.href = getRedirectUrl();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const sponsorElement = form.elements.namedItem(
      "sponsor"
    ) as HTMLSelectElement;
    const passcodeElement = form.elements.namedItem(
      "passcode"
    ) as HTMLInputElement;

    if (!sponsorElement || !passcodeElement) {
      console.error("Form elements not found");
      return;
    }

    const companyName = sponsorElement.value;
    const passcode = passcodeElement.value;

    // After backend says "auth success" and sends token
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${companyName.toLowerCase()}@example.com`,
      password: `${passcode}`,
    });

    if (error) {
      console.error("Error signing in:", error);
      return;
    }

    setSession(data.session);
    setRole("sponsor");

    // Store in localStorage as well for persistence
    localStorage.setItem("sponsorName", companyName);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xs">
      <h1 className="text-2xl font-outfit mb-4">Sponsors</h1>
      <form
        className="flex flex-col gap-2 items-center w-full"
        onSubmit={handleSubmit}
      >
        <div className="relative w-full">
          <select
            name="sponsor"
            id="sponsor"
            defaultValue=""
            required
            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bapred appearance-none"
          >
            <option value="" disabled>
              Choose your sponsor...
            </option>
            {sponsors.map((sponsor) => (
              <option key={sponsor} value={sponsor}>
                {sponsor}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        <div className="relative w-full">
          <input
            name="passcode"
            id="passcode"
            type={showPasscode ? "text" : "password"}
            placeholder="Enter passcode"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bapred pr-10"
            autoComplete="new-password"
            inputMode="text"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
            onClick={() => setShowPasscode((v) => !v)}
            aria-label={showPasscode ? "Hide passcode" : "Show passcode"}
          >
            {showPasscode ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-bapred text-white rounded-md hover:bg-bapreddark transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default SponsorAuth;
