console.log("server.js file loaded");

const dotenv = require("dotenv");
const https = require("https");
const zlib = require("zlib");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { YoutubeTranscript } = require("youtube-transcript");
const User = require("./models/User");
const Recipe = require("./models/Recipe");
const connectDB = require("./db");
connectDB();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://my-personal-chef-pi.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

app.use(express.json());

dotenv.config();
connectDB();


app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      status: "error",
      message: "Invalid JSON body"
    });
  }
  next(err);
});

const extractVideoId = (url) => {
  if (!url || typeof url !== "string") return null;
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : null;
};

const cleanText = (text) => {
  if (!text) return "";
  return String(text).replace(/\s+/g, " ").trim();
};

const confidenceScore = (recipe) => {
  let score = 0;
  if (recipe?.ingredients?.length > 3) score += 0.4;
  if (recipe?.steps?.length > 3) score += 0.4;
  if (recipe?.title) score += 0.2;
  return Math.max(0, Math.min(1, score));
};

const getYouTubeThumbnailUrl = (videoId) => {
  if (!videoId) return "";
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/maxresdefault.jpg`;
};

const extractStepsFromText = (text) => {
  const t = String(text || "");
  if (!t) return [];

  const lines = t
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const out = [];
  for (const line of lines) {
    const m = line.match(/^(?:step\s*\d+\s*[:\-]|\d+[\)\.\-]\s+|[-*]\s+)(.+)$/i);
    if (m && m[1]) {
      const cleaned = cleanText(m[1]);
      if (cleaned) out.push(cleaned);
    }
  }
  return out;
};

const extractCookingTimeFromText = (text) => {
  const t = String(text || "");
  if (!t) return "";

  const m = t.match(/\b(\d{1,3})\s*(?:mins?|minutes?)\b/i);
  if (m && m[1]) return `${m[1]} mins`;

  const m2 = t.match(/\b(\d{1,2})\s*(?:hrs?|hours?)\b/i);
  if (m2 && m2[1]) return `${m2[1]} hrs`;

  return "";
};

const extractDifficultyFromText = (text) => {
  const t = String(text || "");
  if (!t) return "";

  if (/\beasy\b/i.test(t)) return "Easy";
  if (/\bmedium\b/i.test(t)) return "Medium";
  if (/\bhard\b/i.test(t)) return "Hard";
  return "";
};

const extractJsonObject = (text) => {
  if (!text) return null;
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  return text.slice(first, last + 1);
};

const parseAvailableTranscriptLangs = (message) => {
  const msg = message ? String(message) : "";
  const match = msg.match(/Available languages:\s*([^\n\r]+)/i);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const httpsGetText = async (url) => {
  return await new Promise((resolve, reject) => {
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br"
    };

    https
      .get(url, { headers }, (resp) => {
        const chunks = [];
        resp.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        resp.on("end", () => {
          if (!resp.statusCode || resp.statusCode < 200 || resp.statusCode >= 300) {
            return reject(new Error(`HTTP ${resp.statusCode}`));
          }

          const raw = Buffer.concat(chunks);
          const enc = String(resp.headers?.["content-encoding"] || "").toLowerCase();

          const finish = (buf) => resolve(Buffer.isBuffer(buf) ? buf.toString("utf8") : String(buf || ""));

          try {
            if (enc.includes("gzip")) {
              return zlib.gunzip(raw, (err, out) => (err ? finish(raw) : finish(out)));
            }
            if (enc.includes("deflate")) {
              return zlib.inflate(raw, (err, out) => (err ? finish(raw) : finish(out)));
            }
            if (enc.includes("br") && typeof zlib.brotliDecompress === "function") {
              return zlib.brotliDecompress(raw, (err, out) => (err ? finish(raw) : finish(out)));
            }
            return finish(raw);
          } catch {
            return finish(raw);
          }
        });
      })
      .on("error", (e) => reject(e));
  });
};

const fetchTextWithMeta = async (url) => {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br"
  };

  if (typeof fetch === "function") {
    const resp = await fetch(url, { headers, redirect: "follow" });
    const text = await resp.text();
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    const headerObj = {};
    try {
      for (const [k, v] of resp.headers.entries()) headerObj[k.toLowerCase()] = v;
    } catch {
    }

    return { text, headers: headerObj, statusCode: resp.status };
  }

  const legacy = await httpsGetTextWithMeta(url);
  return { ...legacy, statusCode: 200 };
};

const httpsGetTextWithMeta = async (url) => {
  return await new Promise((resolve, reject) => {
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br"
    };

    https
      .get(url, { headers }, (resp) => {
        const chunks = [];
        resp.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        resp.on("end", () => {
          if (!resp.statusCode || resp.statusCode < 200 || resp.statusCode >= 300) {
            return reject(new Error(`HTTP ${resp.statusCode}`));
          }

          const raw = Buffer.concat(chunks);
          const enc = String(resp.headers?.["content-encoding"] || "").toLowerCase();
          const finish = (buf) =>
            resolve({
              text: Buffer.isBuffer(buf) ? buf.toString("utf8") : String(buf || ""),
              headers: resp.headers || {}
            });

          try {
            if (enc.includes("gzip")) {
              return zlib.gunzip(raw, (err, out) => (err ? finish(raw) : finish(out)));
            }
            if (enc.includes("deflate")) {
              return zlib.inflate(raw, (err, out) => (err ? finish(raw) : finish(out)));
            }
            if (enc.includes("br") && typeof zlib.brotliDecompress === "function") {
              return zlib.brotliDecompress(raw, (err, out) => (err ? finish(raw) : finish(out)));
            }
            return finish(raw);
          } catch {
            return finish(raw);
          }
        });
      })
      .on("error", (e) => reject(e));
  });
};

const decodeHtmlEntities = (text) => {
  if (!text) return "";
  return String(text)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => {
      const n = Number(code);
      if (!Number.isFinite(n)) return _;
      try {
        return String.fromCodePoint(n);
      } catch {
        return _;
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const n = Number.parseInt(hex, 16);
      if (!Number.isFinite(n)) return _;
      try {
        return String.fromCodePoint(n);
      } catch {
        return _;
      }
    });
};

const extractCaptionsFromWatchHtml = (html) => {
  const marker = "ytInitialPlayerResponse";
  const idx = html.indexOf(marker);
  if (idx === -1) return null;

  const start = html.indexOf("{", idx);
  if (start === -1) return null;

  let depth = 0;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    if (depth === 0) {
      const jsonStr = html.slice(start, i + 1);
      try {
        return JSON.parse(jsonStr);
      } catch {
        return null;
      }
    }
  }
  return null;
};

const vttToPlainText = (vtt) => {
  if (!vtt) return "";
  const lines = String(vtt)
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim());

  const out = [];
  for (const line of lines) {
    if (!line) continue;
    if (line === "WEBVTT") continue;
    if (line.includes("-->") || /^\d+$/.test(line)) continue;
    if (/^NOTE\b/i.test(line)) continue;
    out.push(decodeHtmlEntities(line.replace(/<[^>]+>/g, "")));
  }

  return cleanText(out.join(" "));
};

const xmlTranscriptToPlainText = (xml) => {
  if (!xml) return "";
  const s = String(xml);
  if (/^\s*<!doctype\s+html\b/i.test(s) || /^\s*<html\b/i.test(s)) return "";

  const out = [];
  const re = /<text\b[^>]*>([\s\S]*?)<\/text>/gi;
  let m;
  while ((m = re.exec(s))) {
    const chunk = decodeHtmlEntities(m[1])
      .replace(/<[^>]+>/g, "")
      .replace(/\n/g, " ")
      .trim();
    if (chunk) out.push(chunk);
  }
  return cleanText(out.join(" "));
};

const fetchTranscriptViaTimedtextApi = async (videoId, preferredLang) => {
  const langs = Array.from(
    new Set([preferredLang, "en", "en-US", "en-GB"].filter(Boolean).map((s) => String(s)))
  );

  const buildUrl = (lang, fmt) => {
    const base = `https://www.youtube.com/api/timedtext?v=${encodeURIComponent(videoId)}&lang=${encodeURIComponent(lang)}`;
    return fmt ? `${base}&fmt=${encodeURIComponent(fmt)}` : base;
  };

  for (const lang of langs) {
    const attempts = [
      { fmt: "vtt", parse: vttToPlainText },
      { fmt: "json3", parse: srv3ToPlainText },
      { fmt: "srv3", parse: srv3ToPlainText },
      { fmt: null, parse: xmlTranscriptToPlainText }
    ];

    for (const a of attempts) {
      const resp = await fetchTextWithMeta(buildUrl(lang, a.fmt));
      const text = a.parse(resp?.text || "");
      if (text) return { text, langUsed: lang };
    }
  }

  throw new Error("Empty transcript");
};

