import { useEffect, useState } from "react";
import { supabase } from "../../context/auth/supabaseClient";
import { useAuth } from "../../context/auth/authProvider";

const SponsorAuth = () => {
    const { session } = useAuth();

    const [sponsors, setSponsors] = useState<string[]>([]);
    const {setSession, setRole} = useAuth();

    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                const response = await fetch("https://asubap-backend.vercel.app/sponsors/names", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
                const data = await response.json();
                const companyNames = data.map((item: { company_name: string }) => item.company_name);
                console.log(companyNames);
                setSponsors(companyNames);
            } catch (error) {
                console.error("Error fetching sponsors:", error);
            }
        };
        fetchSponsors();
    }, []);
    
    // Get base URL for redirect
    const baseUrl = import.meta.env.VITE_ENV_STATE === "development" 
        ? "http://localhost:5173" 
        : "https://frontend-iota-gules-58.vercel.app";
    
    // Redirect to saved path or default to auth home
    const getRedirectUrl = () => {
        const savedPath = localStorage.getItem('redirectAfterLogin');
        // If there's a saved path, use it and clear storage
        if (savedPath) {
            localStorage.removeItem('redirectAfterLogin');
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
        const sponsorElement = form.elements.namedItem('sponsor') as HTMLSelectElement;
        const passcodeElement = form.elements.namedItem('passcode') as HTMLInputElement;

        if (!sponsorElement || !passcodeElement) {
            console.error("Form elements not found");
            return;
        }

        const companyName = sponsorElement.value;
        const passcode = passcodeElement.value;

        console.log(companyName, passcode);

        // After backend says "auth success" and sends token
        const { data, error } = await supabase.auth.signInWithPassword({
            email: `${companyName.toLowerCase()}@example.com`,
            password: `${passcode}`,
        })

        console.log(data);

        if (error) {
        console.error("Error signing in:", error);
        return;
        }

        setSession(data.session);
        setRole("sponsor");

        console.log("Sign in successful");
        
    };

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-2xl font-outfit mb-4">Sponsors</h1>
            <form className="flex flex-col gap-2 items-center" onSubmit={handleSubmit}>
                <select 
                    name="sponsor" 
                    id="sponsor"
                    className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bapred"
                >
                    {sponsors.map((sponsor) => (
                        <option key={sponsor} value={sponsor}>{sponsor}</option>
                    ))}
                </select>
                <input
                    name="passcode"
                    id="passcode"
                    type="password"
                    placeholder="Enter passcode"
                    className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bapred"
                />
                <button 
                    type="submit"
                    className="px-4 py-2 bg-bapred text-white rounded-md hover:bg-bapreddark transition-colors"
                >
                    Login
                </button>
            </form>
        </div>
    )
}

export default SponsorAuth;
