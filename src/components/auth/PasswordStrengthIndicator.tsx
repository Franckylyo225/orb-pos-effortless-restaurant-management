import { Check, X } from "lucide-react";
import { calculatePasswordStrength, type PasswordStrength } from "@/lib/validations/auth";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = calculatePasswordStrength(password);

  if (!password) return null;

  const criteriaList = [
    { key: "length", label: "8 caractères minimum", met: strength.criteria.length },
    { key: "uppercase", label: "Une majuscule", met: strength.criteria.uppercase },
    { key: "lowercase", label: "Une minuscule", met: strength.criteria.lowercase },
    { key: "number", label: "Un chiffre", met: strength.criteria.number },
    { key: "special", label: "Un caractère spécial (recommandé)", met: strength.criteria.special },
  ];

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index <= strength.score ? strength.color : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className={`text-xs font-medium ${
          strength.score <= 1 ? "text-destructive" : 
          strength.score === 2 ? "text-yellow-600" : 
          "text-green-600"
        }`}>
          Force du mot de passe : {strength.label}
        </p>
      </div>

      {/* Criteria list */}
      <div className="grid grid-cols-1 gap-1">
        {criteriaList.map((criterion) => (
          <div
            key={criterion.key}
            className={`flex items-center gap-2 text-xs ${
              criterion.met ? "text-green-600" : "text-muted-foreground"
            }`}
          >
            {criterion.met ? (
              <Check size={12} className="text-green-600" />
            ) : (
              <X size={12} className="text-muted-foreground" />
            )}
            <span>{criterion.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
