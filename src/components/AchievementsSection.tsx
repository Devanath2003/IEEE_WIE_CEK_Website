import CircularGallery from "./CircularGallery";
import awardImage from "../images/award.jpg";
import achivImage from "../images/achiv.jpg";

const AchievementsSection = () => {
  const achievements = [
    {
      image: awardImage,
      text: "WIE Global Leadership Award 2023",
      description: "Recognized globally for outstanding contributions to advancing women in technology and engineering.",
      year: 2023,
    },
    {
      image: achivImage,
      text: "STAR Program Excellence Recognition",
      description: "Acknowledged for outstanding performance and dedication within the STAR program.",
      year: 2024, // optional; remove if you don’t want to show
    },
    {
      image: awardImage,
      text: "WIE Global Leadership Award 2023",
      description: "Recognized globally for outstanding contributions to advancing women in technology and engineering.",
      year: 2023,
    },
    {
      image: achivImage,
      text: "Tech Marathon Innovation Prize",
      description: "Awarded for a groundbreaking innovative solution presented at the Tech Marathon.",
      year: 2022,
    },
    {
      image: achivImage,
      text: "Women in Engineering Impact Award",
      description: "Honored for significant contributions to promoting gender equality and impact in the field of engineering.",
      year: 2021,
    },
  ];

  return (
    <section id="achievements" className="py-20 px-6 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Achievements
          </h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full mb-6"></div>
          <p className="font-body text-xl text-muted-foreground max-w-2xl mx-auto">
            Celebrating our milestones and recognitions in empowering women in engineering
          </p>
        </div>

        <div className="h-[600px] w-full">
          <CircularGallery
            items={achievements}
            bend={2}
            textColor="#ffffff"
            borderRadius={0.02}
            font="bold 18px Inter"
            scrollSpeed={1.5}
            scrollEase={0.08}
          />
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
