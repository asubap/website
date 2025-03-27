interface FooterProps {
    backgroundColor: string;
  }
  
  const Footer: React.FC<FooterProps> = ({ backgroundColor }) => {
    return (
      <footer
        style={{ backgroundColor }}
        className="text-white px-4 sm:px-8 md:px-16 py-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-center sm:text-left font-['Montserrat'] text-sm sm:text-base mb-4 sm:mb-0">
            © Copyright {new Date().getFullYear()} Beta Alpha Psi, All Rights
            Reserved.
          </p>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-8 font-['Montserrat'] text-sm sm:text-base">
            <a
              href="https://www.instagram.com/asubap/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gray-300 hover:underline"
            >
              Instagram
            </a>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;