package com.horseracing.configs;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {

    private Jwt jwt = new Jwt();
    private Google google = new Google();
    private String activationUrl;
    private Cors cors = new Cors();
    private Gemini gemini = new Gemini();

    @Getter
    @Setter
    public static class Jwt {
        private String secret;
        private Long accessTokenExpiration;
        private Long refreshTokenExpiration;
    }

    @Getter
    @Setter
    public static class Google {
        private String clientId;
        private String clientSecret;
    }

    @Getter
    @Setter
    public static class Cors {
        private String allowedOrigins;
    }

    @Getter
    @Setter
    public static class Gemini {
        private String apiKey;
    }
}