const srv3ToPlainText = (json) => {
  if (!json) return "";
  const s = String(json);
  if (/^\s*<!doctype\s+html\b/i.test(s) || /^\s*<html\b/i.test(s)) return "";

  let parsed;
  try {
    parsed = JSON.parse(s);
  } catch {
    return "";
  }

  const events = Array.isArray(parsed?.events) ? parsed.events : [];
  const out = [];
  for (const ev of events) {
    const segs = Array.isArray(ev?.segs) ? ev.segs : [];
    for (const seg of segs) {
      if (seg?.utf8) out.push(decodeHtmlEntities(seg.utf8));
    }
  }
  return cleanText(out.join(" "));
};

const fetchTranscriptViaCaptionTracks = async (videoId, preferredLang) => {
  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  const html = await httpsGetText(watchUrl);
  const player = extractCaptionsFromWatchHtml(html);
  const tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!Array.isArray(tracks) || !tracks.length) {
    throw new Error("No caption tracks found");
  }

  const norm = (s) => String(s || "").toLowerCase();
  let track = null;

  if (preferredLang) {
    track = tracks.find((t) => norm(t.languageCode) === norm(preferredLang));
  }
  if (!track) {
    track = tracks.find((t) => norm(t.languageCode).startsWith("en")) || tracks[0];
  }

  const baseUrl = track?.baseUrl;
  if (!baseUrl) throw new Error("Caption track baseUrl missing");

  const available = tracks.map((t) => t.languageCode).filter(Boolean);
  const buildFmtUrl = (u, fmt) => {
    if (!fmt) return u;
    const sep = u.includes("?") ? "&" : "?";
    return `${u}${sep}fmt=${encodeURIComponent(fmt)}`;
  };

  const attempts = [
    { fmt: "vtt", parse: vttToPlainText },
    { fmt: "json3", parse: srv3ToPlainText },
    { fmt: "srv3", parse: srv3ToPlainText },
    { fmt: null, parse: xmlTranscriptToPlainText }
  ];

  let lastNonEmptyResponse = "";
  const debug = [];
  for (const a of attempts) {
    const url = buildFmtUrl(baseUrl, a.fmt);
    const resp = await fetchTextWithMeta(url);
    const body = resp?.text || "";
    lastNonEmptyResponse = body || lastNonEmptyResponse;
    const text = a.parse(body);
    debug.push({
      fmt: a.fmt || "(none)",
      status: resp?.statusCode,
      contentType: String(resp?.headers?.["content-type"] || ""),
      contentLength: String(resp?.headers?.["content-length"] || ""),
      byteLength: Buffer.byteLength(String(body || ""), "utf8"),
      snippet: String(body || "").slice(0, 180).replace(/\s+/g, " ").trim()
    });
    if (text) {
      return { text, langUsed: track?.languageCode || "", availableLangs: available };
    }
  }

  const resp = String(lastNonEmptyResponse || "");
  if (/^\s*<!doctype\s+html\b/i.test(resp) || /^\s*<html\b/i.test(resp)) {
    throw new Error(`Empty transcript (captionTracks returned HTML). debug=${JSON.stringify(debug)}`);
  }
  throw new Error(`Empty transcript. debug=${JSON.stringify(debug)}`);
};

