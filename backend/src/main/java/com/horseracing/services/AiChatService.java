package com.horseracing.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.horseracing.entities.AiChatHistory;
import com.horseracing.entities.User;
import com.horseracing.entities.Wallet;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.AiChatHistoryRepository;
import com.horseracing.repositories.WalletRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiChatService {

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-3.1-flash-lite}")
    private String geminiModel;

    private final ResourceLoader resourceLoader;
    private final AiChatHistoryRepository aiChatHistoryRepository;
    private final WalletRepository walletRepository;
    private final RestTemplate restTemplate = createRestTemplateWithTimeout();

    private static RestTemplate createRestTemplateWithTimeout() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory =
                new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30000); // 30 seconds
        factory.setReadTimeout(30000); // 30 seconds
        return new RestTemplate(factory);
    }

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String systemPrompt = "";

    @PostConstruct
    public void init() {
        try {
            Resource resource = resourceLoader.getResource("classpath:prompts/system-prompt.txt");
            try (Reader reader =
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)) {
                this.systemPrompt = FileCopyUtils.copyToString(reader);
                log.info("Loaded System Prompt successfully.");
            }
        } catch (IOException e) {
            log.error("Could not load system prompt file. Using default empty prompt.", e);
            this.systemPrompt = "You are an AI virtual assistant. Please assist the user.";
        }
    }

    public String chat(String userMessage) {
        return chat(userMessage, null, null);
    }

    public String chat(String userMessage, User user) {
        return chat(userMessage, null, user);
    }

    public String chat(String userMessage, java.util.Map<String, String> image, User user) {
        if (userMessage == null || userMessage.isBlank()) {
            ObjectNode errorNode = objectMapper.createObjectNode();
            errorNode.put("text", "Please provide a valid question or message.");
            return errorNode.toString();
        }

        if (userMessage.length() > 2000) {
            userMessage = userMessage.substring(0, 2000);
        }

        if (geminiApiKey == null || geminiApiKey.isEmpty()
                || geminiApiKey.contains("your-gemini-api-key")) {
            return "{\"text\": \"Error: Gemini API Key is not configured. Please add GEMINI_API_KEY to environment variables.\" }";
        }

        // 1. Save user's message to database if authenticated
        if (user != null) {
            try {
                String messageToSave = userMessage;
                if (image != null && image.get("data") != null) {
                    messageToSave += " [Attached Image]";
                }
                AiChatHistory userMsg = AiChatHistory.builder().user(user).sender("USER")
                        .message(messageToSave).build();
                aiChatHistoryRepository.save(userMsg);
            } catch (Exception e) {
                log.error("Error saving user message to database", e);
            }
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel
                + ":generateContent?key=" + geminiApiKey;

        try {
            ObjectNode rootNode = objectMapper.createObjectNode();

            // 2. Customize System Instruction based on user role and data
            String rolePrompt;
            if (user == null) {
                rolePrompt =
                        """

                                Current user role: GUEST (Unauthenticated).
                                Instruction: Advise them to log in or register an account to access full features like detailed tournament view, betting, and profile management.""";
            } else {
                Role role = user.getRole();
                String balanceInfo = "";
                if (role == Role.SPECTATOR) {
                    Optional<Wallet> walletOpt = walletRepository.findByUserId(user.getId());
                    BigDecimal balance = walletOpt.map(w -> w.getBalance()).orElse(BigDecimal.ZERO);
                    balanceInfo = " (Current wallet balance: " + balance + " VND)";
                }
                rolePrompt = "\nCurrent user role: " + role.name() + " (Authenticated).\n"
                        + "Account info: Name: " + user.getFullName() + ", Email: "
                        + user.getEmail() + balanceInfo + ".\n";

                rolePrompt += switch (role) {
                    case SPECTATOR -> "Guide Spectator: Answer and guide them on placing bets, deposit/withdraw via PayOS, viewing betting history and transaction logs directly on their dashboard.";
                    case HORSE_OWNER -> "Guide Horse Owner: Guide them on managing horses, registering horses for tournaments, and agreeing contracts with Jockeys.";
                    case JOCKEY -> "Guide Jockey: Guide them on viewing personal race schedule and agreements with horse owners.";
                    case RACE_REFEREE -> "Guide Referee: Guide them on viewing assigned race schedules and updating race round results.";
                    case ADMIN -> "Guide Admin: Guide them on approving role upgrade requests, member management, and configuring new tournaments.";
                    default -> "";
                };
            }

            String finalSystemInstruction = this.systemPrompt + "\n" + rolePrompt + "\n"
                    + "IMPORTANT OUTPUT CONSTRAINTS:\n"
                    + "- Respond in clear English text or standard Markdown format.\n"
                    + "- DO NOT output raw JSON containing structured action commands unless required.\n"
                    + "- Assist strictly on Horse Racing Management System features. Politely decline off-topic queries.";

            ObjectNode systemInstruction = objectMapper.createObjectNode();
            ArrayNode sysParts = objectMapper.createArrayNode();
            ObjectNode sysText = objectMapper.createObjectNode();
            sysText.put("text", finalSystemInstruction);
            sysParts.add(sysText);
            systemInstruction.set("parts", sysParts);
            rootNode.set("system_instruction", systemInstruction);

            // 3. Build the contents array containing conversation log (up to 50 messages)
            ArrayNode contentsArray = objectMapper.createArrayNode();
            if (user != null) {
                List<AiChatHistory> history =
                        aiChatHistoryRepository.findTop50ByUserIdOrderByCreatedAtDesc(user.getId());
                Collections.reverse(history); // chronological order

                String lastRole = null;
                ArrayNode lastPartsArray = null;

                for (int i = 0; i < history.size(); i++) {
                    AiChatHistory h = history.get(i);
                    String role = h.getSender().equalsIgnoreCase("USER") ? "user" : "model";
                    String rawMessage = h.getMessage();
                    String cleanMessage = rawMessage;
                    if (rawMessage != null && rawMessage.trim().startsWith("{")
                            && rawMessage.trim().endsWith("}")) {
                        try {
                            JsonNode parsed = objectMapper.readTree(rawMessage);
                            if (parsed.has("text")) {
                                cleanMessage = parsed.get("text").asText();
                            }
                        } catch (JsonProcessingException ignored) {
                        }
                    }

                    if (role.equals(lastRole)) {
                        // Merge text into the previous content object's parts to ensure strict
                        // alternation
                        if (lastPartsArray != null && lastPartsArray.size() > 0) {
                            ObjectNode textPart = (ObjectNode) lastPartsArray.get(0);
                            String existingText = textPart.path("text").asText("");
                            textPart.put("text", existingText + "\n" + cleanMessage);
                        }
                    } else {
                        // Create a new content object
                        lastRole = role;
                        ObjectNode contentObj = objectMapper.createObjectNode();
                        contentObj.put("role", role);
                        lastPartsArray = objectMapper.createArrayNode();
                        ObjectNode textPart = objectMapper.createObjectNode();
                        textPart.put("text", cleanMessage);
                        lastPartsArray.add(textPart);
                        contentObj.set("parts", lastPartsArray);
                        contentsArray.add(contentObj);
                    }

                    // Attach image to the current user's message (which is at the end of the
                    // history list)
                    if (i == history.size() - 1 && role.equals("user") && image != null
                            && image.get("data") != null) {
                        if (lastPartsArray != null) {
                            ObjectNode imagePart = objectMapper.createObjectNode();
                            ObjectNode inlineData = objectMapper.createObjectNode();
                            inlineData.put("mime_type", image.get("mimeType"));
                            inlineData.put("data", image.get("data"));
                            imagePart.set("inline_data", inlineData);
                            lastPartsArray.add(imagePart);
                        }
                    }
                }

                // Remove leading "model" messages to ensure the conversation starts with "user"
                while (contentsArray.size() > 0
                        && "model".equals(contentsArray.get(0).path("role").asText())) {
                    contentsArray.remove(0);
                }
            } else {
                // For Guest: just current message
                ObjectNode contentObj = objectMapper.createObjectNode();
                contentObj.put("role", "user");
                ArrayNode partsArray = objectMapper.createArrayNode();
                ObjectNode textPart = objectMapper.createObjectNode();
                textPart.put("text", userMessage);
                partsArray.add(textPart);

                // Add image part if provided for Guest
                if (image != null && image.get("data") != null) {
                    ObjectNode imagePart = objectMapper.createObjectNode();
                    ObjectNode inlineData = objectMapper.createObjectNode();
                    inlineData.put("mime_type", image.get("mimeType"));
                    inlineData.put("data", image.get("data"));
                    imagePart.set("inline_data", inlineData);
                    partsArray.add(imagePart);
                }

                contentObj.set("parts", partsArray);
                contentsArray.add(contentObj);
            }

            rootNode.set("contents", contentsArray);

            // Send request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(rootNode.toString(), headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            String replyText = "Sorry, I am unable to get a response from AI at this moment.";

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                JsonNode candidates = jsonResponse.path("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode firstCandidate = candidates.get(0);
                    JsonNode parts = firstCandidate.path("content").path("parts");
                    if (parts.isArray() && parts.size() > 0) {
                        for (JsonNode part : parts) {
                            if (part.has("text") && !part.get("text").asText().isEmpty()) {
                                replyText = part.get("text").asText();
                                break;
                            }
                        }
                    }
                }
            }

            // 4. Save AI's response to database if authenticated
            if (user != null) {
                try {
                    AiChatHistory aiReply = AiChatHistory.builder().user(user).sender("AI")
                            .message(replyText).build();
                    aiChatHistoryRepository.save(aiReply);

                    // Maintain only last 50 messages
                    aiChatHistoryRepository.keepOnlyLast50Messages(user.getId());
                } catch (Exception e) {
                    log.error("Error saving AI response to database", e);
                }
            }

            // 5. Structure response for the client (JSON Wrapping)
            ObjectNode wrappedResponse = objectMapper.createObjectNode();
            wrappedResponse.put("text", replyText);
            return wrappedResponse.toString();

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("HTTP error calling Gemini API: {} - {}", e.getStatusCode(),
                    e.getResponseBodyAsString());
            ObjectNode errorNode = objectMapper.createObjectNode();
            String userFriendlyMessage = switch (e.getStatusCode().value()) {
                case 429 -> "The AI system is receiving too many requests. Please try again in a few minutes.";
                case 503 -> "The AI service is busy or temporarily unavailable. Please try again shortly.";
                default -> "A system error occurred while connecting to AI (Error code: "
                        + e.getStatusCode().value() + "). Please try again later.";
            };
            errorNode.put("text", userFriendlyMessage);
            return errorNode.toString();
        } catch (JsonProcessingException | RestClientException e) {
            log.error("Error calling Gemini API", e);
            ObjectNode errorNode = objectMapper.createObjectNode();
            errorNode.put("text",
                    "An error occurred while connecting to AI. Please try again later.");
            return errorNode.toString();
        }
    }
}
