import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import Particles from "./Particles";
import eve1 from "@/images/eve1.jpg";
import eve2 from "@/images/eve2.jpg";
import eve3 from "@/images/eve3.jpg";
import eve4 from "@/images/eve4.jpg";

const ActivitiesSection = () => {
  const activities = [
    {
      id: 1,
      title: "WIECTORY",
      description:
        "Student-teacher and research engineer/scientist outreach program mentoring young women in STEM fields with hands-on guidance.",
      status: "Ongoing",
      date: "Monthly Sessions",
      location: "Virtual & Campus",
      participants: "100+ Mentees",
    },
    {
      id: 2,
      title: " Switch On Safety",
      description:
        "Technical skill-building challenges engaging student and graduate members in emerging technologies and innovation projects.",
      status: "Upcoming",
      date: "March 20, 2024",
      location: "Hybrid Event",
      participants: "500+ Participants",
    },
    {
      id: 3,
      title: "PromptPalette",
      description:
        "Annual summit bringing together women leaders in technology to share experiences and inspire the next generation of engineers.",
      status: "Past",
      date: "November 15, 2023",
      location: "Tech Conference Center",
      participants: "300+ Attendees",
    },
    {
      id: 4,
      title: "Decode Your Cycle",
      description:
        "Professional development sessions focusing on technical skills, leadership, and career advancement strategies for women in engineering.",
      status: "Upcoming",
      date: "April 18, 2024",
      location: "Engineering Campus",
      participants: "150+ Students",
    },
  ];

  const eventImages: { [key: number]: string } = {
    1: eve1,
    2: eve2,
    3: eve3,
    4: eve4,
  };

  return (
    <section
      id="activities"
      className="py-20 px-6 bg-gradient-subtle relative overflow-hidden"
    >
      {/* Particle Background */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleCount={250}
          particleSpread={14}
          speed={0.06}
          alphaParticles={true}
          particleBaseSize={100}
          particleColors={["#7A2E2E", "#9C27B0"]}
          className="w-full h-full"
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Activities
          </h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full mb-6"></div>
          <p className="font-body text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our engaging technical and professional development activities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="group backdrop-blur-sm bg-card-glass border border-glass-border rounded-2xl overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105"
            >
              {/* Event Image (responsive height per breakpoint) */}
              <div className="relative h-48 md:h-64 lg:h-72 border-b border-glass-border overflow-hidden">
                <img
                  src={eventImages[activity.id]}
                  alt={`${activity.title} banner`}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-xl font-semibold text-foreground">
                    {activity.title}
                  </h3>
                  <Badge
                    variant={
                      activity.status === "Upcoming" ? "default" : "secondary"
                    }
                    className={`font-nav font-medium ${
                      activity.status === "Upcoming"
                        ? "bg-gradient-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {activity.status}
                  </Badge>
                </div>

                <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                  {activity.description}
                </p>

                {/* Event Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar size={16} className="text-accent" />
                    <span className="font-body">{activity.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin size={16} className="text-accent" />
                    <span className="font-body">{activity.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Users size={16} className="text-accent" />
                    <span className="font-body">{activity.participants}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;
