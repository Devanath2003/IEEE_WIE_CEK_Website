import { Mail, Phone, Linkedin } from "lucide-react";
import Particles from "./Particles";
import execomImage from "../images/execom.png";
import React, { useRef, useState } from "react";

// ---- SpotlightCard Component ----
const SpotlightCard = ({
  children,
  className = "",
  spotlightColor = "rgba(227, 16, 255, 0.25)",
}) => {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(0.6);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => setOpacity(0.6);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl border border-glass-border backdrop-blur-sm bg-card-glass overflow-hidden shadow-card transition-all duration-300 hover:scale-105 ${className}`}
    >
      {/* Spotlight effect */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

// ---- ExecomSection Component ----
const ExecomSection = () => {
  const members = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      position: "WIE Chairperson",
      email: "chair@ieeewie.org",
      phone: "+91 98765 43210",
      linkedin: "linkedin.com/in/sarahjohnson",
    },
    {
      id: 2,
      name: "Priya Sharma",
      position: "Vice Chairperson",
      email: "vice.chair@ieeewie.org",
      phone: "+91 98765 43211",
      linkedin: "linkedin.com/in/priyasharma",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "Secretary",
      email: "secretary@ieeewie.org",
      phone: "+91 98765 43212",
      linkedin: "linkedin.com/in/emilyrodriguez",
    },
    {
      id: 4,
      name: "Aisha Patel",
      position: "Treasurer",
      email: "treasurer@ieeewie.org",
      phone: "+91 98765 43213",
      linkedin: "linkedin.com/in/aishapatel",
    },
    {
      id: 5,
      name: "Dr. Lisa Wang",
      position: "STAR Program Coordinator",
      email: "star@ieeewie.org",
      phone: "+91 98765 43214",
      linkedin: "linkedin.com/in/lisawang",
    },
  ];

  return (
    <section
      id="execom"
      className="py-20 px-6 bg-background relative overflow-hidden"
    >
      {/* Particle Background */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleCount={250}
          particleSpread={12}
          speed={0.06}
          alphaParticles={true}
          particleBaseSize={100}
          particleColors={["#9C27B0", "#E91E63"]}
          className="w-full h-full"
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Execom Members
          </h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full mb-6"></div>
          <p className="font-body text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet our dedicated executive committee members who lead and inspire
            women in engineering
          </p>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {/* Render the first 3 normally so large screens show them as the top row */}
          {members.slice(0, 3).map((member) => (
            <SpotlightCard
              key={member.id}
              spotlightColor="rgba(159, 24, 174, 0.25)"
              className="w-full max-w-sm p-8"
            >
              {/* Profile Image */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img
                    src={execomImage}
                    alt={`Profile photo of ${member.name}`}
                    className="w-32 h-32 rounded-full object-cover border-2 border-glass-border shadow-glass"
                  />
                  <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-full blur-lg group-hover:opacity-40 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Member Info */}
              <div className="text-center space-y-4">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                    {member.name}
                  </h3>
                  <p className="font-nav text-accent font-medium text-lg">
                    {member.position}
                  </p>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 pt-4 border-t border-glass-border">
                  <div className="flex items-center justify-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300">
                    <Mail size={16} />
                    <span className="font-body text-sm">{member.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300">
                    <Phone size={16} />
                    <span className="font-body text-sm">{member.phone}</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300">
                    <Linkedin size={16} />
                    <span className="font-body text-sm">{member.linkedin}</span>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          ))}

          {/* Center the remaining members in a full-width row (keeps card width intact).
              - On mobile: flex-col (cards stack) — preserves original mobile layout.
              - On md: this row will span both columns and center the cards.
              - On lg: spans 3 columns and centers the last two under the top 3.
          */}
          {members.length > 3 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col md:flex-row items-center justify-center gap-8 w-full">
              {members.slice(3).map((member) => (
                <SpotlightCard
                  key={member.id}
                  spotlightColor="rgba(159, 24, 174, 0.25)"
                  className="w-full max-w-sm p-8"
                >
                  {/* Profile Image */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <img
                        src={execomImage}
                        alt={`Profile photo of ${member.name}`}
                        className="w-32 h-32 rounded-full object-cover border-2 border-glass-border shadow-glass"
                      />
                      <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-full blur-lg group-hover:opacity-40 transition-opacity duration-300"></div>
                    </div>
                  </div>

                  {/* Member Info */}
                  <div className="text-center space-y-4">
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                        {member.name}
                      </h3>
                      <p className="font-nav text-accent font-medium text-lg">
                        {member.position}
                      </p>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3 pt-4 border-t border-glass-border">
                      <div className="flex items-center justify-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300">
                        <Mail size={16} />
                        <span className="font-body text-sm">{member.email}</span>
                      </div>
                      <div className="flex items-center justify-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300">
                        <Phone size={16} />
                        <span className="font-body text-sm">{member.phone}</span>
                      </div>
                      <div className="flex items-center justify-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300">
                        <Linkedin size={16} />
                        <span className="font-body text-sm">{member.linkedin}</span>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ExecomSection;
