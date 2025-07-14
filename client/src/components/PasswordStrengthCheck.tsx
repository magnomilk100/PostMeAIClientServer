import { Check, Circle } from "lucide-react";
import { PasswordRequirement } from "@/utils/passwordValidation";

interface PasswordStrengthCheckProps {
  requirements: PasswordRequirement[];
}

export default function PasswordStrengthCheck({ requirements }: PasswordStrengthCheckProps) {
  return (
    <div className="mt-3 space-y-2">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Password Requirements:
      </div>
      <div className="space-y-1">
        {requirements.map((req) => (
          <div key={req.id} className="flex items-center gap-2 text-sm">
            <div className="flex-shrink-0">
              {req.isValid ? (
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
              ) : (
                <Circle size={16} className="text-gray-400" />
              )}
            </div>
            <span className={`transition-colors duration-200 ${
              req.isValid 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}