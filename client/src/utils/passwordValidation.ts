// Password validation utility for real-time strength checking
export interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  isValid: boolean;
}

// Common weak passwords to reject
const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '123456789', 'qwerty', 'abc123',
  'password1', 'admin', 'letmein', 'welcome', 'monkey', '1234567890',
  'football', 'iloveyou', 'princess', 'rockyou', 'babygirl', 'password!',
  'hello123', 'welcome123', 'admin123', 'user123', 'test123', 'guest',
  'login', 'pass', 'passw0rd', 'p@ssword', 'p@ssw0rd', 'qwerty123',
  'abc123!', 'password@', 'password#', 'password$', '12345678', '1234',
  'password2023', 'password2024', 'password2025'
];

// Sequential patterns to reject
const SEQUENTIAL_PATTERNS = [
  /123/, /234/, /345/, /456/, /567/, /678/, /789/, /890/, /012/,
  /abc/, /bcd/, /cde/, /def/, /efg/, /fgh/, /ghi/, /hij/, /ijk/,
  /jkl/, /klm/, /lmn/, /mno/, /nop/, /opq/, /pqr/, /qrs/, /rst/,
  /stu/, /tuv/, /uvw/, /vwx/, /wxy/, /xyz/
];

// Repetitive patterns to reject
const REPETITIVE_PATTERNS = [
  /(.)\1{2,}/, // Same character repeated 3+ times
  /^(.{1,3})\1+$/, // Same pattern repeated (e.g., "123123123")
];

export function createPasswordRequirements(): PasswordRequirement[] {
  return [
    {
      id: 'length',
      label: 'Minimum 8 characters',
      validator: (password: string) => password.length >= 8,
      isValid: false
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter (A–Z)',
      validator: (password: string) => /[A-Z]/.test(password),
      isValid: false
    },
    {
      id: 'lowercase',
      label: 'At least one lowercase letter (a–z)',
      validator: (password: string) => /[a-z]/.test(password),
      isValid: false
    },
    {
      id: 'digit',
      label: 'At least one digit (0–9)',
      validator: (password: string) => /[0-9]/.test(password),
      isValid: false
    },
    {
      id: 'special',
      label: 'At least one special character (!@#$%^&*)',
      validator: (password: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password),
      isValid: false
    },
    {
      id: 'common',
      label: 'No common passwords or patterns',
      validator: (password: string) => {
        // If password is empty, this requirement is not met
        if (!password || password.trim() === '') {
          return false;
        }
        
        const lowerPassword = password.toLowerCase();
        
        // Check against common passwords
        if (COMMON_PASSWORDS.includes(lowerPassword)) {
          return false;
        }
        
        // Check for sequential patterns
        if (SEQUENTIAL_PATTERNS.some(pattern => pattern.test(lowerPassword))) {
          return false;
        }
        
        // Check for repetitive patterns
        if (REPETITIVE_PATTERNS.some(pattern => pattern.test(password))) {
          return false;
        }
        
        return true;
      },
      isValid: false
    }
  ];
}

export function validatePassword(password: string, requirements: PasswordRequirement[]): PasswordRequirement[] {
  return requirements.map(req => ({
    ...req,
    isValid: req.validator(password)
  }));
}

export function isPasswordStrong(requirements: PasswordRequirement[]): boolean {
  return requirements.every(req => req.isValid);
}

export function getPasswordStrengthScore(requirements: PasswordRequirement[]): number {
  const validCount = requirements.filter(req => req.isValid).length;
  return Math.round((validCount / requirements.length) * 100);
}