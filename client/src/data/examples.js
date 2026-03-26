/**
 * Pre-built examples to help users understand the app
 */

export const EXAMPLE_PROJECTS = {
  blog: {
    name: "Blog API",
    description: "A simple blog with users, posts, and comments",
    icon: "📝",
    difficulty: "Beginner",
    schema: {
      projectName: "my-blog-api",
      port: "3000",
      database: "mongodb",
      framework: "express",
      includeAuth: true,
      entities: [
        {
          id: 1,
          name: "User",
          auth: true,
          fields: [
            { id: 1, name: "email", type: "email", required: true, unique: true, enumValues: [] },
            { id: 2, name: "password", type: "password", required: true, unique: false, enumValues: [] },
            { id: 3, name: "name", type: "string", required: true, unique: false, enumValues: [] },
            { id: 4, name: "bio", type: "string", required: false, unique: false, enumValues: [] }
          ],
          relations: []
        },
        {
          id: 2,
          name: "Post",
          auth: false,
          fields: [
            { id: 5, name: "title", type: "string", required: true, unique: false, enumValues: [] },
            { id: 6, name: "content", type: "string", required: true, unique: false, enumValues: [] },
            { id: 7, name: "published", type: "boolean", required: false, unique: false, enumValues: [] },
            { id: 8, name: "tags", type: "string", required: false, unique: false, enumValues: [] }
          ],
          relations: [
            { id: 1, type: "one-to-many", targetEntity: "User", fieldName: "author", eager: true }
          ]
        },
        {
          id: 3,
          name: "Comment",
          auth: false,
          fields: [
            { id: 9, name: "content", type: "string", required: true, unique: false, enumValues: [] },
            { id: 10, name: "approved", type: "boolean", required: false, unique: false, enumValues: [] }
          ],
          relations: [
            { id: 2, type: "one-to-many", targetEntity: "User", fieldName: "author", eager: true },
            { id: 3, type: "one-to-many", targetEntity: "Post", fieldName: "post", eager: false }
          ]
        }
      ]
    }
  },
  
  ecommerce: {
    name: "E-commerce API",
    description: "Online store with products, orders, and customers",
    icon: "🛒",
    difficulty: "Intermediate",
    schema: {
      projectName: "ecommerce-api",
      port: "3000",
      database: "postgresql",
      framework: "nestjs",
      includeAuth: true,
      entities: [
        {
          id: 1,
          name: "User",
          auth: true,
          fields: [
            { id: 1, name: "email", type: "email", required: true, unique: true, enumValues: [] },
            { id: 2, name: "password", type: "password", required: true, unique: false, enumValues: [] },
            { id: 3, name: "firstName", type: "string", required: true, unique: false, enumValues: [] },
            { id: 4, name: "lastName", type: "string", required: true, unique: false, enumValues: [] },
            { id: 5, name: "phone", type: "string", required: false, unique: false, enumValues: [] }
          ],
          relations: []
        },
        {
          id: 2,
          name: "Product",
          auth: false,
          fields: [
            { id: 6, name: "name", type: "string", required: true, unique: false, enumValues: [] },
            { id: 7, name: "description", type: "string", required: true, unique: false, enumValues: [] },
            { id: 8, name: "price", type: "number", required: true, unique: false, min: "0", enumValues: [] },
            { id: 9, name: "stock", type: "number", required: true, unique: false, min: "0", enumValues: [] },
            { id: 10, name: "category", type: "string", required: true, unique: false, enumValues: [] }
          ],
          relations: []
        },
        {
          id: 3,
          name: "Order",
          auth: false,
          fields: [
            { id: 11, name: "total", type: "number", required: true, unique: false, min: "0", enumValues: [] },
            { id: 12, name: "status", type: "enum", required: true, unique: false, enumValues: ["pending", "processing", "shipped", "delivered", "cancelled"] },
            { id: 13, name: "shippingAddress", type: "string", required: true, unique: false, enumValues: [] }
          ],
          relations: [
            { id: 1, type: "one-to-many", targetEntity: "User", fieldName: "customer", eager: true },
            { id: 2, type: "many-to-many", targetEntity: "Product", fieldName: "products", eager: false }
          ]
        }
      ]
    }
  },

  taskManager: {
    name: "Task Manager API",
    description: "Project management with teams, tasks, and deadlines",
    icon: "✅",
    difficulty: "Beginner",
    schema: {
      projectName: "task-manager-api",
      port: "3000",
      database: "mongodb",
      framework: "express",
      includeAuth: true,
      entities: [
        {
          id: 1,
          name: "User",
          auth: true,
          fields: [
            { id: 1, name: "email", type: "email", required: true, unique: true, enumValues: [] },
            { id: 2, name: "password", type: "password", required: true, unique: false, enumValues: [] },
            { id: 3, name: "name", type: "string", required: true, unique: false, enumValues: [] },
            { id: 4, name: "role", type: "enum", required: true, unique: false, enumValues: ["admin", "manager", "member"] }
          ],
          relations: []
        },
        {
          id: 2,
          name: "Project",
          auth: false,
          fields: [
            { id: 5, name: "name", type: "string", required: true, unique: false, enumValues: [] },
            { id: 6, name: "description", type: "string", required: false, unique: false, enumValues: [] },
            { id: 7, name: "deadline", type: "date", required: false, unique: false, enumValues: [] },
            { id: 8, name: "status", type: "enum", required: true, unique: false, enumValues: ["planning", "active", "completed", "on-hold"] }
          ],
          relations: [
            { id: 1, type: "one-to-many", targetEntity: "User", fieldName: "owner", eager: true }
          ]
        },
        {
          id: 3,
          name: "Task",
          auth: false,
          fields: [
            { id: 9, name: "title", type: "string", required: true, unique: false, enumValues: [] },
            { id: 10, name: "description", type: "string", required: false, unique: false, enumValues: [] },
            { id: 11, name: "priority", type: "enum", required: true, unique: false, enumValues: ["low", "medium", "high", "urgent"] },
            { id: 12, name: "completed", type: "boolean", required: false, unique: false, enumValues: [] },
            { id: 13, name: "dueDate", type: "date", required: false, unique: false, enumValues: [] }
          ],
          relations: [
            { id: 2, type: "one-to-many", targetEntity: "Project", fieldName: "project", eager: false },
            { id: 3, type: "one-to-many", targetEntity: "User", fieldName: "assignee", eager: true }
          ]
        }
      ]
    }
  },

  social: {
    name: "Social Media API",
    description: "Social platform with posts, likes, and follows",
    icon: "📱",
    difficulty: "Advanced",
    schema: {
      projectName: "social-media-api",
      port: "3000",
      database: "postgresql",
      framework: "nestjs",
      includeAuth: true,
      entities: [
        {
          id: 1,
          name: "User",
          auth: true,
          fields: [
            { id: 1, name: "email", type: "email", required: true, unique: true, enumValues: [] },
            { id: 2, name: "password", type: "password", required: true, unique: false, enumValues: [] },
            { id: 3, name: "username", type: "string", required: true, unique: true, enumValues: [] },
            { id: 4, name: "displayName", type: "string", required: true, unique: false, enumValues: [] },
            { id: 5, name: "bio", type: "string", required: false, unique: false, enumValues: [] },
            { id: 6, name: "verified", type: "boolean", required: false, unique: false, enumValues: [] }
          ],
          relations: [
            { id: 1, type: "many-to-many", targetEntity: "User", fieldName: "following", eager: false },
            { id: 2, type: "many-to-many", targetEntity: "User", fieldName: "followers", eager: false }
          ]
        },
        {
          id: 2,
          name: "Post",
          auth: false,
          fields: [
            { id: 7, name: "content", type: "string", required: true, unique: false, maxLength: "280", enumValues: [] },
            { id: 8, name: "imageUrl", type: "string", required: false, unique: false, enumValues: [] },
            { id: 9, name: "likesCount", type: "number", required: false, unique: false, min: "0", enumValues: [] },
            { id: 10, name: "repostsCount", type: "number", required: false, unique: false, min: "0", enumValues: [] }
          ],
          relations: [
            { id: 3, type: "one-to-many", targetEntity: "User", fieldName: "author", eager: true }
          ]
        },
        {
          id: 3,
          name: "Like",
          auth: false,
          fields: [],
          relations: [
            { id: 4, type: "one-to-many", targetEntity: "User", fieldName: "user", eager: true },
            { id: 5, type: "one-to-many", targetEntity: "Post", fieldName: "post", eager: false }
          ]
        }
      ]
    }
  }
};

export const getExampleByKey = (key) => EXAMPLE_PROJECTS[key];
export const getAllExamples = () => Object.values(EXAMPLE_PROJECTS);