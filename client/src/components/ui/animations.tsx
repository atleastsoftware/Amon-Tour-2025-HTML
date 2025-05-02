import { motion } from "framer-motion";
import { ReactNode } from "react";

// Animation variants for fade-in effect
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.6
    }
  }
};

// Animation variants for slide-up effect
export const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

// Animation variants for slide-in-left effect
export const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6
    }
  }
};

// Animation variants for slide-in-right effect
export const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6
    }
  }
};

// Animation variants for scale-up effect
export const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5
    }
  }
};

// Animation variants for staggered children
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

interface FadeInWhenVisibleProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

// Component for fade-in animation when element becomes visible
export function FadeInWhenVisible({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = ""
}: FadeInWhenVisibleProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: {
            duration,
            delay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Component for slide-up animation when element becomes visible
export function SlideUpWhenVisible({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = ""
}: FadeInWhenVisibleProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration,
            delay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Component for slide-in-left animation when element becomes visible
export function SlideInLeftWhenVisible({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = ""
}: FadeInWhenVisibleProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0, x: -50 },
        visible: { 
          opacity: 1, 
          x: 0,
          transition: {
            duration,
            delay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Component for slide-in-right animation when element becomes visible
export function SlideInRightWhenVisible({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = ""
}: FadeInWhenVisibleProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0, x: 50 },
        visible: { 
          opacity: 1, 
          x: 0,
          transition: {
            duration,
            delay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Component for staggered children animation when element becomes visible
export function StaggerChildren({ 
  children, 
  delay = 0, 
  className = ""
}: FadeInWhenVisibleProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.2,
            delayChildren: delay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animation for individual staggered child
export function StaggerItem({ 
  children, 
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.5
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}