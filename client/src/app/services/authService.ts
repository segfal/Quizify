// Mock user type
export type User = {
  id: string;
  email: string;
  name: string;
  password: string;
};

// Mock database
const mockUsers: User[] = [
  {
    id: "1",
    email: "test@example.com",
    name: "Test User",
    password: "password123",
  },
];

export const authService = {
  login: (email: string, password: string): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers.find(
          (u) => u.email === email && u.password === password
        );
        resolve(user || null);
      }, 500); // Simulate network delay
    });
  },

  signup: (email: string, password: string, name: string): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (mockUsers.some((u) => u.email === email)) {
          resolve(null); // Email already exists
          return;
        }

        const newUser: User = {
          id: String(mockUsers.length + 1),
          email,
          password,
          name,
        };
        mockUsers.push(newUser);
        resolve(newUser);
      }, 500);
    });
  },
}; 