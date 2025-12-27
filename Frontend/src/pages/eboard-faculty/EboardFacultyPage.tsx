import React, { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/auth/authProvider";
import { getNavLinks } from "../../components/nav/NavLink";
import { useToast } from "../../context/toast/ToastContext";
import { EboardFacultyEntry } from "../../types";

type CacheData = {
  data: EboardFacultyEntry[];
  timestamp: number;
};

const CACHE_KEY = 'eboard_faculty_cache';
const CACHE_DURATION = 6000;

const EboardFacultyPage: React.FC = () => {
  const { role, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [eboardEntries, setEboardEntries] = useState<EboardFacultyEntry[]>([]);

  // Fetch e-board members from /eboard
  useEffect(() => {
    const fetchEboard = async () => {
      try {
        // Check cache first
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp }: CacheData = JSON.parse(cachedData);
          const currentTime = Date.now();
          
          // If cache is still valid (less than 1 minute old), use it
          if (currentTime - timestamp < CACHE_DURATION) {
            setEboardEntries(data);
            return;
          }
        }

        // If no cache or cache is expired, fetch from API
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/eboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setEboardEntries(data);
          
          // Update cache with new data
          const cacheData: CacheData = {
            data,
            timestamp: Date.now()
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } else {
          setEboardEntries([]);
        }
      } catch (err) {
        setEboardEntries([]);
      }
    };

    fetchEboard();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        links={getNavLinks(isAuthenticated)}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
        isLogged={isAuthenticated}
        role={role}
      />
      <main className="flex-grow">
        <section className="py-16 px-8 sm:px-16 lg:px-24 pt-32">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-outfit font-bold text-bapred text-center w-full mb-6">
              Executive Board & Faculty
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...eboardEntries]
                .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999))
                .map((entry, index) => (
                  <div
                    key={index}
                    className="bg-white shadow-xl rounded-lg p-6 flex flex-col items-center text-center"
                  >
                    {entry.profile_photo_url && (
                      <img
                        src={entry.profile_photo_url}
                        alt={`Photo of ${entry.name || entry.role}`}
                        className="w-32 h-32 rounded-full object-cover mb-4"
                      />
                    )}
                    <h2 className="text-xl font-semibold">{entry.name || "-"}</h2>
                    <p className="text-bapred font-medium">{entry.role}</p>
                    <p className="text-sm text-bapgray">{entry.major || ""}</p>
                    {entry.role_email && (
                      <button
                        type="button"
                        className="text-bapred hover:underline focus:outline-none text-sm mt-2"
                        title="Copy role email to clipboard"
                        onClick={() => {
                          navigator.clipboard.writeText(entry.role_email);
                          showToast("Role email copied to clipboard!", "success");
                        }}
                      >
                        {entry.role_email}
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </section>
      </main>
      <Footer backgroundColor="#AF272F" />
    </div>
  );
};

export default EboardFacultyPage;
