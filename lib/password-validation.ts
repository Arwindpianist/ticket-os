export interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

export interface PasswordStrength {
  score: number; // 0-100
  level: "weak" | "fair" | "good" | "strong" | "very-strong";
  requirements: {
    label: string;
    met: boolean;
  }[];
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    label: "At least 12 characters",
    test: (pwd) => pwd.length >= 12,
  },
  {
    label: "Contains uppercase letter",
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: "Contains lowercase letter",
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: "Contains number",
    test: (pwd) => /[0-9]/.test(pwd),
  },
  {
    label: "Contains special character",
    test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
  },
  {
    label: "No common patterns (e.g., 123, abc)",
    test: (pwd) => {
      const commonPatterns = [
        /123/,
        /abc/,
        /qwerty/,
        /password/i,
        /admin/i,
        /letmein/i,
      ];
      return !commonPatterns.some((pattern) => pattern.test(pwd));
    },
  },
  {
    label: "No repeated characters (e.g., aaa, 111)",
    test: (pwd) => !/(.)\1{2,}/.test(pwd),
  },
];

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      level: "weak",
      requirements: PASSWORD_REQUIREMENTS.map((req) => ({
        label: req.label,
        met: false,
      })),
    };
  }

  const requirements = PASSWORD_REQUIREMENTS.map((req) => ({
    label: req.label,
    met: req.test(password),
  }));

  const metCount = requirements.filter((r) => r.met).length;
  const totalCount = PASSWORD_REQUIREMENTS.length;

  // Base score from requirements (70% weight)
  const requirementScore = (metCount / totalCount) * 70;

  // Length bonus (20% weight)
  const lengthScore = Math.min((password.length / 20) * 20, 20);

  // Complexity bonus (10% weight) - variety of character types
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const typeCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const complexityScore = (typeCount / 4) * 10;

  const totalScore = Math.round(requirementScore + lengthScore + complexityScore);

  let level: PasswordStrength["level"];
  if (totalScore < 40) {
    level = "weak";
  } else if (totalScore < 60) {
    level = "fair";
  } else if (totalScore < 75) {
    level = "good";
  } else if (totalScore < 90) {
    level = "strong";
  } else {
    level = "very-strong";
  }

  return {
    score: totalScore,
    level,
    requirements,
  };
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const strength = calculatePasswordStrength(password);
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push("Password must be at least 12 characters");
  }

  strength.requirements.forEach((req) => {
    if (!req.met) {
      errors.push(req.label);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

