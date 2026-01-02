import { 
  Truck, 
  BarChart3, 
  Globe, 
  Shield, 
  Zap, 
  Users,
  Package,
  Clock
} from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Real-Time Tracking",
    description: "Track every shipment in real-time with GPS precision across your entire fleet and carrier network.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Gain actionable insights with powerful dashboards and predictive analytics to optimize operations.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Connect with carriers and partners worldwide through our integrated logistics network.",
    color: "bg-green-500/10 text-green-500",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Enterprise-grade security with GDPR, SOC2, and industry-specific compliance built-in.",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: Zap,
    title: "Instant Automation",
    description: "Automate repetitive tasks with smart workflows and reduce manual processing by 80%.",
    color: "bg-yellow-500/10 text-yellow-500",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Unified workspace for your team with role-based access and real-time notifications.",
    color: "bg-pink-500/10 text-pink-500",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Package className="w-4 h-4 text-accent" />
            <span className="text-accent">Powerful Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6">
            Everything You Need to{" "}
            <span className="text-gradient">Scale Logistics</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From real-time tracking to advanced analytics, LogiPro Hub provides all the tools you need to streamline your supply chain operations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-2xl p-6 lg:p-8 border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-secondary rounded-full px-6 py-3">
            <Clock className="w-5 h-5 text-accent" />
            <span className="text-foreground font-medium">
              Setup takes less than 5 minutes
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
