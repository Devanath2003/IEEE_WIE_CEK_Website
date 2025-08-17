import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import Particles from "./Particles";

const ContactSection = () => {
  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      label: "Email",
      value: "contact@ieeewie.org",
      href: "mailto:contact@ieeewie.org"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      label: "Phone",
      value: "+1 732 981 0060",
      href: "tel:+17329810060"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      label: "Location",
      value: "IEEE Headquarters, Piscataway, NJ, USA",
      href: "https://maps.google.com/search/IEEE+Headquarters+Piscataway"
    }
  ];

  const socialMedia = [
    { 
      icon: <Facebook className="w-5 h-5" />, 
      name: "Facebook", 
      href: "#",
      color: "hover:text-blue-500"
    },
    { 
      icon: <Instagram className="w-5 h-5" />, 
      name: "Instagram", 
      href: "#",
      color: "hover:text-pink-500"
    },
    { 
      icon: <Linkedin className="w-5 h-5" />, 
      name: "LinkedIn", 
      href: "#",
      color: "hover:text-blue-600"
    },
    { 
      icon: <Twitter className="w-5 h-5" />, 
      name: "Twitter", 
      href: "#",
      color: "hover:text-blue-400"
    }
  ];

  return (
    <section id="contact" className="py-20 px-6 bg-gradient-subtle relative overflow-hidden">
      {/* Particle Background */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleCount={200}
          particleSpread={10}
          speed={0.05}
          alphaParticles={true}
          particleBaseSize={90}
          particleColors={['#E91E63', '#7A2E2E']}
          className="w-full h-full"
        />
      </div>
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Contact Us
          </h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full mb-6"></div>
          <p className="font-body text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with IEEE Women in Engineering for collaborations, mentorship, and empowerment opportunities
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="backdrop-blur-sm bg-card-glass border border-glass-border rounded-2xl p-8 shadow-card">
              <h3 className="font-heading text-2xl font-semibold text-foreground mb-8">
                Get In Touch
              </h3>
              
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="group">
                    <a 
                      href={item.href}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-glass-primary transition-all duration-300 group-hover:scale-105"
                    >
                      <div className="text-accent group-hover:text-accent-glow transition-colors duration-300">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-nav font-semibold text-foreground mb-1">
                          {item.label}
                        </p>
                        <p className="font-body text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                          {item.value}
                        </p>
                      </div>
                    </a>
                  </div>
                ))}
              </div>

              {/* Social Media */}
              <div className="mt-8 pt-8 border-t border-glass-border">
                <h4 className="font-nav font-semibold text-foreground mb-4">
                  Follow Us
                </h4>
                <div className="flex gap-4">
                  {socialMedia.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className={`p-3 rounded-xl bg-glass-secondary border border-glass-border hover:bg-glass-primary transition-all duration-300 hover:scale-110 text-muted-foreground ${social.color}`}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Map/Visual Placeholder */}
          <div className="relative">
            <div className="backdrop-blur-sm bg-card-glass border border-glass-border rounded-2xl p-8 shadow-card">
              <h3 className="font-heading text-2xl font-semibold text-foreground mb-6">
                Find Us
              </h3>
              
              {/* Map Placeholder */}
              <div className="relative h-80 bg-gradient-secondary rounded-xl border border-glass-border flex items-center justify-center">
                <div className="text-center text-foreground opacity-60">
                  <div className="w-16 h-16 bg-glass-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <p className="font-nav font-medium text-lg mb-2">[MAP_PLACEHOLDER]</p>
                  <p className="font-body text-sm">Interactive Campus Map</p>
                </div>
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-xl blur-xl -z-10"></div>
              </div>

              {/* Quick Info */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-glass-secondary rounded-xl border border-glass-border">
                  <p className="font-nav font-semibold text-accent mb-1">Established</p>
                  <p className="font-body text-foreground">2018</p>
                </div>
                <div className="text-center p-4 bg-glass-secondary rounded-xl border border-glass-border">
                  <p className="font-nav font-semibold text-accent mb-1">Members</p>
                  <p className="font-body text-foreground">200+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;