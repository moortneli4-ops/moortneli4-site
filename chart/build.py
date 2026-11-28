"""Build /chart/ jackets and downloadable chart folders from the AMTS option pack."""
import json
import re
import shutil
import struct
import sys
from pathlib import Path

from PIL import Image

AMTS = Path(r"F:\chumate\chunimate\HDD\bin\option\AMTS")
ANAI = Path(r"F:\chumate\chunimate\HDD\bin\option\ANAI")
SOURCES = (AMTS, ANAI)
OUT = Path(__file__).resolve().parent
PACK_NAME = "AMTS"
META = {
    9588: {"released": "2025-03-22", "note": "初谱"},
    9589: {"released": "2025-08-15", "note": ""},
    9600: {"released": "2025-08-03", "note": "四人合作"},
    9603: {"released": "2025-07-03", "note": ""},
    9604: {"released": "2025-07-15", "note": ""},
    9605: {"released": "2025-09-09", "note": ""},
    9606: {"released": "2025-08-19", "note": ""},
    9617: {"released": "2026-03-13", "note": ""},
    9636: {"released": "2026-02-13", "note": ""},
    9641: {"released": "2026-04-18", "note": ""},
    9876: {"released": "2026-05-16", "note": "重制"},
    9966: {"released": "2026-10-12", "note": ""},
    9971: {"released": "2026-06-07", "note": ""},
    9978: {"released": "2026-11-08", "note": ""},
    11451: {"released": "2026-07-20", "note": ""},
    11452: {"released": "2026-10-24", "note": ""},
    11453: {"released": "2026-11-26", "note": ""},
}


