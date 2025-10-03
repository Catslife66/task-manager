import * as z from "zod";

export const registerForm = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters long." })
    .regex(/[a-z]/, {
      error: "Password must contain at least one lowercase letter.",
    })
    .regex(/[A-Z]/, {
      error: "Password must contain at least one uppderrcase letter.",
    })
    .regex(/d/, { error: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      error: "Password must contain at least one special character.",
    }),
});

export const taskForm = z.object({
  title: z
    .string()
    .min(1, { error: "Title cannot be empty." })
    .max(200, { error: "Max length is 50 characters." }),
  description: z.string().optional(),
  due_date: z.coerce
    .date({ error: "Please fill the date and time." })
    .min(new Date(), { error: "Due date has to be a future date." }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export const loginForm = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(1, { error: "Password cannot be empty." }),
});

export const passwordResetRequestForm = z.object({
  email: z.email({ error: "Invalid email address" }),
});

export const passwordResetForm = z.object({
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters long." })
    .regex(/[a-z]/, {
      error: "Password must contain at least one lowercase letter.",
    })
    .regex(/[A-Z]/, {
      error: "Password must contain at least one uppderrcase letter.",
    })
    .regex(/d/, { error: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      error: "Password must contain at least one special character.",
    }),
  password2: z.string().min(1, { error: "Please confirm your password." }),
});
