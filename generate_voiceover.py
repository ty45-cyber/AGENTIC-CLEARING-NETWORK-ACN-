"""
Agentic Clearing Network (ACN) — Automated Demo Video Voiceover Generator
Synthesizes a 100% uniform, institutional neural voiceover track (en-US-AndrewMultilingualNeural)
and merges it with the screen capture into:
  c:\\Users\\Hp\\Desktop\\Paypal\\videos\\Agentic Clearing Network.mp4
"""

from __future__ import annotations
import asyncio
import json
import os
import shutil
import subprocess
from pathlib import Path
from typing import List, Tuple

import edge_tts
from edge_tts.drm import DRM
from gtts import gTTS
import httpx

DEFAULT_INPUT_VIDEO = (
    r"C:\Users\Hp\Videos\Captures\ACN — Agentic Clearing Network _ "
    r"PayPal Sandbox mLoC & B2B Escrow Engine - Google Chrome 2026-11-10 17-51-50.mp4"
)
PROJECT_ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = PROJECT_ROOT / "videos"
OUTPUT_VIDEO = OUTPUT_DIR / "Agentic Clearing Network.mp4"
TEMP_DIR = PROJECT_ROOT / "videos" / "_temp_vo"

VOICE = "en-US-AndrewMultilingualNeural"
RATE = "+9%"

# Time-stamped narration segments (start_time_seconds, narration_text)
# Paced so all 9 segments fit cleanly inside the 141.42-second (2m 21s) recording
NARRATION_SEGMENTS: List[Tuple[float, str]] = [
    (
        0.4,
        "Cross-border SME importers and B2B suppliers operate in a 2.5 trillion dollar trust vacuum. "
        "Suppliers demand cash upfront, buyers refuse blind prepayment, and bank Letters of Credit cost 1,500 dollars and take weeks.",
    ),
    (
        16.0,
        "Meet the Agentic Clearing Network: an AI-native clearing house turning standard PayPal Sandbox Orders and Invoices "
        "into programmable, milestone-gated micro-Letters-of-Credit.",
    ),
    (
        28.0,
        "From an unstructured natural-language trade prompt, our Procurement Agent discovers verified industrial suppliers via Channel 3, "
        "negotiates unit pricing below the buyer's budget cap, and structures a multi-tranche escrow contract.",
    ),
    (
        43.5,
        "Using strictly typed SDK bindings generated with the APIMatic Context Plugin for PayPal, "
        "the orchestrator drafts an itemized pro-forma commercial invoice via PayPal Invoicing v2, "
        "and creates an authorization-intent order via PayPal Orders v2.",
    ),
    (
        60.0,
        "In the PayPal Sandbox Dual-Lock Escrow Checkout modal, the buyer approves the reserve hold. "
        "Our Underwriting Engine locks the funds into clearing reserve and emits a cryptographic SHA-256 Assurance Receipt, "
        "proving to the supplier that funds are guaranteed before manufacturing begins.",
    ),
    (
        79.0,
        "All active micro-Letters-of-Credit stream live into our institutional AG Grid Clearing Blotter, "
        "complete with Elastic counterparty risk sparklines, tranche progress bars, state filters, and real-time SLA carrier windows.",
    ),
    (
        94.5,
        "When the supplier ships, our Autonomous Fulfillment Oracle attaches the carrier Bill-of-Lading via PayPal's Tracking v1 API, "
        "and immediately disburses Tranche 1 to the supplier via PayPal Payouts v1.",
    ),
    (
        109.0,
        "If customs congestion triggers a hold beyond the SLA window, our AI Dispute Arbiter automatically calculates the 5 percent late-delivery rebate, "
        "refunds the buyer via PayPal Captures Refund v2, and disburses the net 95 percent balance to the supplier.",
    ),
    (
        125.5,
        "Every raw PayPal Sandbox JSON payload, APIMatic validation receipt, and webhook stream is inspectable live. "
        "Agentic Clearing Network: programmable global trade on PayPal Sandbox.",
    ),
]


def sync_edge_drm_clock() -> None:
    try:
        resp = httpx.head("https://speech.platform.bing.com", timeout=5.0)
        server_date = resp.headers.get("date")
        if server_date:
            parsed = DRM.parse_rfc2616_date(server_date)
            if parsed:
                DRM.adj_clock_skew_seconds(parsed - DRM.get_unix_timestamp())
    except Exception:
        pass


def get_media_duration(media_path: Path) -> float:
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "json",
        str(media_path),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(res.stdout)
    return float(data["format"]["duration"])


