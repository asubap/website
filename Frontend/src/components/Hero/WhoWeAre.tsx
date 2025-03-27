export default function WhoWeAre() {
  return (
    <section id="who-we-are" className="py-16 px-4 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Who We Are Content */}
        <div>
          <h2 className="text-3xl font-bold text-[#AF272F] mb-6">Who We Are</h2>
          <p className="text-gray-800 mb-4">
            Beta Alpha Psi is the premier international honor and service
            organization for accounting, finance, and information systems
            students and professionals. The primary objective of Beta Alpha Psi
            is to encourage and give recognition to scholastic and professional
            excellence in the business information field. This includes
            promoting the study and practice of accounting, finance, economics,
            and information systems; providing opportunities for
            self-development, service, and association among members and
            practicing professionals; and encouraging a sense of ethical,
            social, and public responsibility.
          </p>
        </div>

        {/* Testimonial Quote */}
        <div className="bg-gray-100 p-8 rounded-lg">
          <blockquote className="relative">
            <p className="text-gray-800 italic mb-4">
              "Beta Alpha Psi has been one of the most significant aspects of my
              college career. As a member of the club, I have had unparalleled
              opportunities to develop my leadership skills, expand my network,
              and broaden my understanding of Accounting as a career. What sets
              the club apart is its commitment to volunteering and mentoring
              through various service events compared throughout the semester.
              BAP is not a mere club - it is a community for the next generation
              of accounting professionals. I sincerely recommend Beta Alpha Psi
              to anyone who is looking to elevate their professional journey."
            </p>
            <footer className="text-right text-gray-600">
              - BAP Beta Tau Member
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
