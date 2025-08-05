import { serve } from "inngest/next";
import {createUserOrder, inngest, syncUserCreate, syncUserDelete, syncUserUpdate } from "@/config/ingest";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserCreate,
    syncUserUpdate,
    syncUserDelete,
    createUserOrder
  ],
});