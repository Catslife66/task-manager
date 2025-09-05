import * as z from "zod";

export const registerForm = z.object({
  email: z.email(),
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

export const tagForm = z.object({
  name: z.string().max(50, { error: "Max length is 50 characters." }),
});
