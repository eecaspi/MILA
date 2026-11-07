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

/**
 * A picture from our own storage as an inline image. The site's image optimizer turns any upload
 * (WebP, AVIF, big files) into a JPEG the picture maker can use; the original is the fallback.
 */
async function remoteImage(url: string | undefined, origin: string, width = 1080): Promise<string | null> {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || !u.hostname.endsWith(".supabase.co")) return null;
    const tries: { href: string; headers: Record<string, string> }[] = [
      {
        href: `${origin}/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=85`,
        headers: { Accept: "image/jpeg" },
      },
      { href: u.href, headers: {} },
    ];
    for (const t of tries) {
      try {
        const res = await fetch(t.href, { headers: t.headers, signal: AbortSignal.timeout(5000) });
        const type = res.headers.get("content-type")?.split(";")[0] ?? "";
        if (!res.ok || (type !== "image/png" && type !== "image/jpeg")) continue;
        const bytes = Buffer.from(await res.arrayBuffer());
        if (bytes.length > 3_000_000) continue;
        return `data:${type};base64,${bytes.toString("base64")}`;
      } catch {
        /* try the next way */
      }
    }
    return null;
  } catch {
    return null;
  }
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
    value: /^\d+%$/.test(offer.valueLabel.trim()) ? `${offer.valueLabel.trim()} הנחה` : offer.valueLabel,
    channel: offer.redeemChannel ? (CHANNEL[offer.redeemChannel] ?? "") : "",
    until: until ? `בתוקף עד ${until}` : "",
    usage: offer.usageLimit ?? "",
    header: "הטבה חדשה בליקי",
    sub: [offer.business.name, category?.name].filter(Boolean).join(" · "),
    cta: "קוד הקופון מתחת לתמונה",
    host: hostname(siteConfig.url),
  };
  const showCodeNote = (offer.codeMode ?? "fixed") === "fixed";
  const all = Object.values(lines).join("") + "0123456789%₪-";
  const [bold, regular, logo, photo, bizLogo] = await Promise.all([
    loadFont(all, 800),
    loadFont(all, 500),
    dataUri(origin, "/brand/liky-icon.png", "image/png"),
    remoteImage(offer.imageUrl, origin),
    remoteImage(offer.business.logoUrl, origin, 400),
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
          fontSize: 36,
          fontWeight: 700,
          padding: "10px 28px",
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
          background: "#b8201b",
          padding: 48,
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
            padding: "48px 52px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 500, color: "#7a5558" }}>{visual(lines.header)}</div>
            {logo ? <img src={logo} width={110} height={110} alt="" /> : <div style={{ display: "flex" }} />}
          </div>

          <div style={{ display: "flex", position: "relative", width: "100%", height: 480 }}>
            {photo ? (
              <img
                src={photo}
                width={928}
                height={480}
                alt=""
                style={{ width: "100%", height: 480, objectFit: "cover", borderRadius: 36 }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: 480,
                  borderRadius: 36,
                  background: "#fdeaea",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {bizLogo ? (
                  <img src={bizLogo} width={260} height={260} alt="" style={{ objectFit: "contain", borderRadius: 999 }} />
                ) : logo ? (
                  <img src={logo} width={220} height={220} alt="" />
                ) : null}
              </div>
            )}
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: 20,
                right: 20,
                background: "#b8201b",
                color: "#ffffff",
                fontSize: lines.value.length > 9 ? 54 : 72,
                fontWeight: 800,
                padding: "6px 34px 14px",
                borderRadius: 36,
                lineHeight: 1.1,
              }}
            >
              {visual(lines.value)}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 500, color: "#7a5558" }}>
              {visual(lines.sub)}
            </div>
            {visualLines(lines.title, 22).slice(0, 2).map((l, i) => (
              <div key={i} style={{ display: "flex", fontSize: 76, fontWeight: 800, color: "#3f1d20", lineHeight: 1.1 }}>
                {l}
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "row-reverse", flexWrap: "wrap", gap: 14, marginTop: 8 }}>
              {pill(lines.channel, "c")}
              {pill(lines.until, "u")}
              {pill(lines.usage, "l")}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            {showCodeNote ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  background: "#b8201b",
                  color: "#ffffff",
                  fontSize: 54,
                  fontWeight: 800,
                  padding: "18px 0 26px",
                  borderRadius: 999,
                }}
              >
                {visual(lines.cta)}
              </div>
            ) : null}
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
