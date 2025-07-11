import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/auth/authProvider";
import { useToast } from "../../context/toast/ToastContext";
import Modal from "../ui/Modal";

export default function WhoWeAre() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { role, session } = useAuth();
  const { showToast } = useToast();
  const [applyFormUrl, setApplyFormUrl] = useState("https://docs.google.com/forms/d/e/1FAIpQLSciA9BqK7uwVXsjTAId5EJIw-kIvseIxHPeoCo7oGNWy6t3Wg/closedform");
  const [showEditModal, setShowEditModal] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch Google Form URL from backend
    const fetchApplyFormUrl = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/links?link_name=forms`);
        if (response.ok) {
          const data = await response.json();
          setApplyFormUrl(data[0]?.link || "");
        }
      } catch (error) {
        console.error("Error fetching apply form URL:", error);
      }
    };

    fetchApplyFormUrl();
  }, []);

  useEffect(() => {
    // Load Instagram embed script
    const script = document.createElement("script");
    script.src = "//www.instagram.com/embed.js";
    script.async = true;

    // Add script to the document
    document.body.appendChild(script);

    // Initialize Instagram embeds if window.instgrm exists
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }

    return () => {
      // Clean up script on component unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleEditClick = () => {
    setNewUrl(applyFormUrl);
    setShowEditModal(true);
  };

  const handleSaveUrl = async () => {
    if (!session) return;
    setIsSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/links`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ link_name: 'forms', link: newUrl })
      });

      if (response.ok) {
        setApplyFormUrl(newUrl);
        showToast("Apply form URL updated successfully", "success");
        setShowEditModal(false);
      } else {
        throw new Error("Failed to update URL");
      }
    } catch (error) {
      console.error("Error updating apply form URL:", error);
      showToast("Failed to update apply form URL", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      id="who-we-are"
      className="pt-16 sm:pt-20 md:pt-24 pb-4 px-8 sm:px-16 lg:px-24"
    >
      {/* Text and Instagram Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
        {/* Who We Are Content - Mobile: First, Desktop: First */}
        <div className="order-1 md:order-1 mt-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#AF272F] mb-4 md:mb-6">
            Who We Are
          </h2>
          <p className="text-gray-800 mb-4 text-base sm:text-lg">
            Beta Alpha Psi is the premier international honor and service
            organization for accounting, finance, and information systems
            students and professionals. The primary objective of Beta Alpha Psi 
            is to encourage and give recognition to scholastic and professional excellence in the
            business information field. This includes promoting the study and
            practice of accounting, finance, economics, and information systems;
            providing opportunities for self-development, service, and
            association among members and practicing professionals, and
            encouraging a sense of ethical, social, and public responsibility.
          </p>

          {/* Apply Button */}
          <div className="mt-6 md:mt-8">
            <div className="relative inline-block">
              <a
                href={applyFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 sm:px-8 sm:py-4 text-lg sm:text-xl font-semibold text-white bg-[#AF272F] hover:bg-[#8F1F26] transition-colors duration-300 rounded-md shadow-lg"
              >
                Click Here To Apply!
              </a>
              {role === "e-board" && (
                <button
                  onClick={handleEditClick}
                  className="absolute -top-2 -right-2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  title="Edit Apply Form URL"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Instagram Embed - Mobile: Second, Desktop: Second */}
        <div
          className="flex justify-center md:justify-end order-2 md:order-2 mt-8 md:mt-0"
          ref={containerRef}
        >
          <div className="w-full max-w-[400px] md:max-w-[540px]">
            <blockquote
              className="instagram-media"
              data-instgrm-permalink="https://www.instagram.com/asubap/?utm_source=ig_embed&amp;utm_campaign=loading"
              data-instgrm-version="14"
              style={{
                background: "#FFF",
                border: "0",
                borderRadius: "3px",
                boxShadow:
                  "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
                margin: "1px",
                maxWidth: "540px",
                minWidth: "280px",
                padding: "0",
                width: "100%",
              }}
            >
              <div style={{ padding: "16px" }}>
                <a
                  href="https://www.instagram.com/asubap/?utm_source=ig_embed&amp;utm_campaign=loading"
                  style={{
                    background: "#FFFFFF",
                    lineHeight: "0",
                    padding: "0 0",
                    textAlign: "center",
                    textDecoration: "none",
                    width: "100%",
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#F4F4F4",
                        borderRadius: "50%",
                        flexGrow: 0,
                        height: "40px",
                        marginRight: "14px",
                        width: "40px",
                      }}
                    ></div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#F4F4F4",
                          borderRadius: "4px",
                          flexGrow: 0,
                          height: "14px",
                          marginBottom: "6px",
                          width: "100px",
                        }}
                      ></div>
                      <div
                        style={{
                          backgroundColor: "#F4F4F4",
                          borderRadius: "4px",
                          flexGrow: 0,
                          height: "14px",
                          width: "60px",
                        }}
                      ></div>
                    </div>
                  </div>
                  <div style={{ padding: "19% 0" }}></div>
                  <div
                    style={{
                      display: "block",
                      height: "50px",
                      margin: "0 auto 12px",
                      width: "50px",
                    }}
                  >
                    <svg
                      width="50px"
                      height="50px"
                      viewBox="0 0 60 60"
                      version="1.1"
                      xmlns="https://www.w3.org/2000/svg"
                      xmlnsXlink="https://www.w3.org/1999/xlink"
                    >
                      <g
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd"
                      >
                        <g
                          transform="translate(-511.000000, -20.000000)"
                          fill="#000000"
                        >
                          <g>
                            <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                          </g>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div style={{ paddingTop: "8px" }}>
                    <div
                      style={{
                        color: "#3897f0",
                        fontFamily: "outfit,sans-serif",
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: 550,
                        lineHeight: "18px",
                      }}
                    >
                      View this profile on Instagram
                    </div>
                  </div>
                  <div style={{ padding: "12.5% 0" }}></div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      marginBottom: "14px",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          backgroundColor: "#F4F4F4",
                          borderRadius: "50%",
                          height: "12.5px",
                          width: "12.5px",
                          transform: "translateX(0px) translateY(7px)",
                        }}
                      ></div>
                      <div
                        style={{
                          backgroundColor: "#F4F4F4",
                          height: "12.5px",
                          transform:
                            "rotate(-45deg) translateX(3px) translateY(1px)",
                          width: "12.5px",
                          flexGrow: 0,
                          marginRight: "14px",
                          marginLeft: "2px",
                        }}
                      ></div>
                      <div
                        style={{
                          backgroundColor: "#F4F4F4",
                          borderRadius: "50%",
                          height: "12.5px",
                          width: "12.5px",
                          transform: "translateX(9px) translateY(-18px)",
                        }}
                      ></div>
                    </div>
                    <div style={{ marginLeft: "8px" }}>
                      <div
                        style={{
                          backgroundColor: "#F4F4F4",
                          borderRadius: "50%",
                          flexGrow: 0,
                          height: "20px",
                          width: "20px",
                        }}
                      ></div>
                      <div
                        style={{
                          width: 0,
                          height: 0,
                          borderTop: "2px solid transparent",
                          borderLeft: "6px solid #f4f4f4",
                          borderBottom: "2px solid transparent",
                          transform:
                            "translateX(16px) translateY(-4px) rotate(30deg)",
                        }}
                      ></div>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      <div
                        style={{
                          width: 0,
                          borderTop: "8px solid #F4F4F4",
                          borderRight: "8px solid transparent",
                          transform: "translateY(16px)",
                        }}
                      ></div>
                      <div
                        style={{
                          backgroundColor: "#F4F4F4",
                          flexGrow: 0,
                          height: "12px",
                          width: "16px",
                          transform: "translateY(-4px)",
                        }}
                      ></div>
                      <div
                        style={{
                          width: 0,
                          height: 0,
                          borderTop: "8px solid #F4F4F4",
                          borderLeft: "8px solid transparent",
                          transform: "translateY(-4px) translateX(8px)",
                        }}
                      ></div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                      justifyContent: "center",
                      marginBottom: "24px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#F4F4F4",
                        borderRadius: "4px",
                        flexGrow: 0,
                        height: "14px",
                        marginBottom: "6px",
                        width: "224px",
                      }}
                    ></div>
                    <div
                      style={{
                        backgroundColor: "#F4F4F4",
                        borderRadius: "4px",
                        flexGrow: 0,
                        height: "14px",
                        width: "144px",
                      }}
                    ></div>
                  </div>
                </a>
                <p
                  style={{
                    color: "#c9c8cd",
                    fontFamily: "outfit,sans-serif",
                    fontSize: "14px",
                    lineHeight: "17px",
                    marginBottom: 0,
                    marginTop: "8px",
                    overflow: "hidden",
                    padding: "8px 0 7px",
                    textAlign: "center",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <a
                    href="https://www.instagram.com/asubap/?utm_source=ig_embed&amp;utm_campaign=loading"
                    style={{
                      color: "#c9c8cd",
                      fontFamily: "outfit,sans-serif",
                      fontSize: "14px",
                      fontStyle: "normal",
                      fontWeight: "normal",
                      lineHeight: "17px",
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ASU Beta Alpha Psi - Beta Tau Chapter
                  </a>{" "}
                  (@
                  <a
                    href="https://www.instagram.com/asubap/?utm_source=ig_embed&amp;utm_campaign=loading"
                    style={{
                      color: "#c9c8cd",
                      fontFamily: "outfit,sans-serif",
                      fontSize: "14px",
                      fontStyle: "normal",
                      fontWeight: "normal",
                      lineHeight: "17px",
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    asubap
                  </a>
                  ) • Instagram photos and videos
                </p>
              </div>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Testimonial Quote - Below both sections */}
      <div className="relative bg-gray-50 p-10 rounded-lg mt-6 mb-6 shadow-md border-l-4 border-[#AF272F]">
        <blockquote className="relative z-10">
          <p className="text-gray-800 italic mb-4 text-lg leading-relaxed">
            "Beta Alpha Psi has been one of the most significant aspects of my
            college career. As a member of the club, I have had unparalleled
            opportunities to develop my leadership skills, expand my network,
            and broaden my understanding of Accounting as a career. What sets
            the club apart is its commitment to volunteering and mentorship
            through various service events organized throughout the academic
            year. To me, it is more than just a club- it is a community for the
            next generation of accounting professionals. I sincerely recommend
            Beta Alpha Psi to anyone who is looking to elevate their
            professional journey."
          </p>
          <footer className="text-right text-gray-600 font-medium mt-4 flex justify-end items-center">
            <div className="h-px w-8 bg-[#AF272F] opacity-60 mr-3"></div>
            <span>BAP Beta Tau Member</span>
          </footer>
        </blockquote>
      </div>

      {/* Edit URL Modal - use Modal from @common */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Apply Form URL"
        onConfirm={handleSaveUrl}
        confirmText={isSaving ? "Saving..." : "Save"}
        cancelText="Cancel"
        showFooter={true}
      >
        <input
          type="text"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="w-full p-2 border rounded-md mb-4"
          placeholder="Enter Google Form URL"
          disabled={isSaving}
        />
      </Modal>
    </section>
  );
}

// Add TypeScript declaration for Instagram's global object
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}
