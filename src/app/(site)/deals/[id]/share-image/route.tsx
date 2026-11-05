import { ImageResponse } from "next/og";
import { getCategory } from "@/data/categories";
import { siteConfig } from "@/config/site";
import { getOfferById } from "@/lib/data/repository";
import { hostname } from "@/lib/format";

export const runtime = "nodejs";

/** Heebo, only the glyphs used, from Google Fonts (fetched when the picture is made). */
async function loadFont(text: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=Heebo:wght@${weight}&text=${encodeURIComponent(text)}`,
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

async function dataUri(origin: string, path: string, mime: string): Promise<string | null> {
  try {
    const res = await fetch(`${origin}${path}`);
    if (!res.ok) return null;
    return `data:${mime};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}


/**
 * The picture maker lays text out left to right without handling Hebrew direction, so Hebrew is
 * turned into visual order here: words in reverse order, letters of each Hebrew word reversed,
 * numbers and Latin text left as they are.
 */
function visual(text: string): string {
  const tokens = text.match(/[\u0590-\u05FF]+|[A-Za-z0-9%.:₪+\-/]+|\s+|[^]/g) ?? [];
  return tokens
    .map((t) => (/^[\u0590-\u05FF]+$/.test(t) ? Array.from(t).reverse().join("") : t))
    .reverse()
    .join("");
}

/** Splits text into lines of at most `max` characters (by words), each in visual order. */
function visualLines(text: string, max: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (line && (line + " " + word).length > max) {
      out.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) out.push(line);
  return out.slice(0, 3).map(visual);
}

const CHANNEL: Record<string, string> = {
  online: "אונליין",
  store: "בחנות",
  both: "אונליין ובחנות",
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const offer = await getOfferById((await params).id);
  const origin = new URL(req.url).origin;
  if (!offer) return Response.redirect(`${origin}/brand/og.jpg`, 302);

  const category = getCategory(offer.business.category);
  const until = offer.validUntil
    ? new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long" }).format(new Date(offer.validUntil))
    : null;
  const lines = {
    category: category?.name ?? "",
    business: offer.business.name,
    title: offer.title,
    value: offer.valueLabel,
    channel: offer.redeemChannel ? (CHANNEL[offer.redeemChannel] ?? "") : "",
    until: until ? `בתוקף עד ${until}` : "",
    usage: offer.usageLimit ?? "",
    cta: offer.couponCode && (offer.codeMode ?? "fixed") === "fixed" ? "קוד הקופון מתחת לתמונה" : "הקוד והפרטים באתר",
    brand: "ליקי",
    slogan: "יש לי קישור בשבילך",
    host: hostname(siteConfig.url),
  };
  const all = Object.values(lines).join("") + "0123456789%₪-";
  const [bold, regular, logo] = await Promise.all([
    loadFont(all, 800),
    loadFont(all, 500),
    dataUri(origin, "/brand/liky-icon.png", "image/png"),
  ]);
  const fonts: { name: string; data: ArrayBuffer; weight: 500 | 800 }[] = [];
  if (bold) fonts.push({ name: "Heebo", data: bold, weight: 800 });
  if (regular) fonts.push({ name: "Heebo", data: regular, weight: 500 });

  const pill = (text: string, key: string) =>
    text ? (
      <div
        key={key}
        style={{
          display: "flex",
          background: "#fff0f0",
          color: "#3f1d20",
          fontSize: 34,
          fontWeight: 500,
          padding: "10px 26px",
          borderRadius: 999,
        }}
      >
        {visual(text)}
      </div>
    ) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#fdeaea",
          padding: 56,
          fontFamily: "Heebo",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            background: "#ffffff",
            borderRadius: 56,
            padding: "52px 56px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {lines.category ? (
              <div style={{ display: "flex", fontSize: 32, fontWeight: 500, color: "#7a5558" }}>
                {visual(lines.category)}
              </div>
            ) : (
              <div style={{ display: "flex" }} />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{ display: "flex", fontSize: 54, fontWeight: 800, color: "#c4050b" }}>{visual(lines.brand)}</div>
                <div style={{ display: "flex", fontSize: 28, fontWeight: 500, color: "#7a5558" }}>{visual(lines.slogan)}</div>
              </div>
              {logo ? <img src={logo} width={84} height={84} alt="" /> : null}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
            <div
              style={{
                display: "flex",
                background: "#b8201b",
                color: "#ffffff",
                fontSize: lines.value.length > 9 ? 120 : 190,
                fontWeight: 800,
                padding: "10px 64px 22px",
                borderRadius: 64,
                lineHeight: 1.1,
              }}
            >
              {visual(lines.value)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {visualLines(lines.business, 18).map((l, i) => (
                <div key={i} style={{ display: "flex", fontSize: 76, fontWeight: 800, color: "#3f1d20" }}>
                  {l}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {visualLines(lines.title, 26).map((l, i) => (
                <div key={i} style={{ display: "flex", fontSize: 46, fontWeight: 500, color: "#7a5558" }}>
                  {l}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, marginTop: 8 }}>
              {pill(lines.channel, "c")}
              {pill(lines.until, "u")}
              {pill(lines.usage, "l")}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                background: "#c4050b",
                color: "#ffffff",
                fontSize: 50,
                fontWeight: 800,
                padding: "16px 70px 22px",
                borderRadius: 999,
              }}
            >
              {visual(lines.cta)}
            </div>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 500, color: "#7a5558" }}>{lines.host}</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts,
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
    },
  );
}
