package com.example.backend;

import java.io.IOException;

import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import com.example.backend.helpers.Utils;

import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@Slf4j
public class BackendApplication {

	@Value("${appVersion}")
	private String APP_VERSION;

	public static void main(String[] args) {
		readEnvFiles("./.env.local");
        
		SpringApplication.run(BackendApplication.class, args);
	}
    
    @EventListener(ApplicationReadyEvent.class)
    void onApplicationReady() {
        log.info("App version {}", this.APP_VERSION);
        log.info("-Xmx={}m", Math.round((Runtime.getRuntime().maxMemory() / Math.pow(1024, 2)) * 100.0) / 100.0); // in MB, 2 fractions
    }

    /**
     * Read other .env files and set key values as sys properties. Arg env files will override each other (including the .env file).<p>
     * 
     * Wont throw if an arg is blank.
     * 
     * @param envFileNames relative to root folder (same level as /src)
     */
    public static void readEnvFiles(@Nullable String ...envFileNames) {
        if (envFileNames == null || envFileNames.length == 0)
            return;

        for (String envFileName : envFileNames)
            readEnvFile(envFileName);
    }

    /**
     * Blank values are interpreted as {@code null}
     * 
     * @param fileName relative to root folder (same level as /src)
     */
    public static void readEnvFile(@Nullable String fileName) {
        if (Utils.isBlank(fileName))
            return;
        
        log.info(String.format("Reading '%s'...", fileName));
        
        try {
            Utils.readEnvFile(fileName)
                .entrySet()
                .forEach(entry -> 
                    System.setProperty(entry.getKey(), entry.getValue()));

        } catch (IOException e) {
            log.warn(String.format("Failed to read env file '%s': %s", fileName, e.getMessage() == null ? "<no message>" : e.getMessage()));
        }
    }
}
