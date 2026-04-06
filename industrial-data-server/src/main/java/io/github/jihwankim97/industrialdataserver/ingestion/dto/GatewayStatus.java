package io.github.jihwankim97.industrialdataserver.ingestion.dto;

public enum GatewayStatus {
    NORMAL,
    WARNING,
    ERROR,
    OFFLINE;

    public static GatewayStatus from(String raw) {
        if (raw == null || raw.isBlank()) {
            return NORMAL;
        }
        try {
            return valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return NORMAL;
        }
    }
}
