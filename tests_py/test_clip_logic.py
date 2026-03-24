from app.domain.clips.schemas import ClipEventIn
from app.domain.clips.service import ClipService


class DummyDB:
    def add(self, _):
        pass

    def commit(self):
        pass

    def refresh(self, _):
        pass


def test_clip_detects_peak():
    service = ClipService()
    db = DummyDB()
    clip = service.detect_and_store(
        db,
        ClipEventIn(channel_login="canal", events_last_minute=24, baseline_events=6),
    )
    assert clip is not None
    assert clip.score > 0
