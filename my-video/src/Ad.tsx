import { Video } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const sans = "AdMontserrat";
const script = "AdPacifico";
const ranges = {
  cyrillic: "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116",
  latin: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
};
for (const subset of ["cyrillic", "latin"] as const) {
  for (const w of ["700", "800", "900"]) {
    loadFont({
      family: sans,
      url: staticFile(`fonts/montserrat-${subset}-${w}-normal.woff2`),
      weight: w,
      unicodeRange: ranges[subset],
    });
  }
  loadFont({
    family: script,
    url: staticFile(`fonts/pacifico-${subset}-400-normal.woff2`),
    weight: "400",
    unicodeRange: ranges[subset],
  });
}

const PINK = "#ff2d8f";
const HOT = "#ff5e3a";
const GOLD = "#ffd23f";
const VIOLET = "#8a3dff";
const MINT = "#2de2c5";

// ---------- Sparkles ----------
const Sparkle: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ overflow: "visible" }}>
    <path
      d="M0 -48 C4 -14 14 -4 48 0 C14 4 4 14 0 48 C-4 14 -14 4 -48 0 C-14 -4 -4 -14 0 -48Z"
      fill={color}
      style={{ filter: `drop-shadow(0 0 12px ${color})` }}
    />
  </svg>
);

const Heart: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: "visible" }}>
    <path
      d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"
      fill={color}
      style={{ filter: `drop-shadow(0 0 10px ${color})` }}
    />
  </svg>
);

const COLORS = [GOLD, "#ffffff", PINK, MINT, "#ffb3e6"];

