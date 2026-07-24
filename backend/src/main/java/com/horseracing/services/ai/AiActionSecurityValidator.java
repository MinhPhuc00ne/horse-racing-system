package com.horseracing.services.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.horseracing.entities.enums.Role;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@Slf4j
public class AiActionSecurityValidator {

    private static final Map<Role, Set<String>> ROLE_ALLOWED_ACTIONS = new HashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    static {
        // GUEST (null role): Public navigation only
        ROLE_ALLOWED_ACTIONS.put(null, Set.of("NAVIGATE"));

        // SPECTATOR
        ROLE_ALLOWED_ACTIONS.put(Role.SPECTATOR, Set.of(
            "NAVIGATE", "DEPOSIT_FUNDS", "WITHDRAW_FUNDS", "UPDATE_BANK_INFO", "PLACE_BET", "REQUEST_UPGRADE"
        ));

        // HORSE_OWNER
        ROLE_ALLOWED_ACTIONS.put(Role.HORSE_OWNER, Set.of(
            "NAVIGATE", "DEPOSIT_FUNDS", "WITHDRAW_FUNDS", "UPDATE_BANK_INFO", "PLACE_BET", 
            "ADD_HORSE", "REGISTER_HORSE_RACE", "SEARCH_JOCKEY"
        ));

        // JOCKEY
        ROLE_ALLOWED_ACTIONS.put(Role.JOCKEY, Set.of(
            "NAVIGATE", "DEPOSIT_FUNDS", "WITHDRAW_FUNDS", "UPDATE_BANK_INFO", "PLACE_BET", "VIEW_SCHEDULE"
        ));

        // RACE_REFEREE
        ROLE_ALLOWED_ACTIONS.put(Role.RACE_REFEREE, Set.of(
            "NAVIGATE", "DEPOSIT_FUNDS", "WITHDRAW_FUNDS", "UPDATE_BANK_INFO", "PLACE_BET", 
            "VIEW_SCHEDULE", "UPDATE_RACE_RESULT", "RECORD_VIOLATION"
        ));

        // ADMIN
        ROLE_ALLOWED_ACTIONS.put(Role.ADMIN, Set.of(
            "NAVIGATE", "DEPOSIT_FUNDS", "WITHDRAW_FUNDS", "UPDATE_BANK_INFO", "PLACE_BET",
            "APPROVE_UPGRADE", "CREATE_TOURNAMENT", "ASSIGN_REFEREE", "MANAGE_TRANSACTIONS", "MANAGE_BLACKLIST"
        ));
    }

    public boolean isActionAllowed(Role userRole, String actionType) {
        if (actionType == null || actionType.isBlank()) {
            return true;
        }
        Set<String> allowed = ROLE_ALLOWED_ACTIONS.get(userRole);
        return allowed != null && allowed.contains(actionType.trim().toUpperCase());
    }

    /**
     * Sanitizes raw AI response string, strips markdown code blocks if present,
     * checks action permissions against userRole, and returns a clean JSON string with "text" and "action".
     */
    public String sanitizeAndStructureResponse(Role userRole, String rawResponseStr) {
        if (rawResponseStr == null || rawResponseStr.isBlank()) {
            ObjectNode empty = objectMapper.createObjectNode();
            empty.put("text", "");
            empty.putNull("action");
            return empty.toString();
        }

        String cleanedStr = rawResponseStr.trim();
        if (cleanedStr.contains("```")) {
            cleanedStr = cleanedStr.replaceAll("```json", "").replaceAll("```", "").trim();
        }

        int firstBrace = cleanedStr.indexOf('{');
        int lastBrace = cleanedStr.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
            String jsonCandidate = cleanedStr.substring(firstBrace, lastBrace + 1);
            try {
                JsonNode root = objectMapper.readTree(jsonCandidate);
                if (root.isObject() && (root.has("text") || root.has("action"))) {
                    String text = root.has("text") ? root.get("text").asText() : "";
                    text = text.replaceAll("```json", "").replaceAll("```", "").trim();

                    JsonNode actionNode = root.has("action") && !root.get("action").isNull() ? root.get("action") : null;

                    ObjectNode result = objectMapper.createObjectNode();
                    result.put("text", text);

                    if (actionNode != null && actionNode.isObject()) {
                        String actionType = actionNode.has("type") ? actionNode.get("type").asText() : null;
                        if (isActionAllowed(userRole, actionType)) {
                            result.set("action", actionNode);
                        } else {
                            log.warn("SECURITY ALERT: Intercepted unauthorized AI action '{}' for user role '{}'. Action removed.", actionType, userRole);
                            result.putNull("action");
                        }
                    } else {
                        result.putNull("action");
                    }
                    return result.toString();
                }
            } catch (Exception ignored) {
            }
        }

        ObjectNode fallback = objectMapper.createObjectNode();
        String safeText = rawResponseStr.replaceAll("```json", "").replaceAll("```", "").trim();
        fallback.put("text", safeText);
        fallback.putNull("action");
        return fallback.toString();
    }
}
