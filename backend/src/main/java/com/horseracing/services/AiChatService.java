package com.horseracing.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
import org.springframework.web.client.RestTemplate;

import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiChatService {

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    private final ResourceLoader resourceLoader;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String systemPrompt = "";

    @PostConstruct
    public void init() {
        try {
            Resource resource = resourceLoader.getResource("classpath:prompts/system-prompt.txt");
            try (Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)) {
                this.systemPrompt = FileCopyUtils.copyToString(reader);
                log.info("Loaded System Prompt successfully.");
            }
        } catch (Exception e) {
            log.error("Could not load system prompt file. Using default empty prompt.", e);
            this.systemPrompt = "Bạn là trợ lý ảo. Hãy giúp đỡ người dùng.";
        }
    }

    public String chat(String userMessage) {
        if (geminiApiKey == null || geminiApiKey.isEmpty() || geminiApiKey.contains("your-gemini-api-key")) {
            return "Lỗi: Chưa cấu hình Gemini API Key. Vui lòng thêm GEMINI_API_KEY vào biến môi trường.";
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + geminiApiKey;

        try {
            // Build the JSON payload for Gemini API
            ObjectNode rootNode = objectMapper.createObjectNode();

            // 1. System Instruction
            ObjectNode systemInstruction = objectMapper.createObjectNode();
            ArrayNode sysParts = objectMapper.createArrayNode();
            ObjectNode sysText = objectMapper.createObjectNode();
            sysText.put("text", systemPrompt);
            sysParts.add(sysText);
            systemInstruction.set("parts", sysParts);
            rootNode.set("system_instruction", systemInstruction);

            // 2. Contents (User message)
            ArrayNode contentsArray = objectMapper.createArrayNode();
            ObjectNode contentObj = objectMapper.createObjectNode();
            contentObj.put("role", "user");
            ArrayNode userParts = objectMapper.createArrayNode();
            ObjectNode userText = objectMapper.createObjectNode();
            userText.put("text", userMessage);
            userParts.add(userText);
            contentObj.set("parts", userParts);
            contentsArray.add(contentObj);
            
            rootNode.set("contents", contentsArray);

            // Send request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(rootNode.toString(), headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                JsonNode candidates = jsonResponse.path("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode firstCandidate = candidates.get(0);
                    JsonNode parts = firstCandidate.path("content").path("parts");
                    if (parts.isArray() && parts.size() > 0) {
                        return parts.get(0).path("text").asText();
                    }
                }
            }

            return "Xin lỗi, tôi không thể lấy được câu trả lời từ AI lúc này.";

        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            return "Đã xảy ra lỗi khi kết nối với AI: " + e.getMessage();
        }
    }
}
