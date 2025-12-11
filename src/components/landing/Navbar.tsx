import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-warm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">O</span>
            </div>
            <span className="font-display font-bold text-xl">ORBI POS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className="nav-link">Fonctionnalités</Link>
            <Link to="/use-cases" className="nav-link">Cas d'usage</Link>
            <Link to="/pricing" className="nav-link">Tarifs</Link>
            <Link to="/about" className="nav-link">À propos</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Connexion</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/register">Démarrer gratuitement</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              <Link
                to="/features"
                className="px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Fonctionnalités
              </Link>
              <Link
                to="/use-cases"
                className="px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Cas d'usage
              </Link>
              <Link
                to="/pricing"
                className="px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Tarifs
              </Link>
              <Link
                to="/about"
                className="px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                À propos
              </Link>
              <Link
                to="/contact"
                className="px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/login">Connexion</Link>
                </Button>
                <Button variant="hero" asChild className="w-full">
                  <Link to="/register">Démarrer gratuitement</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