const fetchTranscriptText = async (videoId, preferredLang) => {
  const langsTried = [];
  let availableLangs = [];

  const baseLangs = preferredLang
    ? [preferredLang, "en", "en-US", "en-GB"]
    : ["en", "en-US", "en-GB"];

  const candidates = Array.from(new Set(baseLangs)).filter(Boolean);
  let lastErr = null;

  const tryLang = async (lang) => {
    langsTried.push(lang);
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang });
    const transcriptText = transcript.map((t) => t.text).join(" ");
    const cleaned = cleanText(transcriptText);
    if (!cleaned) throw new Error("Empty transcript");
    return cleaned;
  };

  for (const lang of candidates) {
    try {
      const text = await tryLang(lang);
      return { text, langUsed: lang, langsTried, availableLangs };
    } catch (e) {
      lastErr = e;
      const parsed = parseAvailableTranscriptLangs(e?.message);
      if (parsed.length) {
        availableLangs = parsed;
        const prioritized = availableLangs[0];
        if (prioritized) {
          try {
            const text = await tryLang(prioritized);
            return { text, langUsed: prioritized, langsTried, availableLangs };
          } catch (e2) {
            lastErr = e2;
          }
        }
      }
    }
  }

  if (availableLangs.length) {
    for (const lang of availableLangs) {
      try {
        const text = await tryLang(lang);
        return { text, langUsed: lang, langsTried, availableLangs };
      } catch (e) {
        lastErr = e;
      }
    }
  }

  try {
    langsTried.push("(auto)");
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const transcriptText = transcript.map((t) => t.text).join(" ");
    const cleaned = cleanText(transcriptText);
    if (cleaned) return { text: cleaned, langUsed: "(auto)", langsTried, availableLangs };
  } catch (e) {
    lastErr = e;
    const parsed = parseAvailableTranscriptLangs(e?.message);
    if (parsed.length) availableLangs = parsed;
  }

  try {
    langsTried.push("(timedtextApi)");
    const viaTimedtext = await fetchTranscriptViaTimedtextApi(videoId, preferredLang);
    return {
      text: viaTimedtext.text,
      langUsed: viaTimedtext.langUsed,
      langsTried,
      availableLangs
    };
  } catch (e) {
    lastErr = e;
  }

  try {
    langsTried.push("(captionTracks)");
    const viaTracks = await fetchTranscriptViaCaptionTracks(videoId, preferredLang);
    return {
      text: viaTracks.text,
      langUsed: viaTracks.langUsed,
      langsTried,
      availableLangs: viaTracks.availableLangs || availableLangs
    };
  } catch (e) {
    lastErr = e;
  }

  const msg = lastErr?.message ? String(lastErr.message) : "Transcript unavailable";
  const err = new Error(msg);
  err.langsTried = langsTried;
  err.availableLangs = availableLangs;
  throw err;
};

