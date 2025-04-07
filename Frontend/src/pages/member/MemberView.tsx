import Navbar from "../../components/layout/Navbar";
import SponsorDescription from "../../components/sponsor/SponsorDescription";
import SponsorOption from "../../components/sponsor/SponsorOption";
import { useState } from "react";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/auth/authProvider";
import { useEffect } from "react";
import { supabase } from "../../context/auth/supabaseClient";
import MemberDescription from "../../components/member/MemberDescription";
const MemberView = () => {
    const session = useAuth();
    const email = session.session.user.email
    const navLinks = [
           
            { name: "Events", href: "/" },
          ];
    
        const [sponsorProfileUrl] = useState("https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg");
        const [sponsorName] = useState("Google");
        const [sponsorObjective] = useState("We are looking for vibe coders.");
        const [sponsorDescription] = useState("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec blandit dapibus dolor, id malesuada sapien lacinia non. Aliquam eget mattis tellus. Praesent in elit et velit fringilla feugiat. Donec mauris velit, finibus quis quam vel, rhoncus eleifend odio. Integer a pharetra sem. Duis aliquam felis nec nulla porttitor luctus. Phasellus sed euismod enim, sit amet dignissim nibh. Nulla tempor, felis non consequat imperdiet, nunc metus interdum odio, eget placerat ipsum velit a tortor. Nulla imperdiet mi eu condimentum pharetra. Fusce quam libero, pharetra nec enim nec, ultrices scelerisque est.");
        const [userDetails, setUserDetails] = useState<{user_id?: string, bio?:string, internship?:string,first_name?: string, last_name?:string, year?: string, major?:string}>({});
        useEffect(() => {
            const fetchMembers = async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                  // Fetch user role
                  const token = session.access_token;
                  fetch("https://asubap-backend.vercel.app/member-info/", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        user_email: session.user.email
                    }),
                  }).then((response) => response.json())
                    .then((data) => {
                       
                        setUserDetails(data[0]);
                        console.log(data[0]);
                        
                    })
                    .catch((error) => console.error("Error fetching role:", error));
                }
            };
    
           
        
            fetchMembers();
        
           
            
        }, []);
     
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar
                    isLogged={true}
                    links={navLinks}
                    title="Beta Alpha Psi | Beta Tau Chapter"
                    backgroundColor="#FFFFFF"
                    outlineColor="#AF272F"
                />
            {/* <div className="flex w-full flex-col items-stretch max-md:max-w-full"> */}
      {/* Header Section (formerly ProfileHeader) */}
      {/* <header className="w-full">
        <img
          src={sponsorProfileUrl}
          alt="Profile header"
          className="aspect-[14.93] object-contain w-full"
        />
        <div className="w-[607px] max-w-full mt-[39px]">
          <div className="gap-5 flex max-md:flex-col max-md:items-stretch">
            <div className="w-[30%] max-md:w-full max-md:ml-0">
              <div className="bg-[rgba(217,217,217,1)] flex w-[167px] shrink-0 h-[167px] mx-auto rounded-[50%] max-md:mt-10" />
            </div>
            <div className="w-[70%] ml-5 max-md:w-full max-md:ml-0">
              <div className="self-stretch text-black my-auto max-md:mt-10">
                <h1 className="text-5xl font-bold max-md:text-[40px] max-md:mr-1">
                  {userDetails.first_name}
                </h1>
                <div className="text-2xl font-normal mt-[5px]">
                  {userDetails.major}
                  <br />
                  {email}
                  <br />
                  {402-434-2232}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header> */}

      {/* Details Section (formerly ProfileDetails) */}
      {/* <section className="mt-7">
        <div className="flex items-stretch gap-[37px] text-2xl text-black font-normal flex-wrap max-md:mr-1.5">
          <div className="grow">
            <span className="font-bold">Graduating: </span>
            {userDetails.year}
          </div>
          <div className="grow shrink w-[298px]">
            <span className="font-bold">Status: </span>
            {'Not-Grad'}
          </div>
          <div className="grow shrink w-[89px]">
            <span className="font-bold">Hours: </span>
            {'# hours'}
          </div>
        </div>

        <div className="text-black text-2xl mt-[21px] max-md:max-w-full">
          <h2 className="font-bold">About</h2>
          <p className="font-normal">{userDetails.bio}</p>
        </div>

        <button
          
          className="bg-[rgba(175,39,47,1)] text-2xl text-white font-normal mt-[90px] px-9 py-[15px] rounded-[15px] max-md:mt-10 max-md:px-5 hover:bg-[rgba(155,29,37,1)] transition-colors"
        >
          Edit Profile
        </button>
      </section>
    </div> */}
 
            {/* Add padding-top to account for fixed navbar */}
            <div className="flex flex-col pt-[72px] flex-grow">
                <main className="flex-grow flex flex-col items-center justify-center">
                    <div className="py-24 px-16 md:px-32 flex-grow flex flex-col md:grid md:grid-cols-2 items-center gap-24">
                        <div className="flex flex-col items-center justify-center h-full gap-8">
                            <div className="w-full">   
                                <h1 className="text-4xl font-bold font-arial">
                                    Welcome back, <span className="text-bapred">{email}</span>!
                                </h1>
                            </div>
                            <MemberDescription
                                profileUrl={sponsorProfileUrl} 
                                name={userDetails.first_name ?? ""} 
                                major= {userDetails.major ?? ""}
                                email={email}
                                phone={"402-432-2232"}
                                status={"Not-Grad"}
                                hours={"# hours"}
                                year={userDetails.year ?? ""}
                                internship={userDetails.internship ?? ""}
                                description={userDetails.bio ?? ""} 
                            />
                        </div>
                        {/* Add another column with h-full to balance grid */}
                        
                    </div>
                </main>
            </div>
             
            <Footer backgroundColor="#AF272F" />
        </div>
    )
}

export default MemberView;