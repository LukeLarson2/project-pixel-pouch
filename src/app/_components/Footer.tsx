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
        <p>425-830-7245</p>
        <IoMdMail className="footer-top-icons" />
        <p>caitlyn@pixelskydesign.com</p>
        <FaMapMarkerAlt className="footer-top-icons" />
        <p>Olympia, WA</p>
      </div>
      <div className="footer-bottom">
        <p>
          Copyright @ 2023
          <a
            href="https://pixelskydesign.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pixel Sky Design
          </a>
          Theme by:
          <a
            href="https://www.linkedin.com/in/lucas-larson-6a4bb799/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Caloop Mobile LLC
          </a>
          Powered by:
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js
          </a>
        </p>
        <div className="socials">
          <a
            href="https://www.facebook.com/pixelskywebdesign"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookSquare className="fb-icon" />
          </a>
          <a
            href="http://www.twitter.com/caitlyn_larson"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitterSquare className="twit-icon" />
          </a>
          <a
            href="https://www.pinterest.com/pixelskydesign/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaPinterestSquare className="pin-icon" />
          </a>
          <a
            href="https://www.linkedin.com/pub/caitlyn-larson/67/855/24b"
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