const normalizeAiRecipeToSchema = (recipe) => {
  const title = recipe?.title ? String(recipe.title).trim() : "";

  const ingredientsRaw = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  const ingredients = ingredientsRaw
    .map((ing) => {
      if (typeof ing === "string") return ing;
      if (ing && typeof ing === "object") {
        const name = ing.name ? String(ing.name).trim() : "";
        const qty = ing.quantity ? String(ing.quantity).trim() : "";
        if (!name && !qty) return "";
        return qty ? `${qty} ${name}`.trim() : name;
      }
      return "";
    })
    .map((s) => String(s).trim())
    .filter(Boolean);

  const stepsField =
    recipe?.steps ??
    recipe?.instructions ??
    recipe?.directions ??
    recipe?.method ??
    "";

  const stepsFromString = (value) => {
    const text = String(value || "");
    if (!text.trim()) return [];

    const extracted = extractStepsFromText(text);
    if (extracted.length) return extracted;

    const lines = text
      .replace(/\r/g, "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length > 1) return lines;

    const one = lines[0] || "";
    if (!one) return [];

    const parts = one
      .split(/\s*(?=(?:step\s*\d+\s*[:\-]|\d+[\)\.\-]\s+))/i)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        const m = p.match(/^(?:step\s*\d+\s*[:\-]|\d+[\)\.\-]\s+)(.+)$/i);
        return cleanText(m && m[1] ? m[1] : p);
      })
      .filter(Boolean);

    return parts.length ? parts : [cleanText(one)].filter(Boolean);
  };

  const steps = Array.isArray(stepsField)
    ? stepsField.map((s) => String(s).trim()).filter(Boolean)
    : stepsFromString(stepsField);

  const cookingTime = recipe?.cookTime
    ? String(recipe.cookTime).trim()
    : recipe?.cookingTime
      ? String(recipe.cookingTime).trim()
      : "";
  const difficulty = recipe?.difficulty ? String(recipe.difficulty).trim() : "";
  const image = recipe?.image ? String(recipe.image).trim() : "";

  return {
    title,
    ingredients,
    steps,
    cookingTime,
    difficulty,
    image
  };
};