const FloatingStars: React.FC<{ count: number }> = ({ count }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x0 = random(`x${i}`) * width;
        const speed = 90 + random(`s${i}`) * 220; // px per second, upward
        const phase = random(`p${i}`) * height;
        const y = height + 120 - ((phase + (frame / fps) * speed) % (height + 240));
        const sway = Math.sin(frame / 14 + i * 2) * 40;
        const size = 34 + random(`z${i}`) * 80;
        const twinkle = 0.65 + 0.45 * Math.abs(Math.sin(frame / 7 + i));
        const isHeart = i % 6 === 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x0 + sway,
              top: y,
              scale: String(twinkle),
              rotate: `${(frame * (i % 2 ? 4 : -4)) % 360}deg`,
            }}
          >
            {isHeart ? (
              <Heart size={size * 0.8} color={PINK} />
            ) : (
              <Sparkle size={size} color={COLORS[i % COLORS.length]} />
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- Message cards ----------
type CardProps = {
  readonly from: number;
  readonly duration: number;
  readonly x: number;
  readonly y: number;
  readonly rot: number;
  readonly name: string;
  readonly text: string;
  readonly color: string;
  readonly side: "left" | "right";
};

const MessageCard: React.FC<CardProps> = ({ from, duration, x, y, rot, name, text, color, side }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - from;
  if (local < -2 || local > duration + 12) return null;
  const enter = spring({ frame: local, fps, config: { damping: 11, stiffness: 160 } });
  const exit = interpolate(local, [duration, duration + 10], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bob = Math.sin((frame + x) / 12) * 14;
  const slide = (1 - enter) * (side === "left" ? -500 : 500);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + bob,
        translate: `${slide}px 0px`,
        rotate: `${rot}deg`,
        scale: String(enter * exit),
        opacity: exit,
        display: "flex",
        alignItems: "center",
        gap: 20,
        background: "rgba(255,255,255,0.96)",
        borderRadius: 44,
        padding: "22px 36px 22px 22px",
        boxShadow: `0 18px 0 ${color}, 0 30px 60px rgba(0,0,0,0.35)`,
        fontFamily: sans,
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 42,
          background: `linear-gradient(135deg, ${color}, ${GOLD})`,
          color: "#fff",
          fontWeight: 900,
          fontSize: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {name[0]}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#9a9aa8" }}>{name}</div>
        <div style={{ fontSize: 46, fontWeight: 800, color: "#1b1033", lineHeight: 1.1 }}>{text}</div>
      </div>
      <div style={{ marginLeft: 6 }}>
        <Heart size={48} color={PINK} />
      </div>
    </div>
  );
};

const CARDS: CardProps[] = [
  { from: 90, duration: 70, x: 70, y: 1230, rot: -6, name: "Анна", text: "Какая красота!", color: PINK, side: "left" },
  { from: 130, duration: 70, x: 280, y: 1400, rot: 5, name: "Марина", text: "Где такую взять?", color: VIOLET, side: "right" },
  { from: 215, duration: 80, x: 60, y: 1230, rot: 4, name: "Катя", text: "Хочу себе такую!", color: HOT, side: "left" },
  { from: 255, duration: 80, x: 240, y: 1400, rot: -5, name: "Лера", text: "Вау, как дорого выглядит", color: MINT, side: "right" },
  { from: 440, duration: 85, x: 70, y: 1230, rot: -4, name: "Оля", text: "Мягкая, как облако", color: PINK, side: "left" },
  { from: 490, duration: 85, x: 220, y: 1400, rot: 6, name: "Ира", text: "Беру! Пишу в директ", color: GOLD, side: "right" },
];

// ---------- Headline ----------
const Headline: React.FC<{
  readonly from: number;
  readonly duration: number;
  readonly top?: string;
  readonly y?: number;
  readonly size?: number;
  readonly lines: string[];
  readonly accent?: string;
  readonly color?: string;
}> = ({ from, duration, top = "Новая коллекция", y = 250, size = 118, lines, accent = GOLD, color = PINK }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - from;
  if (local < 0 || local > duration) return null;
  const out = interpolate(local, [duration - 6, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: y, opacity: out }}>
      <div
        style={{
          fontFamily: script,
          fontSize: 76,
          color: "#fff",
          background: color,
          padding: "6px 44px 16px",
          borderRadius: 60,
          rotate: "-4deg",
          scale: String(spring({ frame: local, fps, config: { damping: 9 } })),
          boxShadow: "0 12px 40px rgba(255,45,143,0.55)",
        }}
      >
        {top}
      </div>
      <div style={{ marginTop: 28, textAlign: "center" }}>
        {lines.map((line, i) => {
          const p = spring({ frame: local - 4 - i * 5, fps, config: { damping: 10, stiffness: 180 } });
          return (
            <div
              key={line}
              style={{
                fontFamily: sans,
                fontWeight: 900,
                fontSize: size,
                whiteSpace: "nowrap",
                lineHeight: 1.02,
                textTransform: "uppercase",
                color: i === lines.length - 1 ? accent : "#fff",
                translate: `0px ${(1 - p) * 140}px`,
                scale: String(0.6 + 0.4 * p),
                opacity: p,
                WebkitTextStroke: "3px rgba(40,0,40,0.35)",
                textShadow: "0 8px 0 rgba(120,0,80,0.55), 0 16px 50px rgba(0,0,0,0.5)",
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Beat-synced punch-in on the footage ----------
const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beat = fps * 0.9;
  const phase = (frame % beat) / beat;
  const punch = 1.08 + 0.05 * Math.pow(1 - phase, 3) + frame * 0.00004;
  const sat = interpolate(frame, [0, 30], [1.15, 1.3], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Video
        name="Footage"
        src={staticFile("source.mp4")}
        premountFor={fps}
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          scale: String(punch),
          filter: `saturate(${sat}) contrast(1.08) brightness(1.05)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- CTA ----------
const CTA: React.FC<{ readonly from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - from;
  if (local < 0) return null;
  const p = spring({ frame: local, fps, config: { damping: 8, stiffness: 140 } });
  const pulse = 1 + 0.06 * Math.sin(local / 4);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 300 }}>
      <div
        style={{
          fontFamily: sans,
          fontWeight: 900,
          fontSize: 56,
          whiteSpace: "nowrap",
          color: "#fff",
          textShadow: "0 6px 30px rgba(0,0,0,0.6)",
          marginBottom: 34,
          opacity: p,
          textAlign: "center",
        }}
      >
        Сохрани, чтобы не потерять
      </div>
      <div
        style={{
          scale: String(p * pulse),
          fontFamily: sans,
          fontWeight: 900,
          fontSize: 66,
          whiteSpace: "nowrap",
          color: "#fff",
          background: `linear-gradient(90deg, ${PINK}, ${HOT}, ${GOLD})`,
          padding: "34px 56px",
          borderRadius: 100,
          boxShadow: "0 20px 70px rgba(255,45,143,0.75)",
        }}
      >
        Пиши «ШУБА» в Direct
      </div>
    </AbsoluteFill>
  );
};

// ---------- Flash transitions for fast rhythm ----------
const Flash: React.FC<{ readonly at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 2, at + 9], [0, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  return <AbsoluteFill style={{ background: "#fff", opacity: o, mixBlendMode: "overlay" }} />;
};

export const Ad: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hue = interpolate(frame, [0, 780], [0, 40]);
  return (
    <AbsoluteFill style={{ background: "#12001f" }}>
      <Footage />
      {/* colour grade + legibility gradients */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(138,61,255,0.55) 0%, rgba(255,45,143,0) 32%, rgba(255,45,143,0) 55%, rgba(255,94,58,0.6) 100%)`,
          mixBlendMode: "soft-light",
          filter: `hue-rotate(${hue}deg)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(20,0,40,0.55) 0%, rgba(20,0,40,0) 30%, rgba(20,0,40,0) 60%, rgba(20,0,40,0.65) 100%)",
        }}
      />

      <Headline from={0} duration={80} y={540} size={96} lines={["Хочешь,", "чтобы", "оборачивались?"]} />
      <Headline from={90} duration={110} top="Натуральный мех" y={540} lines={["Рыжая", "лисица"]} color={VIOLET} />
      <Headline from={205} duration={110} top="Тот самый образ" y={540} size={104} lines={["Роскошь", "в каждой", "ворсинке"]} accent={MINT} />
      <Headline from={330} duration={100} top="Крупным планом" lines={["Мягкий.", "Тёплый.", "Яркий."]} color={HOT} />
      <Headline from={440} duration={130} top="Все спрашивают" lines={["Где такая", "шуба?"]} color={PINK} />

      <FloatingStars count={26} />
      {CARDS.map((c) => (
        <MessageCard key={c.text} {...c} />
      ))}

      <Flash at={88} />
      <Flash at={203} />
      <Flash at={328} />
      <Flash at={438} />
      <Flash at={598} />
      <Sequence from={600} premountFor={fps}>
        <CTA from={0} />
      </Sequence>
    </AbsoluteFill>
  );
};
