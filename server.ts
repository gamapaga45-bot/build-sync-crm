import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import { createServer } from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy initialization of S3 client for Cloudflare R2
let s3Client: S3Client | null = null;
const getS3Client = () => {
  if (!s3Client) {
    const { 
      CLOUDFLARE_ACCOUNT_ID, 
      R2_ACCESS_KEY_ID, 
      R2_SECRET_ACCESS_KEY 
    } = process.env;

    if (!CLOUDFLARE_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      console.warn("Cloudflare R2 credentials missing. Storage functions will be limited.");
      return null;
    }

    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
};

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Real-time Live Streams & Signaling
  const activeStreams = new Map();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("start-stream", (data) => {
      const { roomId, userId, userName, title } = data;
      const streamInfo = {
        id: socket.id,
        userId,
        userName,
        title,
        startTime: new Date().toISOString(),
        roomId
      };
      activeStreams.set(roomId, streamInfo);
      io.to(roomId).emit("stream-started", streamInfo);
    });

    socket.on("stop-stream", (roomId) => {
      activeStreams.delete(roomId);
      io.to(roomId).emit("stream-stopped");
    });

    socket.on("signal", (data) => {
      // Forward WebRTC signals
      io.to(data.to).emit("signal", {
        signal: data.signal,
        from: socket.id
      });
    });

    socket.on("disconnect", () => {
      // Handle sudden disconnects - cleanup streams
      activeStreams.forEach((stream, roomId) => {
        if (stream.id === socket.id) {
          activeStreams.delete(roomId);
          io.to(roomId).emit("stream-stopped");
        }
      });
      console.log("Client disconnected:", socket.id);
    });
  });

  // Increase payload limit for base64 images
  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "Сервер BuildSync CRM запущен и работает", 
      time: new Date().toISOString() 
    });
  });

  app.get("/api/streams/active", (req, res) => {
    res.json(Array.from(activeStreams.values()));
  });

  // Photo Upload to Cloudflare R2 Logic (kept from before)...
  app.post("/api/photos/upload", async (req, res) => {
    try {
      const { image, filename, contentType } = req.body;
      const client = getS3Client();
      const bucket = process.env.R2_BUCKET_NAME;

      if (!client || !bucket) {
        return res.status(503).json({ 
          error: "Storage service not configured",
          details: "Missing R2 credentials or bucket name"
        });
      }

      // Convert base64 to Buffer
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      const fileExt = contentType?.split('/')[1] || 'jpg';
      const key = `tasks/${uuidv4()}.${fileExt}`;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType || 'image/jpeg',
      });

      await client.send(command);

      const publicUrl = process.env.R2_PUBLIC_URL || "";
      const finalUrl = publicUrl ? `${publicUrl}/${key}` : key;

      res.json({ 
        success: true, 
        url: finalUrl,
        key: key
      });
    } catch (error: any) {
      console.error("R2 Upload Error:", error);
      res.status(500).json({ 
        error: "Failed to upload photo to Cloudflare R2",
        details: error.message
      });
    }
  });

  // Настройка Vite для режима разработки
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
