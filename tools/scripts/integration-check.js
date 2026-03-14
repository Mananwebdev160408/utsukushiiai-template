const fs = require("fs");
const path = require("path");

async function main() {
  const api = "http://localhost:4000";
  const now = Date.now();
  const cwd = process.cwd();
  const wavPath = path.join(cwd, "apps", "api", "uploads", "audio", `integration_${now}.wav`);
  const mangaPath = path.join(cwd, "apps", "web", "public", "images", "hero.png");

  const sampleRate = 22050;
  const seconds = 1;
  const numSamples = sampleRate * seconds;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate;
    const sample = Math.max(-1, Math.min(1, Math.sin(2 * Math.PI * 440 * t)));
    buffer.writeInt16LE(Math.floor(sample * 32767), 44 + i * 2);
  }
  fs.writeFileSync(wavPath, buffer);

  const registerRes = await fetch(`${api}/v1/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: `bridge_${now}@uts.local`,
      password: "DevPass123!",
      username: `bridge_${now}`,
      displayName: "Bridge Test",
    }),
  });
  const registerJson = await registerRes.json();
  if (!registerRes.ok) throw new Error(JSON.stringify(registerJson));

  const token = registerJson.data.accessToken;
  const authHeaders = {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };

  const projectRes = await fetch(`${api}/v1/projects`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ title: `Bridge ${now}`, aspectRatio: "9:16" }),
  });
  const projectJson = await projectRes.json();
  if (!projectRes.ok) throw new Error(JSON.stringify(projectJson));
  const projectId = projectJson.data.project._id;

  const mangaForm = new FormData();
  mangaForm.append("file", new Blob([fs.readFileSync(mangaPath)]), "hero.png");
  mangaForm.append("projectId", projectId);
  mangaForm.append("chapterNumber", "1");
  mangaForm.append("chapterTitle", "Chapter 1");
  const mangaRes = await fetch(`${api}/v1/upload/file/manga`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: mangaForm,
  });
  const mangaJson = await mangaRes.json();
  if (!mangaRes.ok) throw new Error(JSON.stringify(mangaJson));

  const audioForm = new FormData();
  audioForm.append("file", new Blob([fs.readFileSync(wavPath)]), "integration.wav");
  audioForm.append("projectId", projectId);
  const audioRes = await fetch(`${api}/v1/upload/file/audio`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: audioForm,
  });
  const audioJson = await audioRes.json();
  if (!audioRes.ok) throw new Error(JSON.stringify(audioJson));

  const renderRes = await fetch(`${api}/v1/render/start`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      projectId,
      settings: {
        quality: "draft",
        resolution: "720x1280",
        fps: 24,
        format: "mp4",
      },
    }),
  });
  const renderJson = await renderRes.json();
  if (!renderRes.ok) throw new Error(JSON.stringify(renderJson));
  const jobId = renderJson.data.job._id;

  let jobJson = null;
  for (let i = 0; i < 8; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const jobRes = await fetch(`${api}/v1/render/${jobId}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    jobJson = await jobRes.json();
    const status = jobJson?.data?.job?.status;
    if (["processing", "completed", "failed", "cancelled"].includes(status)) {
      break;
    }
  }

  const projectStateRes = await fetch(`${api}/v1/projects/${projectId}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const projectStateJson = await projectStateRes.json();

  console.log(
    JSON.stringify(
      {
        projectId,
        jobId,
        mangaUpload: mangaJson.status,
        audioUpload: audioJson.status,
        jobStatus: jobJson?.data?.job?.status,
        jobProgress: jobJson?.data?.job?.progress,
        projectStatus: projectStateJson?.data?.project?.status,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(String(error));
  process.exit(1);
});