async def synthesize_single_segment(text: str, out_mp3: Path) -> str:
    """
    Synthesizes speech using Microsoft Edge Neural TTS with automatic clock-skew sync
    and up to 6 retries for 100% consistent voice across all segments.
    """
    for attempt in range(6):
        try:
            sync_edge_drm_clock()
            communicate = edge_tts.Communicate(text=text, voice=VOICE, rate=RATE)
            await communicate.save(str(out_mp3))
            if out_mp3.exists() and out_mp3.stat().st_size > 512:
                return f"edge-tts ({VOICE})"
        except Exception:
            await asyncio.sleep(0.8 * (attempt + 1))

    raw_mp3 = out_mp3.with_suffix(".raw.mp3")
    tts = gTTS(text=text, lang="en", tld="us", slow=False)
    tts.save(str(raw_mp3))
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(raw_mp3),
            "-af",
            "atempo=1.15,treble=g=3,acompressor=threshold=-18dB:ratio=2.5",
            "-ar",
            "24000",
            str(out_mp3),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
    )
    raw_mp3.unlink(missing_ok=True)
    return "gtts-fallback"


async def synthesize_segments(temp_dir: Path) -> List[Tuple[float, Path, float]]:
    temp_dir.mkdir(parents=True, exist_ok=True)
    results: List[Tuple[float, Path, float]] = []

    for idx, (target_start, text) in enumerate(NARRATION_SEGMENTS):
        seg_file = temp_dir / f"seg_{idx:02d}.mp3"
        engine = await synthesize_single_segment(text, seg_file)
        dur = get_media_duration(seg_file)
        results.append((target_start, seg_file, dur))
        print(
            f"  [TTS {idx + 1}/{len(NARRATION_SEGMENTS)}] [{engine}] target={target_start:.1f}s | duration={dur:.2f}s -> {seg_file.name}"
        )

    return results


def build_final_video(
    input_video: Path,
    output_video: Path,
    segments: List[Tuple[float, Path, float]],
    total_duration: float,
) -> None:
    output_video.parent.mkdir(parents=True, exist_ok=True)

    scheduled: List[Tuple[int, Path]] = []
    cursor = 0.0
    for target_start, seg_path, dur in segments:
        actual_start = max(target_start, cursor)
        delay_ms = int(round(actual_start * 1000))
        scheduled.append((delay_ms, seg_path))
        cursor = actual_start + dur + 0.25
        print(
            f"  [Timeline] {seg_path.name}: start={actual_start:.2f}s -> end={actual_start + dur:.2f}s"
        )

    ffmpeg_cmd: List[str] = ["ffmpeg", "-y", "-i", str(input_video)]
    for _, seg_path in scheduled:
        ffmpeg_cmd.extend(["-i", str(seg_path)])

    filter_parts: List[str] = []
    mix_inputs: List[str] = []

    for idx, (delay_ms, _) in enumerate(scheduled):
        input_idx = idx + 1
        label = f"a{idx}"
        filter_parts.append(
            f"[{input_idx}:a]aresample=48000,adelay={delay_ms}|{delay_ms},volume=1.9[{label}]"
        )
        mix_inputs.append(f"[{label}]")

    amix_str = (
        f"{''.join(mix_inputs)}amix=inputs={len(scheduled)}:dropout_transition=0:normalize=0,"
        f"alimiter=limit=0.95,apad=whole_dur={total_duration:.2f}[vo_out]"
    )
    filter_parts.append(amix_str)
    filter_complex = ";".join(filter_parts)

    ffmpeg_cmd.extend(
        [
            "-filter_complex",
            filter_complex,
            "-map",
            "0:v:0",
            "-map",
            "[vo_out]",
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-ar",
            "48000",
            "-b:a",
            "192k",
            "-shortest",
            str(output_video),
        ]
    )

    print("\n[FFmpeg] Muxing voiceover track with video stream...")
    subprocess.run(ffmpeg_cmd, check=True)
    print(f"[Success] Final video saved to: {output_video}")


async def main() -> None:
    input_path = Path(os.environ.get("ACN_INPUT_VIDEO", DEFAULT_INPUT_VIDEO))
    if not input_path.exists():
        raise FileNotFoundError(f"Input video not found at: {input_path}")

    print(f"[ACN Voiceover Generator] Input video: {input_path}")
    total_duration = get_media_duration(input_path)
    print(f"[ACN Voiceover Generator] Video duration: {total_duration:.2f} seconds")

    segments = await synthesize_segments(TEMP_DIR)
    build_final_video(input_path, OUTPUT_VIDEO, segments, total_duration)

    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR, ignore_errors=True)


if __name__ == "__main__":
    asyncio.run(main())