const fetchYouTubeTitleAndDescription = async (youtubeUrl) => {
  let title = "";
  let description = "";

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
    if (typeof fetch === "function") {
      const response = await fetch(oembedUrl);
      if (response.ok) {
        const data = await response.json();
        if (data?.title) title = String(data.title);
      }
    } else {
      title = await new Promise((resolve) => {
        https
          .get(oembedUrl, (resp) => {
            let data = "";
            resp.on("data", (chunk) => {
              data += chunk;
            });
            resp.on("end", () => {
              try {
                const parsed = JSON.parse(data);
                resolve(parsed?.title ? String(parsed.title) : "");
              } catch {
                resolve("");
              }
            });
          })
          .on("error", () => resolve(""));
      });
    }
  } catch {
  }

  try {
    const videoId = extractVideoId(youtubeUrl);
    if (videoId) {
      const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
      const html = await httpsGetText(watchUrl);
      const player = extractCaptionsFromWatchHtml(html);
      const vd = player?.videoDetails;
      if (!title && vd?.title) title = String(vd.title);
      if (vd?.shortDescription) description = String(vd.shortDescription);
    }
  } catch {
  }

  const cleanedTitle = cleanText(title);
  const cleanedDesc = cleanText(description);
  return {
    title: cleanedTitle,
    description: cleanedDesc ? cleanedDesc.slice(0, 12000) : ""
  };
};

const fetchYouTubeDescription = async (youtubeUrl) => {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
    if (typeof fetch === "function") {
      const response = await fetch(oembedUrl);
      if (!response.ok) return "";
      const data = await response.json();
      return data?.title ? String(data.title) : "";
    }

    return await new Promise((resolve) => {
      https
        .get(oembedUrl, (resp) => {
          let data = "";
          resp.on("data", (chunk) => {
            data += chunk;
          });
          resp.on("end", () => {
            try {
              const parsed = JSON.parse(data);
              resolve(parsed?.title ? String(parsed.title) : "");
            } catch {
              resolve("");
            }
          });
        })
        .on("error", () => resolve(""));
    });
  } catch {
    return "";
  }
};

let cachedGeminiClient = null;

const tryGeminiModel = async (genAI, modelName) => {
  const model = genAI.getGenerativeModel({ model: modelName });
  await model.generateContent("ping");
  return { model, modelName };
};

const listGeminiModels = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
  return await new Promise((resolve, reject) => {
    https
      .get(url, (resp) => {
        let data = "";
        resp.on("data", (chunk) => {
          data += chunk;
        });
        resp.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (!resp.statusCode || resp.statusCode < 200 || resp.statusCode >= 300) {
              const msg = parsed?.error?.message || `HTTP ${resp.statusCode}`;
              return reject(new Error(msg));
            }

            const models = Array.isArray(parsed?.models) ? parsed.models : [];
            resolve(
              models.map((m) => ({
                name: (m.name || "").replace(/^models\//, ""),
                supportedGenerationMethods: m.supportedGenerationMethods || []
              }))
            );
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", (e) => reject(e));
  });
};

const getGeminiClient = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  if (cachedGeminiClient) return cachedGeminiClient;

  const genAI = new GoogleGenerativeAI(apiKey);

  const preferred = (process.env.GEMINI_MODEL || "gemini-1.5-flash").trim();
  const priority = [
    preferred,
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-pro-latest",
    "gemini-1.5-pro"
  ];

  try {
    const models = await listGeminiModels();
    const availableGenerateContent = (models || [])
      .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"))
      .map((m) => m.name)
      .filter(Boolean);

    const candidates = Array.from(new Set([...priority, ...availableGenerateContent]));
    for (const name of candidates) {
      try {
        cachedGeminiClient = await tryGeminiModel(genAI, name);
        console.log(`Gemini model selected: ${cachedGeminiClient.modelName}`);
        return cachedGeminiClient;
      } catch {
      }
    }

    return null;
  } catch {
    for (const name of priority) {
      try {
        cachedGeminiClient = await tryGeminiModel(genAI, name);
        console.log(`Gemini model selected: ${cachedGeminiClient.modelName}`);
        return cachedGeminiClient;
      } catch {
      }
    }

    return null;
  }
};



// ✅ ONLY THIS CORS
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://my-personal-chef-pi.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

app.use(express.json());


const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

// Finds user even if DB stored email has leading/trailing spaces or different casing.
const findUserByEmailInsensitive = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const escaped = escapeRegex(normalizedEmail);
  return User.findOne({
    email: new RegExp(`^\\s*${escaped}\\s*$`, "i")
  });
};



