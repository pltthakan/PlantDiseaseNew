import { Platform } from "react-native";

const IOS_SIM = "http://localhost:5000";
const ANDROID_EMU = "http://10.0.2.2:5000";

// Gerçek cihaz için: http://MAC_IP:5000 (aşağıda komut verdim)
export const BASE_URL = Platform.OS === "android" ? ANDROID_EMU : IOS_SIM;

async function readJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || "İstek başarısız");
  return data;
}

export async function registerApi(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return readJson(res) as Promise<{ message: string; user_id: number }>;
}

export async function loginApi(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return readJson(res) as Promise<{ message: string; user_id: number }>;
}

export async function historyApi(userId: number) {
  const res = await fetch(`${BASE_URL}/api/history?user_id=${userId}`);
  return readJson(res) as Promise<
    { id: number; class_name: string; confidence: number; created_at: string }[]
  >;
}

export async function predictApi(opts: {
  userId: number;
  image: { uri: string; name: string; type: string };
}) {
  const form = new FormData();
  form.append("user_id", String(opts.userId));
  // @ts-ignore (RN FormData file type)
  form.append("image", opts.image);

  const res = await fetch(`${BASE_URL}/api/predict`, {
    method: "POST",
    body: form,
  });
  return readJson(res) as Promise<{
    class_name: string;
    confidence: number;
    prediction_id: number;
    created_at: string;
  }>;
}
