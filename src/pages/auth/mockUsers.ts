/** DEMO DATA ONLY — customer accounts need the backend described in /docs/API.md. */
export interface DemoUser { firstName: string; lastName: string; email: string; phone: string; password: string }

export const DEMO_USERS: DemoUser[] = [
  { firstName: "Juan", lastName: "dela Cruz", email: "juan@example.com", phone: "0917 123 4567", password: "demo1234" },
  { firstName: "Maria", lastName: "Santos", email: "maria@example.com", phone: "0918 765 4321", password: "demo1234" },
];
