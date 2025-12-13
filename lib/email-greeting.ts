export interface EmailGreeting {
  greeting: string;
  name?: string;
  company?: string;
}

/**
 * Extracts name and company from email and generates a personalized greeting
 */
export function generateEmailGreeting(email: string): EmailGreeting {
  if (!email || !email.includes("@")) {
    return {
      greeting: "Nice to see you",
    };
  }

  const [localPart, domain] = email.split("@");
  
  // Extract name from email (before first dot or underscore)
  let name: string | undefined;
  const nameMatch = localPart.match(/^([a-zA-Z]+)/);
  if (nameMatch) {
    const potentialName = nameMatch[1];
    // Only use if it looks like a name (2+ chars, starts with capital)
    if (potentialName.length >= 2) {
      name = potentialName.charAt(0).toUpperCase() + potentialName.slice(1).toLowerCase();
    }
  }

  // Extract company from domain
  let company: string | undefined;
  const domainParts = domain.split(".");
  if (domainParts.length >= 2) {
    // Get the main domain part (e.g., "company" from "company.com")
    const mainDomain = domainParts[domainParts.length - 2];
    if (mainDomain && mainDomain.length > 1) {
      company = mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1).toLowerCase();
    }
  }

  // Generate greeting
  let greeting: string;
  if (name && company) {
    const greetings = [
      `Hello ${name} from ${company}`,
      `Welcome, ${name} from ${company}`,
      `Nice to see you, ${name} from ${company}`,
    ];
    greeting = greetings[Math.floor(Math.random() * greetings.length)];
  } else if (name) {
    const greetings = [
      `Hello ${name}`,
      `Welcome, ${name}`,
      `Nice to see you, ${name}`,
    ];
    greeting = greetings[Math.floor(Math.random() * greetings.length)];
  } else if (company) {
    const greetings = [
      `Hello from ${company}`,
      `Welcome from ${company}`,
      `Nice to see you from ${company}`,
    ];
    greeting = greetings[Math.floor(Math.random() * greetings.length)];
  } else {
    const greetings = [
      "Nice to see you",
      "Welcome",
      "Hello there",
    ];
    greeting = greetings[Math.floor(Math.random() * greetings.length)];
  }

  return {
    greeting,
    name,
    company,
  };
}

