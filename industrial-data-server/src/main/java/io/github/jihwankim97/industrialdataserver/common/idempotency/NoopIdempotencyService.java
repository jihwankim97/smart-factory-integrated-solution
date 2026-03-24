package io.github.jihwankim97.industrialdataserver.common.idempotency;

import org.springframework.stereotype.Service;

@Service
public class NoopIdempotencyService implements IdempotencyService {

    @Override
    public boolean isDuplicate(String key) {
        return false;
    }
}
