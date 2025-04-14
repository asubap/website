import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Event } from '../../types';
import { supabase } from '../../context/auth/supabaseClient';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const ViewEvent = () => {
    const { eventId } = useParams<{ eventId: string }>(); // Get eventId from URL
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRoleMenu, setShowRoleMenu] = useState(false);
    const [role] = useState<string[]>([]);

    const navLinks = [
        { name: "Event", href: "#" },
      ];

    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                // Replace with your API endpoint
                const { data: session } = await supabase.auth.getSession();
                if (session) {
                    const token = session?.session?.access_token;
                    fetch("https://asubap-backend.vercel.app/events", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ event_id: eventId }),
                    })
                    .then((response) => response.json())
                    .then((data) => {
                        setEvent(data[0]);
                        console.log(data[0])
                    })
                    .catch((error) => console.error("Error fetching event:", error))
                    .finally(() => setLoading(false));
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching event:', error);
            } finally {
                setLoading(false);
            };
        };

        fetchEvent();
    }, [eventId]); // Re-run if eventId changes

    const handleRoleClick = (selectedRole: string) => { 
        setShowRoleMenu(false);
        if (selectedRole === "e-board") {
          navigate("/admin");
        }
        else if (selectedRole === "sponsor") {
          navigate("/sponsor");
        }
        else if (selectedRole === "general-member") {
          navigate("/");
        }
      };

    if (loading) return <div>Loading...</div>;
    if (!event) return <div>Event not found</div>;

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar
                links={navLinks}
                isLogged={true}
                title="Beta Alpha Psi | Beta Tau Chapter"
                backgroundColor="#FFFFFF"
                outlineColor="#AF272F"
            />

            {/* Role selection dropdown */}
            {showRoleMenu && (
                <div className="fixed top-24 right-4 bg-white shadow-lg rounded-md border border-gray-200 z-50 p-4">
                    <h3 className="text-lg font-semibold mb-2">Select Role</h3>
                    <div className="flex flex-col gap-2">
                        {role ? role.map((item: string, i: number) => (
                            <button 
                                key={i}
                                className="px-4 py-2 bg-bapred text-white rounded hover:bg-bapreddark transition-colors"
                                onClick={() => handleRoleClick(item)}
                            >
                                {item}
                            </button>
                        )) : <p>No roles available</p>}
                    </div>
                </div>
            )}

            {/* Add padding-top to account for fixed navbar */}
            <div className="flex flex-col flex-grow pt-24">
                <main className="flex-grow flex flex-col items-center justify-center h-full w-full">
                    <div className="border border-bapgray rounded-md p-4 mx-4   ">
                        <div className="flex flex-row justify-between">
                            <h1 className="text-2xl font-bold">{event.event_name}</h1>
                            <div className="flex flex-row gap-2">
                                <p className="text-sm">{event.event_location}</p>
                                <p className="text-sm">{event.event_date}</p>
                                <p className="text-sm">{event.event_time}</p>
                            </div>
                        </div>
                        <p className="text-sm">Description: {event.event_description}</p>
                        <p className="text-sm">{event.sponsors_attending}</p>
                        <p className="text-sm">{event.event_attending}</p>
                        <p className="text-sm">{event.event_rsvped}</p>
                    </div>
                </main>
            </div>

            <Footer backgroundColor="#AF272F" />
        </div> 
    );
};

export default ViewEvent;
