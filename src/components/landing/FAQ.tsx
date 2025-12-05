import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Combien de temps faut-il pour configurer ORBI POS ?",
    answer: "La configuration initiale prend environ 10 minutes. Vous renseignez les informations de votre restaurant, ajoutez votre menu, et vous êtes prêt à servir. Notre équipe peut vous accompagner gratuitement si besoin."
  },
  {
    question: "ORBI POS fonctionne-t-il sans connexion internet ?",
    answer: "Oui ! ORBI POS dispose d'un mode hors-ligne. Vos commandes sont enregistrées localement et synchronisées automatiquement dès que la connexion revient. Vous ne perdez jamais de données."
  },
  {
    question: "Quels moyens de paiement sont acceptés ?",
    answer: "Nous supportons les paiements en espèces, par carte bancaire (Visa, Mastercard), et tous les principaux services Mobile Money (Orange Money, Wave, MTN MoMo, Airtel Money, M-Pesa, etc.)."
  },
  {
    question: "Puis-je utiliser ORBI POS sur tablette et mobile ?",
    answer: "Absolument ! ORBI POS est une application web responsive optimisée pour ordinateur, tablette et smartphone. Vos serveurs peuvent prendre les commandes directement en salle avec leur téléphone."
  },
  {
    question: "Comment fonctionne le support client ?",
    answer: "Notre équipe support est disponible par email, chat et téléphone. Les plans Pro et Premium bénéficient d'un support prioritaire avec des temps de réponse garantis. Nous proposons aussi des formations en ligne."
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Oui, la sécurité est notre priorité. Vos données sont chiffrées, hébergées sur des serveurs sécurisés, et sauvegardées quotidiennement. Chaque restaurant est isolé avec son propre espace de données."
  },
  {
    question: "Puis-je annuler mon abonnement à tout moment ?",
    answer: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Il n'y a aucun engagement. Vos données restent accessibles pendant 30 jours après l'annulation."
  },
  {
    question: "ORBI POS s'intègre-t-il avec d'autres outils ?",
    answer: "Oui, nous proposons des intégrations avec les principales solutions de comptabilité, les systèmes de fidélité, et les plateformes de livraison. Le plan Premium inclut un accès API pour des intégrations personnalisées."
  }
];

export function FAQ() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              FAQ
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-6">
              Questions fréquentes
            </h2>
            <p className="text-muted-foreground text-lg">
              Tout ce que vous devez savoir pour démarrer avec ORBI POS.
            </p>
          </div>

          {/* Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl border border-border/50 px-6 data-[state=open]:shadow-soft transition-all"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
