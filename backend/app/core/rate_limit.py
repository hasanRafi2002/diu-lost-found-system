from threading import Lock
from time import monotonic


class RateLimiter:
    def __init__(
        self,
        max_attempts: int,
        window_seconds: int,
        max_tracked_keys: int = 100,
    ) -> None:
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self.max_tracked_keys = max_tracked_keys
        self._attempts: dict[str, list[float]] = {}
        self._lock = Lock()

    def _cleanup(self, key: str, now: float) -> None:
        cutoff = now - self.window_seconds
        attempts = self._attempts.get(key)

        if not attempts:
            return

        self._attempts[key] = [
            timestamp
            for timestamp in attempts
            if timestamp > cutoff
        ]

        if not self._attempts[key]:
            self._attempts.pop(key, None)

    def _cleanup_expired(self, now: float) -> None:
        cutoff = now - self.window_seconds

        expired_keys = [
            key
            for key, attempts in self._attempts.items()
            if not attempts or attempts[-1] <= cutoff
        ]

        for key in expired_keys:
            self._attempts.pop(key, None)

    def _enforce_capacity(self) -> None:
        if len(self._attempts) < self.max_tracked_keys:
            return

        oldest_key = min(
            self._attempts,
            key=lambda key: self._attempts[key][-1],
        )

        self._attempts.pop(oldest_key, None)

    def is_limited(self, key: str) -> bool:
        now = monotonic()

        with self._lock:
            self._cleanup(key, now)
            return (
                len(self._attempts.get(key, []))
                >= self.max_attempts
            )

    def record_attempt(self, key: str) -> None:
        now = monotonic()

        with self._lock:
            self._cleanup_expired(now)

            if key not in self._attempts:
                self._enforce_capacity()

            self._attempts.setdefault(key, []).append(now)

    def reset(self, key: str) -> None:
        with self._lock:
            self._attempts.pop(key, None)

    @property
    def tracked_keys(self) -> int:
        with self._lock:
            return len(self._attempts)


ACCOUNT_MAX_ATTEMPTS = 5
IP_MAX_ATTEMPTS = 30
WINDOW_SECONDS = 15 * 60
MAX_TRACKED_KEYS = 100


account_login_rate_limiter = RateLimiter(
    max_attempts=ACCOUNT_MAX_ATTEMPTS,
    window_seconds=WINDOW_SECONDS,
    max_tracked_keys=MAX_TRACKED_KEYS,
)

ip_login_rate_limiter = RateLimiter(
    max_attempts=IP_MAX_ATTEMPTS,
    window_seconds=WINDOW_SECONDS,
    max_tracked_keys=MAX_TRACKED_KEYS,
)

REGISTER_MAX_ATTEMPTS = 10

register_rate_limiter = RateLimiter(
    max_attempts=REGISTER_MAX_ATTEMPTS,
    window_seconds=WINDOW_SECONDS,
    max_tracked_keys=MAX_TRACKED_KEYS,
)
