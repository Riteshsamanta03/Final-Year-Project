import fastcarelogo from "../../assets/fastcarelogo.png";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
const footerLinks = {
  services: [
    { label: "Emergency Booking", href: "/emergency" },
    { label: "Scheduled Transport", href: "/transport" },
    { label: "Hospital Network", href: "/hospitals" },
    { label: "Health ID", href: "/health-id" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "HIPAA Compliance", href: "/hipaa" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container-wide px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              {/* <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                <span className="text-foreground font-bold text-lg">F</span>
              </div> */}
              <div className="w-10 h-10 xl flex items-center justify-center overflow-hidden">
                <img
                 src={fastcarelogo}
                 alt="FastCare Logo"
                 className="w-full h-full object-contain"
                 />
              </div>

              <span className="text-xl font-semibold tracking-tight">FastCare</span>
            </Link>
            <p className="text-background/70 mb-8 max-w-sm leading-relaxed">
              Revolutionizing healthcare access with instant ambulance booking, 
              comprehensive health records, and a network of trusted hospitals.
            </p>
            <div className="space-y-3">
              <a href="tel:+1-800-FASTCARE" className="flex items-center gap-3 text-background/70 hover:text-background transition-colors">
                <Phone className="w-5 h-5" />
                <span>1-800-FASTCARE</span>
              </a>
              <a href="mailto:support@fastcare.com" className="flex items-center gap-3 text-background/70 hover:text-background transition-colors">
                <Mail className="w-5 h-5" />
                <span>riteshsamanta268@gmail.com</span>
              </a>
              <div className="flex items-center gap-3 text-background/70">
                <MapPin className="w-5 h-5" />
                <span>Kolkata , India</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-6">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-6">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">
            © {new Date().getFullYear()} FastCare.All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-background/50 text-sm">HIPAA Compliant</span>
            <span className="text-background/50 text-sm">SOC 2 Certified</span>
            <span className="text-background/50 text-sm">ISO 27001</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