// connect MongoDB


// test route
app.get("/", (req, res) => {
  res.send("My Personal Chef backend running");
});

app.get("/api/ai/import-recipe", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/ai/models", async (req, res) => {
  try {
    const models = await listGeminiModels();
    if (!models) {
      return res.status(500).json({ status: "error", message: "GEMINI_API_KEY is not configured" });
    }
    return res.json({ status: "ok", models });
  } catch (error) {
    console.error("List models error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to list models",
      details: error?.message || "Unknown error"
    });
  }
});

app.post("/api/ai/import-recipe", async (req, res) => {
  let modelTried = null;
  try {
    const { youtubeUrl, transcriptLang } = req.body || {};
    if (!youtubeUrl || typeof youtubeUrl !== "string") {
      return res.status(400).json({
        status: "error",
        message: "youtubeUrl is required"
      });
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({
        status: "error",
        message: "Invalid YouTube URL"
      });
    }

    const gemini = await getGeminiClient();
    modelTried = gemini?.modelName || null;
    if (!gemini?.model) {
      return res.status(500).json({
        status: "error",
        message: "No available Gemini model found for this API key"
      });
    }

    let source = "transcript";
    let inputText = "";

    const transcriptMeta = {
      attempted: true,
      success: false,
      error: ""
    };

    const ytMeta = await fetchYouTubeTitleAndDescription(youtubeUrl);
    const titleFromOembed = ytMeta?.title || "";
    const descriptionFromWatch = ytMeta?.description || "";
    try {
      const transcriptResult = await fetchTranscriptText(videoId, transcriptLang);
      const cleanedTranscript = transcriptResult?.text || "";
      transcriptMeta.langUsed = transcriptResult?.langUsed || "";
      transcriptMeta.langsTried = transcriptResult?.langsTried || [];
      transcriptMeta.availableLangs = transcriptResult?.availableLangs || [];
      transcriptMeta.success = true;
      source = "transcript";
      inputText = `${titleFromOembed ? `Title: ${titleFromOembed}\n` : ""}Transcript: ${cleanedTranscript}`;
    } catch (e) {
      transcriptMeta.error = e?.message ? String(e.message) : "Transcript unavailable";
      transcriptMeta.langsTried = e?.langsTried || [];
      transcriptMeta.availableLangs = e?.availableLangs || [];
      if (!titleFromOembed) {
        return res.status(200).json({
          status: "partial",
          message: "Transcript not available. Please complete manually.",
          source: "none",
          confidence: 0,
          transcript: transcriptMeta,
          recipe: {
            title: "",
            ingredients: [],
            steps: [],
            cookingTime: "",
            difficulty: ""
          }
        });
      }

      source = "description";
      inputText = `${titleFromOembed ? `Title: ${titleFromOembed}\n` : ""}${descriptionFromWatch ? `Description: ${descriptionFromWatch}` : ""}`;
    }

    const prompt = `You are an assistant that extracts cooking recipes.

From the text below, extract and return ONLY valid JSON
in the following format:

{
  "title": "",
  "ingredients": [
    { "name": "", "quantity": "" }
  ],
  "steps": [],
  "cookTime": "",
  "difficulty": ""
}

Rules:
- Do not hallucinate ingredients
- If information is missing, return empty string
- Do not add extra text

TEXT:
<<<${inputText}>>>`;

    const result = await gemini.model.generateContent(prompt);
    const responseText = result?.response?.text ? result.response.text() : "";
    const jsonCandidate = extractJsonObject(responseText);
    if (!jsonCandidate) {
      return res.status(200).json({
        status: "partial",
        message: "AI returned an unreadable response. Please complete manually.",
        source,
        confidence: 0,
        recipe: {
          title: titleFromOembed || "",
          ingredients: [],
          steps: [],
          cookingTime: "",
          difficulty: ""
        }
      });
    }

    let aiRecipe;
    try {
      aiRecipe = JSON.parse(jsonCandidate);
    } catch {
      return res.status(200).json({
        status: "partial",
        message: "AI JSON parse failed. Please complete manually.",
        source,
        confidence: 0,
        recipe: {
          title: titleFromOembed || "",
          ingredients: [],
          steps: [],
          cookingTime: "",
          difficulty: ""
        }
      });
    }

    const normalized = normalizeAiRecipeToSchema(aiRecipe);

    if (!normalized.image) {
      normalized.image = getYouTubeThumbnailUrl(videoId);
    }
    if (source === "description") {
      if (!normalized.steps || !normalized.steps.length) {
        const extractedSteps = extractStepsFromText(descriptionFromWatch);
        if (extractedSteps.length) normalized.steps = extractedSteps;
      }
      if (!normalized.cookingTime) {
        const extractedTime = extractCookingTimeFromText(descriptionFromWatch);
        if (extractedTime) normalized.cookingTime = extractedTime;
      }
      if (!normalized.difficulty) {
        const extractedDiff = extractDifficultyFromText(`${titleFromOembed}\n${descriptionFromWatch}`);
        if (extractedDiff) normalized.difficulty = extractedDiff;
      }
    }
    const confidence = confidenceScore({
      title: normalized.title,
      ingredients: normalized.ingredients,
      steps: normalized.steps
    });

    return res.json({
      status: "ok",
      source,
      confidence,
      recipe: normalized,
      model: gemini.modelName,
      transcript: transcriptMeta
    });
  } catch (error) {
    console.error("AI import error:", error);
    return res.status(500).json({
      status: "error",
      message: "AI import failed",
      details: error?.message || "Unknown error",
      modelTried,
      apiStatus: error?.status,
      apiStatusText: error?.statusText
    });
  }
});

