package com.synth.flashcard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ClaudeService {

    @Value("${app.claude.api-key}")
    private String apiKey;

    @Value("${app.claude.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<FlashcardData> generateFlashcards(String content) {
        String prompt = createFlashcardPrompt(content);
        String response = callClaudeAPI(prompt);
        return parseFlashcardResponse(response);
    }

    public GradingResult gradeAnswer(String question, String correctAnswer, String userAnswer) {
        String prompt = createGradingPrompt(question, correctAnswer, userAnswer);
        String response = callClaudeAPI(prompt);
        return parseGradingResponse(response);
    }

    private String createFlashcardPrompt(String content) {
        return """
            Analyze the following content and generate comprehensive flashcards for studying. Your goal is to create as many relevant flashcards as possible - DO NOT limit yourself to a specific number.
            
            Guidelines:
            1. If the content contains vocabulary words, definitions, or terminology - create a flashcard for EACH word/term
            2. If there are 100 vocabulary words in a document, create 100 flashcards - one for each
            3. For concepts, create multiple flashcards covering different aspects (definition, examples, applications, etc.)
            4. For factual information, create specific question-answer pairs
            5. For procedural knowledge, break down into step-by-step questions
            
            Identify and create flashcards for:
            - Vocabulary words and their definitions
            - Key terms and concepts
            - Important facts and figures
            - Names, dates, and places
            - Formulas and equations
            - Processes and procedures
            - Examples and case studies
            - Relationships between concepts
            
            Format your response as a JSON array with objects containing "question" and "answer" fields.
            Make questions clear, specific, and testable. Make answers comprehensive but concise.
            
            Content to analyze:
            %s
            
            Response format (generate as many as needed):
            [
              {
                "question": "What is the definition of [term]?",
                "answer": "The definition and explanation..."
              },
              {
                "question": "What does [vocabulary word] mean?",
                "answer": "The meaning and context..."
              }
            ]
            """.formatted(content);
    }

    private String createGradingPrompt(String question, String correctAnswer, String userAnswer) {
        return """
            Grade the following answer on a scale of 0.0 to 1.0 based on semantic similarity and correctness.
            Consider partial credit for answers that are close but not exact.
            
            Question: %s
            Correct Answer: %s
            User Answer: %s
            
            Respond with a JSON object containing:
            - "score": number between 0.0 and 1.0
            - "confidence": number between 0.0 and 1.0 indicating how confident you are in the score
            - "feedback": brief explanation of the score
            
            Format:
            {
              "score": 0.85,
              "confidence": 0.9,
              "feedback": "Good answer, covers main points but missing some details"
            }
            """.formatted(question, correctAnswer, userAnswer);
    }

    private String callClaudeAPI(String prompt) {
        try {
            System.out.println("=== CLAUDE API CALL ===");
            System.out.println("API Key present: " + (apiKey != null && !apiKey.isEmpty()));
            System.out.println("Base URL: " + baseUrl);
            System.out.println("Prompt length: " + prompt.length());
            System.out.println("Prompt preview: " + prompt.substring(0, Math.min(200, prompt.length())) + "...");
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "claude-3-5-sonnet-20241022");
            requestBody.put("max_tokens", 4000);
            
            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            messages.add(message);
            requestBody.put("messages", messages);

            System.out.println("Request body: " + objectMapper.writeValueAsString(requestBody));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/messages",
                HttpMethod.POST,
                entity,
                String.class
            );

            System.out.println("Claude API Response Status: " + response.getStatusCode());
            System.out.println("Claude API Response Body: " + response.getBody());

            JsonNode responseNode = objectMapper.readTree(response.getBody());
            String result = responseNode.get("content").get(0).get("text").asText();
            System.out.println("Extracted text: " + result);
            System.out.println("=== END CLAUDE API CALL ===");
            
            return result;
        } catch (Exception e) {
            System.err.println("Claude API Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error calling Claude API: " + e.getMessage(), e);
        }
    }

    private List<FlashcardData> parseFlashcardResponse(String response) {
        try {
            // Extract JSON from response (may contain additional text)
            int startIndex = response.indexOf('[');
            int endIndex = response.lastIndexOf(']') + 1;
            String jsonString = response.substring(startIndex, endIndex);
            
            JsonNode jsonArray = objectMapper.readTree(jsonString);
            List<FlashcardData> flashcards = new ArrayList<>();
            
            for (JsonNode node : jsonArray) {
                FlashcardData flashcard = new FlashcardData();
                flashcard.setQuestion(node.get("question").asText());
                flashcard.setAnswer(node.get("answer").asText());
                flashcards.add(flashcard);
            }
            
            return flashcards;
        } catch (Exception e) {
            throw new RuntimeException("Error parsing flashcard response: " + e.getMessage(), e);
        }
    }

    private GradingResult parseGradingResponse(String response) {
        try {
            // Extract JSON from response
            int startIndex = response.indexOf('{');
            int endIndex = response.lastIndexOf('}') + 1;
            String jsonString = response.substring(startIndex, endIndex);
            
            JsonNode jsonNode = objectMapper.readTree(jsonString);
            
            GradingResult result = new GradingResult();
            result.setScore(jsonNode.get("score").asDouble());
            result.setConfidence(jsonNode.get("confidence").asDouble());
            result.setFeedback(jsonNode.get("feedback").asText());
            
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Error parsing grading response: " + e.getMessage(), e);
        }
    }

    public static class FlashcardData {
        private String question;
        private String answer;

        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }
    }

    public static class GradingResult {
        private double score;
        private double confidence;
        private String feedback;

        public double getScore() { return score; }
        public void setScore(double score) { this.score = score; }
        public double getConfidence() { return confidence; }
        public void setConfidence(double confidence) { this.confidence = confidence; }
        public String getFeedback() { return feedback; }
        public void setFeedback(String feedback) { this.feedback = feedback; }
    }
}