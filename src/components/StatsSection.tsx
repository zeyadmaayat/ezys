import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const StatsSection = () => {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const stats = [
    { 
      value: 2500, 
      suffix: "+", 
      label: language === 'ar' ? 'شركة تثق بنا' : 'Companies Trust Us' 
    },
    { 
      value: 50, 
      suffix: "M+", 
      label: language === 'ar' ? 'شحنة تم تتبعها' : 'Shipments Tracked' 
    },
    { 
      value: 99.9, 
      suffix: "%", 
      label: language === 'ar' ? 'وقت تشغيل المنصة' : 'Platform Uptime' 
    },
    { 
      value: 150, 
      suffix: "+", 
      label: language === 'ar' ? 'دولة مغطاة' : 'Countries Covered' 
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-hero relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/50 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`text-center transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-2">
                <AnimatedNumber 
                  value={stat.value} 
                  suffix={stat.suffix} 
                  isVisible={isVisible} 
                />
              </div>
              <p className="text-primary-foreground/70 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface AnimatedNumberProps {
  value: number;
  suffix: string;
  isVisible: boolean;
}

const AnimatedNumber = ({ value, suffix, isVisible }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current * 10) / 10);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  const formatValue = (val: number) => {
    if (Number.isInteger(value)) {
      return Math.floor(val).toLocaleString();
    }
    return val.toFixed(1);
  };

  return (
    <span>
      {formatValue(displayValue)}
      {suffix}
    </span>
  );
};

export default StatsSection;
