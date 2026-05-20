import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
//import * as pdfParse from "pdf-parse";
import * as mammoth from "mammoth";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware to check if user is admin
const authenticateAdmin = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader === "Bearer static-admin-token") {
    next();
  } else {
    res.status(401).json({
      error: "Unauthorized: Admin access required",
    });
  }
};

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error(
        "GEMINI_API_KEY missing or placeholder value used"
      );
    }

    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  return genAI;
}

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

interface DocumentChunk {
  text: string;
  source: string;
}

const documentStore: DocumentChunk[] = [
  {
    source: "Thesis_Core_Info.txt",
    text: `
Project: Federated Learning for Health Outbreak Detection Using Multi-Platform Data Sources.
Authors: Malek W. Srouji, Mohammad F. Hajj.
University: Lebanese International University.
Abstract:
Federated Learning allows collaborative training without centralizing sensitive data.
`,
  },
];

const indexedFiles = new Set<string>([
  "Thesis_Core_Info.txt",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

app.get("/api/files", (req, res) => {
  res.json({
    files: Array.from(indexedFiles),
  });
});

app.delete(
  "/api/files/:filename",
  authenticateAdmin,
  (req, res) => {
    const filename = req.params.filename;

    if (!indexedFiles.has(filename)) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    indexedFiles.delete(filename);

    let i = documentStore.length;

    while (i--) {
      if (documentStore[i].source === filename) {
        documentStore.splice(i, 1);
      }
    }

    res.json({
      message: "Deleted",
      files: Array.from(indexedFiles),
    });
  }
);

app.post(
  "/api/upload",
  authenticateAdmin,
  (req, res, next) => {
    upload.array("files")(req, res, err => {
      if (err) {
        return res.status(400).json({
          error: err.message,
        });
      }

      next();
    });
  },
  async (req, res) => {
    const files = req.files as Express.Multer.File[];

    if (!files?.length) {
      return res.status(400).json({
        error: "No files",
      });
    }

    const results = [];

    for (const file of files) {
      try {
        let text = "";

        const ext = path
          .extname(file.originalname)
          .toLowerCase();

        if (ext === ".pdf") {
          //const parsed = await pdf(file.buffer);
          //text = parsed.text;
        } else if (ext === ".docx") {
          const parsed =
            await mammoth.extractRawText({
              buffer: file.buffer,
            });

          text = parsed.value;
        } else {
          text = file.buffer.toString("utf8");
        }

        if (!text.trim()) {
          continue;
        }

        documentStore.push({
          text,
          source: file.originalname,
        });

        indexedFiles.add(file.originalname);

        results.push({
          file: file.originalname,
          status: "success",
        });
      } catch (e: any) {
        results.push({
          file: file.originalname,
          status: "error",
          message: e.message,
        });
      }
    }

    res.json(results);
  }
);

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const ai = getAI();

    const context = documentStore
      .map(
        c =>
          `[Source:${c.source}] ${c.text}`
      )
      .join("\n\n");

    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",

        config: {
          systemInstruction: `
Use uploaded documents.

Context:
${context}
`,
        },

        contents: [
          ...history.map((m: any) => ({
            role:
              m.role === "user"
                ? "user"
                : "model",

            parts: [
              {
                text: m.content,
              },
            ],
          })),

          {
            role: "user",
            parts: [
              {
                text: message,
              },
            ],
          },
        ],
      });

    res.json({
      text: response.text,
    });
  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.post(
  "/api/reset",
  authenticateAdmin,
  (req, res) => {
    documentStore.length = 0;

    res.json({
      message: "Reset complete",
    });
  }
);

app.post("/api/login", (req, res) => {
  const { email, password } =
    req.body;

  if (
    email === "admin" &&
    password === "admin"
  ) {
    return res.json({
      token:
        "static-admin-token",
    });
  }

  res.status(401).json({
    error: "Invalid credentials",
  });
});

async function startServer() {
  try {
    const isProd = process.env.NODE_ENV === "production";

    if (!isProd) {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });

      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");

      app.use(express.static(distPath));

      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    const PORT = Number(process.env.PORT) || 3000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }

}

startServer();