// CREATE USER (NO HASHING)
app.post("/create-user", async (req, res) => {
  try {
    console.log("Signup body:", req.body);

    const { name, email, password, role } = req.body;

    // ✅ Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ✅ Simple DB check
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = new User({
      name,
      email: normalizedEmail,
      password,
      role: role || "user"
    });

    await newUser.save();

    res.json({ message: "User created successfully" });

  } catch (err) {
    console.error("Signup error FULL:", err);
    res.status(500).json({ error: err.message });
  }
});

// LOGIN (PLAIN CHECK)
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await findUserByEmailInsensitive(normalizedEmail);

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ error: "Wrong password" });
    }

    res.json({
      message: "Login successful",
      role: user.role,
      name: user.name
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});
app.post("/add-recipe", async (req, res) => {
  try {
    const { title, ingredients, steps, image, rating, cookingTime, difficulty, category, type, servings, heatLevel, youtubeUrl } = req.body;

    const newRecipe = new Recipe({
      title,
      ingredients,
      steps,
      image,
      rating,
      cookingTime,
      difficulty,
      category,
      type,
      servings,
      heatLevel,
      youtubeUrl
    });

    await newRecipe.save();
    res.json({ message: "Recipe added successfully", recipe: newRecipe });
  } catch (error) {
    res.status(400).send("Error adding recipe");
  }
});

app.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(400).send("Error fetching recipes");
  }
});

app.get("/recipes/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).send("Recipe not found");
    }
    res.json(recipe);
  } catch (error) {
    res.status(400).send("Error fetching recipe");
  }
});

app.delete("/recipes/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).send("Recipe not found");
    }
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(400).send("Error deleting recipe");
  }
});

app.put("/recipes/:id", async (req, res) => {
  try {
    const { title, ingredients, steps, image, rating, cookingTime, difficulty, category, type, servings, heatLevel, youtubeUrl } = req.body;
    
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        title,
        ingredients,
        steps,
        image,
        rating,
        cookingTime,
        difficulty,
        category,
        type,
        servings,
        heatLevel,
        youtubeUrl
      },
      { new: true }
    );
    
    if (!recipe) {
      return res.status(404).send("Recipe not found");
    }
    res.json({ message: "Recipe updated successfully", recipe });
  } catch (error) {
    res.status(400).send("Error updating recipe");
  }
});

