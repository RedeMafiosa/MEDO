const entityMethods = {
  filter: async () => [],
  get: async () => null,
  create: async () => ({}),
  update: async () => ({}),
  delete: async () => ({}),
  list: async () => [],
};

export const db = {
  auth: {
    isAuthenticated: async () => false,
    me: async () => null,
    logout: async () => {},
    redirectToLogin: async () => {},
    resetPassword: async () => ({}),
  },
  entities: new Proxy({}, { get: () => entityMethods }),
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: '' }),
    },
  },
};

export const base44 = db;
export default db;