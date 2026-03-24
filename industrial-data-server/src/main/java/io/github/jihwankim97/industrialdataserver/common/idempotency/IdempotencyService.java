package io.github.jihwankim97.industrialdataserver.common.idempotency;

public interface IdempotencyService {
    boolean isDuplicate(String key);
}