app.post("/recipes/pantry-match", async (req, res) => {
  try {
    const { ingredients } = req.body;
    
    console.log("🔍 Pantry Match Request - User ingredients:", ingredients);
    
    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: "Please provide ingredients" });
    }

    if (ingredients.length < 3) {
      return res.status(400).json({ error: "Please provide at least 3 ingredients" });
    }

    const recipes = await Recipe.find();
    console.log(`📚 Total recipes in database: ${recipes.length}`);
    
    const matchedRecipes = recipes.map(recipe => {
      const recipeIngredients = recipe.ingredients.map(ing => ing.toLowerCase());
      const userIngredients = ingredients.map(ing => ing.toLowerCase());
      
      let matchCount = 0;
      userIngredients.forEach(userIng => {
        if (recipeIngredients.some(recipeIng => 
          recipeIng.includes(userIng) || userIng.includes(recipeIng)
        )) {
          matchCount++;
        }
      });
      
      return {
        ...recipe.toObject(),
        matchCount
      };
    }).filter(recipe => recipe.matchCount >= 3)
      .sort((a, b) => b.matchCount - a.matchCount);
    
    console.log(`✅ Found ${matchedRecipes.length} matching recipes`);
    if (matchedRecipes.length > 0) {
      console.log("Top matches:", matchedRecipes.slice(0, 3).map(r => ({ title: r.title, matches: r.matchCount })));
    }
    
    res.json(matchedRecipes);
  } catch (error) {
    console.error("❌ Pantry match error:", error);
    res.status(500).json({ error: "Error finding matching recipes" });
  }
});

app.get("/favorites/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = await findUserByEmailInsensitive(normalizedEmail);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ favorites: user.favorites || [] });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ error: "Error fetching favorites" });
  }
});

app.post("/favorites/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { recipeId } = req.body;

    const normalizedEmail = normalizeEmail(email);
    const normalizedRecipeId = String(recipeId || "").trim();

    if (!normalizedEmail) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!normalizedRecipeId) {
      return res.status(400).json({ error: "recipeId is required" });
    }

    const user = await User.findOneAndUpdate(
      { email: new RegExp(`^\\s*${escapeRegex(normalizedEmail)}\\s*$`, "i") },
      { $addToSet: { favorites: normalizedRecipeId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Added to favorites", favorites: user.favorites || [] });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({ error: "Error adding favorite" });
  }
});

app.delete("/favorites/:email/:recipeId", async (req, res) => {
  try {
    const { email, recipeId } = req.params;

    const normalizedEmail = normalizeEmail(email);
    const normalizedRecipeId = String(recipeId || "").trim();

    if (!normalizedEmail) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!normalizedRecipeId) {
      return res.status(400).json({ error: "recipeId is required" });
    }

    const user = await User.findOneAndUpdate(
      { email: new RegExp(`^\\s*${escapeRegex(normalizedEmail)}\\s*$`, "i") },
      { $pull: { favorites: normalizedRecipeId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Removed from favorites", favorites: user.favorites || [] });
  } catch (error) {
    console.error("Remove favorite error:", error);
    res.status(500).json({ error: "Error removing favorite" });
  }
});

// Feedback API endpoints
const Feedback = require('./models/Feedback');

// Submit feedback
// Submit feedback
app.post('/api/feedback', async (req, res) => {
  try {
    console.log('Received feedback data:', req.body);
    const { recipeId, recipeTitle, name, email, rating, comment } = req.body;
    
    // Input validation
    if (!recipeId || !name || !email || !rating) {
      console.error('Missing required fields:', { recipeId, name, email, rating });
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        receivedData: { recipeId, name, email, rating }
      });
    }

    const feedback = new Feedback({
      recipeId,
      recipeTitle: recipeTitle || 'Untitled Recipe',
      name,
      email,
      rating: parseInt(rating, 10),
      comment: comment || '',
      status: 'pending',
      createdAt: new Date()
    });

    const savedFeedback = await feedback.save();
    console.log('Feedback saved successfully:', savedFeedback);
    
    res.status(201).json({ 
      success: true, 
      message: 'Feedback submitted successfully', 
      feedback: savedFeedback 
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to submit feedback', 
      details: error.message
    });
  }
});
// Get all feedback (for admin)
app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Update feedback status (for admin)
app.patch('/api/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!updatedFeedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json({
      success: true,
      message: 'Feedback status updated',
      feedback: updatedFeedback
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({ error: 'Failed to update feedback status' });
  }
});

// Delete feedback (for admin)
app.delete('/api/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFeedback = await Feedback.findByIdAndDelete(id);
    
    if (!deletedFeedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

