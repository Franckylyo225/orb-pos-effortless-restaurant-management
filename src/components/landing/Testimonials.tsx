import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Aminata Diallo",
    role: "Propriétaire, Restaurant Le Baobab",
    location: "Dakar, Sénégal",
    content: "ORBI POS a transformé notre service. Les serveurs prennent les commandes en un clic, la cuisine reçoit tout instantanément. Notre rotation de table a augmenté de 30%.",
    rating: 5
  },
  {
    name: "Kofi Mensah",
    role: "Manager, Golden Palm Hotel",
    location: "Accra, Ghana",
    content: "Nous gérons 3 restaurants avec ORBI. Les rapports consolidés nous donnent une vue claire de nos performances. L'équipe support est exceptionnelle.",
    rating: 5
  },
  {
    name: "Marie Kouassi",
    role: "Gérante, Maquis Chez Tanti",
    location: "Abidjan, Côte d'Ivoire",
    content: "Simple à utiliser même pour mes serveurs qui n'ont jamais touché un ordinateur. Le mode Mobile Money est parfait pour nos clients. Je recommande à 100%!",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Témoignages
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-6">
            Ils ont choisi ORBI POS
          </h2>
          <p className="text-muted-foreground text-lg">
            Découvrez comment des restaurateurs à travers l'Afrique ont transformé 
            leur activité avec notre solution.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="relative p-8 rounded-2xl bg-card border border-border/50 hover:shadow-medium transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8">
                <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
                  <Quote size={20} className="text-primary-foreground" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4 pt-2">
                {Array(testimonial.rating).fill(null).map((_, i) => (
                  <Star key={i} size={16} className="text-warning fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
