import { useState } from "react";
import Footer from "../../components/layout/Footer";
import Navbar from "../../components/layout/Navbar";
import { supabase } from "../../context/auth/supabaseClient";

const CreateEvent = () => {
    const navLinks = [
        { name: "Event", href: "#" },
      ];

    const [eventTitle, setEventTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [sponsors, setSponsors] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [emailMembers, setEmailMembers] = useState(false);

    const handleCreateEvent = async () => {
        // make sure all fields are filled
        if (!eventTitle || !description || !location || !date || !time) {
            return;
        }

        // POST /events/add-event
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const token = session.access_token;
            fetch("https://asubap-backend.vercel.app/events/add-event", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_email: session.user.email,
                    name: eventTitle,
                    date: date,
                    location: location,
                    description: description,
                    time: time
                })
            }).then((response) => response.json())
            .then((data) => {
                console.log(data);
                window.location.href = "/admin";
            })
            .catch((error) => console.error("Error fetching events:", error));
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar
                links={navLinks}
                isLogged={true}
                title="Beta Alpha Psi | Beta Tau Chapter"
                backgroundColor="#FFFFFF"
                outlineColor="#AF272F"
            />            

            {/* Add padding-top to account for fixed navbar */}
            <div className="flex flex-col flex-grow pt-24">
                <main className="flex-grow flex flex-col items-center justify-center h-full w-full my-12">
                    <div className="flex justify-center items-center w-full h-full">
                        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-300">
                            <h2 className="text-xl font-semibold text-bapred mb-4">Creating New Event</h2>
                            <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Enter Event Title..."
                                value={eventTitle}
                                onChange={(e) => setEventTitle(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred"
                            />
                            </div>
                            <div className="mb-4">
                            <textarea
                                placeholder="Enter description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred"
                            />
                            </div>
                            <div className="mb-4 grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Enter location..."
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred"
                            />
                            <input
                                type="text"
                                placeholder="Add Sponsors Attending..."
                                value={sponsors}
                                onChange={(e) => setSponsors(e.target.value)}
                                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred"
                            />
                            </div>
                            <div className="mb-4 grid grid-cols-2 gap-4">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred"
                            />
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred"
                            />
                            </div>
                            <div className="mb-4 flex">
                                <div className="flex ml-auto">
                                    <input
                                        type="checkbox"
                                        checked={emailMembers}
                                        onChange={() => setEmailMembers(!emailMembers)}
                                        className="mr-2"
                                    />
                                    <label>Email event to members?</label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                            <button
                                onClick={() => window.location.href = "/admin"}
                                className="px-4 py-2 border border-bapred text-bapred text-sm rounded-md hover:bg-gray-100 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleCreateEvent}
                                className="px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors"
                            >
                                Create New Event
                            </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <Footer backgroundColor="#AF272F" />
        </div>
    )
}

export default CreateEvent;