def rgb565(c):
    r = (c >> 11) & 31
    g = (c >> 5) & 63
    b = c & 31
    return (r * 255 // 31, g * 255 // 63, b * 255 // 31, 255)


def decode_dxt1(blob, width, height):
    bw = (width + 3) // 4
    bh = (height + 3) // 4
    pw, ph = bw * 4, bh * 4
    pix = bytearray(pw * ph * 4)
    off = 128
    for by in range(bh):
        for bx in range(bw):
            c0, c1, bits = struct.unpack_from("<HHI", blob, off)
            off += 8
            cols = [rgb565(c0), rgb565(c1)]
            if c0 > c1:
                cols.append(tuple((2 * a + b) // 3 for a, b in zip(cols[0], cols[1])))
                cols.append(tuple((a + 2 * b) // 3 for a, b in zip(cols[0], cols[1])))
            else:
                cols.append(tuple((a + b) // 2 for a, b in zip(cols[0], cols[1])))
                cols.append((0, 0, 0, 0))
            for i in range(16):
                x = bx * 4 + (i % 4)
                y = by * 4 + (i // 4)
                pix[(y * pw + x) * 4:(y * pw + x) * 4 + 4] = bytes(cols[(bits >> (2 * i)) & 3])
    return Image.frombytes("RGBA", (pw, ph), bytes(pix)).crop((0, 0, width, height))


def save_jacket(dds_path, dest):
    blob = dds_path.read_bytes()
    height, width = struct.unpack_from("<II", blob, 12)
    if blob[84:88] != b"DXT1":
        raise SystemExit(f"not DXT1: {dds_path}")
    image = decode_dxt1(blob, width, height).convert("RGB")
    image.thumbnail((480, 480))
    dest.parent.mkdir(parents=True, exist_ok=True)
    image.save(dest, "JPEG", quality=82)


def level_of(raw, original):
    try:
        return float(raw)
    except (TypeError, ValueError):
        return float(original)


def copy_tree(src, dest):
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(src, dest)


def stage_index():
    found = {}
    for base in SOURCES:
        stage = base / "stage"
        if not stage.is_dir():
            continue
        for folder in stage.iterdir():
            if folder.is_dir() and folder.name.startswith("stage") and folder.name[5:].isdigit():
                found.setdefault(int(folder.name[5:]), folder)
    return found


def event_index():
    found = {}
    for base in SOURCES:
        event = base / "event"
        if not event.is_dir():
            continue
        for folder in event.iterdir():
            xml = folder / "Event.xml"
            if not xml.is_file():
                continue
            text = xml.read_text(encoding="utf-8-sig")
            for block in re.findall(r"<musicNames>(.*?)</musicNames>", text, re.S):
                for sid in re.findall(r"<id>\s*(\d+)\s*</id>", block):
                    found.setdefault(int(sid), folder)
    return found


def music_flags(music_xml):
    text = music_xml.read_text(encoding="utf-8-sig")
    stage = re.search(r"<stageName>\s*<id>(\d+)</id>", text)
    ultima = "<enableUltima>true</enableUltima>" in text
    ult_on = False
    for part in text.split("<MusicFumenData>"):
        if re.search(r"<type>\s*<id>4</id>", part) and re.search(r"<enable>\s*true\s*</enable>", part):
            ult_on = True
            break
    return (int(stage.group(1)) if stage else None), ultima and ult_on


def relative_files(root, prefix):
    return [
        f"{prefix}/{path.relative_to(root).as_posix()}"
        for path in root.rglob("*")
        if path.is_file()
    ]


def copy_shared():
    pack = OUT / "pack"
    if pack.exists():
        shutil.rmtree(pack)
    for name in ("releaseTag000020", "releaseTag000099"):
        copy_tree(AMTS / "releaseTag" / name, pack / "releaseTag" / name)
    copy_tree(AMTS / "ddsFieldWall" / "ddsFieldWall9978", pack / "ddsFieldWall" / "ddsFieldWall9978")
    shutil.copy2(AMTS / "wallbind.dll", pack / "wallbind.dll")
    notes = [path for path in AMTS.iterdir() if path.is_file() and path.suffix.lower() == ".txt"]
    if len(notes) != 1:
        raise SystemExit(f"expected one wall note, found {notes}")
    shutil.copy2(notes[0], pack / notes[0].name)
    shared = {
        "name": PACK_NAME,
        "releaseTag": relative_files(pack / "releaseTag", "releaseTag"),
        "wallSong": 9978,
        "wall": ["wallbind.dll", notes[0].name, *relative_files(pack / "ddsFieldWall", "ddsFieldWall")],
    }
    (OUT / "pack.json").write_text(json.dumps(shared, ensure_ascii=False, indent=2), encoding="utf-8")
    return shared


def attach_song(chart, stages, events):
    song_id = int(chart["id"])
    music_xml = next((OUT / "files" / str(song_id)).glob("music/*/Music.xml"), None)
    if music_xml is None:
        return f"{song_id} no music"
    stage_id, ultima = music_flags(music_xml)
    files = [rel for rel in chart["files"] if not rel.startswith(("stage/", "event/"))]
    notes = []
    if stage_id in stages:
        src = stages[stage_id]
        dest = OUT / "files" / str(song_id) / "stage" / src.name
        copy_tree(src, dest)
        files.extend(relative_files(dest, f"stage/{src.name}"))
        notes.append(src.name)
    if ultima:
        src = events.get(song_id)
        if src is None:
            raise SystemExit(f"{song_id} is Ultima but has no unlock event")
        dest = OUT / "files" / str(song_id) / "event" / src.name
        copy_tree(src, dest)
        files.extend(relative_files(dest, f"event/{src.name}"))
        notes.append(src.name)
    chart["files"] = files
    return f"{song_id} stage {stage_id} ultima {ultima} + {', '.join(notes) or 'tags only'}"


def attach_existing():
    charts_path = OUT / "charts.json"
    charts = json.loads(charts_path.read_text(encoding="utf-8"))
    stages = stage_index()
    events = event_index()
    for chart in charts:
        print(attach_song(chart, stages, events))
    charts_path.write_text(json.dumps(charts, ensure_ascii=False, indent=2), encoding="utf-8")
    shared = copy_shared()
    print(f"pack {shared['name']}: {len(shared['releaseTag'])} tags, wall {shared['wallSong']}")


def song_from_dir(song_id, source, title, artist, diff, level, jackets, files_root):
    extra = META.get(song_id, {"released": "", "note": ""})
    music_name = f"music{song_id}"
    cue_name = f"cueFile{song_id:06d}"
    music_dir = source / "music" / music_name
    cue_dir = source / "cueFile" / cue_name
    file_rels = []
    dds = next(music_dir.glob("*.dds"))
    save_jacket(dds, jackets / f"{song_id}.jpg")
    for folder, src in ((f"music/{music_name}", music_dir), (f"cueFile/{cue_name}", cue_dir)):
        for item in src.iterdir():
            if not item.is_file():
                continue
            rel = f"{folder}/{item.name}"
            dest = files_root / str(song_id) / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, dest)
            file_rels.append(rel)
    return {
        "id": song_id,
        "title": title,
        "artist": artist,
        "diff": diff,
        "level": level,
        "released": extra["released"],
        "note": extra["note"],
        "jacket": f"./jackets/{song_id}.jpg",
        "files": file_rels,
    }


def main():
    import pandas as pd

    rows = pd.read_excel(AMTS / "谱面列表.xlsx").to_dict("records")
    jackets = OUT / "jackets"
    files_root = OUT / "files"
    if files_root.exists():
        shutil.rmtree(files_root)
    charts = []
    for row in rows:
        song_id = int(row["ID"])
        extra = META.get(song_id, {"released": "", "note": ""})
        level = level_of(row["新定数6/7"], row["原定数"])
        music_name = f"music{song_id}"
        cue_name = f"cueFile{song_id:06d}"
        music_dir = AMTS / "music" / music_name
        cue_dir = AMTS / "cueFile" / cue_name
        jacket_rel = ""
        file_rels = []
        if music_dir.is_dir() and cue_dir.is_dir():
            dds = next(music_dir.glob("*.dds"))
            jacket_rel = f"./jackets/{song_id}.jpg"
            save_jacket(dds, jackets / f"{song_id}.jpg")
            for folder, src in ((f"music/{music_name}", music_dir), (f"cueFile/{cue_name}", cue_dir)):
                for item in src.iterdir():
                    if not item.is_file():
                        continue
                    rel = f"{folder}/{item.name}"
                    dest = files_root / str(song_id) / rel
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(item, dest)
                    file_rels.append(rel)
        charts.append({
            "id": song_id,
            "title": str(row["歌曲名"]),
            "artist": str(row["艺术家"]),
            "diff": str(row["难度"]),
            "level": level,
            "released": extra["released"],
            "note": extra["note"],
            "jacket": jacket_rel,
            "files": file_rels,
        })
    if not any(chart["id"] == 11452 for chart in charts):
        charts.append(song_from_dir(11452, ANAI, "奶龍伝説(司鳳remix版)", "d×pseek feat. 豆包", "ULTIMA", 18.5, jackets, files_root))
        charts.sort(key=lambda chart: chart["id"])
    (OUT / "charts.json").write_text(json.dumps(charts, ensure_ascii=False, indent=2), encoding="utf-8")
    attach_existing()
    print(f"{len(charts)} charts, {sum(1 for c in charts if c['files'])} with files")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "attach":
        attach_existing()
    else:
        main()
