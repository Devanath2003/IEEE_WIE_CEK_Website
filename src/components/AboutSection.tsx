import React, {
  useEffect,
  useRef,
  useMemo,
  useState,
  ReactNode,
  RefObject,
} from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import type { SpringOptions } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Particles from "./Particles";

import collegeImage from "../images/college.jpg"; // ✅ imported properly

gsap.registerPlugin(ScrollTrigger);

/* -------------------------
   ScrollReveal (inline)
------------------------- */
interface ScrollRevealProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom bottom",
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="inline-block word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { transformOrigin: "0% 50%", rotate: baseRotation },
        {
          ease: "none",
          rotate: 0,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: "top bottom",
            end: rotationEnd,
            scrub: true,
          },
        }
      );

      const wordElements = el.querySelectorAll<HTMLElement>(".word");

      gsap.fromTo(
        wordElements,
        { opacity: baseOpacity, willChange: "opacity" },
        {
          ease: "none",
          opacity: 1,
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: "top bottom-=20%",
            end: wordAnimationEnd,
            scrub: true,
          },
        }
      );

      if (enableBlur) {
        gsap.fromTo(
          wordElements,
          { filter: `blur(${blurStrength}px)` },
          {
            ease: "none",
            filter: "blur(0px)",
            stagger: 0.05,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: "top bottom-=20%",
              end: wordAnimationEnd,
              scrub: true,
            },
          }
        );
      }
    }, el);

    return () => ctx.revert();
  }, [
    scrollContainerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    rotationEnd,
    wordAnimationEnd,
    blurStrength,
  ]);

  return (
    <h2 ref={containerRef} className={`my-5 ${containerClassName}`}>
      <p
        className={`text-[clamp(1.6rem,4vw,3rem)] leading-[1.5] font-semibold ${textClassName}`}
      >
        {splitText}
      </p>
    </h2>
  );
};

/* -------------------------
   TiltedCard (inline)
------------------------- */
interface TiltedCardProps {
  imageSrc: string;
  altText?: string;
  captionText?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  overlayContent?: React.ReactNode;
  displayOverlayContent?: boolean;
}

const springValues: SpringOptions = { damping: 30, stiffness: 100, mass: 2 };

function TiltedCard({
  imageSrc,
  altText = "Tilted card image",
  captionText = "",
  rotateAmplitude = 14,
  scaleOnHover = 1.1,
  showMobileWarning = false,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, { stiffness: 350, damping: 30, mass: 1 });

  const [lastY, setLastY] = useState(0);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);

    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  return (
    <figure className="relative w-full flex flex-col items-center justify-center">
      {showMobileWarning && (
        <div className="absolute top-4 text-center text-sm block sm:hidden">
          This effect is not optimized for mobile. Check on desktop.
        </div>
      )}

      <div
        ref={ref}
        className="
          relative w-full max-w-md md:max-w-lg
          h-64 sm:h-72 md:h-80 lg:h-96
          [perspective:800px]
        "
        onMouseMove={handleMouse}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="relative w-full h-full [transform-style:preserve-3d]"
          style={{ rotateX, rotateY, scale }}
        >
          <motion.img
            src={imageSrc}
            alt={altText}
            className="absolute inset-0 w-full h-full object-cover rounded-[15px] shadow-2xl will-change-transform [transform:translateZ(0)]"
          />

          {displayOverlayContent && overlayContent && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-[2] will-change-transform [transform:translateZ(40px)]"
            >
              {overlayContent}
            </motion.div>
          )}
        </motion.div>

        {showTooltip && (
          <motion.figcaption
            className="pointer-events-none absolute left-0 top-0 rounded-[4px] bg-white px-[10px] py-[4px] text-[10px] text-[#2d2d2d] opacity-0 z-[3] hidden sm:block"
            style={{ x, y, opacity, rotate: rotateFigcaption }}
          >
            {captionText}
          </motion.figcaption>
        )}
      </div>
    </figure>
  );
}

/* -------------------------
   AboutSection (exported)
------------------------- */
const AboutSection = () => {
  return (
    <section
      id="about"
      className="py-20 px-6 bg-gradient-subtle relative overflow-hidden"
    >
      {/* Particle Background */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleCount={300}
          particleSpread={15}
          speed={0.08}
          alphaParticles={true}
          particleBaseSize={120}
          particleColors={["#9C27B0", "#E91E63", "#7A2E2E"]}
          className="w-full h-full"
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <ScrollReveal
            containerClassName="font-heading font-bold text-foreground mb-4"
            textClassName="text-4xl md:text-5xl"
          >
            About Us
          </ScrollReveal>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Text Content */}
          <div className="space-y-10">
            <div className="backdrop-blur-sm bg-card-glass border border-glass-border rounded-2xl p-8 md:p-10 shadow-card max-w-2xl">
              <h3 className="font-heading text-2xl font-semibold text-foreground mb-4">
                IEEE Women in Engineering (WIE)
              </h3>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                IEEE Women in Engineering is a global network of IEEE members and
                volunteers dedicated to promoting women engineers and scientists and
                inspiring girls worldwide to pursue STEM careers. Our core mission is
                to connect, support, and inspire women and girls globally, facilitating
                their recruitment and retention in STEM fields while fostering
                technological innovation and excellence for the benefit of humanity.
              </p>
            </div>

            <div className="backdrop-blur-sm bg-card-glass border border-glass-border rounded-2xl p-8 md:p-10 shadow-card max-w-2xl">
              <h3 className="font-heading text-2xl font-semibold text-foreground mb-4">
                Our Programs & Initiatives
              </h3>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                IEEE WIE runs transformative programs including the STAR Program - a
                student-teacher and research engineer/scientist outreach initiative
                that mentors young women in STEM. We also organize Global Tech
                Marathons that engage student and graduate members with technical
                skill-building challenges, fostering innovation and professional
                development in emerging technologies.
              </p>
            </div>
          </div>

          {/* Image with Tilt Effect + Floating Title */}
          <div className="flex justify-center">
            <TiltedCard
              imageSrc={collegeImage}  // ✅ fixed: imported image used
              altText="IEEE WIE Community Image"
              captionText="IEEE WIE - College Chapter"
              rotateAmplitude={12}
              scaleOnHover={1.12}
              showMobileWarning={false}
              showTooltip={true}
              displayOverlayContent={true}
              overlayContent={
                <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] tracking-wide">
                  IEEE CEK
                </h3>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
