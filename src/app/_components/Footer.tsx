import { IoMdMail } from "react-icons/io";
import {
  FaFacebookSquare,
  FaTwitterSquare,
  FaPinterestSquare,
  FaLinkedin,
  FaMapMarkerAlt,
  FaMobileAlt,
} from "react-icons/fa";

import "../_stylesheets/footer.css";

export default function Footer() {
  return (
    <div>
      <div className="footer-top">
        <FaMobileAlt className="footer-top-icons" />
        <p>541-868-5398</p>
        <IoMdMail className="footer-top-icons" />
        <p>caloopmobilellc@gmail.com</p>
        <FaMapMarkerAlt className="footer-top-icons" />
        <p>Pomona Park, FL</p>
      </div>
      <div className="footer-bottom">
        <p>
          Copyright @ 2023
          <a
            aria-label="View caloop mobile design page"
            href="https://caloopmobile.up.railway.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Caloop Mobile LLC
          </a>
          Theme by:
          <a
            aria-label="View devloper page"
            href="https://caloopmobile.up.railway.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Caloop Mobile LLC
          </a>
          Powered by:
          <a
            aria-label="View next.js framework page"
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js
          </a>
        </p>
        <div className="socials">
          <a
            aria-label="Visit the Caloop Mobile facebook"
            href="https://www.facebook.com/pixelskywebdesign"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookSquare className="fb-icon" />
          </a>
          <a
            aria-label="Visit the Cloop Mobile twitter"
            href="http://www.twitter.com/caitlyn_larson"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitterSquare className="twit-icon" />
          </a>
          <a
            aria-label="Visit the Caloop Mobile pinterest"
            href="https://www.pinterest.com/pixelskydesign/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaPinterestSquare className="pin-icon" />
          </a>
          <a
            aria-label="Visit the developer's linked in"
            href="https://www.linkedin.com/in/lucas-m-larson/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin className="linkin-icon" />
          </a>
        </div>
      </div>
    </div>
  );
}
