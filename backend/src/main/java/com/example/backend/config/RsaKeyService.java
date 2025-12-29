package com.example.backend.config;

import static com.example.backend.helpers.Utils.assertArgsNotNullAndNotBlankOrThrow;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
@Getter
public class RsaKeyService {

    @Value("${PRIVATE_KEY_FILE}")
    private String PRIVATE_KEY_FILE;

    @Value("${PUBLIC_KEY_FILE}")
    private String PUBLIC_KEY_FILE_PATH;

    private KeyPair keyPair;

    private String keyId;

    
    @PostConstruct
    void init() {
        this.keyPair = keyPair();
        this.keyId = UUID.randomUUID().toString();
    }

    private KeyPair keyPair() {
        try {
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
    
            byte[] privateKeyBytes = getRsaKeyDecodedBytes(this.PRIVATE_KEY_FILE, false);
            PrivateKey privateKey = keyFactory.generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(privateKeyBytes)));

            byte[] publicKeyBytes = getRsaKeyDecodedBytes(this.PUBLIC_KEY_FILE_PATH, false);
            PublicKey publicKey = keyFactory.generatePublic(new X509EncodedKeySpec(Base64.getDecoder().decode(publicKeyBytes)));

            return new KeyPair(publicKey, privateKey);

        } catch (InvalidKeySpecException | NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
    
    public String getPublicKey(boolean encode) {
        return new String(getRsaKeyDecodedBytes(this.PUBLIC_KEY_FILE_PATH, encode));
    }

    public String getPublicKey() {
        return getPublicKey(true);
    }

    private byte[] getRsaKeyDecodedBytes(String filePath, boolean encode) {
        assertArgsNotNullAndNotBlankOrThrow(filePath);

        try (InputStream fis = new FileInputStream(filePath)) {
            String keyStr = new String(fis.readAllBytes());
            String unformattedKeyStr = keyStr
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll(System.lineSeparator(), "");
            
            return encode ? Base64.getEncoder().encode(unformattedKeyStr.getBytes()) : unformattedKeyStr.getBytes();
            
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }
}
